"""PostgreSQL client for storing enriched domain metadata."""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import Dict, List, Optional
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()


def _parse_database_url(database_url: str) -> dict:
    """Parse DATABASE_URL into connection parameters."""
    parsed = urlparse(database_url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "user": parsed.username,
        "password": parsed.password,
        "database": parsed.path.lstrip('/')
    }


class PostgresClient:
    """Client for interacting with PostgreSQL database."""
    
    def __init__(self):
        # Render provides DATABASE_URL when linking a database
        # Try DATABASE_URL first, then individual POSTGRES_* vars, then defaults
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Parse DATABASE_URL (Render format)
            connect_params = _parse_database_url(database_url)
            # Override database name if SHADOWSTACK_POSTGRES_DB is set (for shared database servers)
            shadowstack_db = os.getenv("SHADOWSTACK_POSTGRES_DB") or os.getenv("POSTGRES_DATABASE")
            if shadowstack_db:
                connect_params["database"] = shadowstack_db
        else:
            # Use individual POSTGRES_* vars (standalone format)
            connect_params = {
                "host": os.getenv("POSTGRES_HOST") or os.getenv("SHADOWSTACK_POSTGRES_HOST") or os.getenv("POSTGRES_HOSTNAME", "localhost"),
                "port": os.getenv("POSTGRES_PORT") or os.getenv("SHADOWSTACK_POSTGRES_PORT") or "5432",
                "user": os.getenv("POSTGRES_USER") or os.getenv("SHADOWSTACK_POSTGRES_USER") or os.getenv("POSTGRES_USERNAME", "ncii_user"),
                "password": os.getenv("POSTGRES_PASSWORD") or os.getenv("SHADOWSTACK_POSTGRES_PASSWORD") or "ncii123password",
                "database": os.getenv("POSTGRES_DB") or os.getenv("SHADOWSTACK_POSTGRES_DB") or os.getenv("POSTGRES_DATABASE", "ncii_infra")
            }
        
        # Add SSL for Render PostgreSQL (required for external connections)
        postgres_host = connect_params["host"]
        if postgres_host and (postgres_host.endswith(".render.com") or "render.com" in postgres_host):
            connect_params["sslmode"] = "require"
        
        # Add connection timeout to fail fast (5 seconds)
        connect_params["connect_timeout"] = 5
        
        self.conn = psycopg2.connect(**connect_params)
        self._create_tables()
    
    def close(self):
        """Close the database connection."""
        self.conn.close()
    
    def _ensure_connection(self):
        """Ensure database connection is alive, reconnect if needed."""
        try:
            # Try a simple query to check if connection is alive
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
        except (psycopg2.OperationalError, psycopg2.InterfaceError, AttributeError):
            # Connection is dead, reconnect
            print("  ⚠️  Database connection lost, reconnecting...")
            try:
                self.conn.close()
            except:
                pass
            # Use same logic as __init__ to get connection params
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                connect_params = _parse_database_url(database_url)
            else:
                connect_params = {
                    "host": os.getenv("POSTGRES_HOST") or os.getenv("SHADOWSTACK_POSTGRES_HOST") or os.getenv("POSTGRES_HOSTNAME", "localhost"),
                    "port": os.getenv("POSTGRES_PORT") or os.getenv("SHADOWSTACK_POSTGRES_PORT") or "5432",
                    "user": os.getenv("POSTGRES_USER") or os.getenv("SHADOWSTACK_POSTGRES_USER") or os.getenv("POSTGRES_USERNAME", "ncii_user"),
                    "password": os.getenv("POSTGRES_PASSWORD") or os.getenv("SHADOWSTACK_POSTGRES_PASSWORD") or "ncii123password",
                    "database": os.getenv("POSTGRES_DB") or os.getenv("SHADOWSTACK_POSTGRES_DB") or os.getenv("POSTGRES_DATABASE", "ncii_infra"),
                }
            # Add SSL for Render PostgreSQL (required for external connections)
            postgres_host = connect_params["host"]
            if postgres_host and (postgres_host.endswith(".render.com") or "render.com" in postgres_host):
                connect_params["sslmode"] = "require"
            connect_params["connect_timeout"] = 5  # Fail fast - 5 second timeout
            
            self.conn = psycopg2.connect(**connect_params)
    
    def _create_tables(self):
        """Create necessary tables if they don't exist."""
        cursor = self.conn.cursor()
        
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
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_cache (
                id SERIAL PRIMARY KEY,
                analysis_type VARCHAR(50) DEFAULT 'infrastructure',
                analysis_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(analysis_type)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS domain_enrichment (
                id SERIAL PRIMARY KEY,
                domain_id INTEGER REFERENCES domains(id),
                ip_address VARCHAR(45),
                ip_addresses JSONB,
                ipv6_addresses JSONB,
                host_name TEXT,
                asn VARCHAR(50),
                isp TEXT,
                cdn TEXT,
                cms TEXT,
                payment_processor TEXT,
                registrar TEXT,
                creation_date DATE,
                expiration_date TEXT,
                updated_date TEXT,
                name_servers JSONB,
                mx_records JSONB,
                whois_status TEXT,
                web_server TEXT,
                frameworks JSONB,
                analytics JSONB,
                languages JSONB,
                tech_stack JSONB,
                http_headers JSONB,
                ssl_info JSONB,
                whois_data JSONB,
                dns_records JSONB,
                enriched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(domain_id)
            )
        """)
        
        self.conn.commit()
        cursor.close()
    
    def insert_domain(self, domain: str, source: str, notes: str = "") -> int:
        """Insert or update a domain and return its ID."""
        self._ensure_connection()
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
        self.conn.commit()
        cursor.close()
        return domain_id
    
    def insert_enrichment(self, domain_id: int, enrichment_data: Dict):
        """Insert or update enrichment data for a domain."""
        self._ensure_connection()
        cursor = self.conn.cursor()
        
        # Convert dict/list fields to JSON for PostgreSQL
        def to_json(value):
            if value is None:
                return None
            return Json(value) if isinstance(value, (dict, list)) else value
        
        cursor.execute("""
            INSERT INTO domain_enrichment (
                domain_id, ip_address, ip_addresses, ipv6_addresses, host_name, asn, isp,
                cdn, cms, payment_processor, registrar, creation_date, expiration_date, updated_date,
                name_servers, mx_records, whois_status, web_server, frameworks, analytics, languages,
                tech_stack, http_headers, ssl_info, whois_data, dns_records
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (domain_id)
            DO UPDATE SET
                ip_address = EXCLUDED.ip_address,
                ip_addresses = EXCLUDED.ip_addresses,
                ipv6_addresses = EXCLUDED.ipv6_addresses,
                host_name = EXCLUDED.host_name,
                asn = EXCLUDED.asn,
                isp = EXCLUDED.isp,
                cdn = EXCLUDED.cdn,
                cms = EXCLUDED.cms,
                payment_processor = EXCLUDED.payment_processor,
                registrar = EXCLUDED.registrar,
                creation_date = EXCLUDED.creation_date,
                expiration_date = EXCLUDED.expiration_date,
                updated_date = EXCLUDED.updated_date,
                name_servers = EXCLUDED.name_servers,
                mx_records = EXCLUDED.mx_records,
                whois_status = EXCLUDED.whois_status,
                web_server = EXCLUDED.web_server,
                frameworks = EXCLUDED.frameworks,
                analytics = EXCLUDED.analytics,
                languages = EXCLUDED.languages,
                tech_stack = EXCLUDED.tech_stack,
                http_headers = EXCLUDED.http_headers,
                ssl_info = EXCLUDED.ssl_info,
                whois_data = EXCLUDED.whois_data,
                dns_records = EXCLUDED.dns_records,
                enriched_at = CURRENT_TIMESTAMP
        """, (
            domain_id,
            enrichment_data.get("ip_address"),
            to_json(enrichment_data.get("ip_addresses")),
            to_json(enrichment_data.get("ipv6_addresses")),
            enrichment_data.get("host_name"),
            enrichment_data.get("asn"),
            enrichment_data.get("isp"),
            enrichment_data.get("cdn"),
            enrichment_data.get("cms"),
            enrichment_data.get("payment_processor"),
            enrichment_data.get("registrar"),
            enrichment_data.get("creation_date"),
            enrichment_data.get("expiration_date"),
            enrichment_data.get("updated_date"),
            to_json(enrichment_data.get("name_servers")),
            to_json(enrichment_data.get("mx_records")),
            enrichment_data.get("whois_status"),
            enrichment_data.get("web_server"),
            to_json(enrichment_data.get("frameworks")),
            to_json(enrichment_data.get("analytics")),
            to_json(enrichment_data.get("languages")),
            to_json(enrichment_data.get("tech_stack")),
            to_json(enrichment_data.get("http_headers")),
            to_json(enrichment_data.get("ssl_info")),
            to_json(enrichment_data.get("whois_data")),
            to_json(enrichment_data.get("dns_records"))
        ))
        
        self.conn.commit()
        cursor.close()
    
    def get_all_enriched_domains(self) -> List[Dict]:
        """Get all domains with their enrichment data, excluding dummy/test data."""
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                d.id,
                d.domain,
                d.source,
                d.notes,
                de.ip_address,
                de.ip_addresses,
                de.ipv6_addresses,
                de.host_name,
                de.asn,
                de.isp,
                de.cdn,
                de.cms,
                de.payment_processor,
                de.registrar,
                de.creation_date,
                de.expiration_date,
                de.updated_date,
                de.name_servers,
                de.mx_records,
                de.whois_status,
                de.web_server,
                de.frameworks,
                de.analytics,
                de.languages,
                de.tech_stack,
                de.http_headers,
                de.ssl_info,
                de.whois_data,
                de.dns_records,
                de.enriched_at
            FROM domains d
            LEFT JOIN domain_enrichment de ON d.id = de.domain_id
            WHERE d.source != 'DUMMY_DATA_FOR_TESTING'
            ORDER BY d.domain
        """)
        
        results = cursor.fetchall()
        cursor.close()
        
        # Convert results to dicts and parse JSONB fields
        domains = []
        for row in results:
            domain_dict = dict(row)
            
            # Parse JSONB fields that might be strings or already dicts
            jsonb_fields = [
                'ip_addresses', 'ipv6_addresses', 'name_servers', 'mx_records',
                'frameworks', 'analytics', 'languages', 'tech_stack',
                'http_headers', 'ssl_info', 'whois_data', 'dns_records'
            ]
            
            for field in jsonb_fields:
                value = domain_dict.get(field)
                if value is not None:
                    # If it's a string, try to parse as JSON
                    if isinstance(value, str):
                        try:
                            import json
                            domain_dict[field] = json.loads(value)
                        except (json.JSONDecodeError, TypeError):
                            pass  # Keep as string if not valid JSON
                    # If it's already a dict/list, keep it
            
            domains.append(domain_dict)
        
        return domains
    
    def save_analysis(self, analysis_data: Dict, analysis_type: str = 'infrastructure'):
        """Save analysis data to cache."""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO analysis_cache (analysis_type, analysis_data)
            VALUES (%s, %s)
            ON CONFLICT (analysis_type)
            DO UPDATE SET
                analysis_data = EXCLUDED.analysis_data,
                updated_at = CURRENT_TIMESTAMP
        """, (analysis_type, Json(analysis_data)))
        
        self.conn.commit()
        cursor.close()
    
    def delete_analysis(self, analysis_type: str = 'infrastructure'):
        """Delete cached analysis data."""
        cursor = self.conn.cursor()
        cursor.execute("""
            DELETE FROM analysis_cache
            WHERE analysis_type = %s
        """, (analysis_type,))
        self.conn.commit()
        cursor.close()
    
    def get_analysis(self, analysis_type: str = 'infrastructure') -> Optional[Dict]:
        """Get cached analysis data."""
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT analysis_data, updated_at
            FROM analysis_cache
            WHERE analysis_type = %s
        """, (analysis_type,))
        
        result = cursor.fetchone()
        cursor.close()
        
        if result:
            analysis_data = result['analysis_data']
            # Parse JSONB if it's a string
            if isinstance(analysis_data, str):
                try:
                    analysis_data = json.loads(analysis_data)
                except:
                    pass
            return {
                'analysis_data': analysis_data,
                'updated_at': result['updated_at']
            }
        
        return None

