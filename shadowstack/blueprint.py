"""
ShadowStack Flask Blueprint for consolidated DarkAI platform.

This blueprint handles all ShadowStack routes under /shadowstack prefix.
"""

import os
import sys
from pathlib import Path
from flask import Blueprint, render_template, jsonify, request, Response
import json
from flask_cors import CORS
from dotenv import load_dotenv

# Add src to path (relative to blueprint location)
blueprint_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(blueprint_dir))

# Load environment variables early - try from consolidated app root first, then blueprint directory
consolidated_root = blueprint_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')  # Try consolidated app root first
load_dotenv(dotenv_path=blueprint_dir / '.env', override=False)  # Then blueprint directory (don't override)

try:
    from src.database.neo4j_client import Neo4jClient
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    Neo4jClient = None

from src.database.postgres_client import PostgresClient
from src.enrichment.enrichment_pipeline import enrich_domain
from collections import Counter

# OpenAI import
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None


# Create blueprint
# Use absolute path for template_folder to ensure Flask can find templates
blueprint_dir = Path(__file__).parent.absolute()
shadowstack_bp = Blueprint(
    'shadowstack',
    __name__,
    template_folder=str(blueprint_dir / 'templates'),
    static_folder=str(blueprint_dir / 'static'),
    static_url_path='/static'  # Will be prefixed with /shadowstack automatically
)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
openai_client = OpenAI(api_key=OPENAI_API_KEY) if (OPENAI_AVAILABLE and OPENAI_API_KEY) else None

# Initialize global PostgresClient for auto-seeding (similar to PersonaForge)
try:
    postgres_client = PostgresClient()
    if not postgres_client or not postgres_client.conn:
        print("⚠️  ShadowStack: PostgreSQL not available - some features may be limited")
        postgres_client = None
    else:
        print("✅ ShadowStack: PostgreSQL client initialized")
except Exception as e:
    print(f"⚠️  ShadowStack: Could not initialize PostgreSQL client: {e}")
    postgres_client = None

@shadowstack_bp.route('/')
def index():
    """Render the splash/landing page."""
    return render_template('splash.html')


@shadowstack_bp.route('/dashboard')
def dashboard():
    """Render the main visualization dashboard."""
    # Use unique template name to avoid conflict with PersonaForge's dashboard.html
    return render_template('shadowstack_dashboard.html')


@shadowstack_bp.route('/action')
def action():
    """Render the action/take action page."""
    return render_template('action.html')


@shadowstack_bp.route('/check')
def check():
    """Render the URL check/analysis page."""
    return render_template('check.html')


# List of legitimate domains that should NEVER be in ShadowStack
LEGITIMATE_DOMAINS_BLOCKLIST = {
    'usatoday.com', 'vanityfair.com', 'politico.com', 'marketwatch.com',
    'frbservices.org', 'pa.gov', 'cnn.com', 'bbc.com', 'nytimes.com',
    'washingtonpost.com', 'reuters.com', 'ap.org', 'bloomberg.com',
    'wsj.com', 'forbes.com', 'techcrunch.com', 'theguardian.com',
    'npr.org', 'abc.com', 'cbs.com', 'nbc.com', 'foxnews.com',
    'msnbc.com', 'huffpost.com', 'buzzfeed.com', 'vox.com',
    'theatlantic.com', 'newyorker.com', 'time.com', 'newsweek.com',
    'usnews.com', 'businessinsider.com', 'fortune.com', 'economist.com',
    'ft.com', 'latimes.com', 'chicagotribune.com', 'bostonglobe.com',
    'wired.com', 'ars-technica.com', 'theverge.com', 'engadget.com',
    'gizmodo.com', 'mashable.com', 'slate.com', 'salon.com',
    'thedailybeast.com', 'thedailybeast.com', 'independent.co.uk',
    'telegraph.co.uk', 'dailymail.co.uk', 'mirror.co.uk',
    'gov', 'edu', 'mil', 'org', 'com', 'net',  # TLDs that are often legitimate
}

def is_legitimate_domain(domain: str) -> bool:
    """Check if a domain is a legitimate news/government site that shouldn't be in ShadowStack."""
    domain_lower = domain.lower().strip()
    
    # Check exact match
    if domain_lower in LEGITIMATE_DOMAINS_BLOCKLIST:
        return True
    
    # Check if it's a known news/gov domain pattern
    legitimate_patterns = [
        '.gov', '.edu', '.mil',  # Government/education
        'news.', 'media.', 'press.',  # News organizations
        'bbc.', 'cnn.', 'npr.', 'abc.', 'cbs.', 'nbc.',  # Major news networks
    ]
    
    for pattern in legitimate_patterns:
        if pattern in domain_lower:
            return True
    
    return False


