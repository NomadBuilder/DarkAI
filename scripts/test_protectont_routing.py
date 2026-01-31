#!/usr/bin/env python3
"""
Minimal test for ProtectOnt routing logic (no full app deps).
Run: python3 scripts/test_protectont_routing.py
"""
import os
import sys

# Add parent so we can import app's routing helpers by simulating request
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Copy the exact logic from app.py
def get_resolved_host(host, x_forwarded_host):
    raw = x_forwarded_host or host or ""
    return raw.split(",")[0].strip().lower().split(":")[0]

def is_protect_ontario(host, x_forwarded_host):
    h = get_resolved_host(host, x_forwarded_host)
    return h in ("protectont.ca", "www.protectont.ca")

# Test cases
LEDGER_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ledger", "out")
index_path = os.path.join(LEDGER_DIR, "index.html")

tests = [
    ("X-Forwarded-Host wins", "darkai-6otc.onrender.com", "protectont.ca", True),
    ("request.host used when no X-Forwarded-Host", "protectont.ca", None, True),
    ("www", "www.protectont.ca", None, True),
    ("darkai not ProtectOnt", "darkai.ca", None, False),
    ("Render internal host + X-Forwarded-Host", "darkai-6otc.onrender.com", "protectont.ca", True),
    ("Host with port", "protectont.ca:443", None, True),
]

print("ProtectOnt host-detection tests\n")
all_ok = True
for name, host, xfh, expected in tests:
    result = is_protect_ontario(host, xfh)
    ok = result == expected
    if not ok:
        all_ok = False
    status = "PASS" if ok else "FAIL"
    print(f"  {status}: {name}")
    print(f"         host={host!r} X-Forwarded-Host={xfh!r} -> is_protect_ontario={result} (expected {expected})")

print()
print("Ledger build check:")
print(f"  LEDGER_DIR = {LEDGER_DIR}")
print(f"  ledger/out exists: {os.path.isdir(LEDGER_DIR)}")
print(f"  ledger/out/index.html exists: {os.path.isfile(index_path)}")
if not os.path.isfile(index_path):
    all_ok = False

print()
sys.exit(0 if all_ok else 1)
