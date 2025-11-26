"""Neo4j graph database client for storing BlackWire entity relationships."""

import os
import threading
from typing import Dict, List, Optional
from dotenv import load_dotenv
from src.utils.logger import logger

load_dotenv()

# Lock to prevent concurrent reconnection attempts
_reconnect_lock = threading.Lock()

# Try to import Neo4j driver (optional)
try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    GraphDatabase = None


class Neo4jClient:
    """Client for interacting with Neo4j graph database for BlackWire."""
    
    def __init__(self):
        if not NEO4J_AVAILABLE:
            logger.warning("⚠️  Neo4j driver not available. Install with: pip install neo4j")
            self.driver = None
            return
            
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        # Support both NEO4J_USER and NEO4J_USERNAME (Neo4j Aura uses USERNAME)
        user = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "blackwire123password")
        
        logger.info(f"🔌 Attempting Neo4j connection to {uri} with user {user}")
        
        try:
            # Neo4j Aura requires SSL - the driver handles this automatically for neo4j+s:// URIs
            # Configure connection pool for better reliability
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(
                uri, 
                auth=(user, password),
                max_connection_lifetime=1800,  # 30 minutes (shorter for free tier stability)
                max_connection_pool_size=10,  # Smaller pool for free tier
                connection_acquisition_timeout=30,  # Shorter timeout
                connection_timeout=15,  # Shorter timeout
                keep_alive=True  # Enable keep-alive to detect dead connections faster
            )
            # Test connection with timeout
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                result.consume()  # Consume result to ensure query completes
            logger.info(f"✅ Neo4j connection established to {uri}")
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"⚠️  Could not connect to Neo4j: {e}")
            logger.error(f"   URI: {uri}")
            logger.error(f"   User: {user}")
            logger.error(f"   Password set: {'Yes' if password else 'No'}")
            logger.error(f"   Error details: {error_details}")
            logger.warning("   Neo4j will be optional. Graph features will be disabled.")
            self.driver = None
    
    def close(self):
        """Close the database connection."""
        if self.driver:
            self.driver.close()
    
    def _reconnect_if_needed(self):
        """Reconnect to Neo4j if the connection is dead (e.g., after Render spin-down)."""
        import time
        
        # If driver is None, we need to create it
        if not self.driver:
            # Create new connection with retries for ServiceUnavailable errors
            uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "blackwire123password")
            
            max_retries = 3
            for retry in range(max_retries):
                try:
                    from neo4j import GraphDatabase
                    self.driver = GraphDatabase.driver(
                        uri, 
                        auth=(user, password),
                        max_connection_lifetime=1800,  # 30 minutes (shorter for free tier)
                        max_connection_pool_size=10,  # Smaller pool for free tier
                        connection_acquisition_timeout=30,  # Shorter timeout
                        connection_timeout=15,  # Shorter timeout
                        keep_alive=True  # Enable keep-alive
                    )
                    # Verify connection with retry
                    for verify_retry in range(3):
                        try:
                            with self.driver.session() as verify_session:
                                verify_session.run("RETURN 1").consume()
                            logger.info("✅ Neo4j connection established")
                            return True
                        except Exception as verify_error:
                            error_str = str(verify_error).lower()
                            if "service unavailable" in error_str or "routing" in error_str:
                                if verify_retry < 2:
                                    logger.debug(f"Routing error during verification (attempt {verify_retry + 1}/3), retrying...")
                                    time.sleep(1 * (verify_retry + 1))  # Exponential backoff
                                    continue
                            raise verify_error
                except Exception as e:
                    error_str = str(e).lower()
                    is_routing_error = "service unavailable" in error_str or "routing" in error_str or "unable to retrieve" in error_str
                    
                    if is_routing_error and retry < max_retries - 1:
                        wait_time = 2 * (retry + 1)  # Exponential backoff: 2s, 4s, 6s
                        logger.warning(f"⚠️  Neo4j routing error (attempt {retry + 1}/{max_retries}): {str(e)[:100]}. Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"❌ Failed to create Neo4j connection: {str(e)[:200]}")
                        self.driver = None
                        return False
        
        # Driver exists, test if it's alive
        try:
            # Test if connection is alive with a quick query
            with self.driver.session() as test_session:
                test_session.run("RETURN 1").consume()
            return True  # Connection is alive
        except Exception as e:
            error_str = str(e).lower()
            if "defunct" in error_str or "failed to write" in error_str or "failed to read" in error_str:
                # Use lock to prevent concurrent reconnection attempts
                with _reconnect_lock:
                    # Double-check: another thread might have already reconnected
                    if not self.driver:
                        return False
                    
                    # Test again in case another thread fixed it
                    try:
                        with self.driver.session() as quick_test:
                            quick_test.run("RETURN 1").consume()
                        return True  # Another thread fixed it
                    except:
                        pass  # Continue with reconnection
                    
                    try:
                        # Fully close old driver (this is important for cleanup)
                        old_driver = self.driver
                        self.driver = None  # Set to None first to prevent concurrent access
                        
                        try:
                            old_driver.close()
                        except Exception as close_error:
                            logger.debug(f"Error closing old driver (expected): {close_error}")
                        
                        # Small delay to ensure cleanup completes
                        import time
                        time.sleep(0.5)
                        
                        # Recreate connection with fresh settings
                        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
                        user = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
                        password = os.getenv("NEO4J_PASSWORD", "blackwire123password")
                        
                        from neo4j import GraphDatabase
                        self.driver = GraphDatabase.driver(
                            uri, 
                            auth=(user, password),
                            max_connection_lifetime=1800,  # 30 minutes (shorter for free tier)
                            max_connection_pool_size=10,  # Smaller pool for free tier
                            connection_acquisition_timeout=30,  # Shorter timeout
                            connection_timeout=15,  # Shorter timeout
                            keep_alive=True  # Enable keep-alive
                        )
                        
                        # Verify new connection with retry
                        max_verify_attempts = 3
                        for verify_attempt in range(max_verify_attempts):
                            try:
                                with self.driver.session() as verify_session:
                                    verify_session.run("RETURN 1").consume()
                                logger.info("✅ Neo4j connection re-established successfully")
                                return True
                            except Exception as verify_error:
                                verify_error_str = str(verify_error).lower()
                                is_routing_error = "service unavailable" in verify_error_str or "routing" in verify_error_str or "unable to retrieve" in verify_error_str
                                
                                if verify_attempt < max_verify_attempts - 1:
                                    wait_time = 1 * (verify_attempt + 1) if is_routing_error else 0.5
                                    logger.debug(f"Connection verification attempt {verify_attempt + 1} failed ({'routing error' if is_routing_error else 'connection error'}), retrying in {wait_time}s...")
                                    time.sleep(wait_time)
                                else:
                                    raise verify_error
                    except Exception as reconnect_error:
                        logger.error(f"❌ Failed to reconnect to Neo4j: {reconnect_error}")
                        self.driver = None
                        return False
            else:
                # Not a connection error, re-raise
                raise
    
    def _execute_query(self, query: str, parameters: Optional[Dict] = None):
        """Execute a Cypher query with automatic reconnection."""
        if not self.driver:
            return None
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Try to execute query - don't pre-check connection (it might die between check and use)
                with self.driver.session() as session:
                    return list(session.run(query, parameters or {}))
            except Exception as e:
                error_str = str(e).lower()
                # Check if it's a connection error (including routing/ServiceUnavailable)
                is_connection_error = (
                    "defunct" in error_str or 
                    "failed to write" in error_str or 
                    "failed to read" in error_str or
                    "connection" in error_str and ("closed" in error_str or "dead" in error_str) or
                    "service unavailable" in error_str or
                    "routing" in error_str or
                    "unable to retrieve" in error_str
                )
                
                if is_connection_error:
                    if attempt < max_retries - 1:
                        logger.warning(f"⚠️  Neo4j connection error (attempt {attempt + 1}/{max_retries}): {str(e)[:100]}. Reconnecting...")
                        # Force reconnection by setting driver to None temporarily
                        old_driver = self.driver
                        self.driver = None
                        try:
                            old_driver.close()
                        except:
                            pass
                        # Reconnect
                        if not self._reconnect_if_needed():
                            # If reconnection failed, wait a bit before retrying
                            import time
                            time.sleep(1)
                            continue
                        # Small delay after reconnection to let it stabilize
                        import time
                        time.sleep(0.5)
                    else:
                        logger.error(f"❌ Neo4j connection failed after {max_retries} attempts: {str(e)[:200]}")
                        return None
                else:
                    # Not a connection error, re-raise
                    raise
        return None
    
    # Phone number nodes
    def create_phone(self, phone: str, **properties):
        """Create or update a phone number node."""
        # Normalize: Always use formatted number as the primary key to avoid duplicates
        # Store raw value as a property for reference
        formatted = properties.get("formatted") or phone
        
        # Use formatted as the primary key (normalized E.164 format)
        # This prevents duplicates when same number is entered in different formats
        primary_key = formatted if formatted else phone
        
        # Prepare raw_input array - append if not already present
        # Use a simpler approach: just append, duplicates are okay (we can dedupe later if needed)
        query = """
        MERGE (p:PhoneNumber {phone: $primary_key})
        ON CREATE SET 
            p.formatted = $formatted,
            p.raw_input = [$raw_input],
            p.country_code = $country_code,
            p.country = $country,
            p.carrier = $carrier,
            p.is_voip = $is_voip,
            p.last_seen = datetime()
        ON MATCH SET
            p.formatted = $formatted,
            p.raw_input = COALESCE(p.raw_input, []) + [$raw_input],
            p.country_code = COALESCE($country_code, p.country_code),
            p.country = COALESCE($country, p.country),
            p.carrier = COALESCE($carrier, p.carrier),
            p.is_voip = COALESCE($is_voip, p.is_voip),
            p.last_seen = datetime()
        RETURN p
        """
        result = self._execute_query(query, {
            "primary_key": primary_key,
            "raw_input": phone,  # Store original input for reference
            "formatted": formatted,
            "country_code": properties.get("country_code"),
            "country": properties.get("country"),
            "carrier": properties.get("carrier"),
            "is_voip": properties.get("is_voip", False)
        })
        
        return result
    
    # VOIP Provider nodes
    def create_voip_provider(self, name: str, **properties):
        """Create or update a VOIP provider node."""
        query = """
        MERGE (v:VOIPProvider {name: $name})
        SET v.last_seen = datetime()
        RETURN v
        """
        return self._execute_query(query, {"name": name})
    
    def link_phone_to_voip(self, phone: str, voip_provider: str):
        """Create relationship: PhoneNumber -[:USES_VOIP]-> VOIPProvider"""
        query = """
        MATCH (p:PhoneNumber {phone: $phone})
        MATCH (v:VOIPProvider {name: $voip_provider})
        MERGE (p)-[:USES_VOIP]->(v)
        RETURN p, v
        """
        return self._execute_query(query, {"phone": phone, "voip_provider": voip_provider})
    
    def create_country(self, country_name: str):
        """Create or update a Country node."""
        query = """
        MERGE (c:Country {name: $country_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"country_name": country_name})
    
    def link_phone_to_country(self, phone: str, country: str):
        """Create relationship: PhoneNumber -[:LOCATED_IN]-> Country"""
        query = """
        MATCH (p:PhoneNumber {phone: $phone})
        MATCH (c:Country {name: $country})
        MERGE (p)-[:LOCATED_IN]->(c)
        RETURN p, c
        """
        return self._execute_query(query, {"phone": phone, "country": country})
    
    # Domain nodes (adapted from AIPornTracker)
    def create_domain(self, domain: str, **properties):
        """Create or update a domain node."""
        query = """
        MERGE (d:Domain {domain: $domain})
        SET d.last_seen = datetime()
        RETURN d
        """
        return self._execute_query(query, {"domain": domain})
    
    def create_host(self, host_name: str, ip: str = None, isp: str = None):
        """Create or update a Host node."""
        query = """
        MERGE (h:Host {name: $host_name})
        SET h.ip = $ip,
            h.isp = $isp,
            h.last_seen = datetime()
        RETURN h
        """
        return self._execute_query(query, {"host_name": host_name, "ip": ip, "isp": isp})
    
    def link_domain_to_host(self, domain: str, host_name: str):
        """Create relationship: Domain -[:HOSTED_ON]-> Host"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (h:Host {name: $host_name})
        MERGE (d)-[:HOSTED_ON]->(h)
        RETURN d, h
        """
        return self._execute_query(query, {"domain": domain, "host_name": host_name})
    
    def create_cdn(self, cdn_name: str):
        """Create or update a CDN node."""
        query = """
        MERGE (c:CDN {name: $cdn_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"cdn_name": cdn_name})
    
    def link_domain_to_cdn(self, domain: str, cdn_name: str):
        """Create relationship: Domain -[:USES_CDN]-> CDN"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (c:CDN {name: $cdn_name})
        MERGE (d)-[:USES_CDN]->(c)
        RETURN d, c
        """
        return self._execute_query(query, {"domain": domain, "cdn_name": cdn_name})
    
    def create_registrar(self, registrar_name: str):
        """Create or update a Registrar node."""
        query = """
        MERGE (r:Registrar {name: $registrar_name})
        SET r.last_seen = datetime()
        RETURN r
        """
        return self._execute_query(query, {"registrar_name": registrar_name})
    
    def link_domain_to_registrar(self, domain: str, registrar_name: str):
        """Create relationship: Domain -[:REGISTERED_WITH]-> Registrar"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (r:Registrar {name: $registrar_name})
        MERGE (d)-[:REGISTERED_WITH]->(r)
        RETURN d, r
        """
        return self._execute_query(query, {"domain": domain, "registrar_name": registrar_name})
    
    def create_cms(self, cms_name: str):
        """Create or update a CMS node."""
        query = """
        MERGE (c:CMS {name: $cms_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"cms_name": cms_name})
    
    def link_domain_to_cms(self, domain: str, cms_name: str):
        """Create relationship: Domain -[:USES_CMS]-> CMS"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (c:CMS {name: $cms_name})
        MERGE (d)-[:USES_CMS]->(c)
        RETURN d, c
        """
        return self._execute_query(query, {"domain": domain, "cms_name": cms_name})
    
    def create_nameserver(self, nameserver_name: str):
        """Create or update a Nameserver node."""
        query = """
        MERGE (n:Nameserver {name: $nameserver_name})
        SET n.last_seen = datetime()
        RETURN n
        """
        return self._execute_query(query, {"nameserver_name": nameserver_name})
    
    def link_domain_to_nameserver(self, domain: str, nameserver_name: str):
        """Create relationship: Domain -[:USES_NAMESERVER]-> Nameserver"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (n:Nameserver {name: $nameserver_name})
        MERGE (d)-[:USES_NAMESERVER]->(n)
        RETURN d, n
        """
        return self._execute_query(query, {"domain": domain, "nameserver_name": nameserver_name})
    
    def link_phone_to_domain(self, phone: str, domain: str):
        """Create relationship: PhoneNumber -[:LINKED_TO]-> Domain"""
        query = """
        MATCH (p:PhoneNumber {phone: $phone})
        MATCH (d:Domain {domain: $domain})
        MERGE (p)-[:LINKED_TO]->(d)
        RETURN p, d
        """
        return self._execute_query(query, {"phone": phone, "domain": domain})
    
    def link_domain_to_domain(self, from_domain: str, to_domain: str):
        """Create relationship: Domain -[:REDIRECTS_TO]-> Domain"""
        query = """
        MATCH (d1:Domain {domain: $from_domain})
        MATCH (d2:Domain {domain: $to_domain})
        MERGE (d1)-[:REDIRECTS_TO]->(d2)
        RETURN d1, d2
        """
        return self._execute_query(query, {"from_domain": from_domain, "to_domain": to_domain})
    
    # Wallet nodes
    def create_wallet(self, address: str, **properties):
        """Create or update a wallet node."""
        query = """
        MERGE (w:Wallet {address: $address})
        SET w.currency = $currency,
            w.is_valid = $is_valid,
            w.last_seen = datetime()
        RETURN w
        """
        return self._execute_query(query, {
            "address": address,
            "currency": properties.get("currency"),
            "is_valid": properties.get("is_valid", False)
        })
    
    def create_currency(self, currency_name: str):
        """Create or update a Currency node."""
        query = """
        MERGE (c:Currency {name: $currency_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"currency_name": currency_name})
    
    def link_wallet_to_currency(self, wallet_address: str, currency: str):
        """Create relationship: Wallet -[:IS_CURRENCY]-> Currency"""
        query = """
        MATCH (w:Wallet {address: $wallet_address})
        MATCH (c:Currency {name: $currency})
        MERGE (w)-[:IS_CURRENCY]->(c)
        RETURN w, c
        """
        return self._execute_query(query, {"wallet_address": wallet_address, "currency": currency})
    
    def link_domain_to_wallet(self, domain: str, wallet_address: str):
        """Create relationship: Domain -[:ASSOCIATED_WITH]-> Wallet"""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (w:Wallet {address: $wallet_address})
        MERGE (d)-[:ASSOCIATED_WITH]->(w)
        RETURN d, w
        """
        return self._execute_query(query, {"domain": domain, "wallet_address": wallet_address})
    
    def link_wallet_to_wallet(self, from_address: str, to_address: str):
        """Create relationship: Wallet -[:TRANSACTED_WITH]-> Wallet"""
        query = """
        MATCH (w1:Wallet {address: $from_address})
        MATCH (w2:Wallet {address: $to_address})
        MERGE (w1)-[:TRANSACTED_WITH]->(w2)
        RETURN w1, w2
        """
        return self._execute_query(query, {"from_address": from_address, "to_address": to_address})
    
    # Messaging Handle nodes
    def create_messaging_handle(self, handle: str, platform: str, **properties):
        """Create or update a messaging handle node."""
        query = """
        MERGE (m:MessagingHandle {handle: $handle, platform: $platform})
        SET m.is_phone = $is_phone,
            m.phone_linked = $phone_linked,
            m.last_seen = datetime()
        RETURN m
        """
        return self._execute_query(query, {
            "handle": handle,
            "platform": platform,
            "is_phone": properties.get("is_phone", False),
            "phone_linked": properties.get("phone_linked")
        })
    
    def create_platform(self, platform_name: str):
        """Create or update a Platform node."""
        query = """
        MERGE (p:Platform {name: $platform_name})
        SET p.last_seen = datetime()
        RETURN p
        """
        return self._execute_query(query, {"platform_name": platform_name})
    
    def link_handle_to_platform(self, handle: str, platform: str):
        """Create relationship: MessagingHandle -[:ON_PLATFORM]-> Platform"""
        query = """
        MATCH (m:MessagingHandle {handle: $handle, platform: $platform})
        MATCH (p:Platform {name: $platform})
        MERGE (m)-[:ON_PLATFORM]->(p)
        RETURN m, p
        """
        return self._execute_query(query, {"handle": handle, "platform": platform})
    
    def link_phone_to_handle(self, phone: str, handle: str, platform: str):
        """Create relationship: PhoneNumber -[:CONTACTS]-> MessagingHandle"""
        query = """
        MATCH (p:PhoneNumber {phone: $phone})
        MATCH (m:MessagingHandle {handle: $handle, platform: $platform})
        MERGE (p)-[:CONTACTS]->(m)
        RETURN p, m
        """
        return self._execute_query(query, {"phone": phone, "handle": handle, "platform": platform})
    
    def link_handle_to_phone(self, handle: str, platform: str, phone: str):
        """Create relationship: MessagingHandle -[:LINKED_TO]-> PhoneNumber"""
        query = """
        MATCH (m:MessagingHandle {handle: $handle, platform: $platform})
        MATCH (p:PhoneNumber {phone: $phone})
        MERGE (m)-[:LINKED_TO]->(p)
        RETURN m, p
        """
        return self._execute_query(query, {"handle": handle, "platform": platform, "phone": phone})
    
    # Cluster nodes
    def create_cluster(self, cluster_id: str, description: str, **properties):
        """Create or update a cluster node."""
        query = """
        MERGE (c:Cluster {cluster_id: $cluster_id})
        SET c.description = $description,
            c.confidence = $confidence,
            c.created_at = datetime()
        RETURN c
        """
        return self._execute_query(query, {
            "cluster_id": cluster_id,
            "description": description,
            "confidence": properties.get("confidence", 0.5)
        })
    
    def link_entity_to_cluster(self, entity_type: str, entity_id: str, cluster_id: str):
        """Create relationship: Entity -[:PART_OF_CLUSTER]-> Cluster"""
        # Entity type can be PhoneNumber, Domain, Wallet, MessagingHandle
        if entity_type == "PhoneNumber":
            query = """
            MATCH (e:PhoneNumber {phone: $entity_id})
            MATCH (c:Cluster {cluster_id: $cluster_id})
            MERGE (e)-[:PART_OF_CLUSTER]->(c)
            RETURN e, c
            """
        elif entity_type == "Domain":
            query = """
            MATCH (e:Domain {domain: $entity_id})
            MATCH (c:Cluster {cluster_id: $cluster_id})
            MERGE (e)-[:PART_OF_CLUSTER]->(c)
            RETURN e, c
            """
        elif entity_type == "Wallet":
            query = """
            MATCH (e:Wallet {address: $entity_id})
            MATCH (c:Cluster {cluster_id: $cluster_id})
            MERGE (e)-[:PART_OF_CLUSTER]->(c)
            RETURN e, c
            """
        elif entity_type == "MessagingHandle":
            # For handles, we need both handle and platform
            parts = entity_id.split("|")
            if len(parts) == 2:
                handle, platform = parts
                query = """
                MATCH (e:MessagingHandle {handle: $handle, platform: $platform})
                MATCH (c:Cluster {cluster_id: $cluster_id})
                MERGE (e)-[:PART_OF_CLUSTER]->(c)
                RETURN e, c
                """
                return self._execute_query(query, {"handle": handle, "platform": platform, "cluster_id": cluster_id})
            return None
        else:
            return None
        
        return self._execute_query(query, {"entity_id": entity_id, "cluster_id": cluster_id})
    
    def get_nodes_and_relationships_for_entities(self, entities_to_show: Dict) -> Dict:
        """Get nodes and relationships for specific entities (from current search)."""
        if not self.driver:
            return {"nodes": [], "edges": []}
        
        from datetime import datetime
        
        nodes = {}
        edges = []
        
        def serialize_value(value):
            """Convert Neo4j values to JSON-serializable types."""
            if hasattr(value, 'iso_format'):  # Neo4j DateTime
                return value.iso_format()
            elif isinstance(value, datetime):
                return value.isoformat()
            elif isinstance(value, (dict, list)):
                if isinstance(value, dict):
                    return {k: serialize_value(v) for k, v in value.items()}
                else:
                    return [serialize_value(v) for v in value]
            else:
                return value
        
        # Verify connection is alive before querying
        try:
            with self.driver.session() as verify_session:
                verify_session.run("RETURN 1").consume()
        except Exception as verify_error:
            logger.error(f"❌ Neo4j connection verification failed before query: {verify_error}")
            return {"nodes": [], "edges": []}
        
        with self.driver.session() as session:
            # Collect entity IDs we want to show
            entity_ids = []
            params = {}
            
            # Find entities and collect their IDs
            if entities_to_show.get("phone"):
                phones = list(set(entities_to_show["phone"]))  # Dedupe
                # Build format variations to match normalized stored format
                phone_formats = []
                for phone in phones:
                    # Clean phone number
                    phone_clean = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
                    
                    # Always include the original (might already be formatted)
                    phone_formats.append(phone_clean)
                    
                    # Generate all possible format variations
                    if phone_clean.startswith("+"):
                        # Already has country code prefix (E.164 format) - this is what we store
                        phone_formats.append(phone_clean)
                        # Also try without + for matching
                        phone_formats.append(phone_clean[1:])  # Remove +
                    elif phone_clean.startswith("+1") and len(phone_clean) == 12:
                        # US E.164 format (+1XXXXXXXXXX) - this is what we store
                        phone_formats.append(phone_clean)
                        # Also try without +1 for matching
                        phone_formats.append(phone_clean[2:])  # Remove +1
                        phone_formats.append(phone_clean[1:])  # Remove +
                    elif phone_clean.startswith("1") and len(phone_clean) == 11:
                        # Has 1 prefix (1XXXXXXXXXX) - likely US
                        phone_formats.append(f"+{phone_clean}")  # Add + to make +1XXXXXXXXXX
                        phone_formats.append(phone_clean[1:])  # Remove 1 to make 10-digit
                    elif phone_clean.isdigit() and len(phone_clean) == 10:
                        # 10-digit number (XXXXXXXXXX) - most common US case
                        phone_formats.append(f"+1{phone_clean}")  # Add +1 to make +1XXXXXXXXXX
                        phone_formats.append(f"1{phone_clean}")  # Add 1 to make 1XXXXXXXXXX
                    elif phone_clean.isdigit() and len(phone_clean) >= 11:
                        # International number (11+ digits) - try with + prefix
                        # Check if it starts with a known country code
                        if phone_clean.startswith("52") and len(phone_clean) == 11:
                            # Mexico (+52)
                            phone_formats.append(f"+{phone_clean}")
                        elif phone_clean.startswith("1") and len(phone_clean) == 11:
                            # US (1XXXXXXXXXX)
                            phone_formats.append(f"+{phone_clean}")
                        else:
                            # Generic international - try with +
                            phone_formats.append(f"+{phone_clean}")
                
                params["phones"] = list(set(phone_formats))  # Remove duplicates
                logger.info(f"🔍 Searching for phones with formats: {params['phones']}")
                
                # Find matching phone nodes - check both phone (primary key) and formatted
                # Also check raw_input array for backwards compatibility
                phone_query = """
                MATCH (n:PhoneNumber)
                WHERE n.phone IN $phones 
                   OR n.formatted IN $phones
                   OR ANY(phone_var IN $phones WHERE phone_var IN COALESCE(n.raw_input, []))
                RETURN DISTINCT id(n) as nid, n.phone as phone, n.formatted as formatted
                """
                phone_result = session.run(phone_query, params)
                seen_ids = set()
                found_count = 0
                for record in phone_result:
                    nid = record["nid"]
                    phone_val = record.get("phone", "")
                    formatted_val = record.get("formatted", "")
                    if nid not in seen_ids:  # Deduplicate
                        entity_ids.append(nid)
                        seen_ids.add(nid)
                        found_count += 1
                        logger.info(f"✅ Found phone node: id={nid}, phone={phone_val}, formatted={formatted_val}")
                
                if found_count == 0:
                    # Debug: Check what's actually in the database
                    logger.warning(f"⚠️  No phone nodes found for formats: {params['phones']}")
                    # Try to get a sample of all phone nodes to see what format they're stored in
                    sample_query = "MATCH (n:PhoneNumber) RETURN n.phone as phone, n.formatted as formatted, n.raw_input as raw_input LIMIT 5"
                    sample_result = session.run(sample_query)
                    sample_phones = []
                    for sample_record in sample_result:
                        sample_phones.append({
                            "phone": sample_record.get("phone", ""),
                            "formatted": sample_record.get("formatted", ""),
                            "raw_input": sample_record.get("raw_input", [])
                        })
                    logger.info(f"📋 Sample phones in database: {sample_phones}")
                
                if found_count == 0:
                    logger.warning(f"⚠️  No phone nodes found for formats: {params['phones']}")
                    # Debug: Check what phones actually exist in the database
                    debug_query = "MATCH (n:PhoneNumber) RETURN n.phone as phone, n.formatted as formatted LIMIT 10"
                    debug_result = session.run(debug_query)
                    existing_phones = [(r.get("phone", ""), r.get("formatted", "")) for r in debug_result]
                    logger.info(f"📋 Sample phones in database: {existing_phones}")
            
            if entities_to_show.get("domain"):
                domains = list(set(entities_to_show["domain"]))  # Dedupe
                # Normalize domains (remove protocol, www, paths, etc.) to match stored format
                import re
                domain_formats = []
                for domain in domains:
                    domain_clean = domain.strip().lower()
                    # Remove protocol
                    domain_clean = re.sub(r'^https?://', '', domain_clean)
                    # Remove www.
                    domain_clean = re.sub(r'^www\.', '', domain_clean)
                    # Remove paths, query strings, fragments
                    domain_clean = domain_clean.split('/')[0].split('?')[0].split('#')[0]
                    # Remove trailing slash
                    domain_clean = domain_clean.rstrip('/')
                    
                    # Add both original and normalized versions for matching
                    domain_formats.append(domain_clean)
                    if domain_clean != domain.strip().lower():
                        domain_formats.append(domain.strip().lower())  # Also try original
                
                params["domains"] = list(set(domain_formats))  # Remove duplicates
                logger.info(f"🔍 Searching for domains with formats: {params['domains']}")
                
                domain_query = """
                MATCH (n:Domain)
                WHERE n.domain IN $domains
                RETURN DISTINCT id(n) as nid, n.domain as domain
                """
                domain_result = session.run(domain_query, params)
                found_count = 0
                for record in domain_result:
                    nid = record["nid"]
                    domain_val = record.get("domain", "")
                    if nid not in entity_ids:  # Avoid duplicates
                        entity_ids.append(nid)
                        found_count += 1
                        logger.info(f"✅ Found domain node: id={nid}, domain={domain_val}")
                
                if found_count == 0:
                    logger.warning(f"⚠️  No domain nodes found for formats: {params['domains']}")
                    # Debug: Check what's actually in the database
                    sample_query = "MATCH (n:Domain) RETURN n.domain as domain LIMIT 5"
                    sample_result = session.run(sample_query)
                    sample_domains = [r.get("domain", "") for r in sample_result]
                    logger.info(f"📋 Sample domains in database: {sample_domains}")
            
            if entities_to_show.get("wallet"):
                wallets = list(set(entities_to_show["wallet"]))
                params["wallets"] = wallets
                logger.info(f"🔍 Searching for wallets: {params['wallets']}")
                
                wallet_query = """
                MATCH (n:Wallet)
                WHERE n.address IN $wallets
                RETURN DISTINCT id(n) as nid, n.address as address
                """
                wallet_result = session.run(wallet_query, params)
                found_count = 0
                for record in wallet_result:
                    nid = record["nid"]
                    wallet_val = record.get("address", "")
                    if nid not in entity_ids:  # Avoid duplicates
                        entity_ids.append(nid)
                        found_count += 1
                        logger.info(f"✅ Found wallet node: id={nid}, address={wallet_val}")
                
                if found_count == 0:
                    logger.warning(f"⚠️  No wallet nodes found for: {params['wallets']}")
                    # Debug: Check what's actually in the database
                    sample_query = "MATCH (n:Wallet) RETURN n.address as address LIMIT 5"
                    sample_result = session.run(sample_query)
                    sample_wallets = [r.get("address", "") for r in sample_result]
                    logger.info(f"📋 Sample wallets in database: {sample_wallets}")
            
            if entities_to_show.get("handle"):
                handles = list(set(entities_to_show["handle"]))
                # Handles might be in format "handle" or "@handle" - normalize
                handle_formats = []
                handle_platforms = []
                for handle in handles:
                    handle_clean = handle.strip()
                    # Remove @ prefix if present
                    if handle_clean.startswith('@'):
                        handle_clean = handle_clean[1:]
                    handle_formats.append(handle_clean)
                    handle_formats.append(f"@{handle_clean}")  # Also try with @
                
                params["handles"] = list(set(handle_formats))
                logger.info(f"🔍 Searching for handles with formats: {params['handles']}")
                
                # Handles are stored with both handle and platform, so we need to match on handle
                # (platform might vary, so match on handle only)
                handle_query = """
                MATCH (n:MessagingHandle)
                WHERE n.handle IN $handles
                RETURN DISTINCT id(n) as nid, n.handle as handle, n.platform as platform
                """
                handle_result = session.run(handle_query, params)
                found_count = 0
                for record in handle_result:
                    nid = record["nid"]
                    handle_val = record.get("handle", "")
                    platform_val = record.get("platform", "")
                    if nid not in entity_ids:  # Avoid duplicates
                        entity_ids.append(nid)
                        found_count += 1
                        logger.info(f"✅ Found handle node: id={nid}, handle={handle_val}, platform={platform_val}")
                
                if found_count == 0:
                    logger.warning(f"⚠️  No handle nodes found for formats: {params['handles']}")
                    # Debug: Check what's actually in the database
                    sample_query = "MATCH (n:MessagingHandle) RETURN n.handle as handle, n.platform as platform LIMIT 5"
                    sample_result = session.run(sample_query)
                    sample_handles = [{"handle": r.get("handle", ""), "platform": r.get("platform", "")} for r in sample_result]
                    logger.info(f"📋 Sample handles in database: {sample_handles}")
            
            if not entity_ids:
                logger.warning(f"⚠️  No entity IDs found for search: {entities_to_show}")
                return {"nodes": [], "edges": []}
            
            logger.info(f"✅ Found {len(entity_ids)} entity IDs to display in graph")
            
            # Get our entities and their relationship nodes only (NOT other entity nodes)
            # Use UNION to ensure we get all entities first, then their relationships
            all_nodes_query = """
            // First part: Always return all our entities (even if they have no relationships)
            MATCH (start)
            WHERE id(start) IN $entity_ids
            RETURN id(start) as start_id, start, -1 as rel_id, null as rel_node
            
            UNION ALL
            
            // Second part: Get relationship nodes for entities that have them
            MATCH (start)
            WHERE id(start) IN $entity_ids
            MATCH (start)-[r]-(rel_node)
            WHERE (rel_node:Country OR rel_node:Currency OR rel_node:Host OR rel_node:CDN 
                   OR rel_node:Registrar OR rel_node:CMS OR rel_node:Nameserver 
                   OR rel_node:Platform OR rel_node:VOIPProvider)
               AND NOT (rel_node:PhoneNumber OR rel_node:Domain OR rel_node:Wallet OR rel_node:MessagingHandle)
            RETURN DISTINCT id(start) as start_id, start, 
                   id(rel_node) as rel_id, 
                   rel_node
            """
            
            result = session.run(all_nodes_query, {"entity_ids": entity_ids})
            
            # Collect all unique nodes - only our entities and their relationship nodes
            for record in result:
                # Add start node (our entity) - always include even if no relationships
                if record.get("start"):
                    start_node = record["start"]
                    start_id = str(record["start_id"])
                    if start_id not in nodes:
                        labels = list(start_node.labels)
                        props = dict(start_node)
                        serialized_props = {k: serialize_value(v) for k, v in props.items()}
                        display_name = self._get_display_name(labels, props)
                        
                        nodes[start_id] = {
                            "id": start_id,
                            "label": labels[0] if labels else "Unknown",
                            "display_name": display_name or start_id,
                            "properties": serialized_props
                        }
                
                # Add relationship node (Country, Host, etc.) - but skip if it's -1 (no match)
                rel_id = record.get("rel_id")
                if rel_id and rel_id != -1:
                    rel_node = record.get("rel_node")
                    if rel_node:
                        conn_id = str(rel_id)
                        if conn_id not in nodes:
                            labels = list(rel_node.labels)
                            props = dict(rel_node)
                            serialized_props = {k: serialize_value(v) for k, v in props.items()}
                            display_name = self._get_display_name(labels, props)
                            
                            nodes[conn_id] = {
                                "id": conn_id,
                                "label": labels[0] if labels else "Unknown",
                                "display_name": display_name or conn_id,
                                "properties": serialized_props
                            }
            
            # Get relationships between collected nodes
            node_ids_list = list(nodes.keys())
            if node_ids_list:
                edges_query = """
                MATCH (n)-[r]->(m)
                WHERE id(n) IN $node_ids AND id(m) IN $node_ids
                RETURN id(n) as source, id(m) as target, type(r) as rel_type
                """
                edges_result = session.run(edges_query, {"node_ids": [int(nid) for nid in node_ids_list]})
                
                for record in edges_result:
                    source_id = str(record["source"])
                    target_id = str(record["target"])
                    
                    if source_id in nodes and target_id in nodes:
                        edges.append({
                            "source": source_id,
                            "target": target_id,
                            "type": record["rel_type"]
                        })
        
        return {
            "nodes": list(nodes.values()),
            "edges": edges
        }
    
    def _get_display_name(self, labels, props):
        """Helper to get display name for a node."""
        if "PhoneNumber" in labels:
            return props.get("formatted") or props.get("phone")
        elif "Domain" in labels:
            return props.get("domain")
        elif "Wallet" in labels:
            return f"{props.get('currency', '?')}: {props.get('address', '')[:10]}..."
        elif "MessagingHandle" in labels:
            return f"{props.get('platform', '?')}: {props.get('handle', '')}"
        elif "VOIPProvider" in labels:
            return props.get("name")
        elif "Country" in labels:
            return f"🌍 {props.get('name', '')}"
        elif "Currency" in labels:
            return f"💰 {props.get('name', '')}"
        elif "Platform" in labels:
            return f"📱 {props.get('name', '')}"
        elif "Host" in labels:
            return f"🖥️ {props.get('name', '')}"
        elif "CDN" in labels:
            return f"⚡ {props.get('name', '')}"
        elif "Registrar" in labels:
            return f"📝 {props.get('name', '')}"
        elif "CMS" in labels:
            return f"🔧 {props.get('name', '')}"
        elif "Nameserver" in labels:
            return f"🌐 {props.get('name', '')}"
        elif "Cluster" in labels:
            return props.get("description", props.get("cluster_id", ""))
        return None
    
    def get_all_nodes_and_relationships(self) -> Dict:
        """Get all nodes and relationships for visualization."""
        if not self.driver:
            return {"nodes": [], "edges": []}
        
        from datetime import datetime
        
        nodes = {}
        edges = []
        
        def serialize_value(value):
            """Convert Neo4j values to JSON-serializable types."""
            if hasattr(value, 'iso_format'):  # Neo4j DateTime
                return value.iso_format()
            elif isinstance(value, datetime):
                return value.isoformat()
            elif isinstance(value, (dict, list)):
                if isinstance(value, dict):
                    return {k: serialize_value(v) for k, v in value.items()}
                else:
                    return [serialize_value(v) for v in value]
            else:
                return value
        
        with self.driver.session() as session:
            # Get all nodes with their IDs
            nodes_query = "MATCH (n) RETURN id(n) as nid, n"
            nodes_result = session.run(nodes_query)
            
            for record in nodes_result:
                node = record["n"]
                node_id = str(record["nid"])
                if node:
                    labels = list(node.labels)
                    props = dict(node)
                    serialized_props = {k: serialize_value(v) for k, v in props.items()}
                    
                    # Determine display name based on node type
                    display_name = None
                    if "PhoneNumber" in labels:
                        display_name = props.get("formatted") or props.get("phone", node_id)
                    elif "Domain" in labels:
                        display_name = props.get("domain", node_id)
                    elif "Wallet" in labels:
                        display_name = f"{props.get('currency', '?')}: {props.get('address', node_id)[:10]}..."
                    elif "MessagingHandle" in labels:
                        display_name = f"{props.get('platform', '?')}: {props.get('handle', node_id)}"
                    elif "VOIPProvider" in labels:
                        display_name = props.get("name", node_id)
                    elif "Country" in labels:
                        display_name = f"🌍 {props.get('name', node_id)}"
                    elif "Currency" in labels:
                        display_name = f"💰 {props.get('name', node_id)}"
                    elif "Platform" in labels:
                        display_name = f"📱 {props.get('name', node_id)}"
                    elif "Host" in labels:
                        display_name = f"🖥️ {props.get('name', node_id)}"
                    elif "CDN" in labels:
                        display_name = f"⚡ {props.get('name', node_id)}"
                    elif "Registrar" in labels:
                        display_name = f"📝 {props.get('name', node_id)}"
                    elif "CMS" in labels:
                        display_name = f"🔧 {props.get('name', node_id)}"
                    elif "Nameserver" in labels:
                        display_name = f"🌐 {props.get('name', node_id)}"
                    elif "Cluster" in labels:
                        display_name = props.get("description", props.get("cluster_id", node_id))
                    
                    nodes[node_id] = {
                        "id": node_id,
                        "label": labels[0] if labels else "Unknown",
                        "display_name": display_name or node_id,
                        "properties": serialized_props
                    }
            
            # Get all relationships
            edges_query = "MATCH (n)-[r]->(m) RETURN id(n) as source, id(m) as target, type(r) as rel_type"
            edges_result = session.run(edges_query)
            
            for record in edges_result:
                source_id = str(record["source"])
                target_id = str(record["target"])
                
                if source_id in nodes and target_id in nodes:
                    edges.append({
                        "source": source_id,
                        "target": target_id,
                        "type": record["rel_type"]
                    })
        
        return {
            "nodes": list(nodes.values()),
            "edges": edges
        }
    
    def clear_database(self):
        """Clear all nodes and relationships (use with caution!)."""
        if not self.driver:
            return
        query = "MATCH (n) DETACH DELETE n"
        self._execute_query(query)