@shadowstack_bp.route('/api/cleanup-invalid-domains', methods=['POST'])
def cleanup_invalid_domains():
    """
    Remove invalid/legitimate domains that shouldn't be in ShadowStack.
    This removes domains that are clearly legitimate news sites, government sites, etc.
    """
    try:
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = postgres.conn.cursor()
        
        # Get all domains and check which are legitimate
        all_domains = postgres.get_all_enriched_domains()
        invalid_domains = []
        
        for domain_data in all_domains:
            domain = domain_data.get('domain', '')
            if is_legitimate_domain(domain):
                invalid_domains.append(domain)
        
        deleted_count = 0
        if invalid_domains:
            # Delete invalid domains
            placeholders = ','.join(['%s'] * len(invalid_domains))
            cursor.execute(f"""
                DELETE FROM domains 
                WHERE domain IN ({placeholders})
            """, invalid_domains)
            deleted_count = cursor.rowcount
            
            # Also delete their enrichment data
            cursor.execute(f"""
                DELETE FROM domain_enrichment
                WHERE domain_id IN (
                    SELECT id FROM domains WHERE domain IN ({placeholders})
                )
            """, invalid_domains + invalid_domains)
        
        postgres.conn.commit()
        cursor.close()
        postgres.close()
        
        return jsonify({
            "message": f"Cleaned up {deleted_count} invalid domains",
            "deleted": deleted_count,
            "invalid_domains": invalid_domains[:20]  # Show first 20
        }), 200
        
    except Exception as e:
        shadowstack_logger.error(f"Error cleaning up invalid domains: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@shadowstack_bp.route('/api/check', methods=['POST'])
def check_domain_only():
    """
    Check/enrich a domain WITHOUT storing it in the database.
    This is for one-off analysis only.
    
    POST /api/check
    Body: {
        "domain": "example.com"
    }
    """
    data = request.get_json()
    
    if not data or 'domain' not in data:
        return jsonify({"error": "Domain is required"}), 400
    
    domain = data['domain'].strip()
    
    try:
        # Enrich domain but DON'T store it
        print(f"Checking domain (no storage): {domain}")
        enrichment_data = enrich_domain(domain)
        
        return jsonify({
            "message": "Domain analyzed successfully (not stored)",
            "domain": domain,
            "data": enrichment_data,
            "status": "checked"
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "domain": domain,
            "status": "error"
        }), 500


def get_graph_from_postgres():
    """Generate graph data from PostgreSQL instead of Neo4j."""
    from collections import Counter
    
    try:
        postgres = PostgresClient()
        domains = postgres.get_all_enriched_domains()
        postgres.close()
    except Exception as e:
        # Database connection failed, return empty graph
        print(f"PostgreSQL connection failed in get_graph_from_postgres: {e}")
        return {
            "nodes": [],
            "edges": [],
            "stats": {
                "total_domains": 0,
                "total_services": 0,
                "total_edges": 0
            }
        }
    
    # Build nodes and edges from PostgreSQL data
    nodes = []
    edges = []
    node_id_map = {}  # Map of (type, name) -> node_id
    node_counter = 0
    
    # Service frequency counters
    service_counts = Counter()
    
    # Add domain nodes
    for domain in domains:
        domain_name = domain.get('domain', '')
        if not domain_name:
            continue
            
        node_id = f"domain_{domain_name}"
        node_id_map[('domain', domain_name)] = node_id
        
        nodes.append({
            "id": node_id,
            "label": "Domain",
            "node_type": "domain",
            "properties": {
                "domain": domain_name,
                "name": domain_name
            }
        })
        
        # Create service nodes and edges
        # Host
        if domain.get('host_name'):
            host_name = domain['host_name']
            service_counts[('host', host_name)] += 1
            if ('host', host_name) not in node_id_map:
                node_counter += 1
                host_id = f"host_{node_counter}_{host_name}"
                node_id_map[('host', host_name)] = host_id
                nodes.append({
                    "id": host_id,
                    "label": "Host",
                    "node_type": "service",
                    "properties": {
                        "name": host_name,
                        "ip": domain.get('ip_address', ''),
                        "isp": domain.get('isp', '')
                    }
                })
            edges.append({
                "source": node_id,
                "target": node_id_map[('host', host_name)],
                "type": "HOSTED_ON"
            })
        
        # CDN
        if domain.get('cdn'):
            cdn_name = domain['cdn']
            service_counts[('cdn', cdn_name)] += 1
            if ('cdn', cdn_name) not in node_id_map:
                node_counter += 1
                cdn_id = f"cdn_{node_counter}_{cdn_name}"
                node_id_map[('cdn', cdn_name)] = cdn_id
                nodes.append({
                    "id": cdn_id,
                    "label": "CDN",
                    "node_type": "service",
                    "properties": {"name": cdn_name}
                })
            edges.append({
                "source": node_id,
                "target": node_id_map[('cdn', cdn_name)],
                "type": "USES_CDN"
            })
        
        # CMS
        if domain.get('cms'):
            cms_name = domain['cms']
            service_counts[('cms', cms_name)] += 1
            if ('cms', cms_name) not in node_id_map:
                node_counter += 1
                cms_id = f"cms_{node_counter}_{cms_name}"
                node_id_map[('cms', cms_name)] = cms_id
                nodes.append({
                    "id": cms_id,
                    "label": "CMS",
                    "node_type": "service",
                    "properties": {"name": cms_name}
                })
            edges.append({
                "source": node_id,
                "target": node_id_map[('cms', cms_name)],
                "type": "HAS_CMS"
            })
        
        # Registrar
        if domain.get('registrar'):
            registrar_name = domain['registrar']
            service_counts[('registrar', registrar_name)] += 1
            if ('registrar', registrar_name) not in node_id_map:
                node_counter += 1
                registrar_id = f"registrar_{node_counter}_{registrar_name}"
                node_id_map[('registrar', registrar_name)] = registrar_id
                nodes.append({
                    "id": registrar_id,
                    "label": "Registrar",
                    "node_type": "service",
                    "properties": {"name": registrar_name}
                })
            edges.append({
                "source": node_id,
                "target": node_id_map[('registrar', registrar_name)],
                "type": "REGISTERED_BY"
            })
    
    # Filter to top 20 services
    top_services = service_counts.most_common(20)
    top_service_keys = {key for key, count in top_services}
    
    # Filter nodes and edges
    domain_nodes = [n for n in nodes if n.get("node_type") == "domain"]
    service_nodes = [
        n for n in nodes 
        if n.get("node_type") == "service" 
        and any((n["properties"].get("name") == name and 
                 (n["label"].lower(), name) in top_service_keys) 
                for name in [n["properties"].get("name")])
    ]
    
    # Keep all service nodes (we'll filter by checking if they're in top_service_keys)
    all_service_keys_set = {key for key, _ in top_services}
    filtered_service_nodes = [
        n for n in nodes if n.get("node_type") == "service"
        and (n["label"].lower(), n["properties"].get("name")) in all_service_keys_set
    ]
    
    # Filter edges to only include top services
    filtered_node_ids = {n["id"] for n in domain_nodes + filtered_service_nodes}
    filtered_edges = [
        e for e in edges
        if e.get("source") in filtered_node_ids and e.get("target") in filtered_node_ids
    ]
    
    service_names = [name for (_, name), _ in top_services[:20]]
    
    return {
        "nodes": domain_nodes + filtered_service_nodes,
        "edges": filtered_edges,
        "stats": {
            "total_domains": len(domain_nodes),
            "total_services": len(filtered_service_nodes),
            "top_services": service_names
        }
    }


@shadowstack_bp.route('/api/graph')
def get_graph():
    """Get graph data from Neo4j or PostgreSQL, filtered to show top 20 services."""
    from datetime import datetime
    import json
    from collections import Counter
    
    try:
        # ShadowStack ONLY uses PostgreSQL - never Neo4j (to avoid conflicts with BlackWire)
        graph_data = get_graph_from_postgres()
        
        # If graph_data already has the structure from PostgreSQL, return it
        if "stats" in graph_data and "nodes" in graph_data:
            return jsonify(graph_data)
        
        # Otherwise, process Neo4j format
        # Separate domains from services
        # Only show: Host, CMS, CDN, Registrar
        allowed_service_types = ["host", "cms", "cdn", "registrar"]
        
        domain_nodes = []
        service_nodes = []
        
        for node in graph_data.get("nodes", []):
            label = node.get("label", "").lower()
            if label == "domain":
                domain_nodes.append(node)
            elif label in allowed_service_types:
                service_nodes.append(node)
        
        # Count service frequency (how many domains connect to each service)
        service_counts = Counter()
        service_node_map = {}
        
        # Create a map of node IDs to nodes
        all_nodes_map = {node["id"]: node for node in graph_data.get("nodes", [])}
        
        # Count how many domains connect to each service node
        for edge in graph_data.get("edges", []):
            source_id = str(edge.get("source"))
            target_id = str(edge.get("target"))
            
            source_node = all_nodes_map.get(source_id)
            target_node = all_nodes_map.get(target_id)
            
            # If domain -> service connection, count it
            if source_node and target_node:
                source_label = source_node.get("label", "").lower()
                target_label = target_node.get("label", "").lower()
                
                if source_label == "domain" and target_label != "domain":
                    # Domain connecting to a service
                    service_id = target_id
                    service_counts[service_id] += 1
                    if service_id not in service_node_map:
                        service_node_map[service_id] = target_node
                elif target_label == "domain" and source_label != "domain":
                    # Service connecting to a domain
                    service_id = source_id
                    service_counts[service_id] += 1
                    if service_id not in service_node_map:
                        service_node_map[service_id] = source_node
        
        # Get top 20 services by frequency (how many domains use them)
        top_service_ids = [sid for sid, count in service_counts.most_common(20)]
        filtered_service_nodes = [service_node_map[sid] for sid in top_service_ids if sid in service_node_map]
        
        # Filter edges to only include top services and all domains
        all_node_ids = {node["id"] for node in domain_nodes + filtered_service_nodes}
        filtered_edges = [
            edge for edge in graph_data.get("edges", [])
            if edge.get("source") in all_node_ids and edge.get("target") in all_node_ids
        ]
        
        # Mark nodes with type
        for node in domain_nodes:
            node["node_type"] = "domain"
        for node in filtered_service_nodes:
            node["node_type"] = "service"
        
        # Get service names for stats
        service_names = []
        for sid in top_service_ids[:20]:
            node = service_node_map.get(sid)
            if node:
                props = node.get("properties", {})
                name = props.get("name") or props.get("domain") or sid
                service_names.append(name)
        
        filtered_graph = {
            "nodes": domain_nodes + filtered_service_nodes,
            "edges": filtered_edges,
            "stats": {
                "total_domains": len(domain_nodes),
                "total_services": len(filtered_service_nodes),
                "top_services": service_names
            }
        }
        
        # Ensure all data is JSON serializable
        def json_serial(obj):
            # Handle Neo4j DateTime
            if hasattr(obj, 'iso_format'):
                return obj.iso_format()
            elif isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        # Double serialize to catch any nested objects
        json_str = json.dumps(filtered_graph, default=json_serial)
        return jsonify(json.loads(json_str))
    except Exception as e:
        import traceback
        print(f"Error in get_graph: {e}")
        traceback.print_exc()
        # Fallback to PostgreSQL
        try:
            fallback_data = get_graph_from_postgres()
            return jsonify(fallback_data)
        except Exception as e2:
            print(f"PostgreSQL fallback also failed: {e2}")
            return jsonify({
                "error": "Database connection failed",
                "message": str(e2),
                "nodes": [],
                "edges": [],
                "stats": {
                    "total_domains": 0,
                    "total_services": 0,
                    "total_edges": 0
                }
            }), 200  # Return 200 with empty data instead of 500


@shadowstack_bp.route('/api/stats')
def get_stats():
    """Get statistics about the dataset."""
    try:
        # Generate graph-like structure from PostgreSQL (handles DB errors internally)
        graph_data = get_graph_from_postgres()
        
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])
        
        # Count nodes by type
        node_counts = {}
        for node in nodes:
            label = node.get("label", "Unknown")
            node_counts[label] = node_counts.get(label, 0) + 1
        
        stats = {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "node_types": node_counts
        }
        
        return jsonify(stats)
    except Exception as e:
        import traceback
        print(f"Error in get_stats: {e}")
        traceback.print_exc()
        # Return JSON error response, not HTML
        return Response(
            json.dumps({
                "error": "Database connection failed",
                "message": str(e),
                "total_nodes": 0,
                "total_edges": 0,
                "node_types": {}
            }),
            status=200,
            mimetype='application/json'
        )


