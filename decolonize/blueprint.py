"""
Decolonize — inclusive language review UI (static Next export) + scrape API.
Served at /decolonize on the DarkAI consolidated platform.
"""

from __future__ import annotations

import ipaddress
import os
import re
import socket
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from flask import Blueprint, jsonify, request, send_from_directory, abort

decolonize_bp = Blueprint("decolonize", __name__)

MAX_HTML_BYTES = 1_500_000
FETCH_TIMEOUT = 12
SKIP_TAGS = {"script", "style", "noscript", "svg", "canvas", "iframe", "template"}


def _out_dir() -> str:
    return os.path.join(os.path.dirname(__file__), "out")


def _is_safe_public_url(raw: str) -> bool:
    try:
        parsed = urlparse(raw)
        if parsed.scheme not in ("http", "https"):
            return False
        host = (parsed.hostname or "").lower()
        if not host or host == "localhost" or host.endswith(".local"):
            return False
        # Resolve and reject private / link-local addresses
        infos = socket.getaddrinfo(host, None)
        for info in infos:
            ip = ipaddress.ip_address(info[4][0])
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
            ):
                return False
        return True
    except Exception:
        return False


def _extract_text(html: str, final_url: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(SKIP_TAGS):
        tag.decompose()
    for el in soup.select("[aria-hidden='true']"):
        el.decompose()

    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    if not title:
        og = soup.find("meta", property="og:title")
        if og and og.get("content"):
            title = og["content"].strip()
    if not title:
        title = final_url

    blocks: list[str] = []
    seen: set[str] = set()
    for el in soup.select(
        "h1, h2, h3, h4, p, li, blockquote, figcaption, button, a, label, td, th, dt, dd"
    ):
        text = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if len(text) < 3 or len(text) > 2000:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        blocks.append(text)

    if len(blocks) < 3 and soup.body:
        body = re.sub(r"\s+", " ", soup.body.get_text(" ", strip=True)).strip()
        if body:
            blocks.append(body[:20_000])

    return {"url": final_url, "title": title, "text": "\n".join(blocks)}


@decolonize_bp.route("/api/scrape", methods=["POST"])
def scrape():
    payload = request.get_json(silent=True) or {}
    raw_url = (payload.get("url") or "").strip()
    if not raw_url:
        return jsonify({"error": "Provide a URL."}), 400
    if not _is_safe_public_url(raw_url):
        return jsonify(
            {
                "error": "Only public http(s) URLs are allowed. Local and private network targets are blocked."
            }
        ), 400

    try:
        response = requests.get(
            raw_url,
            timeout=FETCH_TIMEOUT,
            headers={
                "User-Agent": "DecolonizeInclusiveReview/1.0 (+https://darkai.ca/decolonize)",
                "Accept": "text/html,application/xhtml+xml",
            },
            allow_redirects=True,
        )
        if response.status_code >= 400:
            return jsonify({"error": f"Could not fetch URL (HTTP {response.status_code})."}), 400

        content_type = response.headers.get("content-type", "")
        if content_type and "html" not in content_type.lower() and "xml" not in content_type.lower():
            return jsonify({"error": "URL did not return HTML content."}), 400

        raw = response.content
        if len(raw) > MAX_HTML_BYTES:
            return jsonify({"error": "Page is too large to analyze safely."}), 400

        html = raw.decode(response.encoding or "utf-8", errors="replace")
        return jsonify(_extract_text(html, response.url or raw_url))
    except requests.Timeout:
        return jsonify({"error": "Timed out while fetching the page."}), 400
    except Exception as exc:
        return jsonify({"error": str(exc) or "Failed to scrape URL."}), 400


@decolonize_bp.route("/")
@decolonize_bp.route("/<path:path>")
def serve_static(path: str = ""):
    """Serve the Next.js static export under /decolonize."""
    root = _out_dir()
    if not os.path.isdir(root):
        return jsonify(
            {
                "error": "Decolonize UI not built. Run: cd decolonize && BASE_PATH=/decolonize STATIC_EXPORT=true npm run build",
                "out_dir": root,
            }
        ), 503

    # Never serve API through the static catch-all (registered separately above)
    if path.startswith("api/") or path == "api":
        abort(404)

    if not path or path.endswith("/"):
        candidate = os.path.join(root, path, "index.html")
        if os.path.isfile(candidate):
            return send_from_directory(os.path.dirname(candidate), "index.html")

    full = os.path.join(root, path)
    if os.path.isfile(full):
        return send_from_directory(root, path)

    # trailingSlash export: /rules -> rules/index.html
    index_candidate = os.path.join(root, path, "index.html")
    if os.path.isfile(index_candidate):
        return send_from_directory(os.path.join(root, path), "index.html")

    # SPA-ish fallback to root index for unknown client paths
    index = os.path.join(root, "index.html")
    if os.path.isfile(index):
        return send_from_directory(root, "index.html")

    abort(404)
