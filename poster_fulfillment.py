"""
Poster checkout: Stripe Checkout + Printful draft orders (never exposed to customers).
Configure variant IDs via PRINTFUL_POSTER_VARIANTS_JSON or PRINTFUL_VARIANT_POSTER_* env vars.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from pathlib import Path
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

POSTER_SIZES = frozenset({"18x24", "24x36"})
PRICES_CENTS_CAD = {"18x24": 4500, "24x36": 6500}

ARTWORK_SUBDIR = "uploads/print-artwork"

TARGET_RATIO = 2 / 3  # width / height for vertical 2:3 posters
RATIO_TOLERANCE = 0.02


def _repo_root() -> Path:
    return Path(__file__).resolve().parent


def instance_dir() -> Path:
    d = _repo_root() / "instance"
    d.mkdir(parents=True, exist_ok=True)
    return d


def artwork_dir() -> Path:
    d = _repo_root() / "static" / ARTWORK_SUBDIR
    d.mkdir(parents=True, exist_ok=True)
    return d


def _sessions_path() -> Path:
    return instance_dir() / "stripe_poster_sessions.json"


def load_processed_sessions() -> set[str]:
    p = _sessions_path()
    if not p.exists():
        return set()
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return set(data.get("sessions", []))
    except Exception:
        return set()


def mark_session_processed(session_id: str) -> None:
    s = load_processed_sessions()
    s.add(session_id)
    _sessions_path().write_text(
        json.dumps({"sessions": sorted(s)}, indent=2),
        encoding="utf-8",
    )


def write_pending_order(session_id: str, payload: dict) -> None:
    p = instance_dir() / f"pending_print_order_{session_id}.json"
    p.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
    logger.warning("Wrote pending print order for manual fulfillment: %s", p)


def allowed_image_hosts() -> set[str]:
    hosts = {
        "protectont.ca",
        "www.protectont.ca",
        "localhost",
        "127.0.0.1",
    }
    extra = os.getenv("POSTER_IMAGE_ALLOWED_HOSTS", "")
    for part in extra.split(","):
        h = part.strip().lower()
        if h:
            hosts.add(h)
    site = os.getenv("SITE_URL", "https://protectont.ca").strip()
    if site:
        try:
            netloc = urlparse(site).netloc.lower().split(":")[0]
            if netloc:
                hosts.add(netloc)
        except Exception:
            pass
    return hosts


def is_safe_artwork_path(path: str) -> bool:
    return path.startswith(f"/static/{ARTWORK_SUBDIR}/") or path.startswith(
        f"/{ARTWORK_SUBDIR}/"
    )


def validate_public_image_url(raw_url: str) -> tuple[bool, str]:
    if not raw_url or not isinstance(raw_url, str):
        return False, "imageUrl required"
    raw_url = raw_url.strip()
    try:
        u = urlparse(raw_url)
    except Exception:
        return False, "Invalid imageUrl"
    if u.scheme not in ("https", "http"):
        return False, "Image URL must be http(s)"
    host = (u.netloc or "").lower().split(":")[0]
    if host not in allowed_image_hosts():
        return False, "Image must be hosted on this site"
    path = u.path or ""
    if not is_safe_artwork_path(path):
        return False, "Image path must be under print artwork uploads"
    return True, ""


def get_poster_variant_ids() -> dict[str, int]:
    raw = os.getenv("PRINTFUL_POSTER_VARIANTS_JSON", "").strip()
    if raw:
        try:
            data = json.loads(raw)
            out = {}
            for k, v in data.items():
                if k in POSTER_SIZES:
                    out[k] = int(v)
            return out
        except Exception:
            pass
    out: dict[str, int] = {}
    v1824 = os.getenv("PRINTFUL_VARIANT_POSTER_18x24", "").strip()
    v2436 = os.getenv("PRINTFUL_VARIANT_POSTER_24x36", "").strip()
    if v1824:
        out["18x24"] = int(v1824)
    if v2436:
        out["24x36"] = int(v2436)
    return out


def printful_headers() -> dict[str, str]:
    """Printful private tokens use Basic auth (key as username, empty password)."""
    key = os.getenv("PRINTFUL_API_KEY", "").strip()
    if not key:
        return {"Content-Type": "application/json"}
    if os.getenv("PRINTFUL_USE_BEARER", "").strip() == "1":
        return {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
    basic = base64.b64encode(f"{key}:".encode("ascii")).decode("ascii")
    return {
        "Authorization": f"Basic {basic}",
        "Content-Type": "application/json",
    }


def create_printful_draft_order_v1(
    *,
    external_id: str,
    variant_id: int,
    artwork_url: str,
    recipient: dict,
):
    """POST /orders with confirm=false → draft (manual confirmation in Printful dashboard)."""
    key = os.getenv("PRINTFUL_API_KEY", "").strip()
    if not key:
        return False, "PRINTFUL_API_KEY not configured"

    url = "https://api.printful.com/orders"
    params = {"confirm": "false"}
    body = {
        "external_id": external_id,
        "shipping": "STANDARD",
        "recipient": recipient,
        "items": [
            {
                "variant_id": variant_id,
                "quantity": 1,
                "files": [{"type": "default", "url": artwork_url}],
            }
        ],
    }
    store_id = os.getenv("PRINTFUL_STORE_ID", "").strip()
    headers = printful_headers()
    if store_id:
        headers["X-PF-Store-Id"] = store_id

    try:
        r = requests.post(url, params=params, headers=headers, json=body, timeout=60)
        try:
            data = r.json()
        except Exception:
            data = {"raw": r.text[:2000]}
        if r.status_code >= 400:
            logger.error("Printful order failed: %s %s", r.status_code, data)
            return False, data
        logger.info("Printful draft order created: %s", data)
        return True, data
    except requests.RequestException as e:
        logger.exception("Printful request error")
        return False, str(e)


def shipping_to_printful_recipient(shipping_details: dict, email: str | None) -> dict | None:
    if not shipping_details:
        return None
    addr = shipping_details.get("address") or {}
    name = (shipping_details.get("name") or "").strip() or "Customer"
    line1 = addr.get("line1") or ""
    city = addr.get("city") or ""
    country = (addr.get("country") or "").upper()
    state = addr.get("state") or ""
    postal = addr.get("postal_code") or ""
    line2 = addr.get("line2") or ""
    phone = (shipping_details.get("phone") or "") or ""

    if country != "CA":
        return None

    return {
        "name": name,
        "address1": line1,
        "address2": line2 or "",
        "city": city,
        "state_code": state,
        "country_code": country,
        "zip": postal,
        "phone": phone,
        "email": email or "",
    }


def register_poster_routes(app):
    """Register upload, Stripe checkout, and webhook on the Flask app."""

    @app.route("/api/upload-print-artwork", methods=["POST", "OPTIONS"])
    def upload_print_artwork():
        from flask import jsonify, request

        if request.method == "OPTIONS":
            return "", 204

        if "file" not in request.files:
            return jsonify({"error": "file field required"}), 400
        f = request.files["file"]
        if not f or not f.filename:
            return jsonify({"error": "Empty file"}), 400

        ext = Path(f.filename).suffix.lower()
        if ext not in (".png", ".jpg", ".jpeg", ".webp"):
            return jsonify({"error": "Allowed types: png, jpg, jpeg, webp"}), 400

        uid = uuid.uuid4().hex
        safe_ext = ".png" if ext == ".png" else ".jpg" if ext in (".jpg", ".jpeg") else ".webp"
        rel_path = f"{ARTWORK_SUBDIR}/{uid}{safe_ext}"
        out = _repo_root() / "static" / rel_path
        out.parent.mkdir(parents=True, exist_ok=True)
        f.save(out)

        base = os.getenv("SITE_URL", "").strip().rstrip("/")
        if not base:
            base = request.url_root.rstrip("/")
        url = f"{base}/static/{rel_path}"
        return jsonify({"url": url, "path": f"/static/{rel_path}"})

    @app.route("/api/create-checkout-session", methods=["POST", "OPTIONS"])
    def create_checkout_session():
        from flask import jsonify, request

        if request.method == "OPTIONS":
            return "", 204

        import stripe

        secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
        if not secret:
            return jsonify({"error": "Payments not configured"}), 503
        stripe.api_key = secret

        payload = request.get_json(silent=True) or {}
        image_url = (payload.get("imageUrl") or "").strip()
        size = (payload.get("size") or "").strip()

        ok, err = validate_public_image_url(image_url)
        if not ok:
            return jsonify({"error": err}), 400
        if size not in POSTER_SIZES:
            return jsonify({"error": "size must be 18x24 or 24x36"}), 400

        amount = PRICES_CENTS_CAD.get(size)
        if amount is None:
            return jsonify({"error": "Invalid pricing"}), 400

        site = os.getenv("SITE_URL", "https://protectont.ca/").strip().rstrip("/") + "/"
        success_url = os.getenv(
            "STRIPE_SUCCESS_URL",
            f"{site.rstrip('/')}/checkout-success?session_id={{CHECKOUT_SESSION_ID}}",
        )
        cancel_url = os.getenv(
            "STRIPE_CANCEL_URL",
            f"{site.rstrip('/')}/checkout-cancelled",
        )

        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                currency="cad",
                line_items=[
                    {
                        "price_data": {
                            "currency": "cad",
                            "product_data": {
                                "name": f"Matte poster print ({size} in, vertical)",
                                "description": "Protect Ontario — custom poster fulfillment",
                            },
                            "unit_amount": amount,
                        },
                        "quantity": 1,
                    }
                ],
                shipping_address_collection={"allowed_countries": ["CA"]},
                phone_number_collection={"enabled": True},
                metadata={
                    "imageUrl": image_url if len(image_url) <= 490 else "",
                    "imagePath": (urlparse(image_url).path or "")[:490],
                    "size": size,
                },
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return jsonify({"url": session.url})
        except Exception as e:
            logger.exception("Stripe checkout session failed")
            return jsonify({"error": str(e)}), 500

    @app.route("/api/stripe-webhook", methods=["POST"])
    def stripe_webhook():
        from flask import abort, request

        import stripe

        secret = os.getenv("STRIPE_SECRET_KEY", "").strip()
        wh_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
        if not secret or not wh_secret:
            logger.error("Stripe webhook or secret key not configured")
            abort(503)

        stripe.api_key = secret
        payload = request.get_data(cache=False)
        sig = request.headers.get("Stripe-Signature")
        if not sig:
            abort(400)

        try:
            from stripe.error import SignatureVerificationError
        except ImportError:
            SignatureVerificationError = type("SignatureVerificationError", (Exception,), {})
        try:
            event = stripe.Webhook.construct_event(payload, sig, wh_secret)
        except ValueError:
            abort(400)
        except SignatureVerificationError:
            abort(400)

        if event["type"] != "checkout.session.completed":
            return "", 200

        session_obj = event["data"]["object"]
        session_id = session_obj.get("id")
        if not session_id:
            return "", 200

        if session_id in load_processed_sessions():
            logger.info("Skipping duplicate webhook for session %s", session_id)
            return "", 200

        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception:
            logger.exception("Failed to retrieve session %s", session_id)
            abort(500)

        sd = session.to_dict()
        meta = dict(sd.get("metadata") or {})
        image_url = (meta.get("imageUrl") or "").strip()
        if not image_url.startswith("http"):
            path = (meta.get("imagePath") or "").strip()
            if path.startswith("/"):
                base = os.getenv("SITE_URL", "https://protectont.ca").strip().rstrip("/")
                image_url = f"{base}{path}"
        size = (meta.get("size") or "").strip()

        ok, err = validate_public_image_url(image_url)
        if not ok:
            logger.error("Invalid image URL in session metadata: %s", err)
            write_pending_order(
                session_id,
                {
                    "reason": "invalid_image_url",
                    "error": err,
                    "metadata": meta,
                    "session_id": session_id,
                },
            )
            mark_session_processed(session_id)
            return "", 200

        if size not in POSTER_SIZES:
            write_pending_order(
                session_id,
                {"reason": "bad_size", "metadata": meta},
            )
            mark_session_processed(session_id)
            return "", 200

        shipping = sd.get("shipping_details") or sd.get("shipping")

        email = None
        cd = sd.get("customer_details")
        if isinstance(cd, dict) and cd.get("email"):
            email = cd.get("email")
        if not email and sd.get("customer_email"):
            email = sd.get("customer_email")

        recipient = shipping_to_printful_recipient(
            shipping if isinstance(shipping, dict) else {},
            email,
        )
        if not recipient:
            logger.error("Missing or non-CA shipping for session %s", session_id)
            write_pending_order(
                session_id,
                {
                    "reason": "shipping",
                    "session_id": session_id,
                    "imageUrl": image_url,
                    "size": size,
                    "stripe_email": email,
                },
            )
            mark_session_processed(session_id)
            return "", 200

        variants = get_poster_variant_ids()
        variant_id = variants.get(size)
        if not variant_id:
            logger.error("No Printful variant ID for size %s", size)
            write_pending_order(
                session_id,
                {
                    "reason": "missing_variant_id",
                    "size": size,
                    "recipient": recipient,
                    "imageUrl": image_url,
                },
            )
            mark_session_processed(session_id)
            return "", 200

        ok_pf, result = create_printful_draft_order_v1(
            external_id=session_id,
            variant_id=int(variant_id),
            artwork_url=image_url,
            recipient=recipient,
        )
        if not ok_pf:
            write_pending_order(
                session_id,
                {
                    "reason": "printful_error",
                    "printful": result,
                    "recipient": recipient,
                    "imageUrl": image_url,
                    "size": size,
                    "variant_id": variant_id,
                },
            )

        mark_session_processed(session_id)
        return "", 200