@shadowstack_bp.route('/api/enrich', methods=['POST'])
def enrich_and_store():
    """
    Enrich a domain and store results in database.
    
    POST /api/enrich
    Body: {
        "domain": "example.com",
        "source": "Manual entry",
        "notes": "Optional notes"
    }
    """
    data = request.get_json()
    
    if not data or 'domain' not in data:
        return jsonify({"error": "Domain is required"}), 400
    
    domain = data['domain'].strip()
    source = data.get('source', 'Web API')
    notes = data.get('notes', '')
    
    # Check if domain already exists
    postgres = PostgresClient()
    
    try:
        # Check PostgreSQL for existing domain
        existing = postgres.get_all_enriched_domains()
        existing_domains = [d['domain'] for d in existing if d['domain']]
        
        if domain in existing_domains:
            return jsonify({
                "message": "Domain already exists in database",
                "domain": domain,
                "status": "exists"
            }), 200
        
        # Enrich domain
        print(f"Enriching domain: {domain}")
        enrichment_data = enrich_domain(domain)
        
        # Store in PostgreSQL
        domain_id = postgres.insert_domain(domain, source, notes)
        postgres.insert_enrichment(domain_id, enrichment_data)
        
        # Store in Neo4j (optional - only if available)
        if NEO4J_AVAILABLE and Neo4jClient:
            try:
                neo4j = Neo4jClient()
                neo4j.create_domain(domain, source, notes)
                
                # Create host node and link
                if enrichment_data.get("ip_address"):
                    neo4j.create_host(
                        host_name=enrichment_data.get("host_name", "Unknown"),
                        ip=enrichment_data["ip_address"],
                        asn=enrichment_data.get("asn"),
                        isp=enrichment_data.get("isp")
                    )
                    neo4j.link_domain_to_host(domain, enrichment_data["ip_address"])
                
                # Create CDN node and link
                if enrichment_data.get("cdn"):
                    neo4j.create_cdn(enrichment_data["cdn"])
                    neo4j.link_domain_to_cdn(domain, enrichment_data["cdn"])
                
                # Create CMS node and link
                if enrichment_data.get("cms"):
                    neo4j.create_cms(enrichment_data["cms"])
                    neo4j.link_domain_to_cms(domain, enrichment_data["cms"])
                
                # Create payment processor nodes and links
                if enrichment_data.get("payment_processor"):
                    processors = [p.strip() for p in enrichment_data["payment_processor"].split(",")]
                    for processor in processors:
                        neo4j.create_payment_processor(processor)
                        neo4j.link_domain_to_payment(domain, processor)
                
                neo4j.close()
            except Exception as e:
                print(f"Neo4j storage failed (continuing without it): {e}")
                # Continue without Neo4j - PostgreSQL has all the data we need
        
        return jsonify({
            "message": "Domain enriched and stored successfully",
            "domain": domain,
            "data": enrichment_data,
            "status": "success"
        }), 201
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "domain": domain,
            "status": "error"
        }), 500
    
    finally:
        postgres.close()


@shadowstack_bp.route('/api/domains', methods=['GET'])
def get_domains():
    """Get all enriched domains from database."""
    try:
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            print("⚠️  ShadowStack: PostgreSQL connection is None")
            return jsonify({
                "domains": [],
                "count": 0,
                "error": "Database not connected",
                "message": "PostgreSQL connection failed. Check database configuration."
            }), 200
        
        print(f"✅ ShadowStack: Connected to database, querying domains...")
        domains = postgres.get_all_enriched_domains()
        print(f"📊 ShadowStack: Found {len(domains)} domains in database")
        postgres.close()
        
        return jsonify({
            "domains": domains,
            "count": len(domains)
        })
    except Exception as e:
        import traceback
        error_msg = f"Error in get_domains: {e}"
        print(error_msg)
        traceback.print_exc()
        # Return JSON error response, not HTML
        return Response(
            json.dumps({
                "error": "Database connection failed",
                "message": str(e),
                "domains": [],
                "count": 0
            }),
            status=200,
            mimetype='application/json'
        )


