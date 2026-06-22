"""Minimal .xlsx reader (stdlib only) for historical sign-up imports."""

from __future__ import annotations

import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

_NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def _col_idx(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n


def _col_row(ref: str) -> tuple[str, int]:
    m = re.match(r"([A-Z]+)(\d+)", ref)
    if not m:
        return "A", 1
    return m.group(1), int(m.group(2))


def read_xlsx_sheet(path: Path, sheet_name: str) -> list[list[str]]:
    """Return rows as lists of string cell values (row 1 = headers)."""
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("m:si", _NS):
                texts = [t.text or "" for t in si.findall(".//m:t", _NS)]
                shared.append("".join(texts))

        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        sheets: list[tuple[str, str]] = []
        for sh in workbook.find("m:sheets", _NS) or []:
            sheets.append(
                (
                    sh.attrib["name"],
                    sh.attrib[
                        "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
                    ],
                )
            )
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target = {r.attrib["Id"]: r.attrib["Target"] for r in rels}

        target: str | None = None
        for name, rid in sheets:
            if name == sheet_name:
                t = rid_to_target[rid]
                target = t if t.startswith("xl/") else f"xl/{t.lstrip('/')}"
                break
        if not target:
            raise ValueError(f"Sheet not found: {sheet_name}")

        root = ET.fromstring(z.read(target))
        sparse: dict[int, dict[int, str]] = {}
        for cell in root.findall(".//m:c", _NS):
            ref = cell.attrib.get("r", "")
            col, row = _col_row(ref)
            ci = _col_idx(col)
            v = cell.find("m:v", _NS)
            if v is None:
                continue
            val = v.text or ""
            if cell.attrib.get("t") == "s":
                val = shared[int(val)]
            sparse.setdefault(row, {})[ci] = str(val).strip()

        if not sparse:
            return []

        max_col = max(max(r.keys()) for r in sparse.values())
        return [
            [sparse[r].get(i, "") for i in range(1, max_col + 1)]
            for r in sorted(sparse)
        ]


def list_xlsx_sheets(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as z:
        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        return [sh.attrib["name"] for sh in workbook.find("m:sheets", _NS) or []]
