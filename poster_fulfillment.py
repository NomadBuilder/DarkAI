"""
Printful checkout: Stripe Checkout + Printful draft orders (never exposed to customers).

Posters + white DTG tees share upload + webhook; Printful item file type differs.

Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRINTFUL_API_KEY, SITE_URL,
  PRINTFUL_POSTER_VARIANTS_JSON (or PRINTFUL_VARIANT_POSTER_18x24 / _24x36),
  PRINTFUL_SHIRT_VARIANTS_JSON — JSON map sizes S,M,L,XL,2XL → Printful variant_id
    (run scripts/lookup_printful_shirt_variants.py with PRINTFUL_API_KEY set),
  PRINTFUL_SHIRT_FILE_TYPE — front placement for DTG (default: front; try front_large if Printful rejects),
  SHIRT_PRICE_CENTS_CAD — default unit price for all sizes if SHIRT_PRICES_CENTS_JSON unset,
  SHIRT_PRICES_CENTS_JSON — optional per-size cents, e.g. {"S":3500,"M":3500,"L":3500,"XL":3600,"2XL":3800},
  optional PRINTFUL_STORE_ID, RESEND_API_KEY, POSTER_ALERT_EMAIL (or CONTACT_EMAIL),
  POSTER_ADMIN_TOKEN (for GET /api/admin/poster-orders).
"""

from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

POSTER_SIZES = frozenset({"18x24", "24x36"})
PRICES_CENTS_CAD = {"18x24": 4500, "24x36": 6500}

PRODUCT_POSTER = "poster"
PRODUCT_SHIRT = "shirt"
SHIRT_SIZES = frozenset({"S", "M", "L", "XL", "2XL"})

ARTWORK_SUBDIR = "uploads/print-artwork"


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


def _fulfillment_log_path() -> Path:
    return instance_dir() / "poster_fulfillment_log.jsonl"


def append_fulfillment_log(entry: dict) -> None:
    line = json.dumps(entry, default=str, ensure_ascii=False)
    with open(_fulfillment_log_path(), "a", encoding="utf-8") as f:
        f.write(line + "\n")


