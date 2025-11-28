#!/bin/bash
# Commands to run in Render Web Shell to debug ShadowStack data issue

echo "=== 1. Checking for JSON file ==="
find /opt/render/project -name "shadowstack_enriched_data.json" 2>/dev/null
echo ""
echo "Files in /opt/render/project/src/:"
ls -la /opt/render/project/src/*.json 2>/dev/null || echo "No JSON files found"
echo ""
echo "Current directory:"
pwd
echo ""
echo "JSON files in current directory:"
ls -la *.json 2>/dev/null || echo "No JSON files in current directory"

echo ""
echo "=== 2. Checking database ==="
python3 << 'PYEOF'
import os
import psycopg2
from urllib.parse import urlparse

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("No DATABASE_URL found")
    exit(1)

parsed = urlparse(database_url)
try:
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip('/'),
        sslmode='require'
    )
    
    cursor = conn.cursor()
    
    # Count by source
    cursor.execute("SELECT source, COUNT(*) FROM domains WHERE source IS NOT NULL AND source != '' GROUP BY source ORDER BY COUNT(*) DESC")
    print("Domains by source:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")
    
    # Count matching filter
    cursor.execute("""
        SELECT COUNT(*) 
        FROM domains 
        WHERE source != 'DUMMY_DATA_FOR_TESTING'
          AND source IS NOT NULL
          AND source != ''
          AND source LIKE 'SHADOWSTACK%'
    """)
    filtered = cursor.fetchone()[0]
    print(f"\nDomains matching SHADOWSTACK% filter: {filtered}")
    
    # Check enrichment
    cursor.execute("SELECT COUNT(*) FROM domain_enrichment")
    enrichment_count = cursor.fetchone()[0]
    print(f"Total enrichment records: {enrichment_count}")
    
    # Sample domains
    cursor.execute("""
        SELECT domain, source 
        FROM domains 
        WHERE source LIKE 'SHADOWSTACK%' 
        LIMIT 5
    """)
    print("\nSample ShadowStack domains:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
PYEOF

echo ""
echo "=== 3. Testing API ==="
curl -s https://darkai.ca/shadowstack/api/analytics | python3 -m json.tool | grep -A 10 "statistics"

