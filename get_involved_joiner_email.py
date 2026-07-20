"""Joiner confirmation + follow-up emails for ProtectOnt /join sign-ups.

Uses Resend when RESEND_API_KEY is set. Tracks opens/clicks via webhook (optional)
and a confirm link. Cron endpoint sends one follow-up if they have not engaged.
"""

from __future__ import annotations

import hashlib
import hmac
import html
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests

logger = logging.getLogger(__name__)

SITE = (os.getenv("PUBLIC_SITE_URL") or "https://protectont.ca").rstrip("/")


def _followup_hours() -> float:
    try:
        return float(os.getenv("JOIN_FOLLOWUP_HOURS", "48"))
    except ValueError:
        return 48.0


def _from_address() -> str:
    raw = os.getenv("FROM_EMAIL", "onboarding@resend.dev").strip() or "onboarding@resend.dev"
    if "<" in raw and ">" in raw:
        return raw
    return f"ProtectOnt <{raw}>"


def _reply_to_organizer() -> str:
    return (
        os.getenv("GET_INVOLVED_ALERT_EMAIL", "").strip()
        or os.getenv("CONTACT_EMAIL", "").strip()
        or "protectont@gmail.com"
    )


def _signing_secret() -> str:
    return (
        os.getenv("JOIN_EMAIL_SIGNING_SECRET", "").strip()
        or os.getenv("SECRET_KEY", "").strip()
        or os.getenv("SUBMISSIONS_ADMIN_TOKEN", "").strip()
        or "protectont-join-email"
    )


