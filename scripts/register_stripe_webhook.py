#!/usr/bin/env python3
"""
Register the Stripe webhook our Flask app expects (checkout.session.completed).

I cannot log into your Stripe account from Cursor — run this on your machine with
your secret key in the environment, then paste the printed STRIPE_WEBHOOK_SECRET
into Render (and STRIPE_SECRET_KEY if not already set).

Usage (test mode recommended first — use a test sk_test_... key):
  cd /path/to/DarkAI-consolidated
  export STRIPE_SECRET_KEY=sk_test_...
  python3 scripts/register_stripe_webhook.py

Optional:
  python3 scripts/register_stripe_webhook.py --url https://protectont.ca/api/stripe-webhook
  python3 scripts/register_stripe_webhook.py --replace   # delete existing endpoint(s) for same URL, then create (use with care)

Loads .env from repo root if python-dotenv is available.
"""

from __future__ import annotations

import argparse
import os
import sys


def main() -> int:
    try:
        from dotenv import load_dotenv

        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
    except ImportError:
        pass

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--url",
        default=os.getenv(
            "STRIPE_WEBHOOK_URL",
            "https://protectont.ca/api/stripe-webhook",
        ),
        help="Full webhook URL (must match production domain)",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing webhook endpoint(s) pointing at --url, then create a new one (new signing secret)",
    )
    args = parser.parse_args()

    key = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if not key:
        print("Set STRIPE_SECRET_KEY (e.g. export STRIPE_SECRET_KEY=sk_test_...)", file=sys.stderr)
        return 1

    import stripe

    stripe.api_key = key

    target = args.url.strip()
    existing = stripe.WebhookEndpoint.list(limit=100)
    matches = [e for e in existing.data if getattr(e, "url", None) == target]

    if matches and not args.replace:
        print(f"Webhook already exists for {target!r}:", file=sys.stderr)
        for e in matches:
            print(f"  id={e.id}  disabled={getattr(e, 'disabled', False)}", file=sys.stderr)
        print(
            "\nStripe only shows the signing secret once at creation.\n"
            "Either: (1) Stripe Dashboard → Webhooks → that endpoint → Reveal / Roll secret,\n"
            "    or (2) run again with --replace to delete and recreate (brief webhook gap).\n",
            file=sys.stderr,
        )
        return 0

    if matches and args.replace:
        for e in matches:
            print(f"Deleting webhook endpoint {e.id} …", file=sys.stderr)
            stripe.WebhookEndpoint.delete(e.id)

    we = stripe.WebhookEndpoint.create(
        url=target,
        enabled_events=["checkout.session.completed"],
        description="ProtectOnt poster checkout (Flask)",
    )

    secret = getattr(we, "secret", None) or ""
    print("\n--- Add these to Render (Environment) ---\n")
    print(f"STRIPE_SECRET_KEY={key[:12]}…   # already set if checkout works; same key you used here")
    if secret:
        print(f"STRIPE_WEBHOOK_SECRET={secret}")
    else:
        print("STRIPE_WEBHOOK_SECRET=(not returned — check Stripe Dashboard for this endpoint)")
    print(f"\nEndpoint id: {we.id}")
    print(f"URL: {we.url}")
    print("\nThen redeploy / restart the Render service.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
