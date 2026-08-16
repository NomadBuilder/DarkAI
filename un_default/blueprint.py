"""
Un-Default — inclusive language review UI (static Next export) + scrape API.
Served at /un-default on the DarkAI consolidated platform.
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

un_default_bp = Blueprint("un_default", __name__)

MAX_HTML_BYTES = 1_500_000
FETCH_TIMEOUT = 12
SKIP_TAGS = {"script", "style", "noscript", "svg", "canvas", "iframe", "template"}


def _normalize_url(raw: str) -> str:
    """Accept bare hostnames like livingoutloud.life by defaulting to https."""
    value = (raw or "").strip()
    if not value:
        return value
    if "://" not in value:
        value = "https://" + value
    return value


def _is_safe_public_url(raw: str) -> tuple[bool, str]:
    """
    Returns (ok, error_message). error_message is empty when ok.
    """
    try:
        normalized = _normalize_url(raw)
        parsed = urlparse(normalized)
        if parsed.scheme not in ("http", "https"):
            return False, "Use an http:// or https:// web address."
        host = (parsed.hostname or "").lower()
        if not host:
            return False, "That doesn’t look like a valid web address."
        if host == "localhost" or host.endswith(".local"):
            return (
                False,
                "Local addresses can’t be scraped. Use a public https:// site.",
            )
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
                return (
                    False,
                    "Private or local network targets are blocked. Use a public site.",
                )
        return True, ""
    except socket.gaierror:
        return False, "Couldn’t look up that hostname. Check the spelling and try again."
    except Exception:
        return False, "That URL couldn’t be validated. Try a full https:// address."


def _out_dir() -> str:
    return os.path.join(os.path.dirname(__file__), "out")


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


RELATED_PATH_HINTS = re.compile(
    r"(about|careers?|jobs?|product|products|team|mission|company|values|"
    r"culture|story|who[-_]?we[-_]?are|our[-_]?story|join|work[-_]?with|"
    r"solutions?|platform|features?|contact|newsroom|press|media|blog|"
    r"services?|faq|community|diversity|inclusion|equity|sustainability|"
    r"impact|editorial|staff|writers?|columnists?|contribute|advertise|"
    r"subscribe|newsletter|policies|guidelines|standards|ethics)",
    re.I,
)
# Primary URL + up to this many related pages. Keep modest vs gunicorn timeout
# (FETCH_TIMEOUT * (1 + MAX_RELATED_PAGES) should stay under ~120s worst case).
MAX_RELATED_PAGES = 10


def _fetch_html(url: str) -> tuple[str, str]:
    """Return (html, final_url). Raises on soft failures with a message."""
    response = requests.get(
        url,
        timeout=FETCH_TIMEOUT,
        headers={
            "User-Agent": "UnDefaultInclusiveReview/1.0 (+https://darkai.ca/un-default)",
            "Accept": "text/html,application/xhtml+xml",
        },
        allow_redirects=True,
    )
    if response.status_code >= 400:
        raise ValueError(f"Could not fetch URL (HTTP {response.status_code}).")

    content_type = response.headers.get("content-type", "")
    if content_type and "html" not in content_type.lower() and "xml" not in content_type.lower():
        raise ValueError("URL did not return HTML content.")

    raw = response.content
    if len(raw) > MAX_HTML_BYTES:
        raise ValueError("Page is too large to analyze safely.")

    html = raw.decode(response.encoding or "utf-8", errors="replace")
    return html, response.url or url


def _same_registrable_host(a: str, b: str) -> bool:
    try:
        ha = (urlparse(a).hostname or "").lower()
        hb = (urlparse(b).hostname or "").lower()
        if not ha or not hb:
            return False
        if ha.startswith("www."):
            ha = ha[4:]
        if hb.startswith("www."):
            hb = hb[4:]
        return ha == hb
    except Exception:
        return False


def _related_links(html: str, base_url: str) -> list[str]:
    """Find same-site about / careers / product-style links."""
    from urllib.parse import urljoin, urldefrag

    soup = BeautifulSoup(html, "lxml")
    found: list[str] = []
    seen: set[str] = set()
    base_norm = urldefrag(base_url)[0].rstrip("/")

    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        absolute = urljoin(base_url, href)
        absolute = urldefrag(absolute)[0]
        if absolute.rstrip("/") == base_norm:
            continue
        ok, _ = _is_safe_public_url(absolute)
        if not ok:
            continue
        if not _same_registrable_host(base_url, absolute):
            continue
        path = urlparse(absolute).path or "/"
        label = f"{path} {a.get_text(' ', strip=True)}"
        if not RELATED_PATH_HINTS.search(label):
            continue
        key = absolute.rstrip("/").lower()
        if key in seen:
            continue
        seen.add(key)
        found.append(absolute)
        if len(found) >= MAX_RELATED_PAGES:
            break
    return found


@un_default_bp.route("/api/scrape", methods=["POST"])
def scrape():
    payload = request.get_json(silent=True) or {}
    raw_url = (payload.get("url") or "").strip()
    crawl_related = payload.get("crawlRelated", True)
    if not raw_url:
        return jsonify({"error": "Provide a URL."}), 400
    ok, err = _is_safe_public_url(raw_url)
    if not ok:
        return jsonify({"error": err}), 400

    url = _normalize_url(raw_url)

    try:
        html, final_url = _fetch_html(url)
        primary = _extract_text(html, final_url)
        pages = [
            {
                "url": primary["url"],
                "title": primary["title"],
                "text": primary["text"],
            }
        ]

        if crawl_related:
            for link in _related_links(html, final_url):
                try:
                    related_html, related_final = _fetch_html(link)
                    extracted = _extract_text(related_html, related_final)
                    pages.append(
                        {
                            "url": extracted["url"],
                            "title": extracted["title"],
                            "text": extracted["text"],
                        }
                    )
                except Exception:
                    # Related pages are best-effort
                    continue

        combined_parts = []
        for page in pages:
            label = page.get("title") or page["url"]
            combined_parts.append(f"--- {label} ({page['url']}) ---\n{page['text']}")

        return jsonify(
            {
                "url": primary["url"],
                "title": primary["title"],
                "text": "\n\n".join(combined_parts),
                "pages": pages,
                "pageCount": len(pages),
            }
        )
    except requests.Timeout:
        return jsonify({"error": "Timed out while fetching the page."}), 400
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc) or "Failed to scrape URL."}), 400


MAX_UPLOAD_BYTES = 8_000_000

# LinkedIn/Facebook OG crawlers need cacheable images; Flask defaults to no-cache.
_CACHEABLE_STATIC = (
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".css",
    ".js",
    ".map",
)


def _with_static_cache(response, path: str):
    lower = (path or "").lower()
    if any(lower.endswith(ext) for ext in _CACHEABLE_STATIC):
        response.headers["Cache-Control"] = "public, max-age=604800"
        response.headers["Content-Disposition"] = "inline"
    elif lower.endswith(".html") or not lower:
        response.headers["Cache-Control"] = "public, max-age=60"
    return response


@un_default_bp.route("/api/extract", methods=["POST"])
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


@un_default_bp.route("/")
@un_default_bp.route("/<path:path>")
def serve_static(path: str = ""):
    """Serve the Next.js static export under /un-default."""
    root = _out_dir()
    if not os.path.isdir(root):
        return jsonify(
            {
                "error": "Un-Default UI not built. Run: cd un_default && BASE_PATH=/un-default STATIC_EXPORT=true npm run build",
                "out_dir": root,
            }
        ), 503

    if path.startswith("api/") or path == "api":
        abort(404)

    if not path or path.endswith("/"):
        candidate = os.path.join(root, path, "index.html")
        if os.path.isfile(candidate):
            return _with_static_cache(
                send_from_directory(os.path.dirname(candidate), "index.html"),
                "index.html",
            )

    full = os.path.join(root, path)
    if os.path.isfile(full):
        return _with_static_cache(send_from_directory(root, path), path)

    index_candidate = os.path.join(root, path, "index.html")
    if os.path.isfile(index_candidate):
        return _with_static_cache(
            send_from_directory(os.path.join(root, path), "index.html"),
            "index.html",
        )

    index = os.path.join(root, "index.html")
    if os.path.isfile(index):
        return _with_static_cache(send_from_directory(root, "index.html"), "index.html")

    abort(404)