def confirm_token(submission_id: str) -> str:
    return hmac.new(
        _signing_secret().encode("utf-8"),
        f"join-confirm:{submission_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()[:32]


def verify_confirm_token(submission_id: str, token: str) -> bool:
    expected = confirm_token(submission_id)
    return hmac.compare_digest(expected, (token or "").strip())


def confirm_url(submission_id: str) -> str:
    return f"{SITE}/api/protectont/join-confirm?id={submission_id}&t={confirm_token(submission_id)}"


def _role_next_steps(role_id: str) -> str:
    if role_id == "yard-sign":
        return (
            "A local organizer will follow up about delivery and payment when they can match you in your area."
        )
    if role_id == "volunteer":
        return "A volunteer coordinator will reach out when they can match you to local needs."
    if role_id == "dropoff":
        return "We'll follow up about listing your drop-off / pickup point when organizers are coordinating nearby."
    return "A ProtectOnt volunteer will follow up when they can help with your request."


def _ack_copy(record: dict[str, Any]) -> tuple[str, str, str]:
    name = (record.get("name") or "").strip() or "there"
    first = name.split()[0] if name != "there" else "there"
    role = (record.get("request") or record.get("roleId") or "sign-up").strip()
    role_id = (record.get("roleId") or "").strip()
    confirm = confirm_url(record["id"])
    next_steps = _role_next_steps(role_id)

    subject = "We got your ProtectOnt sign-up"
    text = "\n".join(
        [
            f"Hi {first},",
            "",
            f"Thanks for signing up on protectont.ca ({role}).",
            "",
            next_steps,
            "",
            "If this still matters to you, tap the link below so we know you're still interested:",
            confirm,
            "",
            "You can also reply to this email.",
            "",
            "— ProtectOnt",
            "https://protectont.ca/",
        ]
    )
    body_html = f"""
<p>Hi {html.escape(first)},</p>
<p>Thanks for signing up on <strong>protectont.ca</strong> ({html.escape(role)}).</p>
<p>{html.escape(next_steps)}</p>
<p><a href="{html.escape(confirm)}" style="display:inline-block;background:#3d2b7a;color:#f9e04c;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">I'm still interested</a></p>
<p style="color:#555;font-size:14px;">Or reply to this email. Check junk/spam if you don't see follow-ups.</p>
<p>— ProtectOnt<br><a href="https://protectont.ca/">protectont.ca</a></p>
"""
    return subject, text, body_html


def _followup_copy(record: dict[str, Any]) -> tuple[str, str, str]:
    name = (record.get("name") or "").strip() or "there"
    first = name.split()[0] if name != "there" else "there"
    role = (record.get("request") or record.get("roleId") or "sign-up").strip()
    confirm = confirm_url(record["id"])

    subject = "Quick check-in on your ProtectOnt sign-up"
    text = "\n".join(
        [
            f"Hi {first},",
            "",
            f"Just checking in — we received your {role} sign-up and wanted to make sure our first email didn't get buried.",
            "",
            "If you're still interested, tap here:",
            confirm,
            "",
            "No worries if your plans changed — you can ignore this.",
            "",
            "— ProtectOnt",
        ]
    )
    body_html = f"""
<p>Hi {html.escape(first)},</p>
<p>Just checking in — we received your <strong>{html.escape(role)}</strong> sign-up and wanted to make sure our first email didn't get buried.</p>
<p><a href="{html.escape(confirm)}" style="display:inline-block;background:#3d2b7a;color:#f9e04c;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">I'm still interested</a></p>
<p style="color:#555;font-size:14px;">No worries if your plans changed — you can ignore this.</p>
<p>— ProtectOnt</p>
"""
    return subject, text, body_html


def _send_resend(
    *,
    to: str,
    subject: str,
    text: str,
    body_html: str,
    tags: dict[str, str],
) -> tuple[bool, str | None, str | None]:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        return False, "RESEND_API_KEY not set", None

    payload: dict[str, Any] = {
        "from": _from_address(),
        "to": [to],
        "reply_to": _reply_to_organizer(),
        "subject": subject[:998],
        "text": text[:50000],
        "html": body_html[:50000],
        "tags": [{"name": k, "value": v[:256]} for k, v in tags.items()],
    }
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
                msg = (r.json() or {}).get("message") or r.text[:400]
            except ValueError:
                msg = r.text[:400]
            return False, f"Resend HTTP {r.status_code}: {msg}", None
        msg_id = None
        try:
            msg_id = (r.json() or {}).get("id")
        except ValueError:
            pass
        return True, None, msg_id
    except requests.RequestException as exc:
        return False, str(exc), None


def send_joiner_ack(record: dict[str, Any]) -> bool:
    """Send immediate confirmation to the person who signed up."""
    email = (record.get("email") or "").strip()
    sid = (record.get("id") or "").strip()
    if not email or not sid:
        return False

    subject, text, body_html = _ack_copy(record)
    ok, err, msg_id = _send_resend(
        to=email,
        subject=subject,
        text=text,
        body_html=body_html,
        tags={"submission_id": sid, "kind": "join_ack"},
    )
    from get_involved_store import update_submission

    if not ok:
        logger.warning("Joiner ack failed for %s: %s", sid, err)
        update_submission(
            sid,
            {
                "joinerAckStatus": "failed",
                "joinerAckError": (err or "")[:300],
            },
        )
        return False

    now = datetime.now(timezone.utc).isoformat()
    update_submission(
        sid,
        {
            "joinerAckStatus": "sent",
            "joinerAckSentAt": now,
            "joinerAckResendId": msg_id or "",
            "joinerAckError": "",
        },
    )
    print(f"✅ Joiner ack sent to {email} (submission={sid}, resend={msg_id})")
    return True


def send_joiner_followup(record: dict[str, Any]) -> bool:
    email = (record.get("email") or "").strip()
    sid = (record.get("id") or "").strip()
    if not email or not sid:
        return False
    if record.get("joinerFollowUpSentAt"):
        return False
    if _has_engaged(record):
        return False

    subject, text, body_html = _followup_copy(record)
    ok, err, msg_id = _send_resend(
        to=email,
        subject=subject,
        text=text,
        body_html=body_html,
        tags={"submission_id": sid, "kind": "join_followup"},
    )
    from get_involved_store import update_submission

    if not ok:
        logger.warning("Joiner follow-up failed for %s: %s", sid, err)
        update_submission(
            sid,
            {
                "joinerFollowUpStatus": "failed",
                "joinerFollowUpError": (err or "")[:300],
            },
        )
        return False

    now = datetime.now(timezone.utc).isoformat()
    update_submission(
        sid,
        {
            "joinerFollowUpStatus": "sent",
            "joinerFollowUpSentAt": now,
            "joinerFollowUpResendId": msg_id or "",
            "joinerFollowUpError": "",
        },
    )
    print(f"✅ Joiner follow-up sent to {email} (submission={sid})")
    return True


def _has_engaged(record: dict[str, Any]) -> bool:
    return bool(
        record.get("joinerEmailOpenedAt")
        or record.get("joinerEmailClickedAt")
        or record.get("joinerConfirmedAt")
    )


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def process_due_followups(*, limit: int = 50) -> dict[str, Any]:
    """Send one follow-up to joiners who have not engaged after JOIN_FOLLOWUP_HOURS."""
    from get_involved_store import list_submissions

    hours = _followup_hours()
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    sent = 0
    skipped = 0
    candidates = 0

    for row in list_submissions():
        if sent >= limit:
            break
        if not row.get("joinerAckSentAt"):
            continue
        if row.get("joinerFollowUpSentAt"):
            skipped += 1
            continue
        if _has_engaged(row):
            skipped += 1
            continue
        ack_at = _parse_iso(row.get("joinerAckSentAt"))
        if not ack_at or ack_at > cutoff:
            continue
        candidates += 1
        if send_joiner_followup(row):
            sent += 1
        else:
            skipped += 1

    return {
        "followupHours": hours,
        "candidates": candidates,
        "sent": sent,
        "skipped": skipped,
    }


def mark_engagement_from_resend_event(event_type: str, data: dict[str, Any]) -> bool:
    """Handle Resend webhook email.opened / email.clicked."""
    from get_involved_store import find_submission_by_resend_id, get_submission, update_submission

    email_id = (data.get("email_id") or "").strip()
    tags = data.get("tags") or {}
    if isinstance(tags, list):
        tag_map = {str(t.get("name")): str(t.get("value")) for t in tags if isinstance(t, dict)}
    elif isinstance(tags, dict):
        tag_map = {str(k): str(v) for k, v in tags.items()}
    else:
        tag_map = {}

    submission_id = (tag_map.get("submission_id") or "").strip()
    record = None
    if email_id:
        record = find_submission_by_resend_id(email_id)
    if not record and submission_id:
        record = get_submission(submission_id)
    if not record:
        return False

    sid = record["id"]
    now = datetime.now(timezone.utc).isoformat()
    patch: dict[str, Any] = {}
    if event_type in ("email.opened", "opened") and not record.get("joinerEmailOpenedAt"):
        patch["joinerEmailOpenedAt"] = now
    if event_type in ("email.clicked", "clicked") and not record.get("joinerEmailClickedAt"):
        patch["joinerEmailClickedAt"] = now
    if not patch:
        return True
    update_submission(sid, patch)
    return True


def mark_confirmed(submission_id: str) -> dict[str, Any] | None:
    from get_involved_store import get_submission, update_submission

    row = get_submission(submission_id)
    if not row:
        return None
    if row.get("joinerConfirmedAt"):
        return row
    now = datetime.now(timezone.utc).isoformat()
    return update_submission(
        submission_id,
        {
            "joinerConfirmedAt": now,
            "joinerEmailClickedAt": row.get("joinerEmailClickedAt") or now,
        },
    )
