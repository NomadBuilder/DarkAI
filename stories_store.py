"""ProtectOnt community stories — persistence and image uploads."""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

STORY_MAX_LEN = 300
DISPLAY_NAME_MAX_LEN = 60
AVATAR_SUBDIR = "uploads/stories"
ALLOWED_IMAGE_EXT = frozenset({".png", ".jpg", ".jpeg", ".webp", ".gif"})
MAX_AVATAR_BYTES = 2 * 1024 * 1024

_JSON_PATH = Path(__file__).resolve().parent / "instance" / "stories.json"
_TABLE = "protectont_stories"

# One-time removals (purged on first stories API access after deploy)
_PURGE_STORY_IDS = frozenset({"1338670e-05c2-4313-ae5c-7e15c48238e4"})
_purge_done = False


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def avatar_dir() -> Path:
    d = _repo_root() / "static" / AVATAR_SUBDIR
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
            _json_path().write_text(json.dumps({"stories": []}, indent=2), encoding="utf-8")
        return
    conn = _connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {_TABLE} (
                    id UUID PRIMARY KEY,
                    display_name TEXT NOT NULL DEFAULT '',
                    story TEXT NOT NULL,
                    avatar_path TEXT,
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


def _load_json_stories() -> list[dict[str, Any]]:
    p = _json_path()
    if not p.exists():
        return []
    try:
        return list(json.loads(p.read_text(encoding="utf-8")).get("stories", []))
    except Exception:
        return []


def _save_json_stories(stories: list[dict[str, Any]]) -> None:
    _json_path().parent.mkdir(parents=True, exist_ok=True)
    _json_path().write_text(json.dumps({"stories": stories}, indent=2), encoding="utf-8")


def _row_to_public(row: dict[str, Any], base_url: str) -> dict[str, Any]:
    avatar_path = row.get("avatar_path") or ""
    avatar_url = ""
    if avatar_path:
        avatar_url = f"{base_url.rstrip('/')}/static/{avatar_path.lstrip('/')}"
    name = (row.get("display_name") or "").strip() or "Ontarian"
    initial = name[0].upper() if name else "O"
    return {
        "id": str(row.get("id", "")),
        "displayName": name,
        "initial": initial,
        "story": row.get("story", ""),
        "avatarUrl": avatar_url,
        "createdAt": row.get("created_at", ""),
    }


def save_avatar_file(file_storage) -> tuple[str | None, str | None]:
    """Returns (relative_path under static/, error)."""
    if not file_storage or not file_storage.filename:
        return None, None
    ext = Path(file_storage.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXT:
        return None, "Image must be PNG, JPG, WEBP, or GIF."
    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    if size > MAX_AVATAR_BYTES:
        return None, "Image must be 2 MB or smaller."
    safe_ext = ".jpg" if ext in (".jpg", ".jpeg") else ext
    rel = f"{AVATAR_SUBDIR}/{uuid.uuid4().hex}{safe_ext}"
    out = _repo_root() / "static" / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(out)
    return rel, None


def validate_story_payload(
    display_name: str,
    story: str,
    honeypot: str = "",
) -> tuple[dict[str, str] | None, str | None]:
    if honeypot.strip():
        return None, "Invalid submission."
    story = story.strip()
    if not story:
        return None, "Please share your story."
    if len(story) > STORY_MAX_LEN:
        return None, f"Story must be {STORY_MAX_LEN} characters or fewer."
    display_name = display_name.strip()[:DISPLAY_NAME_MAX_LEN]
    if not display_name:
        display_name = "Anonymous"
    return {"display_name": display_name, "story": story}, None


def _auto_approve() -> bool:
    return os.getenv("STORIES_AUTO_APPROVE", "true").strip().lower() in ("1", "true", "yes")


def insert_story(
    display_name: str,
    story: str,
    avatar_path: str | None = None,
) -> tuple[dict[str, Any] | None, str | None]:
    ensure_schema()
    story_id = str(uuid.uuid4())
    status = "approved" if _auto_approve() else "pending"
    created = datetime.now(timezone.utc).isoformat()

    if _postgres_configured():
        conn = _connect()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO {_TABLE} (id, display_name, story, avatar_path, status, created_at)
                    VALUES (%s::uuid, %s, %s, %s, %s, %s::timestamptz)
                    """,
                    (story_id, display_name, story, avatar_path, status, created),
                )
            conn.commit()
        except Exception as e:
            logger.exception("insert_story postgres failed")
            return None, str(e)
        finally:
            conn.close()
    else:
        stories = _load_json_stories()
        stories.append(
            {
                "id": story_id,
                "display_name": display_name,
                "story": story,
                "avatar_path": avatar_path,
                "status": status,
                "created_at": created,
            }
        )
        _save_json_stories(stories)

    return {
        "id": story_id,
        "status": status,
        "pending": status == "pending",
    }, None


def delete_story(story_id: str) -> bool:
    """Delete a story by id. Returns True if removed."""
    ensure_schema()
    sid = (story_id or "").strip()
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
        stories = _load_json_stories()
        n = len(stories)
        stories = [s for s in stories if str(s.get("id")) != sid]
        if len(stories) < n:
            _save_json_stories(stories)
            removed = True
    return removed


def purge_known_test_stories() -> None:
    global _purge_done
    if _purge_done:
        return
    _purge_done = True
    for sid in _PURGE_STORY_IDS:
        delete_story(sid)


def list_public_stories(base_url: str, limit: int = 100) -> list[dict[str, Any]]:
    ensure_schema()
    purge_known_test_stories()
    limit = max(1, min(limit, 200))
    rows: list[dict[str, Any]] = []

    if _postgres_configured():
        conn = _connect()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT id::text, display_name, story, avatar_path, created_at
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
                            "display_name": r[1],
                            "story": r[2],
                            "avatar_path": r[3],
                            "created_at": r[4].isoformat() if r[4] else "",
                        }
                    )
        finally:
            conn.close()
    else:
        for s in _load_json_stories():
            if s.get("status") == "approved":
                rows.append(s)
        rows.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        rows = rows[:limit]

    return [_row_to_public(r, base_url) for r in rows]
