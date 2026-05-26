"""Flask routes for ProtectOnt community stories."""

from __future__ import annotations

import logging
import os

from stories_store import (
    delete_story,
    insert_story,
    list_public_stories,
    save_avatar_file,
    validate_story_payload,
)

logger = logging.getLogger(__name__)


def _base_url() -> str:
    site = os.getenv("SITE_URL", "https://protectont.ca").strip().rstrip("/")
    return site or "https://protectont.ca"


def register_stories_routes(app):
    @app.route("/api/stories", methods=["GET", "POST", "OPTIONS"])
    def api_stories():
        from flask import jsonify, request

        if request.method == "OPTIONS":
            return "", 204

        if request.method == "GET":
            try:
                limit = int(request.args.get("limit", "100"))
            except ValueError:
                limit = 100
            stories = list_public_stories(_base_url(), limit=limit)
            return jsonify({"stories": stories}), 200

        display_name = (request.form.get("displayName") or request.form.get("display_name") or "").strip()
        story = (request.form.get("story") or "").strip()
        honeypot = (request.form.get("website") or "").strip()

        if request.is_json and not request.form:
            data = request.get_json(silent=True) or {}
            display_name = (data.get("displayName") or data.get("display_name") or "").strip()
            story = (data.get("story") or "").strip()
            honeypot = (data.get("website") or "").strip()

        payload, err = validate_story_payload(display_name, story, honeypot)
        if err:
            return jsonify({"success": False, "error": err}), 400

        avatar_path = None
        if "avatar" in request.files:
            avatar_path, img_err = save_avatar_file(request.files["avatar"])
            if img_err:
                return jsonify({"success": False, "error": img_err}), 400

        result, err = insert_story(
            payload["display_name"],
            payload["story"],
            avatar_path=avatar_path,
        )
        if err:
            return jsonify({"success": False, "error": "Could not save your story. Please try again."}), 500

        msg = (
            "Thank you — your story is live."
            if result and not result.get("pending")
            else "Thank you — your story was received and will appear after a quick review."
        )
        return jsonify({"success": True, "message": msg, **(result or {})}), 200

    @app.route("/api/stories/<story_id>", methods=["DELETE", "OPTIONS"])
    def api_stories_delete(story_id: str):
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

        if delete_story(story_id):
            return jsonify({"success": True}), 200
        return jsonify({"success": False, "error": "Not found"}), 404
