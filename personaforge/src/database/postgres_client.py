"""PostgreSQL client for storing enriched domain and vendor metadata."""

import os
import json
import psycopg2
import psycopg2.extensions
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

# Import Config after load_dotenv
try:
    from src.utils.config import Config
except ImportError:
    # Fallback if import fails
    class Config:
        POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
        POSTGRES_USER = os.getenv("POSTGRES_USER", "personaforge_user")
        POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "personaforge123password")
        POSTGRES_DB = os.getenv("POSTGRES_DB", "personaforge")

load_dotenv()


class PostgresClient:
    """Client for interacting with PostgreSQL database for PersonaForge."""
    
    def __init__(self):
        # Render provides DATABASE_URL when linking a database
        # Try DATABASE_URL first, then Config/individual vars, then defaults
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Parse DATABASE_URL (Render format)
            connect_params = _parse_database_url(database_url)
        else:
            # Use Config or individual env vars
            connect_params = {
                "host": Config.POSTGRES_HOST,
                "port": Config.POSTGRES_PORT,
                "user": Config.POSTGRES_USER,
                "password": Config.POSTGRES_PASSWORD,
                "database": Config.POSTGRES_DB
            }
        
        # Add SSL for Render PostgreSQL (required for external connections)
        postgres_host = connect_params["host"]
        if postgres_host and (postgres_host.endswith(".render.com") or "render.com" in postgres_host):
            connect_params["sslmode"] = "require"
        
        # Add connection timeout to prevent hanging (5 seconds)
        connect_params["connect_timeout"] = 5
        
        try:
            self.conn = psycopg2.connect(**connect_params)
            # Set statement timeout to prevent hanging queries (30 seconds)
            try:
                cursor = self.conn.cursor()
                cursor.execute("SET statement_timeout = '30s'")
                cursor.close()
                self.conn.commit()
            except:
                self.conn.rollback()
            
            # Ensure clean transaction state before creating tables
            try:
                if self.conn.status == psycopg2.extensions.STATUS_IN_TRANSACTION:
                    self.conn.rollback()
            except:
                pass
            
            # Create tables (this might take a moment on first run)
            try:
                self._create_tables()
            except Exception as e:
                # Rollback any failed transaction
                try:
                    self.conn.rollback()
                except:
                    pass
                # Don't fail the whole connection if table creation fails
                # Check if it's a transaction error - if so, rollback and retry once
                if "current transaction is aborted" in str(e).lower() or "aborted" in str(e).lower():
                    try:
                        self.conn.rollback()
                        # Retry table creation after rollback
                        self._create_tables()
                    except Exception as e2:
                        print(f"⚠️  Warning: Could not create tables after rollback: {e2}")
                else:
                    print(f"⚠️  Warning: Could not create tables: {e}")
        except psycopg2.OperationalError as e:
            print(f"⚠️  Could not connect to PostgreSQL: {e}")
            print("   Database will be optional. Start with: docker-compose up -d")
            self.conn = None
        except Exception as e:
            print(f"⚠️  Database connection error: {e}")
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
            # Check if connection is in a bad state (aborted transaction)
            if self.conn.status == psycopg2.extensions.STATUS_IN_TRANSACTION:
                try:
                    self.conn.rollback()
                except:
                    pass
            
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return True
        except (psycopg2.OperationalError, psycopg2.InterfaceError, AttributeError, psycopg2.InternalError) as e:
            # If transaction is aborted, try to rollback first
            try:
                if self.conn and self.conn.status != psycopg2.extensions.STATUS_READY:
                    self.conn.rollback()
            except:
                pass
            
            # If rollback didn't work, reconnect
            if "current transaction is aborted" in str(e).lower() or "aborted" in str(e).lower():
                print("  ⚠️  Database transaction aborted, reconnecting...")
                try:
                    if self.conn:
                        self.conn.close()
                except:
                    pass
                
                # Reconnect using same logic as __init__
                database_url = os.getenv("DATABASE_URL")
                if database_url:
                    connect_params = _parse_database_url(database_url)
                else:
                    connect_params = {
                        "host": Config.POSTGRES_HOST,
                        "port": Config.POSTGRES_PORT,
                        "user": Config.POSTGRES_USER,
                        "password": Config.POSTGRES_PASSWORD,
                        "database": Config.POSTGRES_DB
                    }
                postgres_host = connect_params["host"]
                if postgres_host and (postgres_host.endswith(".render.com") or "render.com" in postgres_host):
                    connect_params["sslmode"] = "require"
                
                try:
                    self.conn = psycopg2.connect(**connect_params)
                    return True
                except:
                    self.conn = None
                    return False
            else:
                print("  ⚠️  Database connection lost, attempting reconnect...")
                try:
                    if self.conn:
                        self.conn.close()
                except:
                    pass
                
                # Reconnect using same logic as __init__
                database_url = os.getenv("DATABASE_URL")
                if database_url:
                    connect_params = _parse_database_url(database_url)
                else:
                    connect_params = {
                        "host": Config.POSTGRES_HOST,
                        "port": Config.POSTGRES_PORT,
                        "user": Config.POSTGRES_USER,
                        "password": Config.POSTGRES_PASSWORD,
                        "database": Config.POSTGRES_DB
                    }
                postgres_host = connect_params["host"]
                if postgres_host and (postgres_host.endswith(".render.com") or "render.com" in postgres_host):
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
        
        # Ensure we're not in a bad transaction state
        try:
            if self.conn.status == psycopg2.extensions.STATUS_IN_TRANSACTION:
                self.conn.rollback()
        except:
            pass
            
        cursor = self.conn.cursor()
        
        # Domains table (prefixed to avoid conflicts with ShadowStack)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_domains (
                id SERIAL PRIMARY KEY,
                domain VARCHAR(255) UNIQUE NOT NULL,
                source VARCHAR(255),
                notes TEXT,
                vendor_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Domain enrichment table (prefixed to avoid conflicts with ShadowStack)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_domain_enrichment (
                id SERIAL PRIMARY KEY,
                domain_id INTEGER REFERENCES personaforge_domains(id),
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
                web_scraping JSONB,
                extracted_content JSONB,
                nlp_analysis JSONB,
                ssl_certificate JSONB,
                certificate_transparency JSONB,
                security_headers JSONB,
                threat_intel JSONB,
                enrichment_data JSONB,
                enriched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(domain_id)
            )
        """)
        
        # Add new enrichment columns if they don't exist (for existing tables)
        try:
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS web_scraping JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS extracted_content JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS nlp_analysis JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS ssl_certificate JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS certificate_transparency JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS security_headers JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS threat_intel JSONB
            """)
            cursor.execute("""
                ALTER TABLE personaforge_domain_enrichment 
                ADD COLUMN IF NOT EXISTS enrichment_data JSONB
            """)
        except Exception as e:
            # Columns might already exist or other error, ignore
            pass
        
        # Vendors table (clustered vendors) - prefixed to avoid conflicts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_vendors (
                id SERIAL PRIMARY KEY,
                vendor_name VARCHAR(255),
                vendor_type VARCHAR(100),
                domain_count INTEGER DEFAULT 0,
                shared_infrastructure JSONB,
                payment_processors JSONB,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cluster_id INTEGER
            )
        """)
        
        # Vendor domains junction table - prefixed to avoid conflicts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_vendor_domains (
                vendor_id INTEGER REFERENCES personaforge_vendors(id),
                domain_id INTEGER REFERENCES personaforge_domains(id),
                PRIMARY KEY (vendor_id, domain_id)
            )
        """)
        
        # Analysis cache table - prefixed to avoid conflicts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_analysis_cache (
                id SERIAL PRIMARY KEY,
                analysis_type VARCHAR(50) DEFAULT 'vendor_clusters',
                analysis_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(analysis_type)
            )
        """)
        
        # Vendor Intelligence table (from CSV) - prefixed to avoid conflicts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_vendors_intel (
                id SERIAL PRIMARY KEY,
                vendor_name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                platform_type VARCHAR(50),
                category VARCHAR(100),
                region VARCHAR(100),
                summary TEXT,
                telegram_description TEXT,
                services TEXT[],
                telegram_channel TEXT,
                other_social_media JSONB,
                operator_identifiers JSONB,
                source_found_at VARCHAR(100),
                source_type VARCHAR(50) DEFAULT 'CSV_IMPORT',
                primary_domain VARCHAR(255),
                mentioned_domains TEXT[],
                domain_headline TEXT,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                active BOOLEAN DEFAULT true,
                UNIQUE(vendor_name)
            )
        """)
        
        # Vendor Intelligence to Domains junction table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personaforge_vendor_intel_domains (
                vendor_intel_id INTEGER REFERENCES personaforge_vendors_intel(id) ON DELETE CASCADE,
                domain_id INTEGER REFERENCES personaforge_domains(id) ON DELETE CASCADE,
                relationship_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (vendor_intel_id, domain_id)
            )
        """)
        
        # Create indexes for performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendors_intel_category 
            ON personaforge_vendors_intel(category)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendors_intel_platform 
            ON personaforge_vendors_intel(platform_type)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendors_intel_region 
            ON personaforge_vendors_intel(region)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendors_intel_active 
            ON personaforge_vendors_intel(active)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendor_intel_domains_vendor 
            ON personaforge_vendor_intel_domains(vendor_intel_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_vendor_intel_domains_domain 
            ON personaforge_vendor_intel_domains(domain_id)
        """)
        
        self.conn.commit()
        cursor.close()
    
    def insert_domain(self, domain: str, source: str, notes: str = "", vendor_type: Optional[str] = None) -> int:
        """Insert or update a domain and return its ID."""
        if not self._ensure_connection():
            return None
            
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO personaforge_domains (domain, source, notes, vendor_type, updated_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (domain) 
            DO UPDATE SET 
                source = EXCLUDED.source,
                notes = EXCLUDED.notes,
                vendor_type = EXCLUDED.vendor_type,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """, (domain, source, notes, vendor_type))
        
        domain_id = cursor.fetchone()[0]
        self.conn.commit()
        cursor.close()
        return domain_id
    
    def insert_enrichment(self, domain_id: int, enrichment_data: Dict):
        """Insert or update enrichment data for a domain."""
        if not self._ensure_connection():
            return
            
        cursor = self.conn.cursor()
        
        # Convert dict/list fields to JSON for PostgreSQL, handling date objects
        import datetime
        import json
        
        def serialize_dates_recursive(obj):
            """Recursively convert date/datetime objects to strings."""
            if isinstance(obj, (datetime.date, datetime.datetime)):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: serialize_dates_recursive(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize_dates_recursive(item) for item in obj]
            else:
                return obj
        
        def to_json(value):
            if value is None:
                return None
            if isinstance(value, (dict, list)):
                # Convert date/datetime objects to strings before JSON serialization
                try:
                    cleaned_value = serialize_dates_recursive(value)
                    return Json(cleaned_value)
                except Exception as e:
                    # If serialization fails, return as-is (let PostgreSQL handle it)
                    return Json(value)
            return value
        
        cursor.execute("""
            INSERT INTO personaforge_domain_enrichment (
                domain_id, ip_address, ip_addresses, ipv6_addresses, host_name, asn, isp,
                cdn, cms, payment_processor, registrar, creation_date, expiration_date, updated_date,
                name_servers, mx_records, whois_status, web_server, frameworks, analytics, languages,
                tech_stack, http_headers, ssl_info, whois_data, dns_records,
                web_scraping, extracted_content, nlp_analysis, ssl_certificate,
                certificate_transparency, security_headers, threat_intel, enrichment_data
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                web_scraping = EXCLUDED.web_scraping,
                extracted_content = EXCLUDED.extracted_content,
                nlp_analysis = EXCLUDED.nlp_analysis,
                ssl_certificate = EXCLUDED.ssl_certificate,
                certificate_transparency = EXCLUDED.certificate_transparency,
                security_headers = EXCLUDED.security_headers,
                threat_intel = EXCLUDED.threat_intel,
                enrichment_data = EXCLUDED.enrichment_data,
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
            to_json(enrichment_data.get("dns_records")),
            to_json(enrichment_data.get("web_scraping")),
            to_json(enrichment_data.get("extracted_content")),
            to_json(enrichment_data.get("nlp_analysis")),
            to_json(enrichment_data.get("ssl_certificate")),
            to_json(enrichment_data.get("certificate_transparency")),
            to_json(enrichment_data.get("security_headers")),
            to_json(enrichment_data.get("threat_intel")),
            to_json(enrichment_data) if enrichment_data else None  # Store full enrichment data as backup
        ))
        
        # Store vendor_risk_score and vendor_type in whois_data JSONB if provided
        # (since we don't have dedicated columns for these)
        if enrichment_data.get("vendor_risk_score") or enrichment_data.get("vendor_type"):
            cursor.execute("""
                UPDATE personaforge_domain_enrichment
                SET whois_data = COALESCE(whois_data, '{}'::jsonb) || jsonb_build_object(
                    'vendor_risk_score', %s,
                    'vendor_type', %s,
                    'vendor_name', %s
                )
                WHERE domain_id = %s
            """, (
                enrichment_data.get("vendor_risk_score"),
                enrichment_data.get("vendor_type"),
                enrichment_data.get("vendor_name"),
                domain_id
            ))
        
        self.conn.commit()
        cursor.close()
    
    def get_all_enriched_domains(self) -> List[Dict]:
        """Get all domains with their enrichment data."""
        if not self._ensure_connection():
            return []
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT 
                    d.id, d.domain, d.source, d.notes, d.vendor_type,
                    de.ip_address, de.ip_addresses, de.host_name, de.asn, de.isp,
                    de.cdn, de.cms, de.payment_processor, de.registrar,
                    de.creation_date, de.expiration_date, de.name_servers,
                    de.whois_data, de.web_scraping, de.extracted_content,
                    de.nlp_analysis, de.ssl_certificate, de.certificate_transparency,
                    de.security_headers, de.threat_intel, de.enrichment_data, de.enriched_at
                FROM personaforge_domains d
                LEFT JOIN personaforge_domain_enrichment de ON d.id = de.domain_id
                ORDER BY d.updated_at DESC
            """)
            
            results = cursor.fetchall()
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting enriched domains: {e}")
            return []
        finally:
            cursor.close()
        
        # Reconstruct enrichment_data dict from individual columns
        enriched_domains = []
        for row in results:
            domain_dict = dict(row)
            
            # Get whois_data JSONB which may contain vendor_risk_score, vendor_type, vendor_name
            whois_data = domain_dict.get("whois_data") or {}
            if isinstance(whois_data, str):
                try:
                    import json
                    whois_data = json.loads(whois_data)
                except:
                    whois_data = {}
            
            # Build enrichment_data dict from individual columns
            enrichment_data = {
                "domain": domain_dict.get("domain"),
                "ip_address": domain_dict.get("ip_address"),
                "ip_addresses": domain_dict.get("ip_addresses"),
                "host_name": domain_dict.get("host_name"),
                "asn": domain_dict.get("asn"),
                "isp": domain_dict.get("isp"),
                "cdn": domain_dict.get("cdn"),
                "cms": domain_dict.get("cms"),
                "payment_processor": domain_dict.get("payment_processor"),
                "registrar": domain_dict.get("registrar"),
                "creation_date": str(domain_dict.get("creation_date")) if domain_dict.get("creation_date") else None,
                "expiration_date": domain_dict.get("expiration_date"),
                "name_servers": domain_dict.get("name_servers"),
                # Extract vendor data from whois_data JSONB
                "vendor_risk_score": whois_data.get("vendor_risk_score") or 0,
                "vendor_type": whois_data.get("vendor_type") or domain_dict.get("vendor_type"),
                "vendor_name": whois_data.get("vendor_name"),
                # New Phase 1 & 2 data
                "web_scraping": domain_dict.get("web_scraping"),
                "extracted_content": domain_dict.get("extracted_content"),
                "nlp_analysis": domain_dict.get("nlp_analysis"),
                # Phase 4 data
                "ssl_certificate": domain_dict.get("ssl_certificate"),
                "certificate_transparency": domain_dict.get("certificate_transparency"),
                "security_headers": domain_dict.get("security_headers"),
                # Threat intelligence
                "threat_intel": domain_dict.get("threat_intel"),
                # Tech stack
                "tech_stack": domain_dict.get("tech_stack"),
                "frameworks": domain_dict.get("frameworks"),
                "analytics": domain_dict.get("analytics"),
                "javascript_frameworks": domain_dict.get("javascript_frameworks"),
                "web_servers": domain_dict.get("web_servers"),
                "programming_languages": domain_dict.get("programming_languages")
            }
            
            domain_dict["enrichment_data"] = enrichment_data
            # Also set direct fields for easier access
            domain_dict["vendor_risk_score"] = enrichment_data["vendor_risk_score"]
            if not domain_dict.get("vendor_type"):
                domain_dict["vendor_type"] = enrichment_data["vendor_type"]
            
            enriched_domains.append(domain_dict)
        
        return enriched_domains
    
    def get_vendors(self, min_domains: int = 1) -> List[Dict]:
        """Get all vendors with their domain counts."""
        if not self._ensure_connection():
            return []
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                v.id, v.vendor_name, v.vendor_type, v.domain_count,
                v.shared_infrastructure, v.payment_processors,
                v.first_seen, v.last_seen, v.cluster_id
            FROM personaforge_vendors v
            WHERE v.domain_count >= %s
            ORDER BY v.domain_count DESC
        """, (min_domains,))
        
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    
    # ==================== Vendor Intelligence Methods ====================
    
    def insert_vendor_intel(self, vendor_data: Dict) -> int:
        """Insert or update vendor intelligence record with validation and transaction management."""
        if not self._ensure_connection():
            return None
        
        # Validate vendor data
        try:
            from src.utils.vendor_intel_validation import validate_vendor_data, sanitize_vendor_data
            vendor_data = sanitize_vendor_data(vendor_data)
            is_valid, error, warnings = validate_vendor_data(vendor_data)
            if not is_valid:
                raise ValueError(f"Validation failed: {error}")
        except ImportError:
            # Validation module not available, continue without validation
            pass
        except Exception as e:
            print(f"⚠️  Validation error: {e}")
            raise
        
        cursor = self.conn.cursor()
        
        try:
            # Extract fields from vendor_data
            vendor_name = vendor_data.get('vendor_name') or vendor_data.get('title', '')
            if not vendor_name:
                return None
            
            cursor.execute("""
            INSERT INTO personaforge_vendors_intel (
                vendor_name, title, platform_type, category, region, summary,
                telegram_description, services, telegram_channel, other_social_media,
                operator_identifiers, source_found_at, source_type, primary_domain,
                mentioned_domains, domain_headline, active, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (vendor_name) 
            DO UPDATE SET
                title = EXCLUDED.title,
                platform_type = EXCLUDED.platform_type,
                category = EXCLUDED.category,
                region = EXCLUDED.region,
                summary = EXCLUDED.summary,
                telegram_description = EXCLUDED.telegram_description,
                services = EXCLUDED.services,
                telegram_channel = EXCLUDED.telegram_channel,
                other_social_media = EXCLUDED.other_social_media,
                operator_identifiers = EXCLUDED.operator_identifiers,
                source_found_at = EXCLUDED.source_found_at,
                primary_domain = EXCLUDED.primary_domain,
                mentioned_domains = EXCLUDED.mentioned_domains,
                domain_headline = EXCLUDED.domain_headline,
                active = EXCLUDED.active,
                updated_at = CURRENT_TIMESTAMP,
                last_seen = CURRENT_TIMESTAMP
            RETURNING id
        """, (
            vendor_name,
            vendor_data.get('title') or vendor_name,
            vendor_data.get('platform_type'),
            vendor_data.get('category'),
            vendor_data.get('region'),
            vendor_data.get('summary'),
            vendor_data.get('telegram_description'),
            vendor_data.get('services', []),
            vendor_data.get('telegram_channel'),
            Json(vendor_data.get('other_social_media')) if vendor_data.get('other_social_media') else None,
            Json(vendor_data.get('operator_identifiers')) if vendor_data.get('operator_identifiers') else None,
            vendor_data.get('source_found_at'),
            vendor_data.get('source_type', 'CSV_IMPORT'),
            vendor_data.get('primary_domain'),
            vendor_data.get('mentioned_domains', []),
            vendor_data.get('domain_headline'),
            vendor_data.get('active', True)
        ))
        
            vendor_id = cursor.fetchone()[0]
            self.conn.commit()
            cursor.close()
            return vendor_id
        except Exception as e:
            self.conn.rollback()
            cursor.close()
            print(f"❌ Error inserting vendor intelligence: {e}")
            raise
    
    def get_vendor_intel(self, vendor_id: int) -> Optional[Dict]:
        """Get vendor intelligence by ID."""
        if not self._ensure_connection():
            return None
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM personaforge_vendors_intel WHERE id = %s
        """, (vendor_id,))
        
        result = cursor.fetchone()
        cursor.close()
        return dict(result) if result else None
    
    def get_all_vendors_intel(self, filters: Dict = None) -> List[Dict]:
        """Get all vendor intelligence with optional filters."""
        if not self._ensure_connection():
            return []
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = "SELECT * FROM personaforge_vendors_intel WHERE 1=1"
            params = []
            
            if filters:
                if filters.get('category'):
                    query += " AND category = %s"
                    params.append(filters['category'])
                if filters.get('platform_type'):
                    query += " AND platform_type = %s"
                    params.append(filters['platform_type'])
                if filters.get('region'):
                    query += " AND region ILIKE %s"
                    params.append(f"%{filters['region']}%")
                if filters.get('active') is not None:
                    query += " AND active = %s"
                    params.append(filters['active'])
                if filters.get('search'):
                    query += " AND (vendor_name ILIKE %s OR summary ILIKE %s)"
                    search_term = f"%{filters['search']}%"
                    params.extend([search_term, search_term])
            
            query += " ORDER BY created_at DESC"
            
            if filters and filters.get('limit'):
                query += " LIMIT %s"
                params.append(filters['limit'])
            if filters and filters.get('offset'):
                query += " OFFSET %s"
                params.append(filters['offset'])
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            return [dict(row) for row in results]
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting vendors intel: {e}")
            return []
        finally:
            cursor.close()
    
    def link_vendor_to_domain(self, vendor_intel_id: int, domain_id: int, relationship_type: str = 'primary'):
        """Link vendor intelligence to domain."""
        if not self._ensure_connection():
            return False
        
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO personaforge_vendor_intel_domains (vendor_intel_id, domain_id, relationship_type)
            VALUES (%s, %s, %s)
            ON CONFLICT (vendor_intel_id, domain_id) 
            DO UPDATE SET relationship_type = EXCLUDED.relationship_type
        """, (vendor_intel_id, domain_id, relationship_type))
        
        self.conn.commit()
        cursor.close()
        return True
    
    def get_vendor_domains(self, vendor_intel_id: int) -> List[Dict]:
        """Get all domains for a vendor."""
        if not self._ensure_connection():
            return []
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                d.id, d.domain, d.source, d.notes, d.vendor_type,
                vid.relationship_type,
                de.ip_address, de.host_name, de.cdn, de.registrar
            FROM personaforge_vendor_intel_domains vid
            JOIN personaforge_domains d ON vid.domain_id = d.id
            LEFT JOIN personaforge_domain_enrichment de ON d.id = de.domain_id
            WHERE vid.vendor_intel_id = %s
            ORDER BY vid.relationship_type, d.domain
        """, (vendor_intel_id,))
        
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    
    def search_vendors_intel(self, query: str, filters: Dict = None) -> List[Dict]:
        """Search vendors by name, summary, services, etc."""
        if not self._ensure_connection():
            return []
        
        search_filters = filters or {}
        search_filters['search'] = query
        return self.get_all_vendors_intel(search_filters)
    
    def get_vendors_by_category(self, category: str) -> List[Dict]:
        """Get vendors by category."""
        return self.get_all_vendors_intel({'category': category})
    
    def get_vendors_by_service(self, service: str) -> List[Dict]:
        """Get vendors offering a specific service."""
        if not self._ensure_connection():
            return []
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM personaforge_vendors_intel
            WHERE %s = ANY(services)
            ORDER BY vendor_name
        """, (service,))
        
        results = cursor.fetchall()
        cursor.close()
        return [dict(row) for row in results]
    
    def get_vendors_by_platform(self, platform_type: str) -> List[Dict]:
        """Get vendors by platform type."""
        return self.get_all_vendors_intel({'platform_type': platform_type})
    
    def get_category_stats(self) -> Dict:
        """Get statistics by category."""
        if not self._ensure_connection():
            return {}
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT 
                    category,
                    COUNT(*) as count,
                    COUNT(CASE WHEN active = true THEN 1 END) as active_count
                FROM personaforge_vendors_intel
                WHERE category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
            """)
            
            results = cursor.fetchall()
            return {row['category']: {'total': row['count'], 'active': row['active_count']} for row in results}
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting category stats: {e}")
            return {}
        finally:
            cursor.close()
    
    def get_service_stats(self) -> Dict:
        """Get statistics by service."""
        if not self._ensure_connection():
            return {}
        
        cursor = self.conn.cursor()
        try:
            cursor.execute("""
                SELECT unnest(services) as service, COUNT(*) as count
                FROM personaforge_vendors_intel
                WHERE services IS NOT NULL AND array_length(services, 1) > 0
                GROUP BY service
                ORDER BY count DESC
            """)
            
            results = cursor.fetchall()
            return {row[0]: row[1] for row in results}
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting service stats: {e}")
            return {}
        finally:
            cursor.close()
    
    def link_vendor_intel_to_infrastructure(self, vendor_intel_id: int) -> List[int]:
        """
        Link vendor intelligence to infrastructure vendors by matching domains.
        Returns list of infrastructure vendor IDs that were linked.
        """
        if not self._ensure_connection():
            return []
        
        cursor = self.conn.cursor()
        
        try:
            # Get all domains for this vendor intelligence
            cursor.execute("""
                SELECT domain_id, relationship_type
                FROM personaforge_vendor_intel_domains
                WHERE vendor_intel_id = %s
            """, (vendor_intel_id,))
            
            vendor_domains = cursor.fetchall()
            if not vendor_domains:
                return []
            
            domain_ids = [row[0] for row in vendor_domains]
            
            # Find infrastructure vendors that have these domains
            cursor.execute("""
                SELECT DISTINCT vd.vendor_id
                FROM personaforge_vendor_domains vd
                WHERE vd.domain_id = ANY(%s)
            """, (domain_ids,))
            
            infrastructure_vendor_ids = [row[0] for row in cursor.fetchall()]
            
            # Store the link (we can add a junction table later if needed)
            # For now, we'll just return the IDs that match
            
            return infrastructure_vendor_ids
            
        except Exception as e:
            print(f"Error linking vendor intelligence to infrastructure: {e}")
            return []
        finally:
            cursor.close()
    
    def get_unenriched_vendor_intel_domains(self) -> List[Dict]:
        """Get domains from vendor intelligence that haven't been enriched yet."""
        if not self._ensure_connection():
            return []
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Optimized query with EXISTS instead of LEFT JOIN for better performance
            cursor.execute("""
                SELECT DISTINCT d.id, d.domain, vid.vendor_intel_id
                FROM personaforge_vendor_intel_domains vid
                JOIN personaforge_domains d ON vid.domain_id = d.id
                WHERE NOT EXISTS (
                    SELECT 1 FROM personaforge_domain_enrichment de 
                    WHERE de.domain_id = d.id
                )
                ORDER BY d.domain
                LIMIT 1000
            """)
            
            results = cursor.fetchall()
            return [dict(row) for row in results]
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting unenriched domains: {e}")
            return []
        finally:
            cursor.close()
    
    def get_domain_by_name(self, domain: str) -> Optional[Dict]:
        """Get a single domain with enrichment data by domain name (fast query)."""
        if not self._ensure_connection():
            return None
        
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT 
                    d.id, d.domain, d.source, d.notes, d.vendor_type,
                    de.ip_address, de.ip_addresses, de.host_name, de.asn, de.isp,
                    de.cdn, de.cms, de.payment_processor, de.registrar,
                    de.creation_date, de.expiration_date, de.name_servers,
                    de.whois_data, de.web_scraping, de.extracted_content,
                    de.nlp_analysis, de.ssl_certificate, de.certificate_transparency,
                    de.security_headers, de.threat_intel, de.enrichment_data, de.enriched_at
                FROM personaforge_domains d
                LEFT JOIN personaforge_domain_enrichment de ON d.id = de.domain_id
                WHERE LOWER(d.domain) = LOWER(%s)
                LIMIT 1
            """, (domain,))
            
            result = cursor.fetchone()
            if not result:
                return None
            
            domain_dict = dict(result)
            
            # Reconstruct enrichment_data dict (same logic as get_all_enriched_domains)
            whois_data = domain_dict.get("whois_data") or {}
            if isinstance(whois_data, str):
                try:
                    import json
                    whois_data = json.loads(whois_data)
                except:
                    whois_data = {}
            
            enrichment_data = {
                "domain": domain_dict.get("domain"),
                "ip_address": domain_dict.get("ip_address"),
                "ip_addresses": domain_dict.get("ip_addresses"),
                "host_name": domain_dict.get("host_name"),
                "asn": domain_dict.get("asn"),
                "isp": domain_dict.get("isp"),
                "cdn": domain_dict.get("cdn"),
                "cms": domain_dict.get("cms"),
                "payment_processor": domain_dict.get("payment_processor"),
                "registrar": domain_dict.get("registrar"),
                "creation_date": str(domain_dict.get("creation_date")) if domain_dict.get("creation_date") else None,
                "expiration_date": domain_dict.get("expiration_date"),
                "name_servers": domain_dict.get("name_servers"),
                "vendor_risk_score": whois_data.get("vendor_risk_score") or 0,
                "vendor_type": whois_data.get("vendor_type") or domain_dict.get("vendor_type"),
                "vendor_name": whois_data.get("vendor_name"),
                "web_scraping": domain_dict.get("web_scraping"),
                "extracted_content": domain_dict.get("extracted_content"),
                "nlp_analysis": domain_dict.get("nlp_analysis"),
                "ssl_certificate": domain_dict.get("ssl_certificate"),
                "certificate_transparency": domain_dict.get("certificate_transparency"),
                "security_headers": domain_dict.get("security_headers"),
                "threat_intel": domain_dict.get("threat_intel"),
                "tech_stack": domain_dict.get("tech_stack"),
                "frameworks": domain_dict.get("frameworks"),
                "analytics": domain_dict.get("analytics"),
                "javascript_frameworks": domain_dict.get("javascript_frameworks"),
                "web_servers": domain_dict.get("web_servers"),
                "programming_languages": domain_dict.get("programming_languages")
            }
            
            domain_dict["enrichment_data"] = enrichment_data
            domain_dict["vendor_risk_score"] = enrichment_data["vendor_risk_score"]
            if not domain_dict.get("vendor_type"):
                domain_dict["vendor_type"] = enrichment_data["vendor_type"]
            
            return domain_dict
        except Exception as e:
            self.conn.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting domain by name: {e}")
            return None
        finally:
            cursor.close()

