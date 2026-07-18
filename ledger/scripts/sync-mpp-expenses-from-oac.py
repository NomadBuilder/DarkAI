#!/usr/bin/env python3
"""Build ProtectOnt mpp-expenses.json from the OAC tracker (no second scrape).

Reads:
  OAC/data/expenses.json
  OAC/data/mpps.json

Writes:
  ledger/public/data/mpp-expenses.json

Override OAC root with OAC_ROOT env if needed.
"""

from __future__ import annotations

import html as htmlmod
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from statistics import mean, median

ROOT = Path(__file__).resolve().parents[2]
OAC = Path(os.environ.get("OAC_ROOT", Path.home() / "Desktop/Coding/OAC"))
if not (OAC / "data/expenses.json").exists():
    alt = ROOT.parent / "OAC"
    if (alt / "data/expenses.json").exists():
        OAC = alt
OUT = ROOT / "ledger/public/data/mpp-expenses.json"


def norm_name(name: str) -> str:
    s = htmlmod.unescape(str(name or ""))
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"^(hon\.|dr\.)\s*", "", s, flags=re.I)
    s = s.lower().encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z\s-]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def norm_riding(name: str) -> str:
    s = htmlmod.unescape(str(name or ""))
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"\s*\(\*\)\s*", "", s)
    s = s.lower().encode("ascii", "ignore").decode("ascii")
    s = s.replace("—", "-").replace("–", "-").replace("−", "-")
    s = re.sub(r"[''`]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def member_from_expense(
    *,
    name: str,
    party: str,
    riding: str,
    email: str,
    profile_url: str,
    e: dict,
) -> dict:
    total = float(e.get("total") or 0)
    travel = float(e.get("travel") or 0)
    hosp = float(e.get("hospitality") or 0)
    accom = float(e.get("accommodation") or 0)
    meals = float(e.get("meals") or 0)
    cat_sum = travel + hosp + accom + meals or 1.0
    cats = [
        ("travel", travel),
        ("hospitality", hosp),
        ("accommodation", accom),
        ("meals", meals),
    ]
    dominant = max(cats, key=lambda x: x[1])[0]
    return {
        "name": name,
        "party": party,
        "riding": riding,
        "email": email,
        "profileUrl": profile_url,
        "total": round(total, 2),
        "travel": round(travel, 2),
        "accommodation": round(accom, 2),
        "meals": round(meals, 2),
        "hospitality": round(hosp, 2),
        "claimCount": int(e.get("claimCount") or 0),
        "sourceUrl": e.get("sourceUrl") or "",
        "hospShare": round(hosp / cat_sum, 4),
        "travelShare": round(travel / cat_sum, 4),
        "dominant": dominant,
    }


