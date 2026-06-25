"""ProtectOnt — sign-in-the-wild photo submissions (FSA-only location)."""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

PHOTO_SUBDIR = "uploads/sign-spots"
ALLOWED_IMAGE_EXT = frozenset({".png", ".jpg", ".jpeg", ".webp", ".heic"})
MAX_PHOTO_BYTES = 5 * 1024 * 1024

_JSON_PATH = Path(__file__).resolve().parent / "instance" / "sign_spots.json"
_TABLE = "protectont_sign_spots"


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def photo_dir() -> Path:
    d = _repo_root() / "static" / PHOTO_SUBDIR
    d.mkdir(parents=True, exist_ok=True)
    return d


def _postgres_configured() -> bool:
    return bool(
        os.getenv("POSTGRES_HOST")
        and os.getenv("POSTGRES_USER")
        and os.getenv("POSTGRES_PASSWORD")
        and os.getenv("POSTGRES_DB")
    )


def _connect():
    import psycopg2

    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT", "5432"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        dbname=os.getenv("POSTGRES_DB"),
    )


def ensure_schema() -> None:
    if not _postgres_configured():
        _json_path().parent.mkdir(parents=True, exist_ok=True)
        if not _json_path().exists():
            _json_path().write_text(json.dumps({"spots": []}, indent=2), encoding="utf-8")
        return
    conn = _connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {_TABLE} (
                    id UUID PRIMARY KEY,
                    fsa TEXT,
                    photo_path TEXT NOT NULL,
                    caption TEXT,
                    status TEXT NOT NULL DEFAULT 'pending',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_{_TABLE}_status_created
                    ON {_TABLE} (status, created_at DESC);
                """
            )
        conn.commit()
    finally:
        conn.close()


def _json_path() -> Path:
    return _JSON_PATH


def _load_json_spots() -> list[dict[str, Any]]:
    p = _json_path()
    if not p.exists():
        return []
    try:
        return list(json.loads(p.read_text(encoding="utf-8")).get("spots", []))
    except Exception:
        return []


def _save_json_spots(spots: list[dict[str, Any]]) -> None:
    _json_path().parent.mkdir(parents=True, exist_ok=True)
    _json_path().write_text(json.dumps({"spots": spots}, indent=2), encoding="utf-8")


def extract_fsa(postal_raw: str) -> str | None:
    """Canadian FSA = first 3 chars of postal code. Never store full postal."""
    compact = (postal_raw or "").upper().replace(" ", "").replace("-", "")
    if len(compact) >= 3 and compact[0].isalpha() and compact[1].isdigit() and compact[2].isalpha():
        return compact[:3]
    return None


def save_spot_photo(file_storage) -> tuple[str | None, str | None]:
    if not file_storage or not file_storage.filename:
        return None, "Please upload a photo of your sign."
    ext = Path(file_storage.filename).suffix.lower()
    if ext == ".heic":
        ext = ".jpg"
    if ext not in ALLOWED_IMAGE_EXT and ext != ".jpg":
        return None, "Photo must be PNG, JPG, WEBP, or HEIC."
    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    if size > MAX_PHOTO_BYTES:
        return None, "Photo must be 5 MB or smaller."
    safe_ext = ".jpg" if ext in (".jpg", ".jpeg", ".heic") else ext
    rel = f"{PHOTO_SUBDIR}/{uuid.uuid4().hex}{safe_ext}"
    out = _repo_root() / "static" / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(out)
    return rel, None


def validate_spot_payload(
    honeypot: str = "",
    caption: str = "",
) -> tuple[dict[str, str], str | None]:
    if honeypot.strip():
        return {}, "Invalid submission."
    caption = (caption or "").strip()[:120]
    return {"caption": caption}, None


def _auto_approve() -> bool:
    return os.getenv("SIGN_SPOTS_AUTO_APPROVE", os.getenv("STORIES_AUTO_APPROVE", "true")).strip().lower() in (
        "1",
        "true",
        "yes",
    )


def insert_sign_spot(
    photo_path: str,
    *,
    fsa: str | None = None,
    caption: str = "",
) -> tuple[dict[str, Any] | None, str | None]:
    ensure_schema()
    spot_id = str(uuid.uuid4())
    status = "approved" if _auto_approve() else "pending"
    created = datetime.now(timezone.utc).isoformat()
    fsa_clean = (fsa or "").strip().upper()[:3] if fsa else None

    try:
        if _postgres_configured():
            conn = _connect()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        INSERT INTO {_TABLE} (id, fsa, photo_path, caption, status, created_at)
                        VALUES (%s::uuid, %s, %s, %s, %s, %s::timestamptz)
                        """,
                        (spot_id, fsa_clean, photo_path, caption, status, created),
                    )
                conn.commit()
            finally:
                conn.close()
        else:
            spots = _load_json_spots()
            spots.append(
                {
                    "id": spot_id,
                    "fsa": fsa_clean,
                    "photo_path": photo_path,
                    "caption": caption,
                    "status": status,
                    "created_at": created,
                }
            )
            _save_json_spots(spots)
    except Exception:
        logger.exception("insert_sign_spot failed")
        return None, "Could not save your photo. Please try again."

    return {"id": spot_id, "status": status, "pending": status == "pending"}, None


