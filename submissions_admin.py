"""ProtectOnt admin: sign-ups (Google Sheet), Stripe payments, print fulfillment."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

import requests

logger = logging.getLogger(__name__)

SIGNUP_FIELD_ALIASES: dict[str, str] = {
    "submitted_at": "submittedAt",
    "submitted at": "submittedAt",
    "role": "roleId",
    "request": "request",
    "role_label": "request",
    "name": "name",
    "email": "email",
    "phone": "phone",
    "city": "city",
    "postal_code": "postalCode",
    "postal code": "postalCode",
    "yard_sign_design": "yardSignDesign",
    "yard sign design": "yardSignDesign",
    "yard_sign_size": "yardSignDesign",
    "yard_sign_quantity": "yardSignQuantity",
    "yard sign quantity": "yardSignQuantity",
    "yard_sign_payment_status": "yardSignPaymentStatus",
    "yard sign payment status": "yardSignPaymentStatus",
    "yard_sign_notes": "yardSignNotes",
    "yard sign notes": "yardSignNotes",
    "dropoff_location": "dropoffLocation",
    "drop-off location": "dropoffLocation",
    "dropoff_availability": "dropoffAvailability",
    "drop-off availability": "dropoffAvailability",
    "dropoff_capacity": "dropoffCapacity",
    "drop-off capacity": "dropoffCapacity",
    "dropoff_list_publicly": "dropoffListPublicly",
    "list drop-off publicly": "dropoffListPublicly",
    "volunteer_roles": "volunteerRoles",
    "volunteer roles": "volunteerRoles",
    "volunteer_availability": "volunteerAvailability",
    "volunteer availability": "volunteerAvailability",
    "volunteer_has_vehicle": "volunteerHasVehicle",
    "volunteer has vehicle": "volunteerHasVehicle",
    "updates_topics": "updatesTopics",
    "update topics": "updatesTopics",
    "additional_notes": "additionalNotes",
    "additional notes": "additionalNotes",
    "source_page": "sourcePage",
    "source page": "sourcePage",
}


def _admin_token() -> str:
    return (
        os.getenv("SUBMISSIONS_ADMIN_TOKEN", "").strip()
        or os.getenv("POSTER_ADMIN_TOKEN", "").strip()
    )


def submissions_admin_authorized() -> bool:
    from flask import request

    token = _admin_token()
    if not token:
        return False
    auth = (request.headers.get("Authorization") or "").strip()
    if auth.lower().startswith("bearer ") and auth[7:].strip() == token:
        return True
    if (request.headers.get("X-Submissions-Admin-Token") or "").strip() == token:
        return True
    return False


def _normalize_signup_row(raw: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in raw.items():
        norm_key = SIGNUP_FIELD_ALIASES.get(str(key).strip().lower())
        if not norm_key:
            continue
        text = "" if value is None else str(value).strip()
        if text and norm_key not in out:
            out[norm_key] = text
    if not out.get("request") and out.get("roleId"):
        out["request"] = out["roleId"]
    return out


def fetch_sheet_signups() -> tuple[list[dict[str, Any]], str | None]:
    """Read sign-ups via Google Apps Script doGet (see GET_INVOLVED_GOOGLE_SHEET.md)."""
    base_url = (
        os.getenv("GET_INVOLVED_SHEET_READ_URL", "").strip()
        or os.getenv("GET_INVOLVED_SUBMIT_URL", "").strip()
        or os.getenv("NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL", "").strip()
    )
    if not base_url:
        return [], "Sheet read URL is not configured (GET_INVOLVED_SHEET_READ_URL)."

    token = os.getenv("GET_INVOLVED_SHEET_READ_TOKEN", "").strip()
    params: dict[str, str] = {}
    if token:
        params["token"] = token

    try:
        resp = requests.get(base_url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        logger.exception("Sheet read request failed")
        return [], f"Could not read Google Sheet: {exc}"
    except ValueError:
        return [], "Google Sheet read endpoint returned invalid JSON."

    if not data.get("success"):
        return [], str(data.get("error") or "Sheet read failed.")

    rows = data.get("rows") or []
    if isinstance(rows, list) and rows and isinstance(rows[0], list):
        headers = [str(h) for h in (data.get("headers") or [])]
        mapped: list[dict[str, Any]] = []
        for row in rows:
            raw_row = {
                headers[i]: row[i] if i < len(row) else ""
                for i in range(len(headers))
            }
            mapped.append(_normalize_signup_row(raw_row))
        return mapped, None

    if isinstance(rows, list):
        return [_normalize_signup_row(r) for r in rows if isinstance(r, dict)], None

    return [], "Unexpected sheet response shape."


def _custom_field_value(field: dict[str, Any]) -> str:
    if field.get("text"):
        return str(field["text"].get("value") or "")
    if field.get("dropdown"):
        return str(field["dropdown"].get("value") or "")
    if field.get("numeric") is not None:
        val = field["numeric"].get("value")
        return "" if val is None else str(val)
    return ""


def _session_quantity(session: Any) -> int | None:
    line_items = getattr(getattr(session, "line_items", None), "data", None) or []
    if not line_items:
        return None
    total = sum(int(item.quantity or 0) for item in line_items)
    return total or None


def fetch_stripe_payments() -> tuple[list[dict[str, Any]], str | None]:
    secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if not secret:
        return [], "STRIPE_SECRET_KEY is not configured on the server."

    try:
        import stripe

        stripe.api_key = secret
    except ImportError:
        return [], "Stripe Python package is not installed."

    payments: list[dict[str, Any]] = []
    custom_labels: list[str] = []

    try:
        sessions: list[Any] = []
        starting_after: str | None = None
        while True:
            page = stripe.checkout.Session.list(
                limit=100,
                expand=["data.payment_intent", "data.line_items"],
                starting_after=starting_after,
            )
            sessions.extend(page.data)
            if not page.has_more or not page.data:
                break
            starting_after = page.data[-1].id

        paid = [s for s in sessions if getattr(s, "payment_status", None) == "paid"]

        for session in paid:
            for field in session.custom_fields or []:
                label = (field.label.custom if field.label else None) or field.key or ""
                if label and label not in custom_labels:
                    custom_labels.append(label)

        for session in paid:
            field_map: dict[str, str] = {}
            for field in session.custom_fields or []:
                label = (field.label.custom if field.label else None) or field.key or ""
                if label:
                    field_map[label] = _custom_field_value(field.to_dict())

            created_ts = int(session.created or 0)
            payments.append(
                {
                    "id": session.id,
                    "createdAt": datetime.fromtimestamp(created_ts, tz=timezone.utc).isoformat(),
                    "customerName": (session.customer_details.name if session.customer_details else "") or "",
                    "customerEmail": (session.customer_details.email if session.customer_details else "") or "",
                    "amount": round((session.amount_total or 0) / 100, 2),
                    "currency": (session.currency or "cad").upper(),
                    "quantity": _session_quantity(session),
                    "paymentStatus": session.payment_status,
                    "customFields": field_map,
                }
            )

        payments.sort(key=lambda row: row.get("createdAt") or "", reverse=True)
        return payments, None
    except Exception as exc:
        logger.exception("Stripe payments fetch failed")
        return [], f"Stripe API error: {exc}"


def build_print_orders() -> list[dict[str, Any]]:
    from poster_fulfillment import list_pending_poster_orders, read_recent_fulfillment_log

    orders: list[dict[str, Any]] = []
    seen: set[str] = set()

    for entry in read_recent_fulfillment_log(200):
        sid = str(entry.get("stripe_session_id") or "")
        if not sid or sid in seen:
            continue
        seen.add(sid)
        orders.append(
            {
                "sessionId": sid,
                "status": "fulfilled",
                "updatedAt": entry.get("ts"),
                "product": entry.get("product"),
                "size": entry.get("size"),
                "printfulOrderId": entry.get("printful_order_id"),
                "imageUrl": entry.get("imageUrl"),
                "reason": None,
            }
        )

    for pending in list_pending_poster_orders():
        sid = str(pending.get("session_id") or "")
        payload = pending.get("payload") or {}
        orders.append(
            {
                "sessionId": sid,
                "status": "pending",
                "updatedAt": pending.get("mtime_iso"),
                "product": payload.get("product"),
                "size": payload.get("size"),
                "printfulOrderId": None,
                "imageUrl": payload.get("imageUrl"),
                "reason": payload.get("reason"),
                "recipient": payload.get("recipient"),
                "stripeEmail": payload.get("stripe_email"),
            }
        )

    orders.sort(key=lambda row: row.get("updatedAt") or "", reverse=True)
    return orders


def build_submissions_summary(
    signups: list[dict[str, Any]],
    payments: list[dict[str, Any]],
    print_orders: list[dict[str, Any]],
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    month_key = now.strftime("%Y-%m")

    def in_month(iso: str | None) -> bool:
        if not iso:
            return False
        try:
            dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
            return dt.strftime("%Y-%m") == month_key
        except ValueError:
            return False

    paid_total = sum(float(p.get("amount") or 0) for p in payments)
    month_payments = [p for p in payments if in_month(p.get("createdAt"))]
    month_total = sum(float(p.get("amount") or 0) for p in month_payments)
    month_signups = [s for s in signups if in_month(s.get("submittedAt"))]

    return {
        "signupsTotal": len(signups),
        "signupsThisMonth": len(month_signups),
        "paymentsTotal": len(payments),
        "paymentsThisMonth": len(month_payments),
        "paymentsAmountTotal": round(paid_total, 2),
        "paymentsAmountThisMonth": round(month_total, 2),
        "printOrdersPending": sum(1 for o in print_orders if o.get("status") == "pending"),
        "printOrdersFulfilled": sum(1 for o in print_orders if o.get("status") == "fulfilled"),
    }


def register_submissions_admin_routes(app) -> None:
    from flask import jsonify, request

    @app.route("/api/admin/submissions-dashboard", methods=["GET", "OPTIONS"])
    def admin_submissions_dashboard():
        if request.method == "OPTIONS":
            return "", 204

        if not _admin_token():
            return jsonify(
                {
                    "error": "Not configured",
                    "message": "Set SUBMISSIONS_ADMIN_TOKEN (or POSTER_ADMIN_TOKEN) on the server.",
                }
            ), 503
        if not submissions_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        signups, signups_error = fetch_sheet_signups()
        payments, payments_error = fetch_stripe_payments()
        print_orders = build_print_orders()

        return jsonify(
            {
                "fetchedAt": datetime.now(timezone.utc).isoformat(),
                "summary": build_submissions_summary(signups, payments, print_orders),
                "signups": signups,
                "payments": payments,
                "printOrders": print_orders,
                "errors": {
                    "signups": signups_error,
                    "payments": payments_error,
                },
            }
        )
