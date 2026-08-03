"""
Anti-Default — inclusive language review UI (static Next export) + scrape API.
Served at /anti-default on the DarkAI consolidated platform.
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

anti_default_bp = Blueprint("anti_default", __name__)

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


@anti_default_bp.route("/api/scrape", methods=["POST"])
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
                "User-Agent": "AntiDefaultInclusiveReview/1.0 (+https://darkai.ca/anti-default)",
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


MAX_UPLOAD_BYTES = 8_000_000


@anti_default_bp.route("/api/extract", methods=["POST"])
def extract_document():
    """Extract text from uploaded PDF / DOCX / plain text for review."""
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        return jsonify({"error": "Upload a PDF, DOCX, or text file."}), 400

    filename = upload.filename
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    raw = upload.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        return jsonify({"error": "File is too large (max 8MB)."}), 400

    try:
        if ext in {"txt", "md", "markdown", "csv", "json", "html", "htm", "rtf"}:
            text = raw.decode("utf-8", errors="replace")
        elif ext == "pdf":
            text = _extract_pdf(raw)
        elif ext in {"docx"}:
            text = _extract_docx(raw)
        elif ext == "doc":
            return jsonify(
                {
                    "error": "Legacy .doc is not supported — save as .docx or PDF and try again."
                }
            ), 400
        else:
            return jsonify(
                {
                    "error": "Unsupported file type. Use PDF, DOCX, TXT, MD, CSV, HTML, or JSON."
                }
            ), 400

        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return jsonify({"error": "No readable text found in that file."}), 400

        return jsonify(
            {
                "filename": filename,
                "text": text[:200_000],
                "chars": min(len(text), 200_000),
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc) or "Could not extract text."}), 400


def _extract_pdf(raw: bytes) -> str:
    from io import BytesIO

    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError(
            "PDF support is not installed on the server (pypdf)."
        ) from exc

    reader = PdfReader(BytesIO(raw))
    parts: list[str] = []
    for page in reader.pages[:80]:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def _extract_docx(raw: bytes) -> str:
    from io import BytesIO

    try:
        from docx import Document
    except ImportError as exc:
        raise RuntimeError(
            "DOCX support is not installed on the server (python-docx)."
        ) from exc

    document = Document(BytesIO(raw))
    return "\n".join(p.text for p in document.paragraphs if p.text)


@anti_default_bp.route("/")
@anti_default_bp.route("/<path:path>")
def serve_static(path: str = ""):
    """Serve the Next.js static export under /anti-default."""
    root = _out_dir()
    if not os.path.isdir(root):
        return jsonify(
            {
                "error": "Anti-Default UI not built. Run: cd anti_default && BASE_PATH=/anti-default STATIC_EXPORT=true npm run build",
                "out_dir": root,
            }
        ), 503

    if path.startswith("api/") or path == "api":
        abort(404)

    if not path or path.endswith("/"):
        candidate = os.path.join(root, path, "index.html")
        if os.path.isfile(candidate):
            return send_from_directory(os.path.dirname(candidate), "index.html")

    full = os.path.join(root, path)
    if os.path.isfile(full):
        return send_from_directory(root, path)

    index_candidate = os.path.join(root, path, "index.html")
    if os.path.isfile(index_candidate):
        return send_from_directory(os.path.join(root, path), "index.html")

    index = os.path.join(root, "index.html")
    if os.path.isfile(index):
        return send_from_directory(root, "index.html")

    abort(404)
