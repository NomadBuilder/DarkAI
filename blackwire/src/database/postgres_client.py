"""PostgreSQL client for storing enriched entity metadata for BlackWire."""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()


class PostgresClient:
    """Client for interacting with PostgreSQL database for BlackWire."""
    
    def __init__(self):
        # Support prefixed env vars for consolidated app, fallback to standard
        connect_params = {
            "host": os.getenv("BLACKWIRE_POSTGRES_HOST") or os.getenv("POSTGRES_HOST", "localhost"),
            "port": os.getenv("BLACKWIRE_POSTGRES_PORT") or os.getenv("POSTGRES_PORT", "5432"),
            "user": os.getenv("BLACKWIRE_POSTGRES_USER") or os.getenv("POSTGRES_USER", "blackwire_user"),
            "password": os.getenv("BLACKWIRE_POSTGRES_PASSWORD") or os.getenv("POSTGRES_PASSWORD", "blackwire123password"),
            "database": os.getenv("BLACKWIRE_POSTGRES_DB") or os.getenv("POSTGRES_DB", "blackwire")
        }
        # Add SSL for Render PostgreSQL (required for external connections)
        postgres_host = connect_params["host"]
        if postgres_host.endswith(".render.com"):
            connect_params["sslmode"] = "require"
        
        try:
            self.conn = psycopg2.connect(**connect_params)
            self._create_tables()
        except psycopg2.OperationalError as e:
            print(f"⚠️  Could not connect to PostgreSQL: {e}")
            print("   Database will be optional. Start with: docker-compose up -d")
            self.conn = None
    
    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
    
    def _ensure_connection(self):
        """Ensure database connection is alive, reconnect if needed."""
        if not self.conn:
            return False
            
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return True
        except (psycopg2.OperationalError, psycopg2.InterfaceError, AttributeError):
            print("  ⚠️  Database connection lost, attempting reconnect...")
            try:
                if self.conn:
                    self.conn.close()
            except:
                pass
            
            # Support prefixed env vars for consolidated app, fallback to standard
            connect_params = {
                "host": os.getenv("BLACKWIRE_POSTGRES_HOST") or os.getenv("POSTGRES_HOST", "localhost"),
                "port": os.getenv("BLACKWIRE_POSTGRES_PORT") or os.getenv("POSTGRES_PORT", "5432"),
                "user": os.getenv("BLACKWIRE_POSTGRES_USER") or os.getenv("POSTGRES_USER", "blackwire_user"),
                "password": os.getenv("BLACKWIRE_POSTGRES_PASSWORD") or os.getenv("POSTGRES_PASSWORD", "blackwire123password"),
                "database": os.getenv("BLACKWIRE_POSTGRES_DB") or os.getenv("POSTGRES_DB", "blackwire")
            }
            postgres_host = connect_params["host"]
            if postgres_host.endswith(".render.com"):
                connect_params["sslmode"] = "require"
            
            try:
                self.conn = psycopg2.connect(**connect_params)
                return True
            except:
                self.conn = None
                return False
    
    def _create_tables(self):
        """Create necessary tables if they don't exist."""
        if not self.conn:
            return
            
        cursor = self.conn.cursor()
        
        # Phone numbers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS phone_numbers (
                id SERIAL PRIMARY KEY,
                phone VARCHAR(50) UNIQUE NOT NULL,
                formatted VARCHAR(50),
                country_code VARCHAR(10),
                country VARCHAR(100),
                carrier VARCHAR(255),
                voip_provider VARCHAR(255),
                is_voip BOOLEAN DEFAULT FALSE,
                source VARCHAR(255),
                notes TEXT,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Domains table (adapted from AIPornTracker)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS domains (
                id SERIAL PRIMARY KEY,
                domain VARCHAR(255) UNIQUE NOT NULL,
                source VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Domain enrichment table (adapted from AIPornTracker)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS domain_enrichment (
                id SERIAL PRIMARY KEY,
                domain_id INTEGER REFERENCES domains(id),
                ip_address VARCHAR(45),
                ip_addresses JSONB,
                host_name TEXT,
                registrar TEXT,
                is_shortlink BOOLEAN DEFAULT FALSE,
                shortlink_provider VARCHAR(100),
                dns_records JSONB,
                enriched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(domain_id)
            )
        """)
        
        # Crypto wallets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                address VARCHAR(255) UNIQUE NOT NULL,
                currency VARCHAR(50),
                is_valid BOOLEAN DEFAULT FALSE,
                transaction_count INTEGER,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source VARCHAR(255),
                notes TEXT
            )
        """)
        
        # Messaging handles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messaging_handles (
                id SERIAL PRIMARY KEY,
                handle VARCHAR(255) NOT NULL,
                platform VARCHAR(50),
                phone_linked VARCHAR(50),
                is_phone BOOLEAN DEFAULT FALSE,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source VARCHAR(255),
                notes TEXT,
                UNIQUE(handle, platform)
            )
        """)
        
        # Enrichment cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enrichment_cache (
                id SERIAL PRIMARY KEY,
                entity_type VARCHAR(50) NOT NULL,
                entity_id VARCHAR(255) NOT NULL,
                enrichment_data JSONB NOT NULL,
                cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(entity_type, entity_id)
            )
        """)
        
        # Investigation sessions - tracks which entities were traced together
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS investigations (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id VARCHAR(255) NOT NULL,
                entity_value VARCHAR(500) NOT NULL,
                traced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for investigations table
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_investigations_session_id 
            ON investigations(session_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_investigations_entity 
            ON investigations(entity_type, entity_id)
        """)
        
        self.conn.commit()
        cursor.close()
        print("✅ PostgreSQL tables created/verified")
    
    def insert_phone(self, phone: str, enrichment_data: Dict, source: str = "", notes: str = "") -> Optional[int]:
        """Insert or update a phone number and return its ID."""
        if not self._ensure_connection():
            return None
            
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO phone_numbers (
                phone, formatted, country_code, country, carrier, voip_provider, 
                is_voip, source, notes, last_seen
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (phone) 
            DO UPDATE SET 
                formatted = EXCLUDED.formatted,
                country_code = EXCLUDED.country_code,
                country = EXCLUDED.country,
                carrier = EXCLUDED.carrier,
                voip_provider = EXCLUDED.voip_provider,
                is_voip = EXCLUDED.is_voip,
                source = EXCLUDED.source,
                notes = EXCLUDED.notes,
                last_seen = CURRENT_TIMESTAMP
            RETURNING id
        """, (
            phone,
            enrichment_data.get("formatted"),
            enrichment_data.get("country_code"),
            enrichment_data.get("country"),
            enrichment_data.get("carrier"),
            enrichment_data.get("voip_provider"),
            enrichment_data.get("is_voip", False),
            source,
            notes
        ))
        
        phone_id = cursor.fetchone()[0]
        self.conn.commit()
        cursor.close()
        return phone_id
    
    def insert_domain(self, domain: str, enrichment_data: Dict, source: str = "", notes: str = "") -> Optional[int]:
        """Insert or update a domain and return its ID."""
        if not self._ensure_connection():
            return None
            
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO domains (domain, source, notes, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (domain) 
            DO UPDATE SET 
                source = EXCLUDED.source,
                notes = EXCLUDED.notes,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """, (domain, source, notes))
        
        domain_id = cursor.fetchone()[0]
        
        # Insert enrichment data
        cursor.execute("""
            INSERT INTO domain_enrichment (
                domain_id, ip_address, ip_addresses, host_name, registrar,
                is_shortlink, shortlink_provider, dns_records
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (domain_id)
            DO UPDATE SET
                ip_address = EXCLUDED.ip_address,
                ip_addresses = EXCLUDED.ip_addresses,
                host_name = EXCLUDED.host_name,
                registrar = EXCLUDED.registrar,
                is_shortlink = EXCLUDED.is_shortlink,
                shortlink_provider = EXCLUDED.shortlink_provider,
                dns_records = EXCLUDED.dns_records,
                enriched_at = CURRENT_TIMESTAMP
        """, (
            domain_id,
            enrichment_data.get("ip_address"),
            Json(enrichment_data.get("ip_addresses", [])),
            enrichment_data.get("host_name"),
            enrichment_data.get("registrar"),
            enrichment_data.get("is_shortlink", False),
            enrichment_data.get("shortlink_provider"),
            Json(enrichment_data.get("dns_records", {}))
        ))
        
        self.conn.commit()
        cursor.close()
        return domain_id
    
    def insert_wallet(self, address: str, enrichment_data: Dict, source: str = "", notes: str = "") -> Optional[int]:
        """Insert or update a wallet and return its ID."""
        if not self._ensure_connection():
            return None
            
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO wallets (
                address, currency, is_valid, transaction_count, source, notes, last_seen
            )
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (address) 
            DO UPDATE SET 
                currency = EXCLUDED.currency,
                is_valid = EXCLUDED.is_valid,
                transaction_count = EXCLUDED.transaction_count,
                source = EXCLUDED.source,
                notes = EXCLUDED.notes,
                last_seen = CURRENT_TIMESTAMP
            RETURNING id
        """, (
            address,
            enrichment_data.get("currency"),
            enrichment_data.get("is_valid", False),
            enrichment_data.get("transaction_count"),
            source,
            notes
        ))
        
        wallet_id = cursor.fetchone()[0]
        self.conn.commit()
        cursor.close()
        return wallet_id
    
    def insert_handle(self, handle: str, enrichment_data: Dict, source: str = "", notes: str = "") -> Optional[int]:
        """Insert or update a messaging handle and return its ID."""
        if not self._ensure_connection():
            return None
            
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO messaging_handles (
                handle, platform, phone_linked, is_phone, source, notes, last_seen
            )
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (handle, platform) 
            DO UPDATE SET 
                phone_linked = EXCLUDED.phone_linked,
                is_phone = EXCLUDED.is_phone,
                source = EXCLUDED.source,
                notes = EXCLUDED.notes,
                last_seen = CURRENT_TIMESTAMP
            RETURNING id
        """, (
            handle,
            enrichment_data.get("platform"),
            enrichment_data.get("phone_linked"),
            enrichment_data.get("is_phone", False),
            source,
            notes
        ))
        
        handle_id = cursor.fetchone()[0]
        self.conn.commit()
        cursor.close()
        return handle_id
    
    def get_all_phones(self) -> List[Dict]:
        """Get all phone numbers."""
        if not self._ensure_connection():
            return []
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM phone_numbers ORDER BY last_seen DESC")
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    
    def get_all_domains(self) -> List[Dict]:
        """Get all domains with enrichment."""
        if not self._ensure_connection():
            return []
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT d.*, de.*
            FROM domains d
            LEFT JOIN domain_enrichment de ON d.id = de.domain_id
            ORDER BY d.updated_at DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    
    def get_all_wallets(self) -> List[Dict]:
        """Get all wallets."""
        if not self._ensure_connection():
            return []
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM wallets ORDER BY last_seen DESC")
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]

