#!/usr/bin/env python3
"""
Fetch Printful catalog variant IDs for Bella + Canvas 3001 Unisex Staple Tee — White.

Usage (from repo root, with API key in env):
  export PRINTFUL_API_KEY=...
  python3 scripts/lookup_printful_shirt_variants.py

Optional: PRINTFUL_STORE_ID if your token requires X-PF-Store-Id.

Prints JSON suitable for PRINTFUL_SHIRT_VARIANTS_JSON, e.g.
  {"S":4011,"M":4012,"L":4013,"XL":4014,"2XL":4015}

If the catalog title changes, adjust TITLE_MATCH below or pick product id manually from:
  GET https://api.printful.com/products
"""

from __future__ import annotations

import base64
import json
import os
import re
import sys

import requests

# Bella Canvas 3001 is Printful's common DTG tee; title may vary slightly by locale.
TITLE_MATCH = ("3001", "bella")
SIZE_KEYS = ("S", "M", "L", "XL", "2XL")


def parse_white_size(name: str) -> str | None:
    lower = name.lower()
    if "white" not in lower:
        return None
    # Examples: "White / S", "White/S"
    tail = name.split("/")[-1].strip().upper()
    tail = tail.replace(" ", "")
    if tail == "XXL":
        return "2XL"
    if tail in SIZE_KEYS:
        return tail
    return None


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
        title = (p.get("title") or "").lower()
        if all(t in title for t in TITLE_MATCH) and "unisex" in title:
            target = p
            break
    if not target:
        for p in result:
            title = (p.get("title") or "").lower()
            if "3001" in title and "bella" in title:
                target = p
                break

    if not target:
        print(
            "Could not find Bella Canvas 3001. Inspect catalog names and edit TITLE_MATCH.",
            file=sys.stderr,
        )
        print(json.dumps([{"id": x.get("id"), "title": x.get("title")} for x in result[:40]], indent=2))
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
        name = v.get("name") or ""
        vid = v.get("variant_id") or v.get("id")
        if not vid:
            continue
        sk = parse_white_size(name)
        if sk and sk not in out:
            out[sk] = int(vid)

    # Regex fallback on variant names
    if len(out) < len(SIZE_KEYS):
        for v in variants:
            name = (v.get("name") or "").strip()
            vid = v.get("variant_id") or v.get("id")
            if not vid or "white" not in name.lower():
                continue
            m = re.search(
                r"/\s*([SML]|XL|2XL|XXL)\s*$",
                name,
                re.I,
            )
            if not m:
                continue
            raw = m.group(1).upper()
            sk = "2XL" if raw == "XXL" else raw
            if sk in SIZE_KEYS and sk not in out:
                out[sk] = int(vid)

    ordered = {k: out[k] for k in SIZE_KEYS if k in out}
    print(json.dumps(ordered, indent=2))
    print("\n# Set on host (single line):", file=sys.stderr)
    print(f'# PRINTFUL_SHIRT_VARIANTS_JSON={json.dumps(ordered, separators=(",", ":"))}', file=sys.stderr)
    if len(ordered) < len(SIZE_KEYS):
        print(
            f"# Warning: expected {len(SIZE_KEYS)} sizes, got {len(ordered)}. Check White variants in dashboard.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