def main() -> None:
    exp_path = OAC / "data/expenses.json"
    mpps_path = OAC / "data/mpps.json"
    if not exp_path.exists() or not mpps_path.exists():
        print(f"Missing OAC data under {OAC}", file=sys.stderr)
        sys.exit(1)

    exp = json.loads(exp_path.read_text())
    mpps = json.loads(mpps_path.read_text())["mpps"]

    members: list[dict] = []
    for m in mpps:
        e = m.get("expenses")
        if not e or not isinstance(e.get("total"), (int, float)):
            continue
        members.append(
            member_from_expense(
                name=m["name"],
                party=m.get("party") or "",
                riding=m.get("riding") or "",
                email=m.get("email") or "",
                profile_url=m.get("profileUrl") or "",
                e=e,
            )
        )

    tracker_names = {norm_name(m["name"]) for m in members}
    for slug, d in (exp.get("bySlug") or {}).items():
        raw = d.get("name") or ""
        if "," in raw:
            last, first = [p.strip() for p in raw.split(",", 1)]
            first = htmlmod.unescape(re.sub(r"<[^>]+>", "", first))
            last = htmlmod.unescape(re.sub(r"<[^>]+>", "", last))
            display = f"{first} {last}"
        else:
            display = htmlmod.unescape(re.sub(r"<[^>]+>", "", raw))
        if norm_name(display) in tracker_names:
            continue
        members.append(
            member_from_expense(
                name=display,
                party="",
                riding=htmlmod.unescape(re.sub(r"<[^>]+>", "", d.get("riding") or "")),
                email="",
                profile_url="",
                e=d,
            )
        )

    members.sort(key=lambda m: (-m["total"], m["name"]))
    for i, m in enumerate(members, 1):
        m["rankTotal"] = i
    by_hosp = sorted(members, key=lambda m: (-m["hospitality"], m["name"]))
    for i, m in enumerate(by_hosp, 1):
        m["rankHospitality"] = i
    by_trav = sorted(members, key=lambda m: (-m["travel"], m["name"]))
    for i, m in enumerate(by_trav, 1):
        m["rankTravel"] = i

    totals = [m["total"] for m in members]
    hosps = [m["hospitality"] for m in members]
    travs = [m["travel"] for m in members]
    sum_total = sum(totals)
    sum_hosp = sum(hosps)

    party_totals: dict[str, list[float]] = defaultdict(list)
    party_hosp: dict[str, list[float]] = defaultdict(list)
    for m in members:
        if m["party"]:
            party_totals[m["party"]].append(m["total"])
            party_hosp[m["party"]].append(m["hospitality"])

    party_medians = {
        p: {
            "total": round(median(v), 2),
            "hospitality": round(median(party_hosp[p]), 2),
            "n": len(v),
        }
        for p, v in sorted(party_totals.items(), key=lambda x: -median(x[1]))
    }

    hosp_heavy = [m for m in members if m["total"] >= 40000 and m["hospShare"] >= 0.70]
    trav_heavy = [m for m in members if m["total"] >= 40000 and m["travelShare"] >= 0.50]

    by_name: dict[str, str] = {}
    by_riding: dict[str, str] = {}
    for m in members:
        by_name[norm_name(m["name"])] = m["name"]
        parts = m["name"].split()
        if len(parts) >= 2:
            by_name[norm_name(f"{parts[-1]}, {' '.join(parts[:-1])}")] = m["name"]
        r = norm_riding(m["riding"])
        if r:
            by_riding[r] = m["name"]

    payload = {
        "fetchedAt": exp.get("fetchedAt"),
        "source": exp.get("source")
        or "https://www.ola.org/en/members/expense-disclosure/list",
        "periodNote": (
            "Travel, accommodation, meals, and hospitality claims from OLA Members’ "
            "expense disclosure (roughly the past two years). Not full office or staff budgets."
        ),
        "credit": "Dataset maintained with Ontarians Against Corruption (ONAC) / OAC MPP tracker.",
        "house": {
            "memberCount": len(members),
            "sumTotal": round(sum_total, 2),
            "sumHospitality": round(sum_hosp, 2),
            "medianTotal": round(median(totals), 2) if totals else 0,
            "medianHospitality": round(median(hosps), 2) if hosps else 0,
            "medianTravel": round(median(travs), 2) if travs else 0,
            "meanTotal": round(mean(totals), 2) if totals else 0,
            "hospitalityShare": round(sum_hosp / sum_total, 4) if sum_total else 0,
            "over50k": sum(1 for t in totals if t >= 50000),
            "over100k": sum(1 for t in totals if t >= 100000),
            "partyMedians": party_medians,
        },
        "members": members,
        "byName": by_name,
        "byRiding": by_riding,
        "lists": {
            "topTotal": [m["name"] for m in members[:15]],
            "topHospitality": [m["name"] for m in by_hosp[:15]],
            "topTravel": [m["name"] for m in by_trav[:15]],
            "hospitalityHeavy": [
                m["name"] for m in sorted(hosp_heavy, key=lambda x: -x["hospitality"])
            ],
            "travelHeavy": [m["name"] for m in sorted(trav_heavy, key=lambda x: -x["travel"])],
        },
        "missingNotes": [
            "Premier Doug Ford has no expense-disclosure claims in this OLA window in the joined tracker.",
        ],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {OUT} ({len(members)} members, as of {payload['fetchedAt']})")


if __name__ == "__main__":
    main()
