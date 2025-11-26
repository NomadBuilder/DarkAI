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
        # Try Neo4j first, fallback to PostgreSQL
        if NEO4J_AVAILABLE:
            try:
                neo4j = Neo4jClient()
                graph_data = neo4j.get_all_nodes_and_relationships()
                neo4j.close()
            except Exception as e:
                print(f"Neo4j unavailable, using PostgreSQL: {e}")
                graph_data = get_graph_from_postgres()
        else:
            graph_data = get_graph_from_postgres()
        
        if not graph_data:
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
        domains = postgres.get_all_enriched_domains()
        postgres.close()
        
        return jsonify({
            "domains": domains,
            "count": len(domains)
        })
    except Exception as e:
        import traceback
        print(f"Error in get_domains: {e}")
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
        stats = {
            'total_domains': total,
            'domains_with_cms': sum(1 for d in domains if d.get('cms')),
            'domains_with_cdn': sum(1 for d in domains if d.get('cdn')),
            'domains_with_payment': sum(1 for d in domains if d.get('payment_processor')),
            'unique_isps': len(set(d.get('isp') for d in domains if d.get('isp'))),
            'unique_hosts': len(set(d.get('host_name') for d in domains if d.get('host_name')))
        }
        
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


