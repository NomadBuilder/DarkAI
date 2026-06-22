#!/usr/bin/env python3
"""Import historical join-form sign-ups from the Google Sheet .xlsx export."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from get_involved_import import (  # noqa: E402
    SIGNUP_SHEETS,
    default_historical_xlsx_path,
    import_etransfer_from_xlsx,
    import_payments_from_xlsx,
    import_signups_from_xlsx,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "xlsx",
        nargs="?",
        type=Path,
        default=default_historical_xlsx_path(),
        help="Path to Protest Submissions.xlsx (default: ledger/data/protest-submissions-historical.xlsx)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Import even if a previous historical import marker exists",
    )
    parser.add_argument(
        "--payments-only",
        action="store_true",
        help="Import only the Payments tab",
    )
    parser.add_argument(
        "--signups-only",
        action="store_true",
        help="Import only sign-up tabs",
    )
    parser.add_argument(
        "--etransfer-only",
        action="store_true",
        help="Import only the e-transfer payments tab",
    )
    args = parser.parse_args()

    if args.force:
        marker = ROOT / "instance" / ".historical_signups_imported"
        if marker.exists():
            marker.unlink()
        pay_marker = ROOT / "instance" / ".historical_payments_imported"
        if pay_marker.exists():
            pay_marker.unlink()
        et_marker = ROOT / "instance" / ".historical_etransfer_imported"
        if et_marker.exists():
            et_marker.unlink()

    results: dict[str, object] = {}
    if not args.payments_only and not args.etransfer_only:
        results["signups"] = import_signups_from_xlsx(args.xlsx.resolve())
    if not args.signups_only and not args.etransfer_only:
        results["payments"] = import_payments_from_xlsx(args.xlsx.resolve())
    if not args.signups_only and not args.payments_only:
        results["etransfer"] = import_etransfer_from_xlsx(args.xlsx.resolve())
    print(json.dumps(results, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
