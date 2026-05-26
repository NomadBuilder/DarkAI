"""ProtectOnt get-involved: forward to Google Sheet + Resend alert email."""

from __future__ import annotations

import html
import logging
import os
from typing import Any

import requests

logger = logging.getLogger(__name__)

FIELD_LABELS: list[tuple[str, str]] = [
    ("submitted_at", "Submitted at"),
    ("role_label", "Type"),
    ("role", "Type (id)"),
    ("name", "Name"),
    ("email", "Email"),
    ("phone", "Phone"),
    ("city", "City / community"),
    ("postal_code", "Postal code"),
    ("yard_sign_design", "Sign design"),
    ("yard_sign_quantity", "Sign quantity"),
    ("yard_sign_payment_status", "Payment"),
    ("yard_sign_notes", "Sign / delivery notes"),
    ("dropoff_location", "Drop-off location"),
    ("dropoff_availability", "Drop-off availability"),
    ("dropoff_capacity", "Drop-off capacity"),
    ("dropoff_list_publicly", "List drop-off publicly"),
    ("volunteer_roles", "Volunteer roles"),
    ("volunteer_availability", "Volunteer availability"),
    ("volunteer_has_vehicle", "Has vehicle"),
    ("additional_notes", "Additional notes"),
    ("source_page", "Source"),
]


def _sheet_submit_url() -> str:
    return (
        os.environ.get("NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL")
        or os.environ.get("GET_INVOLVED_SUBMIT_URL")
        or ""
    ).strip()


def _alert_email() -> str:
    return (
        os.environ.get("GET_INVOLVED_ALERT_EMAIL", "").strip()
        or os.environ.get("CONTACT_EMAIL", "").strip()
        or "mufc4everch@gmail.com"
    )


def _format_submission_email(data: dict[str, Any]) -> tuple[str, str, str]:
    role_label = (data.get("role_label") or data.get("role") or "Sign-up").strip()
    name = (data.get("name") or "").strip() or "Unknown"
    subject = f"[ProtectOnt] {role_label} — {name}"

    lines: list[str] = []
    html_rows: list[str] = []
    for key, label in FIELD_LABELS:
        value = str(data.get(key) or "").strip()
        if not value:
            continue
        lines.append(f"{label}: {value}")
        html_rows.append(
            f"<tr><td style='padding:6px 12px 6px 0;vertical-align:top;font-weight:600;'>{html.escape(label)}</td>"
            f"<td style='padding:6px 0;'>{html.escape(value)}</td></tr>"
        )

    text = "New get-involved sign-up on protectont.ca\n\n" + "\n".join(lines)
    body_html = (
        "<p>New <strong>get-involved</strong> sign-up on protectont.ca</p>"
        "<table style='border-collapse:collapse;font-family:sans-serif;font-size:14px;'>"
        + "".join(html_rows)
        + "</table>"
    )
    return subject, text, body_html


def send_get_involved_alert(data: dict[str, Any]) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        logger.warning("Get-involved alert skipped: RESEND_API_KEY not set")
        return False

    to_email = _alert_email()
    from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev").strip()
    subject, text, body_html = _format_submission_email(data)
    reply_to = (data.get("email") or "").strip() or None

    payload: dict[str, Any] = {
        "from": from_email,
        "to": [to_email],
        "subject": subject[:998],
        "text": text[:50000],
        "html": body_html[:50000],
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )
        if r.status_code >= 400:
            logger.error("Get-involved Resend failed: %s %s", r.status_code, r.text[:500])
            return False
        return True
    except requests.RequestException:
        logger.exception("Get-involved Resend request failed")
        return False


def forward_to_google_sheet(data: dict[str, Any]) -> tuple[bool, str | None]:
    url = _sheet_submit_url()
    if not url:
        return False, "Google Sheet submit URL is not configured on the server."

    try:
        r = requests.post(url, data=data, timeout=25)
        text = (r.text or "").strip()
        if not r.ok:
            return False, f"Sheet forward failed (HTTP {r.status_code})"
        if text:
            try:
                parsed = r.json()
                if parsed.get("success") is False:
                    return False, parsed.get("error") or "Sheet script returned an error"
            except ValueError:
                if "success" not in text.lower():
                    pass
        return True, None
    except requests.RequestException as e:
        logger.exception("Get-involved sheet forward failed")
        return False, str(e)


def process_get_involved_submission(data: dict[str, Any]) -> tuple[bool, str | None]:
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    role = (data.get("role") or "").strip()
    if not role or not name or not email:
        return False, "Name, email, and sign-up type are required."

    sheet_ok, sheet_err = forward_to_google_sheet(data)
    if not sheet_ok:
        return False, sheet_err or "Could not save to spreadsheet."

    if not send_get_involved_alert(data):
        logger.warning("Get-involved saved to sheet but Resend alert email failed")

    return True, None
