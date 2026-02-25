#!/usr/bin/env python3
"""
Test PersonaForge dashboard and vendors pages: embedded data and API fallback.

Run from project root (with project venv activated and deps installed):
  python test_personaforge_pages.py

Or with pytest:
  pytest test_personaforge_pages.py -v

Manual test in browser:
  1. Start app (e.g. flask run or your usual command).
  2. Open /personaforge/dashboard — sidebar counts and graph should appear immediately (no spinner).
  3. Open /personaforge/vendors — stats and clusters should appear immediately.
  4. Open /personaforge/ — homepage should still show stats (uses API).
  5. On dashboard click "Refresh Data" — should refetch and update (API still works).
"""

import sys
from pathlib import Path

# Project root
project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

# Need app for test client
def get_app():
    from app import app
    app.config["TESTING"] = True
    return app


def test_dashboard_returns_html_with_embedded_data():
    """Dashboard page should contain embedded stats and graph in the HTML."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/dashboard")
    assert rv.status_code == 200
    html = rv.data.decode("utf-8")
    assert "window.__PERSONAFORGE_HOMEPAGE_STATS__" in html
    assert "window.__PERSONAFORGE_GRAPH__" in html
    # Should be valid JSON (contains at least structure)
    assert "total_domains" in html or '"total_domains"' in html
    assert "nodes" in html or '"nodes"' in html


def test_vendors_returns_html_with_embedded_data():
    """Vendors page should contain embedded stats, vendors, and clusters."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/vendors")
    assert rv.status_code == 200
    html = rv.data.decode("utf-8")
    assert "window.__PERSONAFORGE_STATS__" in html
    assert "window.__PERSONAFORGE_VENDORS__" in html
    assert "window.__PERSONAFORGE_CLUSTERS__" in html


def test_homepage_stats_api_still_works():
    """Other pages (e.g. PersonaForge home) use this API; it must still work."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/api/homepage-stats")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "total_domains" in data
    assert "total_vendors" in data
    assert "infrastructure_clusters" in data


def test_graph_api_still_works():
    """Dashboard 'Refresh Data' uses this API; it must still work."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/api/graph")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "nodes" in data
    assert "edges" in data


def test_clusters_api_still_works():
    """Vendors page 'Refresh' and filter use this API."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/api/clusters")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "clusters" in data


def test_vendors_api_still_works():
    """Vendors list (when changing min domains) uses this API."""
    app = get_app()
    with app.test_client() as client:
        rv = client.get("/personaforge/api/vendors?min_domains=2")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "vendors" in data
    assert "clusters" in data


if __name__ == "__main__":
    print("PersonaForge pages: checking embedded data and APIs...\n")
    try:
        test_dashboard_returns_html_with_embedded_data()
        print("  OK  Dashboard: HTML has embedded stats + graph")
    except Exception as e:
        print(f"  FAIL Dashboard: {e}")
        sys.exit(1)
    try:
        test_vendors_returns_html_with_embedded_data()
        print("  OK  Vendors: HTML has embedded stats, vendors, clusters")
    except Exception as e:
        print(f"  FAIL Vendors: {e}")
        sys.exit(1)
    try:
        test_homepage_stats_api_still_works()
        print("  OK  API /api/homepage-stats (used by PersonaForge home, refresh)")
    except Exception as e:
        print(f"  FAIL API homepage-stats: {e}")
        sys.exit(1)
    try:
        test_graph_api_still_works()
        print("  OK  API /api/graph (used by Refresh Data)")
    except Exception as e:
        print(f"  FAIL API graph: {e}")
        sys.exit(1)
    try:
        test_clusters_api_still_works()
        print("  OK  API /api/clusters")
    except Exception as e:
        print(f"  FAIL API clusters: {e}")
        sys.exit(1)
    try:
        test_vendors_api_still_works()
        print("  OK  API /api/vendors")
    except Exception as e:
        print(f"  FAIL API vendors: {e}")
        sys.exit(1)
    print("\nAll checks passed. Run with pytest for full output: pytest test_personaforge_pages.py -v")