def send_poster_fulfillment_alert(
    *,
    subject: str,
    body_text: str,
    body_html: str | None = None,
) -> None:
    """Notify ops when fulfillment needs attention (Resend)."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        logger.warning("Poster alert skipped: RESEND_API_KEY not set (%s)", subject)
        return
    to = (
        os.getenv("POSTER_ALERT_EMAIL", "").strip()
        or os.getenv("CONTACT_EMAIL", "").strip()
        or os.getenv("FROM_EMAIL", "").strip()
    )
    if not to:
        logger.warning("Poster alert skipped: no POSTER_ALERT_EMAIL or CONTACT_EMAIL (%s)", subject)
        return
    from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev").strip()
    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": from_email,
                "to": [to],
                "subject": subject[:998],
                "text": body_text[:50000],
                "html": (body_html or f"<pre>{body_text[:50000]}</pre>")[:50000],
            },
            timeout=20,
        )
        if r.status_code >= 400:
            logger.error("Poster alert email failed: %s %s", r.status_code, r.text[:500])
    except requests.RequestException:
        logger.exception("Poster alert email request failed")


def write_pending_order(session_id: str, payload: dict, *, send_alert: bool = True) -> None:
    p = instance_dir() / f"pending_print_order_{session_id}.json"
    p.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
    logger.warning("Wrote pending print order for manual fulfillment: %s", p)
    if send_alert and (
        os.getenv("POSTER_ALERT_EMAIL", "").strip()
        or os.getenv("CONTACT_EMAIL", "").strip()
    ):
        reason = str(payload.get("reason", "unknown"))
        subject = f"[ProtectOnt posters] Action needed: {reason} ({session_id[:12]}…)"
        body = json.dumps(payload, indent=2, default=str)
        send_poster_fulfillment_alert(subject=subject, body_text=body)


def _poster_admin_authorized() -> bool:
    from flask import request

    token = os.getenv("POSTER_ADMIN_TOKEN", "").strip()
    if not token:
        return False
    auth = (request.headers.get("Authorization") or "").strip()
    if auth.lower().startswith("bearer ") and auth[7:].strip() == token:
        return True
    if (request.headers.get("X-Poster-Admin-Token") or "").strip() == token:
        return True
    return False


def list_pending_poster_orders() -> list[dict]:
    out: list[dict] = []
    inst = instance_dir()
    for p in sorted(
        inst.glob("pending_print_order_*.json"),
        key=lambda x: x.stat().st_mtime,
        reverse=True,
    ):
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            out.append(
                {
                    "file": p.name,
                    "session_id": p.stem.replace("pending_print_order_", ""),
                    "mtime_iso": datetime.fromtimestamp(p.stat().st_mtime).isoformat(),
                    "payload": data,
                }
            )
        except Exception as e:
            out.append({"file": p.name, "error": str(e)})
    return out


def read_recent_fulfillment_log(max_lines: int = 80) -> list[dict]:
    p = _fulfillment_log_path()
    if not p.exists():
        return []
    lines = p.read_text(encoding="utf-8").splitlines()
    tail = lines[-max_lines:]
    rows: list[dict] = []
    for line in tail:
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except Exception:
            rows.append({"raw": line[:200]})
    return rows


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


def normalize_shirt_size(raw: str) -> str:
    k = (raw or "").strip().upper()
    if k == "XXL":
        return "2XL"
    return k


def get_shirt_variant_ids() -> dict[str, int]:
    raw = os.getenv("PRINTFUL_SHIRT_VARIANTS_JSON", "").strip()
    if not raw:
        return {}
    try:
        data = json.loads(raw)
        out: dict[str, int] = {}
        for k, v in data.items():
            sk = normalize_shirt_size(str(k))
            if sk in SHIRT_SIZES:
                out[sk] = int(v)
        return out
    except Exception:
        return {}


def get_shirt_prices_cents() -> dict[str, int]:
    single = int(os.getenv("SHIRT_PRICE_CENTS_CAD", "3800"))
    base = {s: single for s in SHIRT_SIZES}
    raw = os.getenv("SHIRT_PRICES_CENTS_JSON", "").strip()
    if not raw:
        return base
    try:
        data = json.loads(raw)
        for k, v in data.items():
            sk = normalize_shirt_size(str(k))
            if sk in SHIRT_SIZES:
                base[sk] = int(v)
    except Exception:
        pass
    return base


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
    file_type: str = "default",
):
    """POST /orders with confirm=false → draft (manual confirmation in Printful dashboard).

    Posters use file_type \"default\"; DTG shirts typically \"front\" or \"front_large\".
    """
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
                "files": [{"type": file_type, "url": artwork_url}],
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
        product = (payload.get("product") or PRODUCT_POSTER).strip().lower()
        image_url = (payload.get("imageUrl") or "").strip()

        ok, err = validate_public_image_url(image_url)
        if not ok:
            return jsonify({"error": err}), 400

        site = os.getenv("SITE_URL", "https://protectont.ca/").strip().rstrip("/") + "/"
        success_url = os.getenv(
            "STRIPE_SUCCESS_URL",
            f"{site.rstrip('/')}/checkout-success?session_id={{CHECKOUT_SESSION_ID}}",
        )
        cancel_url = os.getenv(
            "STRIPE_CANCEL_URL",
            f"{site.rstrip('/')}/checkout-cancelled",
        )

        meta: dict[str, str] = {
            "product": product,
            "imageUrl": image_url if len(image_url) <= 490 else "",
            "imagePath": (urlparse(image_url).path or "")[:490],
        }

        if product == PRODUCT_POSTER:
            size = (payload.get("size") or "").strip()
            if size not in POSTER_SIZES:
                return jsonify({"error": "size must be 18x24 or 24x36"}), 400
            amount = PRICES_CENTS_CAD.get(size)
            if amount is None:
                return jsonify({"error": "Invalid pricing"}), 400
            meta["size"] = size
            line_name = f"Matte poster print ({size} in, vertical)"
            line_desc = "Protect Ontario — custom poster fulfillment"
        elif product == PRODUCT_SHIRT:
            shirt_size = normalize_shirt_size(payload.get("shirtSize") or "")
            if shirt_size not in SHIRT_SIZES:
                return jsonify({"error": "shirtSize must be S, M, L, XL, or 2XL"}), 400
            prices = get_shirt_prices_cents()
            amount = prices.get(shirt_size)
            if amount is None:
                return jsonify({"error": "Invalid shirt pricing"}), 400
            if not get_shirt_variant_ids().get(shirt_size):
                return jsonify(
                    {"error": "Shirt fulfilment not configured (set PRINTFUL_SHIRT_VARIANTS_JSON)"}
                ), 503
            meta["shirtSize"] = shirt_size
            line_name = f"White unisex tee — front print (size {shirt_size})"
            line_desc = "Protect Ontario — Bella Canvas 3001 (white), DTG front"
        else:
            return jsonify({"error": "product must be poster or shirt"}), 400

        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                currency="cad",
                line_items=[
                    {
                        "price_data": {
                            "currency": "cad",
                            "product_data": {
                                "name": line_name,
                                "description": line_desc,
                            },
                            "unit_amount": amount,
                        },
                        "quantity": 1,
                    }
                ],
                shipping_address_collection={"allowed_countries": ["CA"]},
                phone_number_collection={"enabled": True},
                metadata=meta,
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

        product = (meta.get("product") or PRODUCT_POSTER).strip().lower()
        if product not in (PRODUCT_POSTER, PRODUCT_SHIRT):
            product = PRODUCT_POSTER

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

        poster_size = (meta.get("size") or "").strip()
        shirt_sz = normalize_shirt_size(meta.get("shirtSize") or "")

        if product == PRODUCT_SHIRT:
            if shirt_sz not in SHIRT_SIZES:
                write_pending_order(
                    session_id,
                    {"reason": "bad_shirt_size", "metadata": meta, "session_id": session_id},
                )
                mark_session_processed(session_id)
                return "", 200
        else:
            if poster_size not in POSTER_SIZES:
                write_pending_order(
                    session_id,
                    {"reason": "bad_size", "metadata": meta, "session_id": session_id},
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
                    "product": product,
                    "imageUrl": image_url,
                    "poster_size": poster_size,
                    "shirtSize": shirt_sz,
                    "stripe_email": email,
                },
            )
            mark_session_processed(session_id)
            return "", 200

        if product == PRODUCT_SHIRT:
            variants = get_shirt_variant_ids()
            variant_id = variants.get(shirt_sz)
            file_type = os.getenv("PRINTFUL_SHIRT_FILE_TYPE", "front").strip() or "front"
            log_label = shirt_sz
        else:
            variants = get_poster_variant_ids()
            variant_id = variants.get(poster_size)
            file_type = "default"
            log_label = poster_size

        if not variant_id:
            logger.error("No Printful variant ID for %s size %s", product, log_label)
            write_pending_order(
                session_id,
                {
                    "reason": "missing_variant_id",
                    "product": product,
                    "size": log_label,
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
            file_type=file_type,
        )
        if not ok_pf:
            write_pending_order(
                session_id,
                {
                    "reason": "printful_error",
                    "printful": result,
                    "recipient": recipient,
                    "imageUrl": image_url,
                    "product": product,
                    "size": log_label,
                    "variant_id": variant_id,
                },
            )
        else:
            order_id = None
            if isinstance(result, dict):
                res = result.get("result")
                if isinstance(res, dict):
                    order_id = res.get("id")
            append_fulfillment_log(
                {
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "event": "printful_draft_created",
                    "stripe_session_id": session_id,
                    "printful_order_id": order_id,
                    "product": product,
                    "size": log_label,
                    "imageUrl": image_url,
                }
            )

        mark_session_processed(session_id)
        return "", 200

    @app.route("/api/admin/poster-orders", methods=["GET"])
    def admin_poster_orders():
        """List pending JSON files + recent fulfillment log. Set POSTER_ADMIN_TOKEN; send Authorization: Bearer <token>."""
        import html

        from flask import Response, jsonify, request

        if not os.getenv("POSTER_ADMIN_TOKEN", "").strip():
            return jsonify({"error": "POSTER_ADMIN_TOKEN not configured on server"}), 503
        if not _poster_admin_authorized():
            return jsonify({"error": "Unauthorized"}), 401

        pending = list_pending_poster_orders()
        processed = len(load_processed_sessions())
        recent = read_recent_fulfillment_log(120)
        payload = {
            "pending": pending,
            "processed_webhook_sessions_count": processed,
            "recent_fulfillment_log": recent,
        }

        if request.args.get("format") == "html":
            rows = []
            for x in pending:
                sid = html.escape(str(x.get("session_id", "")))
                mtime = html.escape(str(x.get("mtime_iso", "")))
                reason = html.escape(str((x.get("payload") or {}).get("reason", "")))
                rows.append(f"<tr><td>{sid}</td><td>{mtime}</td><td>{reason}</td></tr>")
            rows_html = "".join(rows) if rows else '<tr><td colspan="3">No pending files</td></tr>'
            body = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Print orders — admin</title>
<style>
body{{font-family:system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem;color:#111}}
table{{border-collapse:collapse;width:100%;margin:1rem 0}} th,td{{border:1px solid #ccc;padding:8px;text-align:left;font-size:14px}}
pre{{background:#f4f4f5;padding:1rem;overflow:auto;font-size:12px;border-radius:8px}}
code{{background:#eee;padding:2px 6px;border-radius:4px}}
</style></head><body>
<h1>Printful fulfilment</h1>
<p>Stripe webhook idempotency set size: <strong>{processed}</strong></p>
<h2>Pending manual / failed fulfillment</h2>
<table><thead><tr><th>Session</th><th>Updated (server)</th><th>Reason</th></tr></thead><tbody>{rows_html}</tbody></table>
<h2>Recent log (drafts created)</h2>
<pre>{html.escape(json.dumps(recent[-40:], indent=2, default=str))}</pre>
<p><small>JSON: <code>/api/admin/poster-orders</code> with same Bearer token.</small></p>
</body></html>"""
            return Response(body, mimetype="text/html; charset=utf-8")

        return jsonify(payload)
