#!/usr/bin/env python3
"""
Generate sitemap.xml for DarkAI site.
Run this script to regenerate the sitemap.
"""

from datetime import datetime
from pathlib import Path

# Define all routes with their priorities and change frequencies
ROUTES = [
    # Main pages
    {"url": "/", "priority": "1.0", "changefreq": "weekly"},
    {"url": "/about", "priority": "0.8", "changefreq": "monthly"},
    {"url": "/contact", "priority": "0.7", "changefreq": "monthly"},
    
    # Reports
    {"url": "/reports/2025-deepfake-report", "priority": "0.9", "changefreq": "monthly"},
    {"url": "/reports/vendor-intelligence-report", "priority": "0.9", "changefreq": "monthly"},
    
    # PersonaForge
    {"url": "/personaforge/", "priority": "0.9", "changefreq": "weekly"},
    {"url": "/personaforge/dashboard", "priority": "0.8", "changefreq": "daily"},
    {"url": "/personaforge/vendors", "priority": "0.8", "changefreq": "daily"},
    {"url": "/personaforge/vendors-intel", "priority": "0.8", "changefreq": "daily"},
    {"url": "/personaforge/categories", "priority": "0.7", "changefreq": "weekly"},
    {"url": "/personaforge/services", "priority": "0.7", "changefreq": "weekly"},
    {"url": "/personaforge/methodology", "priority": "0.6", "changefreq": "monthly"},
    {"url": "/personaforge/glossary", "priority": "0.6", "changefreq": "monthly"},
    
    # ShadowStack
    {"url": "/shadowstack/", "priority": "0.9", "changefreq": "weekly"},
    {"url": "/shadowstack/dashboard", "priority": "0.8", "changefreq": "daily"},
    {"url": "/shadowstack/check", "priority": "0.7", "changefreq": "monthly"},
    {"url": "/shadowstack/action", "priority": "0.7", "changefreq": "monthly"},
    
    # BlackWire
    {"url": "/blackwire/", "priority": "0.9", "changefreq": "weekly"},
    {"url": "/blackwire/trace", "priority": "0.8", "changefreq": "monthly"},
    {"url": "/blackwire/dashboard", "priority": "0.8", "changefreq": "daily"},
    {"url": "/blackwire/support", "priority": "0.7", "changefreq": "monthly"},
]

BASE_URL = "https://darkai.ca"
LAST_MOD = datetime.now().strftime("%Y-%m-%d")

def generate_sitemap():
    """Generate sitemap.xml content."""
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''
    
    for route in ROUTES:
        sitemap += f'''  <url>
    <loc>{BASE_URL}{route["url"]}</loc>
    <lastmod>{LAST_MOD}</lastmod>
    <changefreq>{route["changefreq"]}</changefreq>
    <priority>{route["priority"]}</priority>
  </url>
'''
    
    sitemap += '</urlset>'
    return sitemap

if __name__ == '__main__':
    sitemap_content = generate_sitemap()
    output_file = Path(__file__).parent / 'static' / 'sitemap.xml'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        f.write(sitemap_content)
    
    print(f"✅ Sitemap generated: {output_file}")
    print(f"   {len(ROUTES)} URLs included")

