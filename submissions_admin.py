"""ProtectOnt admin: sign-ups (local store), Stripe payments, print fulfillment."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


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


def load_local_signups() -> tuple[list[dict[str, Any]], str | None]:
    try:
        from get_involved_store import list_submissions

        return list_submissions(), None
    except OSError as exc:
        logger.exception("Local sign-ups read failed")
        return [], f"Could not read sign-ups: {exc}"


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

        signups, signups_error = load_local_signups()
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