@shadowstack_bp.route('/api/domains/<domain>', methods=['GET'])
def get_domain(domain):
    """Get enrichment data for a specific domain."""
    postgres = PostgresClient()
    
    try:
        all_domains = postgres.get_all_enriched_domains()
        domain_data = [d for d in all_domains if d.get('domain') == domain]
        
        if not domain_data:
            return jsonify({"error": "Domain not found"}), 404
        
        return jsonify(domain_data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        postgres.close()


@shadowstack_bp.route('/api/import', methods=['POST'])
def import_domains():
    """
    Import domains from CSV or JSON list.
    
    POST /api/import
    Body (JSON): {
        "domains": ["domain1.com", "domain2.com", ...],
        "source": "CSV Import",
        "auto_enrich": false
    }
    
    OR
    
    Body (CSV): CSV file with 'domain', 'source', 'notes' columns
    """
    postgres = PostgresClient()
    
    try:
        imported = []
        errors = []
        
        # Check if CSV file uploaded
        if 'file' in request.files:
            import csv
            from io import StringIO
            
            file = request.files['file']
            if file.filename.endswith('.csv'):
                content = file.read().decode('utf-8')
                reader = csv.DictReader(StringIO(content))
                
                for row in reader:
                    domain = row.get('domain') or row.get('Domain') or row.get('url') or row.get('URL')
                    if not domain:
                        continue
                    
                    # Clean domain
                    domain = domain.strip().lower()
                    if domain.startswith('http://') or domain.startswith('https://'):
                        from urllib.parse import urlparse
                        domain = urlparse(domain).netloc or domain.replace('http://', '').replace('https://', '').split('/')[0]
                    
                    # Skip legitimate domains
                    if is_legitimate_domain(domain):
                        errors.append({"domain": domain, "error": "Legitimate domain - not appropriate for ShadowStack"})
                        continue
                    
                    source = row.get('source', 'CSV Import')
                    notes = row.get('notes', '') or row.get('Notes', '')
                    
                    try:
                        domain_id = postgres.insert_domain(domain, source, notes)
                        imported.append({"domain": domain, "id": domain_id})
                    except Exception as e:
                        errors.append({"domain": domain, "error": str(e)})
        
        # Check if JSON list provided
        elif request.is_json:
            data = request.get_json()
            domains = data.get('domains', [])
            source = data.get('source', 'API Import')
            auto_enrich = data.get('auto_enrich', False)
            
            for domain in domains:
                if not domain:
                    continue
                
                # Clean domain
                domain = domain.strip().lower()
                if domain.startswith('http://') or domain.startswith('https://'):
                    from urllib.parse import urlparse
                    domain = urlparse(domain).netloc or domain.replace('http://', '').replace('https://', '').split('/')[0]
                
                # Skip legitimate domains
                if is_legitimate_domain(domain):
                    errors.append({"domain": domain, "error": "Legitimate domain - not appropriate for ShadowStack"})
                    continue
                
                try:
                    domain_id = postgres.insert_domain(domain, source, data.get('notes', ''))
                    imported.append({"domain": domain, "id": domain_id})
                    
                    # Auto-enrich if requested
                    if auto_enrich:
                        try:
                            enrichment_data = enrich_domain(domain)
                            postgres.insert_enrichment(domain_id, enrichment_data)
                        except Exception as e:
                            errors.append({"domain": domain, "error": f"Enrichment failed: {str(e)}"})
                except Exception as e:
                    errors.append({"domain": domain, "error": str(e)})
        else:
            return jsonify({"error": "No domains provided. Send JSON with 'domains' array or upload CSV file."}), 400
        
        postgres.close()
        
        return jsonify({
            "success": True,
            "imported": len(imported),
            "errors": len(errors),
            "domains": imported,
            "error_details": errors
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        postgres.close()


@shadowstack_bp.route('/api/enrich-all', methods=['POST'])
def enrich_all_domains():
    """
    Enrich all domains that don't have enrichment data yet.
    This will add CDN, host, registrar, etc. data so the graph can show clusters.
    """
    postgres = PostgresClient()
    
    try:
        # Get all domains
        all_domains = postgres.get_all_enriched_domains()
        
        # Filter to domains without enrichment data
        unenriched = [
            d for d in all_domains 
            if not d.get('ip_address') and not d.get('host_name') and not d.get('cdn')
        ]
        
        if not unenriched:
            return jsonify({
                "message": "All domains already enriched",
                "enriched": 0,
                "total": len(all_domains)
            }), 200
        
        enriched_count = 0
        errors = []
        
        for domain_data in unenriched:
            domain = domain_data.get('domain')
            if not domain:
                continue
            
            try:
                # Get domain ID - try from domain_data first, then query database
                domain_id = domain_data.get('id')
                if not domain_id:
                    cursor = postgres.conn.cursor()
                    cursor.execute("SELECT id FROM domains WHERE domain = %s", (domain,))
                    result = cursor.fetchone()
                    cursor.close()
                    
                    if not result:
                        continue
                    
                    domain_id = result[0]
                
                # Enrich the domain
                print(f"Enriching {domain}...")
                enrichment_data = enrich_domain(domain)
                
                # Store enrichment
                postgres.insert_enrichment(domain_id, enrichment_data)
                enriched_count += 1
                
                if enriched_count % 10 == 0:
                    print(f"Enriched {enriched_count}/{len(unenriched)} domains...")
                    
            except Exception as e:
                print(f"Error enriching {domain}: {e}")
                errors.append({"domain": domain, "error": str(e)})
                continue
        
        postgres.close()
        
        return jsonify({
            "message": f"Enriched {enriched_count} domains",
            "enriched": enriched_count,
            "total": len(all_domains),
            "errors": len(errors),
            "error_details": errors[:10]  # Limit error details
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        postgres.close()


@shadowstack_bp.route('/api/analytics')
def get_analytics():
    """Get analytics and outlier detection."""
    try:
        try:
            postgres = PostgresClient()
            domains = postgres.get_all_enriched_domains()
            postgres.close()
        except Exception as db_error:
            # Database connection failed, return empty analytics
            print(f"PostgreSQL connection failed in get_analytics: {db_error}")
            return Response(
                json.dumps({
                    "error": "Database connection failed",
                    "message": str(db_error),
                    "outliers": [],
                    "statistics": {
                        "total_domains": 0,
                        "domains_with_cms": 0,
                        "domains_with_cdn": 0,
                        "domains_with_payment": 0,
                        "unique_isps": 0,
                        "unique_hosts": 0
                    }
                }),
                status=200,
                mimetype='application/json'
            )
        
        if not domains:
            return jsonify({
                "outliers": [],
                "statistics": {}
            })
        
        total = len(domains)
        outliers = []
        
        # Check for outliers in various columns
        columns_to_check = {
            'cms': 'CMS',
            'cdn': 'CDN',
            'payment_processor': 'Payment Processor',
            'isp': 'ISP',
            'host_name': 'Hosting Provider',
            'registrar': 'Registrar'
        }
        
        for col, label in columns_to_check.items():
            values = {}
            for domain in domains:
                value = domain.get(col)
                if value:
                    values[value] = values.get(value, 0) + 1
            
            if values:
                # Find most common value
                most_common = max(values.items(), key=lambda x: x[1])
                percentage = (most_common[1] / total) * 100
                
                # If 50%+ use the same value, it's an outlier
                if percentage >= 50:
                    outliers.append({
                        'column': col,
                        'label': label,
                        'value': most_common[0],
                        'count': most_common[1],
                        'percentage': round(percentage, 1),
                        'severity': 'high' if percentage >= 75 else 'medium'
                    })
        
        # Calculate statistics
        # Handle None, empty string, and falsy values properly
        # Debug: Check a few sample domains to see what the data looks like
        if domains:
            sample = domains[0]
            print(f"🔍 Sample domain data: cms={repr(sample.get('cms'))}, cdn={repr(sample.get('cdn'))}, isp={repr(sample.get('isp'))}, host_name={repr(sample.get('host_name'))}")
        
        def has_value(field_value):
            """Check if a field has a valid (non-empty) value."""
            if field_value is None:
                return False
            if isinstance(field_value, str):
                cleaned = field_value.strip()
                return cleaned and cleaned.lower() != 'none' and cleaned != ''
            return bool(field_value)
        
        # Count domains with each enrichment field
        domains_with_cms = sum(1 for d in domains if has_value(d.get('cms')))
        domains_with_cdn = sum(1 for d in domains if has_value(d.get('cdn')))
        domains_with_payment = sum(1 for d in domains if has_value(d.get('payment_processor')))
        unique_isps = len(set(d.get('isp') for d in domains if has_value(d.get('isp'))))
        unique_hosts = len(set(d.get('host_name') for d in domains if has_value(d.get('host_name'))))
        
        stats = {
            'total_domains': total,
            'domains_with_cms': domains_with_cms,
            'domains_with_cdn': domains_with_cdn,
            'domains_with_payment': domains_with_payment,
            'unique_isps': unique_isps,
            'unique_hosts': unique_hosts
        }
        
        print(f"📊 Analytics stats calculated: {stats}")
        print(f"   Sample check - first 5 domains with cms: {[d.get('cms') for d in domains[:5]]}")
        print(f"   Sample check - first 5 domains with cdn: {[d.get('cdn') for d in domains[:5]]}")
        print(f"   Sample check - first 5 domains with isp: {[d.get('isp') for d in domains[:5]]}")
        print(f"   Sample check - first 5 domains with host_name: {[d.get('host_name') for d in domains[:5]]}")
        
        return jsonify({
            "outliers": outliers,
            "statistics": stats
        })
    except Exception as e:
        import traceback
        print(f"Error in get_analytics: {e}")
        traceback.print_exc()
        # Return JSON error response, not HTML
        return Response(
            json.dumps({
                "error": "Database connection failed",
                "message": str(e),
                "outliers": [],
                "statistics": {
                    "total_domains": 0,
                    "domains_with_cms": 0,
                    "domains_with_cdn": 0,
                    "domains_with_payment": 0,
                    "unique_isps": 0,
                    "unique_hosts": 0
                }
            }),
            status=200,
            mimetype='application/json'
        )


@shadowstack_bp.route('/api/analysis', methods=['GET'])
def get_ai_analysis():
    """Get AI-powered analysis of the domain data to identify bad actors."""
    postgres = PostgresClient()
    
    try:
        # ALWAYS check for cached analysis first
        cached = postgres.get_analysis('infrastructure')
        if cached:
            cached_data = cached['analysis_data']
            return jsonify({
                "analysis": cached_data.get('analysis'),
                "summary": cached_data.get('summary'),
                "bad_actors": cached_data.get('bad_actors'),
                "cached": True,
                "updated_at": str(cached['updated_at'])
            })
        
        # Only generate new analysis if explicitly requested AND no cache exists
        force_regenerate = request.args.get('force', 'false').lower() == 'true'
        if not force_regenerate:
            # No cache and not forcing - return message to user
            return jsonify({
                "error": "No cached analysis available. Use ?force=true to generate new analysis.",
                "cached": False,
                "needs_regeneration": True
            }), 200
        
        domains = postgres.get_all_enriched_domains()
        
        if not domains:
            return jsonify({
                "error": "No domains found"
            }), 404
        
        # Prepare data summary for OpenAI
        total = len(domains)
        
        # Normalize provider names to merge duplicates (e.g., "Cloudflare" and "Cloudflare, Inc.")
        def normalize_provider_name(name):
            """Normalize provider names to merge variants."""
            if not name:
                return name
            name_lower = name.lower().strip()
            # Cloudflare variants
            if 'cloudflare' in name_lower:
                return 'Cloudflare, Inc.'
            # Namecheap variants
            if 'namecheap' in name_lower:
                return 'Namecheap, Inc.'
            # Return original if no normalization needed
            return name
        
        # Count providers
        isps = Counter()
        hosts = Counter()
        registrars = Counter()
        cdns = Counter()
        cms_platforms = Counter()
        # Service providers: count unique domains per provider across all roles (CDN/Host/ISP)
        # Use a set to track which domains each provider serves
        service_provider_domains = {}
        
        for domain in domains:
            domain_id = domain.get('domain') or domain.get('id', '')
            
            if domain.get('isp'):
                normalized_isp = normalize_provider_name(domain['isp'])
                isps[normalized_isp] += 1
                # Track unique domains for this ISP
                if normalized_isp not in service_provider_domains:
                    service_provider_domains[normalized_isp] = set()
                service_provider_domains[normalized_isp].add(domain_id)
                
            if domain.get('host_name'):
                normalized_host = normalize_provider_name(domain['host_name'])
                hosts[normalized_host] += 1
                # Track unique domains for this host
                if normalized_host not in service_provider_domains:
                    service_provider_domains[normalized_host] = set()
                service_provider_domains[normalized_host].add(domain_id)
                
            if domain.get('registrar'):
                normalized_registrar = normalize_provider_name(domain['registrar'])
                registrars[normalized_registrar] += 1
                
            if domain.get('cdn'):
                normalized_cdn = normalize_provider_name(domain['cdn'])
                cdns[normalized_cdn] += 1
                # Track unique domains for this CDN
                if normalized_cdn not in service_provider_domains:
                    service_provider_domains[normalized_cdn] = set()
                service_provider_domains[normalized_cdn].add(domain_id)
            
            if domain.get('cms'):
                cms_platforms[domain['cms']] += 1
                
        
        # Convert service provider domain sets to counts
        service_providers = Counter({provider: len(domains_set) 
                                    for provider, domains_set in service_provider_domains.items()})
        
        # Create summary text - filter to top 10 and only include entries with 5+ domains
        def format_summary_items(items, limit=10):
            """Format items for summary, filtering to top N with 5+ domains."""
            return chr(10).join([f"- {name}: {count} domains ({round(count/total*100, 1)}%)" 
                                for name, count in items.most_common(limit) if count >= 5])
        
        summary = f"""
Total domains analyzed: {total}

Top ISPs:
{format_summary_items(isps, 10)}

Top Hosting Providers:
{format_summary_items(hosts, 10)}

Top Registrars:
{format_summary_items(registrars, 10)}

Top CDNs:
{format_summary_items(cdns, 10)}

Top Service Providers (CDN + Host + ISP combined):
{format_summary_items(service_providers, 10)}

"""
        
        # Prepare bad actors data - filter to top 10 and only include entries with 5+ domains
        def filter_by_count(items, limit=10):
            """Filter items to top N with 5+ domains."""
            return [{"name": name, "count": count, "percentage": round(count/total*100, 1)} 
                   for name, count in items.most_common(limit) if count >= 5]
        
        bad_actors_data = {
            "top_isps": filter_by_count(isps, 10),
            "top_hosts": filter_by_count(hosts, 10),
            "top_registrars": filter_by_count(registrars, 10),
            "top_cdns": filter_by_count(cdns, 10),
            "top_service_providers": filter_by_count(service_providers, 10),
            "top_cms": filter_by_count(cms_platforms, 10)
        }
        
        # Call OpenAI API
        analysis_text = None
        try:
            if openai_client:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert cybersecurity analyst specializing in identifying infrastructure patterns of harmful content. Analyze the provided data and identify the common 'bad actors' - hosting providers, registrars, CDNs, and ISPs that are enabling these domains. Provide actionable recommendations for contacting these providers to request domain removal."
                        },
                        {
                            "role": "user",
                            "content": f"""Analyze this infrastructure data for AI-generated non-consensual intimate imagery (NCII) domains:

{summary}

Please provide:
1. **Executive Summary**: A brief overview of the infrastructure patterns
2. **Key Findings**: Include ONLY an "Infrastructure Breakdown" section that consolidates providers across all their roles (host/CDN/ISP). Do NOT create separate "Service Provider Concentration" and "Infrastructure Breakdown" sections - they should be combined into one consolidated breakdown.
3. **Bad Actors Identified**: List the top hosting providers, registrars, CDNs, and ISPs hosting the most domains, with counts and percentages. Only show top 10 providers per category, and only if they have 5+ domains.
4. **Recommendations**: Specific actions to take, including:
   - Which providers to contact first (prioritized by impact)
   - Sample contact templates or approaches
   - Legal/compliance angles to mention
   - Expected response rates

IMPORTANT: In the "Key Findings" section, consolidate providers that appear in multiple roles (e.g., if Cloudflare is both CDN and Host, show it once with all roles combined). Do NOT create duplicate entries.

Format the response in clear sections with markdown formatting."""
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )
                analysis_text = response.choices[0].message.content
        except Exception as e:
            # Fallback to generated analysis if OpenAI fails
            print(f"OpenAI API Error (using fallback): {str(e)}")
        
        # Generate fallback analysis if OpenAI didn't work
        if not analysis_text:
            analysis_text = generate_fallback_analysis(bad_actors_data, total)
        
        # Clean up markdown formatting
        analysis_text = clean_analysis_formatting(analysis_text)
        
        # Save to cache
        analysis_data = {
            "analysis": analysis_text,
            "summary": summary,
            "bad_actors": bad_actors_data
        }
        postgres.save_analysis(analysis_data, 'infrastructure')
        
        return jsonify({
            "analysis": analysis_text,
            "summary": summary,
            "bad_actors": bad_actors_data,
            "cached": False
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        postgres.close()


def clean_analysis_formatting(text):
    """Clean up markdown formatting and improve spacing."""
    if not text:
        return text
    
    # Remove markdown bold markers
    text = text.replace('**', '')
    
    # Clean up excessive newlines (more than 2 consecutive)
    import re
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Clean up spacing around headers
    text = re.sub(r'\n##\s+', '\n\n## ', text)
    text = re.sub(r'\n###\s+', '\n\n### ', text)
    
    # Clean up spacing around lists
    text = re.sub(r'\n-\s+', '\n- ', text)
    text = re.sub(r'\n\*\s+', '\n- ', text)
    
    # Remove trailing whitespace
    lines = [line.rstrip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    return text.strip()


def generate_fallback_analysis(bad_actors, total_domains):
    """Generate analysis without OpenAI API."""
    
    top_host = bad_actors["top_hosts"][0] if bad_actors["top_hosts"] else None
    top_registrar = bad_actors["top_registrars"][0] if bad_actors["top_registrars"] else None
    top_isp = bad_actors["top_isps"][0] if bad_actors["top_isps"] else None
    top_cdn = bad_actors["top_cdns"][0] if bad_actors["top_cdns"] else None
    top_service_provider = bad_actors["top_service_providers"][0] if bad_actors.get("top_service_providers") else None
    
    # Consolidate providers that appear in multiple categories
    provider_roles = {}
    
    if top_host:
        name = top_host['name']
        if name not in provider_roles:
            provider_roles[name] = []
        provider_roles[name].append(f"hosts {top_host['percentage']}% of all domains ({top_host['count']} domains)")
    
    if top_registrar:
        name = top_registrar['name']
        if name not in provider_roles:
            provider_roles[name] = []
        provider_roles[name].append(f"is the registrar for {top_registrar['percentage']}% of domains ({top_registrar['count']} domains)")
    
    if top_cdn:
        name = top_cdn['name']
        if name not in provider_roles:
            provider_roles[name] = []
        provider_roles[name].append(f"serves as CDN for {top_cdn['percentage']}% of domains ({top_cdn['count']} domains)")
    
    if top_isp:
        name = top_isp['name']
        if name not in provider_roles:
            provider_roles[name] = []
        provider_roles[name].append(f"provides ISP services for {top_isp['percentage']}% of domains ({top_isp['count']} domains)")
    
    # Build infrastructure breakdown text
    infrastructure_lines = []
    for provider_name, roles in provider_roles.items():
        if len(roles) > 1:
            # Multiple roles - combine them
            combined_roles = ", ".join(roles)
            infrastructure_lines.append(f"- {provider_name}: {combined_roles}")
        else:
            # Single role
            infrastructure_lines.append(f"- {provider_name} {roles[0]}")
    
    if not infrastructure_lines:
        infrastructure_lines.append("- No infrastructure data available")
    
    infrastructure_breakdown = "\n".join(infrastructure_lines)
    
    analysis = f"""## Executive Summary

This analysis examines infrastructure patterns across {total_domains} domains associated with AI-generated non-consensual intimate imagery (NCII). The data reveals significant concentration of infrastructure services, with several providers enabling disproportionately large numbers of these domains through CDN, hosting, and network services.

**IMPORTANT**: Service providers (CDNs, hosts, ISPs) are being paid to enable these sites and should be held accountable, even if they're acting as intermediaries like Cloudflare.

## Key Findings

Infrastructure Breakdown:
{infrastructure_breakdown}


## Bad Actors Identified

**Key Principle**: All service providers in the chain (CDN, Host, ISP) are being paid and should be held accountable, including intermediaries like Cloudflare.

### Priority 1: High-Impact Service Providers (>40% market share)

**Service Providers (CDN + Host + ISP combined - these are being paid):**
"""
    
    # Add service providers section - top 10 only, and only if more than 4 domains
    service_provider_names = set()
    if bad_actors.get("top_service_providers"):
        filtered_providers = [p for p in bad_actors["top_service_providers"][:10] if int(p['count']) >= 5]
        for provider in filtered_providers:
            service_provider_names.add(provider['name'])
            if provider['percentage'] >= 40:
                analysis += f"- {provider['name']}: {provider['count']} domains ({provider['percentage']}%) - **CRITICAL PRIORITY**\n"
            elif provider['percentage'] >= 20:
                analysis += f"- {provider['name']}: {provider['count']} domains ({provider['percentage']}%) - **HIGH PRIORITY**\n"
            else:
                analysis += f"- {provider['name']}: {provider['count']} domains ({provider['percentage']}%)\n"
    
    analysis += "\nHosting Providers:\n"
    
    # Top 10 only, and only if more than 4 domains, excluding those already in Service Providers
    filtered_hosts = [h for h in bad_actors["top_hosts"][:10] 
                     if int(h['count']) >= 5 and h['name'] not in service_provider_names]
    if filtered_hosts:
        for host in filtered_hosts:
            if host['percentage'] >= 40:
                analysis += f"- {host['name']}: {host['count']} domains ({host['percentage']}%) - CRITICAL PRIORITY\n"
            elif host['percentage'] >= 20:
                analysis += f"- {host['name']}: {host['count']} domains ({host['percentage']}%) - HIGH PRIORITY\n"
            else:
                analysis += f"- {host['name']}: {host['count']} domains ({host['percentage']}%)\n"
    else:
        analysis += "- (All top hosting providers already listed in Service Providers section)\n"
    
    analysis += "\nRegistrars:\n"
    # Top 10 only, and only if more than 4 domains, excluding those already in Service Providers
    filtered_registrars = [r for r in bad_actors["top_registrars"][:10] 
                          if int(r['count']) >= 5 and r['name'] not in service_provider_names]
    if filtered_registrars:
        for reg in filtered_registrars:
            if reg['percentage'] >= 35:
                analysis += f"- {reg['name']}: {reg['count']} domains ({reg['percentage']}%) - CRITICAL PRIORITY\n"
            elif reg['percentage'] >= 10:
                analysis += f"- {reg['name']}: {reg['count']} domains ({reg['percentage']}%) - HIGH PRIORITY\n"
            else:
                analysis += f"- {reg['name']}: {reg['count']} domains ({reg['percentage']}%)\n"
    else:
        analysis += "- (All top registrars already listed in Service Providers section)\n"
    
    analysis += "\nCDNs:\n"
    # Top 10 only, and only if more than 4 domains, excluding those already in Service Providers
    filtered_cdns = [c for c in bad_actors["top_cdns"][:10] 
                     if int(c['count']) >= 5 and c['name'] not in service_provider_names]
    if filtered_cdns:
        for cdn in filtered_cdns:
            if cdn['percentage'] >= 40:
                analysis += f"- {cdn['name']}: {cdn['count']} domains ({cdn['percentage']}%) - CRITICAL PRIORITY\n"
            else:
                analysis += f"- {cdn['name']}: {cdn['count']} domains ({cdn['percentage']}%)\n"
    else:
        analysis += "- (All top CDNs already listed in Service Providers section)\n"
    
    # Build consolidated contact list for Immediate Action Items
    contact_providers = {}
    
    # Add service provider (highest priority)
    if top_service_provider:
        name = top_service_provider['name']
        contact_providers[name] = {
            'priority': 'CRITICAL',
            'roles': [f"provide services (CDN/Host/ISP) to {top_service_provider['percentage']}% of all domains"],
            'details': [
                "They are being paid to enable these sites",
                f"Abuse contact: abuse@{name.lower().replace(' ', '').replace(',', '').replace('.', '').replace('inc', '')}.com",
                "Reference: They are profiting from enabling NCII content distribution"
            ]
        }
    
    # Add registrar (if different from service provider)
    if top_registrar and top_registrar['name'] not in contact_providers:
        name = top_registrar['name']
        contact_providers[name] = {
            'priority': 'CRITICAL',
            'roles': [f"register {top_registrar['percentage']}% of all domains in this dataset"],
            'details': [
                "Focus on their abuse department",
                "Reference: Domain registration terms violations, hosting NCII content"
            ]
        }
    
    # Add host (if different from service provider)
    if top_host and top_host['name'] not in contact_providers:
        name = top_host['name']
        contact_providers[name] = {
            'priority': 'CRITICAL',
            'roles': [f"host {top_host['percentage']}% of all domains"],
            'details': [
                "Reference: Terms of Service violations, illegal content hosting"
            ]
        }
    elif top_host and top_host['name'] in contact_providers:
        # Add host role to existing provider
        contact_providers[top_host['name']]['roles'].append(f"host {top_host['percentage']}% of all domains")
    
    # Add CDN (if different from service provider)
    if top_cdn and top_cdn['name'] not in contact_providers:
        name = top_cdn['name']
        contact_providers[name] = {
            'priority': 'HIGH',
            'roles': [f"serve {top_cdn['percentage']}% of domains via CDN"],
            'details': [
                "Reference: They are being paid to deliver NCII content, even if acting as intermediary"
            ]
        }
    elif top_cdn and top_cdn['name'] in contact_providers:
        # Add CDN role to existing provider
        contact_providers[top_cdn['name']]['roles'].append(f"serve {top_cdn['percentage']}% of domains via CDN")
        # Update priority to CRITICAL if it was HIGH
        if contact_providers[top_cdn['name']]['priority'] == 'HIGH':
            contact_providers[top_cdn['name']]['priority'] = 'CRITICAL'
    
    # Build action items text
    action_items = []
    item_num = 1
    for provider_name, info in contact_providers.items():
        roles_text = ", ".join([f"They {role}" for role in info['roles']])
        details_text = "\n   ".join([f"- {detail}" for detail in info['details']])
        action_items.append(f"""{item_num}. Contact {provider_name} (Priority: {info['priority']})
   - {roles_text}
   {details_text}""")
        item_num += 1
    
    action_items_text = "\n\n".join(action_items) if action_items else "No providers identified for contact."
    
    analysis += f"""

## Recommendations

### Immediate Action Items

CRITICAL: Service providers (CDNs, hosts, ISPs) are being paid to enable these sites and must be held accountable, regardless of whether they are intermediaries.

{action_items_text}
"""
    
    return analysis


# Import ShadowStack real domain data
try:
    # Use importlib to avoid sys.path issues
    import importlib.util
    domains_data_path = blueprint_dir / 'src' / 'data' / 'domains.py'
    if domains_data_path.exists():
        spec = importlib.util.spec_from_file_location("domains_data", domains_data_path)
        domains_data_module = importlib.util.module_from_spec(spec)
        import sys
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        try:
            spec.loader.exec_module(domains_data_module)
            SHADOWSTACK_DOMAINS = domains_data_module.SHADOWSTACK_DOMAINS
        finally:
            sys.path[:] = original_path
    else:
        SHADOWSTACK_DOMAINS = []
except Exception as e:
    print(f"⚠️  Could not load ShadowStack domains data: {e}")
    SHADOWSTACK_DOMAINS = []

@shadowstack_bp.route('/api/import-data', methods=['POST'])
def import_shadowstack_data():
    """
    Import ShadowStack real data into the database.
    This endpoint can be called once to seed the database with the 110 domains.
    
    POST /api/import-data
    Body (optional): {
        "domains": ["domain1.com", "domain2.com", ...]  # If not provided, uses hardcoded list
        "enrich": false  # Whether to enrich domains immediately (default: false, takes time)
    }
    
    This ONLY affects ShadowStack's 'domains' table and does NOT touch
    PersonaForge (personaforge_domains) or BlackWire (blackwire_domains) tables.
    """
    try:
        data = request.get_json() or {}
        domains_to_import = data.get('domains', [])
        should_enrich = data.get('enrich', False)
        
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            return jsonify({
                "error": "Database connection failed",
                "message": "Could not connect to PostgreSQL"
            }), 500
        
        # If no domains provided, use the hardcoded ShadowStack domains list
        if not domains_to_import:
            domains_to_import = SHADOWSTACK_DOMAINS
        
        if not domains_to_import:
            return jsonify({
                "error": "No domains available",
                "message": "No domains provided and no default domains configured"
            }), 400
        
        # Get existing domains to avoid duplicates
        existing = postgres.get_all_enriched_domains()
        existing_domains = {d.get('domain') for d in existing if d.get('domain')}
        
        imported = 0
        skipped = 0
        errors = []
        
        print(f"📊 ShadowStack: Starting data import. {len(domains_to_import)} domains provided, {len(existing_domains)} already exist")
        
        for domain in domains_to_import:
            domain = domain.strip()
            if not domain:
                continue
            
            try:
                # Skip if already exists
                if domain in existing_domains:
                    skipped += 1
                    continue
                
                # Insert domain (ONLY into ShadowStack's 'domains' table)
                domain_id = postgres.insert_domain(
                    domain=domain,
                    source="SHADOWSTACK_IMPORT",
                    notes="Imported via /api/import-data endpoint"
                )
                
                # Optionally enrich (this takes time, so disabled by default)
                if should_enrich:
                    try:
                        # Use importlib to avoid sys.path issues
                        import importlib.util
                        enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
                        if enrichment_pipeline_path.exists():
                            spec = importlib.util.spec_from_file_location("enrichment_pipeline", enrichment_pipeline_path)
                            enrichment_pipeline_module = importlib.util.module_from_spec(spec)
                            import sys
                            original_path = sys.path[:]
                            if str(blueprint_dir) not in sys.path:
                                sys.path.insert(0, str(blueprint_dir))
                            try:
                                spec.loader.exec_module(enrichment_pipeline_module)
                                enrich_domain = enrichment_pipeline_module.enrich_domain
                                enrichment_data = enrich_domain(domain)
                                postgres.insert_enrichment(domain_id, enrichment_data)
                            finally:
                                sys.path[:] = original_path
                    except Exception as e:
                        print(f"  ⚠️  Could not enrich {domain}: {e}")
                
                imported += 1
                if imported % 10 == 0:
                    print(f"  ✅ Imported {imported} domains...")
                    
            except Exception as e:
                error_msg = f"Error importing {domain}: {str(e)}"
                errors.append(error_msg)
                print(f"  ❌ {error_msg}")
        
        postgres.conn.commit()
        postgres.close()
        
        print(f"✅ ShadowStack: Import complete! Imported: {imported}, Skipped: {skipped}, Errors: {len(errors)}")
        
        return jsonify({
            "success": True,
            "imported": imported,
            "skipped": skipped,
            "errors": len(errors),
            "error_details": errors[:10] if errors else [],  # First 10 errors
            "message": f"Imported {imported} new domains into ShadowStack database (skipped {skipped} duplicates)"
        }), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Error in import_shadowstack_data: {e}"
        print(error_msg)
        traceback.print_exc()
        return jsonify({
            "error": "Import failed",
            "message": str(e)
        }), 500


@shadowstack_bp.route('/api/seed-data', methods=['POST'])
def seed_shadowstack_data():
    """
    One-time seed endpoint for ShadowStack real data.
    Checks if database is empty and seeds with default domains if needed.
    
    This is safe to call multiple times - it checks for existing data first.
    ONLY affects ShadowStack's 'domains' table.
    """
    try:
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            return jsonify({
                "error": "Database connection failed"
            }), 500
        
        # Check if we already have data
        existing = postgres.get_all_enriched_domains()
        existing_count = len(existing)
        
        if existing_count > 0:
            return jsonify({
                "success": True,
                "message": f"Database already has {existing_count} domains. No seeding needed.",
                "existing_count": existing_count,
                "seeded": 0
            }), 200
        
        # Database is empty - seed with default domains
        # In production, you would load this from a file or external source
        # For now, return instructions
        postgres.close()
        
        return jsonify({
            "success": False,
            "message": "Database is empty. Please use /api/import-data endpoint with a list of domains.",
            "instructions": "POST to /api/import-data with body: {\"domains\": [\"domain1.com\", \"domain2.com\", ...]}",
            "note": "This endpoint only affects ShadowStack's 'domains' table and does not touch PersonaForge or BlackWire data."
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error in seed_shadowstack_data: {e}")
        traceback.print_exc()
        return jsonify({
            "error": "Seed check failed",
            "message": str(e)
        }), 500


def run_shadowstack_data_seed():
    """
    Auto-seed ShadowStack real data on startup if database is empty.
    This ONLY affects ShadowStack's 'domains' table and does NOT touch
    PersonaForge (personaforge_domains) or BlackWire (blackwire_domains) tables.
    """
    try:
        # Create a new connection for seeding (don't use global to avoid conflicts)
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            print("⚠️  ShadowStack: PostgreSQL not available - skipping data seed")
            return
        
        # Check if we already have data
        cursor = postgres.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM domains WHERE source != 'DUMMY_DATA_FOR_TESTING'")
        domain_count = cursor.fetchone()[0]
        cursor.close()
        
        if domain_count > 0:
            print(f"✅ ShadowStack: Database has {domain_count} domains - skipping data seed")
            postgres.close()
            return
        
        # Database is empty - seed with real ShadowStack domains
        print(f"📊 ShadowStack: Database is empty - seeding {len(SHADOWSTACK_DOMAINS)} real domains...")
        
        imported = 0
        skipped = 0
        
        for domain in SHADOWSTACK_DOMAINS:
            domain = domain.strip()
            if not domain:
                continue
            
            try:
                # Check if domain already exists (shouldn't, but check anyway)
                cursor = postgres.conn.cursor()
                cursor.execute("SELECT id FROM domains WHERE domain = %s", (domain,))
                existing = cursor.fetchone()
                cursor.close()
                
                if existing:
                    skipped += 1
                    continue
                
                # Insert domain (ONLY into ShadowStack's 'domains' table)
                domain_id = postgres.insert_domain(
                    domain=domain,
                    source="SHADOWSTACK_AUTO_SEED",
                    notes="Auto-seeded on startup - real ShadowStack data"
                )
                
                imported += 1
                if imported % 20 == 0:
                    print(f"  ✅ ShadowStack: Imported {imported} domains...")
                    
            except Exception as e:
                print(f"  ⚠️  ShadowStack: Error importing {domain}: {e}")
        
        postgres.conn.commit()
        postgres.close()
        print(f"✅ ShadowStack: Auto-seed complete! Imported: {imported}, Skipped: {skipped}")
        
    except Exception as e:
        print(f"⚠️  ShadowStack: Error during auto-seed: {e}", exc_info=True)


# Run auto-seed in background thread after a delay (similar to PersonaForge)
import threading
import time

def delayed_shadowstack_seed():
    """Run ShadowStack data seed after app starts."""
    time.sleep(5)  # Wait for app to fully start
    run_shadowstack_data_seed()

shadowstack_seed_thread = threading.Thread(target=delayed_shadowstack_seed, daemon=True)
shadowstack_seed_thread.start()


@shadowstack_bp.route('/api/enrich-all-domains', methods=['POST'])
def enrich_all_domains_new():
    """
    Enrich all unenriched domains in the database.
    This will fetch infrastructure data (IPs, hosting, CDNs, etc.) for all domains
    that don't have enrichment data yet.
    
    POST /api/enrich-all-domains
    Body (optional): {
        "limit": 10,  # Maximum number of domains to enrich (default: all)
        "force": false  # Re-enrich even if data exists (default: false)
    }
    
    This ONLY affects ShadowStack's 'domains' and 'domain_enrichment' tables.
    """
    try:
        data = request.get_json() or {}
        limit = data.get('limit', None)  # None means no limit
        force = data.get('force', False)
        
        postgres = PostgresClient()
        if not postgres or not postgres.conn:
            return jsonify({
                "error": "Database connection failed",
                "message": "Could not connect to PostgreSQL"
            }), 500
        
        # Get domains that need enrichment
        cursor = postgres.conn.cursor()
        if force:
            # Get all domains
            cursor.execute("""
                SELECT id, domain FROM domains 
                WHERE source != 'DUMMY_DATA_FOR_TESTING'
                ORDER BY id
            """)
        else:
            # Get only domains without enrichment data
            cursor.execute("""
                SELECT d.id, d.domain 
                FROM domains d
                LEFT JOIN domain_enrichment de ON d.id = de.domain_id
                WHERE de.domain_id IS NULL 
                AND d.source != 'DUMMY_DATA_FOR_TESTING'
                ORDER BY d.id
            """)
        
        domains_to_enrich = cursor.fetchall()
        cursor.close()
        
        if limit:
            domains_to_enrich = domains_to_enrich[:limit]
        
        if not domains_to_enrich:
            postgres.close()
            return jsonify({
                "success": True,
                "message": "No domains need enrichment",
                "enriched": 0,
                "skipped": 0,
                "errors": 0
            }), 200
        
        print(f"📊 ShadowStack: Starting enrichment for {len(domains_to_enrich)} domains...")
        
        # Load enrichment pipeline using importlib
        import importlib.util
        enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
        if not enrichment_pipeline_path.exists():
            postgres.close()
            return jsonify({
                "error": "Enrichment pipeline not found",
                "message": f"Could not find enrichment_pipeline.py at {enrichment_pipeline_path}"
            }), 500
        
        spec = importlib.util.spec_from_file_location("enrichment_pipeline", enrichment_pipeline_path)
        enrichment_pipeline_module = importlib.util.module_from_spec(spec)
        import sys
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        
        try:
            spec.loader.exec_module(enrichment_pipeline_module)
            enrich_domain = enrichment_pipeline_module.enrich_domain
        finally:
            sys.path[:] = original_path
        
        enriched = 0
        skipped = 0
        errors = []
        
        for domain_id, domain_name in domains_to_enrich:
            try:
                print(f"  🔍 Enriching {domain_name}...")
                enrichment_data = enrich_domain(domain_name)
                
                # Store enrichment data
                postgres.insert_enrichment(domain_id, enrichment_data)
                
                enriched += 1
                if enriched % 5 == 0:
                    print(f"  ✅ Enriched {enriched} domains...")
                    
            except Exception as e:
                error_msg = f"Error enriching {domain_name}: {str(e)}"
                errors.append(error_msg)
                print(f"  ❌ {error_msg}")
        
        postgres.conn.commit()
        postgres.close()
        
        print(f"✅ ShadowStack: Enrichment complete! Enriched: {enriched}, Errors: {len(errors)}")
        
        return jsonify({
            "success": True,
            "enriched": enriched,
            "skipped": skipped,
            "errors": len(errors),
            "error_details": errors[:10] if errors else [],  # First 10 errors
            "message": f"Enriched {enriched} domains ({(enriched/len(domains_to_enrich)*100):.1f}% success rate)"
        }), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Error in enrich_all_domains: {e}"
        print(error_msg)
        traceback.print_exc()
        return jsonify({
            "error": "Enrichment failed",
            "message": str(e)
        }), 500


