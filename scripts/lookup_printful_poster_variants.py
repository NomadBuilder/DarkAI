#!/usr/bin/env python3
"""
Fetch Printful catalog variant IDs for Enhanced Matte Paper Poster (imperial sizes).

Usage (from repo root, with API key in env):
  export PRINTFUL_API_KEY=...
  python3 scripts/lookup_printful_poster_variants.py

Optional: PRINTFUL_STORE_ID if your token requires X-PF-Store-Id.

Prints JSON suitable for PRINTFUL_POSTER_VARIANTS_JSON, e.g.
  {"18x24": 12345, "24x36": 67890}
"""

from __future__ import annotations

import base64
import json
import os
import sys

import requests


def main() -> int:
    key = os.getenv("PRINTFUL_API_KEY", "").strip()
    if not key:
        print("Set PRINTFUL_API_KEY", file=sys.stderr)
        return 1

    if os.getenv("PRINTFUL_USE_BEARER", "").strip() == "1":
        auth = f"Bearer {key}"
    else:
        basic = base64.b64encode(f"{key}:".encode("ascii")).decode("ascii")
        auth = f"Basic {basic}"

    headers = {
        "Authorization": auth,
        "Content-Type": "application/json",
    }
    store = os.getenv("PRINTFUL_STORE_ID", "").strip()
    if store:
        headers["X-PF-Store-Id"] = store

    # Catalog products (Printful API v1)
    r = requests.get("https://api.printful.com/products", headers=headers, timeout=60)
    try:
        data = r.json()
    except Exception:
        print(r.text[:1000], file=sys.stderr)
        return 1

    if r.status_code >= 400:
        print(json.dumps(data, indent=2), file=sys.stderr)
        return 1

    result = data.get("result") or []
    target = None
    for p in result:
        name = (p.get("title") or p.get("name") or "").lower()
        if "enhanced matte paper poster" in name and "(in)" in name:
            target = p
            break
        if "enhanced matte" in name and "poster" in name and "(in)" in name:
            target = p
            break

    if not target:
        print(
            "Could not find 'Enhanced Matte Paper Poster (in)'. "
            "Adjust search or inspect products JSON below.",
            file=sys.stderr,
        )
        print(json.dumps(result[:30], indent=2)[:8000])
        return 1

    pid = target.get("id") or target.get("product_id")
    print(f"# Found product id={pid} title={target.get('title')!r}", file=sys.stderr)

    r2 = requests.get(
        f"https://api.printful.com/products/{pid}",
        headers=headers,
        timeout=60,
    )
    detail = r2.json()
    if r2.status_code >= 400:
        print(json.dumps(detail, indent=2), file=sys.stderr)
        return 1

    variants = detail.get("result", {}).get("variants") or []
    out: dict[str, int] = {}
    for v in variants:
        name = (v.get("name") or "").lower().replace("×", "x")
        vid = v.get("variant_id") or v.get("id")
        if not vid:
            continue
        if "18" in name and "24" in name and "18x24" in name.replace(" ", ""):
            out.setdefault("18x24", int(vid))
        if "24" in name and "36" in name and "24x36" in name.replace(" ", ""):
            out.setdefault("24x36", int(vid))

    # Fallback: parse size from variant name
    for v in variants:
        name = (v.get("name") or "").lower()
        vid = v.get("variant_id") or v.get("id")
        if not vid:
            continue
        if "18" in name and "24" in name and "36" not in name:
            out.setdefault("18x24", int(vid))
        if "24" in name and "36" in name:
            out.setdefault("24x36", int(vid))

    print(json.dumps(out, indent=2))
    print("\n# Set on Render:", file=sys.stderr)
    print(f'# PRINTFUL_POSTER_VARIANTS_JSON={json.dumps(out, separators=(",", ":"))}', file=sys.stderr)
    return 0 if len(out) == 2 else 1


if __name__ == "__main__":
    raise SystemExit(main())
