"""Admin API for yard-sign delivery tracking."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

ALLOWED_DELIVERY_STATUSES = frozenset({"new", "paid", "delivered"})


def send_sign_delivery_alert(record: dict[str, Any]) -> None:
    """Email the regional organizer when a new yard-sign request is assigned."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        logger.info("Sign delivery alert skipped: RESEND_API_KEY not set")
        return

    to = (record.get("organizerEmail") or "").strip() or "protectont@gmail.com"
    from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev").strip() or "onboarding@resend.dev"
    name = record.get("name") or "Someone"
    area = record.get("territoryArea") or "Unknown area"
    hub = record.get("hubName") or "See regional lead"
    lead = record.get("regionalLeadName") or "Organizer"

    subject = f"[ProtectOnt] New sign request — {area} — {name}"
    lines = [
        f"A new yard sign was requested in your area ({lead}).",
        "",
        f"Name: {name}",
        f"Email: {record.get('email', '')}",
        f"Phone: {record.get('phone', '') or '(none)'}",
        f"City: {record.get('city', '')}",
        f"Postal code: {record.get('postalCode', '')}",
        f"Quantity: {record.get('yardSignQuantity', '') or '1'}",
        f"Sign size: {record.get('yardSignDesign', '')}",
        f"Payment (self-reported): {record.get('yardSignPaymentStatus', '') or 'not specified'}",
        f"Delivery notes: {record.get('yardSignNotes', '') or '(none)'}",
        "",
        f"Area: {area}",
        f"Local hub: {hub}",
        f"Hub phone: {record.get('hubPhone', '') or '(not on file)'}",
        "",
        "Mark paid or delivered in the admin dashboard:",
        "https://protectont.ca/admin?section=sign-deliveries",
    ]
    body = "\n".join(lines)

    try:
        import requests

        requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "from": from_email,
                "to": [to],
                "subject": subject[:998],
                "text": body[:50000],
            },
            timeout=20,
        )
    except Exception:
        logger.exception("Sign delivery alert failed")


def register_sign_delivery_routes(app) -> None:
    from flask import jsonify, request

    from submissions_admin import submissions_admin_authorized

    @app.route("/api/admin/sign-deliveries", methods=["GET", "OPTIONS"])
    def admin_sign_deliveries_list():
        if request.method == "OPTIONS":
            return "", 204
        if not submissions_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        from get_involved_import import ensure_historical_import
        from get_involved_store import list_yard_sign_requests
        from sign_routing import build_territory_structure, list_leads

        ensure_historical_import()
        rows = list_yard_sign_requests()

        return jsonify(
            {
                "fetchedAt": datetime.now(timezone.utc).isoformat(),
                "leads": list_leads(),
                "territoryStructure": build_territory_structure(),
                "requests": rows,
                "summary": {
                    "total": len(rows),
                    "new": sum(1 for r in rows if (r.get("deliveryStatus") or "new") == "new"),
                    "paid": sum(1 for r in rows if r.get("deliveryStatus") == "paid"),
                    "delivered": sum(1 for r in rows if r.get("deliveryStatus") == "delivered"),
                    "unassigned": sum(1 for r in rows if not r.get("regionalLeadId")),
                },
            }
        )

    @app.route("/api/admin/sign-deliveries/leads/<lead_id>", methods=["PATCH", "OPTIONS"])
    def admin_sign_deliveries_lead_email(lead_id: str):
        if request.method == "OPTIONS":
            return "", 204
        if not submissions_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        from sign_routing import build_territory_structure, save_lead_email

        payload = request.get_json(silent=True) or {}
        email = str(payload.get("email") or "").strip()
        ok, err = save_lead_email(lead_id, email)
        if not ok:
            return jsonify({"error": err or "Could not save email"}), 400

        structure = build_territory_structure()
        lead = next((row for row in structure if row.get("id") == lead_id), None)
        return jsonify({"success": True, "lead": lead, "territoryStructure": structure})

    @app.route("/api/admin/sign-deliveries/territories/<territory_id>", methods=["PATCH", "OPTIONS"])
    def admin_sign_deliveries_territory_hub(territory_id: str):
        if request.method == "OPTIONS":
            return "", 204
        if not submissions_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        from sign_routing import build_territory_structure, save_territory_hub

        payload = request.get_json(silent=True) or {}
        hub_name = str(payload.get("hubName") or "").strip()
        hub_phone = str(payload.get("hubPhone") or "").strip()
        ok, err = save_territory_hub(territory_id, hub_name=hub_name, hub_phone=hub_phone)
        if not ok:
            return jsonify({"error": err or "Could not save local contact"}), 400

        structure = build_territory_structure()
        area = None
        for lead in structure:
            for row in lead.get("areas", []):
                if row.get("id") == territory_id:
                    area = row
                    break
            if area:
                break
        return jsonify({"success": True, "area": area, "territoryStructure": structure})

    @app.route("/api/admin/sign-deliveries/<submission_id>", methods=["PATCH", "OPTIONS"])
    def admin_sign_deliveries_update(submission_id: str):
        if request.method == "OPTIONS":
            return "", 204
        if not submissions_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        from get_involved_store import update_submission

        payload = request.get_json(silent=True) or {}
        patch: dict[str, Any] = {}
        if "deliveryStatus" in payload:
            status = str(payload["deliveryStatus"]).strip().lower()
            if status not in ALLOWED_DELIVERY_STATUSES:
                return jsonify({"error": "Invalid deliveryStatus"}), 400
            patch["deliveryStatus"] = status

        if not patch:
            return jsonify({"error": "No valid fields to update"}), 400

        updated = update_submission(submission_id, patch)
        if not updated:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"success": True, "request": updated})
