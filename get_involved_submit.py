"""ProtectOnt get-involved: save locally + optional Google Sheet forward + alert email."""

from __future__ import annotations

import html
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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
    ("yard_sign_size", "Sign size"),
    ("yard_sign_design", "Sign size (legacy column)"),
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


def _alert_recipients() -> list[str]:
    # Always notify the campaign inbox. (If you want a different mailbox later,
    # update the code and redeploy.)
    candidates = ["protectont@gmail.com"]
    seen: set[str] = set()
    out: list[str] = []
    for addr in candidates:
        key = addr.lower()
        if addr and key not in seen:
            seen.add(key)
            out.append(addr)
    return out


def _from_address() -> str:
    raw = os.getenv("FROM_EMAIL", "onboarding@resend.dev").strip()
    if not raw:
        raw = "onboarding@resend.dev"
    if "<" in raw and ">" in raw:
        return raw
    return f"Protect Ontario <{raw}>"


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


def _send_via_resend(
    *,
    to_list: list[str],
    subject: str,
    text: str,
    body_html: str,
    reply_to: str | None,
) -> tuple[bool, str | None]:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        return False, "RESEND_API_KEY not set"

    from_email = _from_address()
    payload: dict[str, Any] = {
        "from": from_email,
        "to": to_list,
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
            try:
                detail = r.json()
                msg = detail.get("message") or r.text[:500]
            except ValueError:
                msg = r.text[:500]
            return False, f"Resend HTTP {r.status_code}: {msg}"
        try:
            msg_id = r.json().get("id")
        except ValueError:
            msg_id = None
        print(f"✅ Get-involved Resend sent to {to_list}" + (f" (id={msg_id})" if msg_id else ""))
        return True, None
    except requests.RequestException as exc:
        return False, f"Resend request failed: {exc}"


def _send_via_smtp(
    *,
    to_list: list[str],
    subject: str,
    text: str,
    reply_to: str | None,
) -> tuple[bool, str | None]:
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    if not smtp_username or not smtp_password:
        return False, "SMTP not configured"

    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = ", ".join(to_list)
    msg["Subject"] = subject[:998]
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(text, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, to_list, msg.as_string())
        print(f"✅ Get-involved SMTP sent to {to_list}")
        return True, None
    except Exception as exc:
        return False, f"SMTP failed: {exc}"


def _use_resend_for_alerts() -> bool:
    return os.environ.get("GET_INVOLVED_USE_RESEND", "").strip().lower() in (
        "1",
        "true",
        "yes",
    )


def send_get_involved_alert(data: dict[str, Any]) -> bool:
    if not _use_resend_for_alerts():
        print("📧 Get-involved: email via Apps Script MailApp (Resend skipped)")
        return True

    to_list = _alert_recipients()
    if not to_list:
        logger.warning("Get-involved alert skipped: no recipient addresses")
        return False

    subject, text, body_html = _format_submission_email(data)
    reply_to = (data.get("email") or "").strip() or None

    print(f"📧 Get-involved alert: from={_from_address()} to={to_list} reply_to={reply_to or '(none)'}")

    ok, err = _send_via_resend(
        to_list=to_list,
        subject=subject,
        text=text,
        body_html=body_html,
        reply_to=reply_to,
    )
    if ok:
        return True

    print(f"❌ Get-involved Resend failed: {err}")
    logger.error("Get-involved Resend failed: %s", err)

    # Retry without reply_to (some Resend setups reject unverified reply-to)
    if reply_to:
        ok2, err2 = _send_via_resend(
            to_list=to_list,
            subject=subject,
            text=text,
            body_html=body_html,
            reply_to=None,
        )
        if ok2:
            return True
        print(f"❌ Get-involved Resend retry (no reply-to) failed: {err2}")

    ok_smtp, err_smtp = _send_via_smtp(
        to_list=to_list,
        subject=subject,
        text=text,
        reply_to=reply_to,
    )
    if ok_smtp:
        return True
    print(f"❌ Get-involved SMTP failed: {err_smtp}")
    logger.error("Get-involved SMTP failed: %s", err_smtp)
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

    from get_involved_store import append_submission

    try:
        record = append_submission(data)
    except OSError as exc:
        logger.exception("Get-involved local save failed")
        return False, f"Could not save sign-up: {exc}"

    if record.get("roleId") == "yard-sign":
        from sign_delivery_admin import send_sign_delivery_alert

        send_sign_delivery_alert(record)

    # Always try to email the joiner a confirmation (needs RESEND_API_KEY + usable FROM_EMAIL).
    try:
        from get_involved_joiner_email import send_joiner_ack

        send_joiner_ack(record)
    except Exception:
        logger.exception("Joiner confirmation email failed")

    sheet_url = _sheet_submit_url()
    if sheet_url:
        sheet_ok, sheet_err = forward_to_google_sheet(data)
        if not sheet_ok:
            logger.warning("Get-involved saved locally but sheet forward failed: %s", sheet_err)

    if _use_resend_for_alerts() and not send_get_involved_alert(data):
        logger.warning("Get-involved saved but Resend alert email failed.")

    return True, None
