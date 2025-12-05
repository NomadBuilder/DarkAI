#!/usr/bin/env python3
"""Check what sources exist in production database."""

import os
from urllib.parse import urlparse
import psycopg2
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("❌ DATABASE_URL not set")
    exit(1)

parsed = urlparse(database_url)
conn = psycopg2.connect(
    host=parsed.hostname,
    port=parsed.port or 5432,
    user=parsed.username,
    password=parsed.password,
    database=parsed.path.lstrip('/'),
    sslmode='require'
)

cursor = conn.cursor()

# Count domains by source
cursor.execute("""
    SELECT source, COUNT(*) as count 
    FROM domains 
    WHERE source IS NOT NULL 
      AND source != 'DUMMY_DATA_FOR_TESTING'
    GROUP BY source
    ORDER BY count DESC
""")

results = cursor.fetchall()
print("📊 Domains by source in production:")
total = 0
for source, count in results:
    print(f"   {source}: {count}")
    total += count

print(f"\n📊 Total: {total} domains")

# Count domains matching SHADOWSTACK filter
cursor.execute("""
    SELECT COUNT(*) 
    FROM domains 
    WHERE source != 'DUMMY_DATA_FOR_TESTING'
      AND source IS NOT NULL
      AND source != ''
      AND source LIKE 'SHADOWSTACK%'
""")

shadowstack_count = cursor.fetchone()[0]
print(f"📊 Domains matching 'SHADOWSTACK%' filter: {shadowstack_count}")

cursor.close()
conn.close()

