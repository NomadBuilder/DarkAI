#!/usr/bin/env python3
"""
Fix domain sources in production to use SHADOWSTACK prefix.
This ensures all domains show up in the dashboard.
"""

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

# Update all domains that don't have SHADOWSTACK prefix
cursor.execute("""
    UPDATE domains 
    SET source = 'SHADOWSTACK_SYNC'
    WHERE source IS NOT NULL
      AND source != 'DUMMY_DATA_FOR_TESTING'
      AND source NOT LIKE 'SHADOWSTACK%'
      AND domain IN (
          SELECT domain FROM domains 
          WHERE source LIKE 'SHADOWSTACK%' OR source = 'SHADOWSTACK_SYNC'
      )
""")

updated = cursor.rowcount
conn.commit()

print(f"✅ Updated {updated} domains to use SHADOWSTACK_SYNC source")

# Also update any domains that might have been synced with wrong source
cursor.execute("""
    UPDATE domains 
    SET source = 'SHADOWSTACK_SYNC'
    WHERE source = 'Local Sync'
       OR source = 'ShadowStack Master List'
""")

updated2 = cursor.rowcount
conn.commit()

print(f"✅ Updated {updated2} additional domains")

cursor.close()
conn.close()

print("✅ Done! Refresh your dashboard to see the updated count.")

