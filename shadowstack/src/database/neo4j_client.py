"""Neo4j graph database client for storing infrastructure relationships."""

import os
from typing import Dict, List, Optional
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()


class Neo4jClient:
    """Client for interacting with Neo4j graph database."""
    
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "ncii123password")
        
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        """Close the database connection."""
        self.driver.close()
    
    def _execute_query(self, query: str, parameters: Optional[Dict] = None):
        """Execute a Cypher query."""
        with self.driver.session() as session:
            return session.run(query, parameters or {})
    
    def create_domain(self, domain: str, source: str, notes: str = ""):
        """Create or update a domain node."""
        query = """
        MERGE (d:Domain {domain: $domain})
        SET d.name = $domain,
            d.source = $source,
            d.notes = $notes,
            d.last_seen = datetime()
        RETURN d
        """
        return self._execute_query(query, {
            "domain": domain,
            "source": source,
            "notes": notes
        })
    
    def create_host(self, host_name: str, ip: str, asn: Optional[str] = None, 
                    isp: Optional[str] = None):
        """Create or update a host node."""
        query = """
        MERGE (h:Host {ip: $ip})
        SET h.name = $host_name,
            h.asn = $asn,
            h.isp = $isp,
            h.last_seen = datetime()
        RETURN h
        """
        return self._execute_query(query, {
            "host_name": host_name,
            "ip": ip,
            "asn": asn,
            "isp": isp
        })
    
    def create_cdn(self, cdn_name: str):
        """Create or update a CDN node."""
        query = """
        MERGE (c:CDN {name: $cdn_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"cdn_name": cdn_name})
    
    def create_cms(self, cms_name: str):
        """Create or update a CMS node."""
        query = """
        MERGE (c:CMS {name: $cms_name})
        SET c.last_seen = datetime()
        RETURN c
        """
        return self._execute_query(query, {"cms_name": cms_name})
    
    def create_payment_processor(self, processor_name: str):
        """Create or update a payment processor node."""
        query = """
        MERGE (p:PaymentProcessor {name: $processor_name})
        SET p.last_seen = datetime()
        RETURN p
        """
        return self._execute_query(query, {"processor_name": processor_name})
    
    def link_domain_to_host(self, domain: str, ip: str):
        """Create relationship between domain and host."""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (h:Host {ip: $ip})
        MERGE (d)-[:HOSTED_ON]->(h)
        RETURN d, h
        """
        return self._execute_query(query, {"domain": domain, "ip": ip})
    
    def link_domain_to_cdn(self, domain: str, cdn_name: str):
        """Create relationship between domain and CDN."""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (c:CDN {name: $cdn_name})
        MERGE (d)-[:USES_CDN]->(c)
        RETURN d, c
        """
        return self._execute_query(query, {"domain": domain, "cdn_name": cdn_name})
    
    def link_domain_to_cms(self, domain: str, cms_name: str):
        """Create relationship between domain and CMS."""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (c:CMS {name: $cms_name})
        MERGE (d)-[:USES_CMS]->(c)
        RETURN d, c
        """
        return self._execute_query(query, {"domain": domain, "cms_name": cms_name})
    
    def create_registrar(self, name: str):
        """Create or update a registrar node."""
        query = """
        MERGE (r:Registrar {name: $name})
        SET r.last_seen = datetime()
        RETURN r
        """
        return self._execute_query(query, {"name": name})
    
    def link_domain_to_registrar(self, domain: str, registrar: str):
        """Create relationship between domain and registrar."""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (r:Registrar {name: $registrar})
        MERGE (d)-[:REGISTERED_BY]->(r)
        RETURN d, r
        """
        return self._execute_query(query, {"domain": domain, "registrar": registrar})
    
    def link_domain_to_payment(self, domain: str, processor_name: str):
        """Create relationship between domain and payment processor."""
        query = """
        MATCH (d:Domain {domain: $domain})
        MATCH (p:PaymentProcessor {name: $processor_name})
        MERGE (d)-[:USES_PAYMENT]->(p)
        RETURN d, p
        """
        return self._execute_query(query, {"domain": domain, "processor_name": processor_name})
    
    def get_all_nodes_and_relationships(self) -> Dict:
        """Get all nodes and relationships for visualization."""
        from datetime import datetime
        
        nodes = {}
        edges = []
        
        def serialize_value(value):
            """Convert Neo4j values to JSON-serializable types."""
            # Handle Neo4j DateTime and Python datetime
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
                    # Convert node properties to dict and serialize
                    props = dict(node)
                    serialized_props = {k: serialize_value(v) for k, v in props.items()}
                    
                    nodes[node_id] = {
                        "id": node_id,
                        "label": labels[0] if labels else "Unknown",
                        "properties": serialized_props
                    }
            
            # Get all relationships
            edges_query = "MATCH (n)-[r]->(m) RETURN id(n) as source, id(m) as target, type(r) as rel_type"
            edges_result = session.run(edges_query)
            
            for record in edges_result:
                source_id = str(record["source"])
                target_id = str(record["target"])
                
                # Only include edges where both nodes exist
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
        query = "MATCH (n) DETACH DELETE n"
        self._execute_query(query)

