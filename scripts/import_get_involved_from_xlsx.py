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
    args = parser.parse_args()

    if args.force:
        marker = ROOT / "instance" / ".historical_signups_imported"
        if marker.exists():
            marker.unlink()

    result = import_signups_from_xlsx(args.xlsx.resolve())
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