def _row_to_public(row: dict[str, Any], base_url: str) -> dict[str, Any]:
    photo_path = row.get("photo_path") or ""
    photo_url = ""
    if photo_path:
        photo_url = f"{base_url.rstrip('/')}/static/{photo_path.lstrip('/')}"
    fsa = (row.get("fsa") or "").strip().upper() or None
    location_label = f"Near {fsa}" if fsa else "Ontario"
    return {
        "id": str(row.get("id", "")),
        "photoUrl": photo_url,
        "fsa": fsa,
        "locationLabel": location_label,
        "caption": (row.get("caption") or "").strip(),
        "createdAt": row.get("created_at", ""),
    }


def _week_start_utc() -> datetime:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=now.weekday())
    return start.replace(hour=0, minute=0, second=0, microsecond=0)


def list_public_spots(base_url: str, limit: int = 48) -> tuple[list[dict[str, Any]], int]:
    """Returns (spots, count_this_week)."""
    ensure_schema()
    limit = max(1, min(limit, 100))
    week_start = _week_start_utc()
    rows: list[dict[str, Any]] = []
    week_count = 0

    if _postgres_configured():
        conn = _connect()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT id::text, fsa, photo_path, caption, created_at
                    FROM {_TABLE}
                    WHERE status = 'approved'
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                for r in cur.fetchall():
                    rows.append(
                        {
                            "id": r[0],
                            "fsa": r[1],
                            "photo_path": r[2],
                            "caption": r[3],
                            "created_at": r[4].isoformat() if r[4] else "",
                        }
                    )
                cur.execute(
                    f"""
                    SELECT COUNT(*) FROM {_TABLE}
                    WHERE status = 'approved' AND created_at >= %s
                    """,
                    (week_start,),
                )
                week_count = int(cur.fetchone()[0] or 0)
        finally:
            conn.close()
    else:
        for s in _load_json_spots():
            if s.get("status") != "approved":
                continue
            rows.append(s)
            created_raw = s.get("created_at", "")
            try:
                created = datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
                if created.tzinfo is None:
                    created = created.replace(tzinfo=timezone.utc)
                if created >= week_start:
                    week_count += 1
            except Exception:
                pass
        rows.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        rows = rows[:limit]

    public = [_row_to_public(r, base_url) for r in rows]
    return public, week_count


def delete_sign_spot(spot_id: str) -> bool:
    ensure_schema()
    sid = (spot_id or "").strip()
    if not sid:
        return False
    removed = False
    if _postgres_configured():
        conn = _connect()
        try:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {_TABLE} WHERE id = %s::uuid", (sid,))
                removed = cur.rowcount > 0
            conn.commit()
        finally:
            conn.close()
    else:
        spots = _load_json_spots()
        n = len(spots)
        spots = [s for s in spots if str(s.get("id")) != sid]
        if len(spots) < n:
            _save_json_spots(spots)
            removed = True
    return removed
