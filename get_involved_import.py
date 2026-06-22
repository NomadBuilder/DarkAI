"""Import historical get-involved sign-ups from the Google Sheet export (.xlsx)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from get_involved_store import bulk_import_submissions, normalize_submission
from xlsx_read import list_xlsx_sheets, read_xlsx_sheet

logger = logging.getLogger(__name__)

ROLE_IDS = frozenset({"yard-sign", "volunteer", "dropoff", "other"})

ROLE_LABEL_TO_ID: dict[str, str] = {
    "i want a sign": "yard-sign",
    "volunteer": "volunteer",
    "host a drop-off / pickup point": "dropoff",
    "host a drop-off - pickup point": "dropoff",
    "something else": "other",
}

SIGNUP_SHEETS = (
    "Responses",
    "Volunteer",
    "I want a sign",
    "Host a drop-off - pickup point",
)

PAYMENTS_SHEET = "Payments"

PAYMENTS_HEADER_MAP: dict[str, str] = {
    "created date": "created",
    "customer name": "customerName",
    "customer email": "customerEmail",
    "amount": "amount",
    "quantity": "quantity",
}


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def default_historical_xlsx_path() -> Path:
    return _repo_root() / "ledger" / "data" / "protest-submissions-historical.xlsx"


def _import_marker_path() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d / ".historical_signups_imported"


def _payments_import_marker_path() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d / ".historical_payments_imported"


def historical_import_done() -> bool:
    return _import_marker_path().exists()


def historical_payments_import_done() -> bool:
    return _payments_import_marker_path().exists()


def _cell(values: list[str], index: int) -> str:
    if index < 0 or index >= len(values):
        return ""
    val = values[index]
    return "" if val is None else str(val).strip()


def _role_id_from_label(label: str) -> str:
    key = label.strip().lower()
    if key in ROLE_IDS:
        return key
    return ROLE_LABEL_TO_ID.get(key, "")


def _parse_signup_row(values: list[str]) -> dict[str, Any] | None:
    if not values or not _cell(values, 0):
        return None

    submitted = _cell(values, 0)
    c1 = _cell(values, 1)
    c2 = _cell(values, 2)
    c3 = _cell(values, 3)
    c4 = _cell(values, 4)

    # Legacy Responses rows: role id | role label | name | email | phone ...
    if (
        c1.lower() in ROLE_IDS
        and "@" in c4
        and "@" not in c3
    ):
        role = c1.lower()
        role_label = c2
        name = c3
        email = c4
        phone = _cell(values, 5)
        city = _cell(values, 6)
        postal = _cell(values, 7)
        offset = 8
    else:
        role_label = c1
        role = _role_id_from_label(role_label)
        name = c2
        email = c3
        phone = _cell(values, 4)
        city = _cell(values, 5)
        postal = _cell(values, 6)
        offset = 7

    if not name or not email or "@" not in email:
        return None
    if not role:
        role = _role_id_from_label(role_label)

    raw = {
        "submitted_at": submitted,
        "role": role,
        "role_label": role_label,
        "name": name,
        "email": email,
        "phone": phone,
        "city": city,
        "postal_code": postal,
        "yard_sign_design": _cell(values, offset),
        "yard_sign_quantity": _cell(values, offset + 1),
        "yard_sign_payment_status": _cell(values, offset + 2),
        "yard_sign_notes": _cell(values, offset + 3),
        "dropoff_location": _cell(values, offset + 4),
        "dropoff_availability": _cell(values, offset + 5),
        "dropoff_capacity": _cell(values, offset + 6),
        "dropoff_list_publicly": _cell(values, offset + 7),
        "volunteer_roles": _cell(values, offset + 8),
        "volunteer_availability": _cell(values, offset + 9),
        "volunteer_has_vehicle": _cell(values, offset + 10),
        "updates_topics": _cell(values, offset + 11),
        "additional_notes": _cell(values, offset + 12),
        "source_page": _cell(values, offset + 13) or _cell(values, offset + 14) or "import",
    }
    return raw


def rows_from_sheet(path: Path, sheet_name: str) -> list[dict[str, Any]]:
    table = read_xlsx_sheet(path, sheet_name)
    if len(table) < 2:
        return []

    out: list[dict[str, Any]] = []
    for row in table[1:]:
        parsed = _parse_signup_row(row)
        if parsed:
            out.append(parsed)
    return out


def rows_from_payments_sheet(path: Path, sheet_name: str = PAYMENTS_SHEET) -> list[dict[str, Any]]:
    from payments_store import normalize_sheet_payment

    table = read_xlsx_sheet(path, sheet_name)
    if len(table) < 2:
        return []

    headers = [str(h or "").strip() for h in table[0]]
    out: list[dict[str, Any]] = []

    for values in table[1:]:
        mapped: dict[str, str] = {}
        custom: dict[str, str] = {}
        for i, header in enumerate(headers):
            if not header:
                continue
            val = _cell(values, i)
            key = PAYMENTS_HEADER_MAP.get(header.lower())
            if key:
                mapped[key] = val
            else:
                custom[header] = val

        record = normalize_sheet_payment(
            created=mapped.get("created", ""),
            customer_name=mapped.get("customerName", ""),
            customer_email=mapped.get("customerEmail", ""),
            amount=mapped.get("amount", ""),
            quantity=mapped.get("quantity", ""),
            custom_fields=custom,
        )
        if record:
            out.append(record)
    return out


def import_signups_from_xlsx(
    path: Path,
    *,
    sheets: tuple[str, ...] = SIGNUP_SHEETS,
    mark_complete: bool = True,
) -> dict[str, Any]:
    path = path.resolve()
    if not path.is_file():
        raise FileNotFoundError(str(path))

    available = set(list_xlsx_sheets(path))
    records: list[dict[str, Any]] = []
    per_sheet: dict[str, int] = {}

    for sheet in sheets:
        if sheet not in available:
            logger.warning("Skipping missing sheet %r in %s", sheet, path.name)
            continue
        parsed = rows_from_sheet(path, sheet)
        per_sheet[sheet] = len(parsed)
        records.extend(parsed)

    added, skipped = bulk_import_submissions(records, source="xlsx-import")

    result = {
        "path": str(path),
        "sheets": per_sheet,
        "parsed": len(records),
        "added": added,
        "skippedDuplicates": skipped,
        "importedAt": datetime.now(timezone.utc).isoformat(),
    }

    if mark_complete and added > 0:
        _import_marker_path().write_text(
            f"{result['importedAt']} added={added} skipped={skipped}\n",
            encoding="utf-8",
        )

    return result


def import_payments_from_xlsx(
    path: Path,
    *,
    sheet: str = PAYMENTS_SHEET,
    mark_complete: bool = True,
) -> dict[str, Any]:
    from payments_store import bulk_import_payments

    path = path.resolve()
    if not path.is_file():
        raise FileNotFoundError(str(path))

    if sheet not in set(list_xlsx_sheets(path)):
        raise ValueError(f"Sheet not found: {sheet}")

    records = rows_from_payments_sheet(path, sheet)
    added, skipped = bulk_import_payments(records)

    result = {
        "path": str(path),
        "sheet": sheet,
        "parsed": len(records),
        "added": added,
        "skippedDuplicates": skipped,
        "importedAt": datetime.now(timezone.utc).isoformat(),
    }

    if mark_complete:
        _payments_import_marker_path().write_text(
            f"{result['importedAt']} added={added} skipped={skipped} parsed={len(records)}\n",
            encoding="utf-8",
        )

    return result


def ensure_historical_import(path: Path | None = None) -> dict[str, Any] | None:
    """Run once per server if the bundled xlsx exists and import has not run."""
    if historical_import_done():
        return None
    xlsx = path or default_historical_xlsx_path()
    if not xlsx.is_file():
        return None
    try:
        return import_signups_from_xlsx(xlsx)
    except Exception:
        logger.exception("Historical sign-up import failed")
        return None


def ensure_historical_payments_import(path: Path | None = None) -> dict[str, Any] | None:
    """Run once per server: import Payments tab from bundled xlsx."""
    if historical_payments_import_done():
        return None
    xlsx = path or default_historical_xlsx_path()
    if not xlsx.is_file():
        return None
    try:
        return import_payments_from_xlsx(xlsx)
    except Exception:
        logger.exception("Historical payments import failed")
        return None
