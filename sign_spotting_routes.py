"""Flask routes for ProtectOnt sign-in-the-wild gallery."""

from __future__ import annotations

import logging
import os

from sign_spotting_store import (
    delete_sign_spot,
    extract_fsa,
    insert_sign_spot,
    list_public_spots,
    save_spot_photo,
    validate_spot_payload,
)

logger = logging.getLogger(__name__)


def _base_url() -> str:
    site = os.getenv("SITE_URL", "https://protectont.ca").strip().rstrip("/")
    return site or "https://protectont.ca"


def register_sign_spotting_routes(app):
    @app.route("/api/sign-spots", methods=["GET", "POST", "OPTIONS"])
    def api_sign_spots():
        from flask import jsonify, request

        if request.method == "OPTIONS":
            return "", 204

        if request.method == "GET":
            try:
                limit = int(request.args.get("limit", "48"))
            except ValueError:
                limit = 48
            spots, week_count = list_public_spots(_base_url(), limit=limit)
            return jsonify({"spots": spots, "countThisWeek": week_count}), 200

        honeypot = (request.form.get("website") or "").strip()
        caption = (request.form.get("caption") or "").strip()
        postal = (request.form.get("postalCode") or request.form.get("postal_code") or "").strip()
        fsa_field = (request.form.get("fsa") or "").strip().upper()[:3]

        payload, err = validate_spot_payload(honeypot, caption)
        if err:
            return jsonify({"success": False, "error": err}), 400

        if "photo" not in request.files:
            return jsonify({"success": False, "error": "Please upload a photo of your sign."}), 400

        photo_path, img_err = save_spot_photo(request.files["photo"])
        if img_err:
            return jsonify({"success": False, "error": img_err}), 400
        if not photo_path:
            return jsonify({"success": False, "error": "Please upload a photo of your sign."}), 400

        fsa = fsa_field or extract_fsa(postal)
        result, err = insert_sign_spot(
            photo_path,
            fsa=fsa,
            caption=payload.get("caption", ""),
        )
        if err:
            return jsonify({"success": False, "error": err}), 500

        msg = (
            "Thank you — your sign is in the gallery."
            if result and not result.get("pending")
            else "Thank you — your photo was received and will appear after a quick review."
        )
        return jsonify({"success": True, "message": msg, **(result or {})}), 200

    @app.route("/api/sign-spots/<spot_id>", methods=["DELETE", "OPTIONS"])
    def api_sign_spots_delete(spot_id: str):
        from flask import jsonify, request

        if request.method == "OPTIONS":
            return "", 204

        token = os.getenv("STORIES_ADMIN_TOKEN", "").strip()
        if not token:
            return jsonify({"success": False, "error": "Not configured"}), 503

        auth = request.headers.get("Authorization", "")
        provided = auth.removeprefix("Bearer ").strip() if auth.startswith("Bearer ") else ""
        if provided != token:
            return jsonify({"success": False, "error": "Unauthorized"}), 401

        if delete_sign_spot(spot_id):
            return jsonify({"success": True}), 200
        return jsonify({"success": False, "error": "Not found"}), 404
