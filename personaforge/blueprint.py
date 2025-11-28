"""
PersonaForge Flask Blueprint for consolidated DarkAI platform.

This blueprint handles all PersonaForge routes under /personaforge prefix.
"""

import os
import sys
from pathlib import Path

# Add src to path (relative to blueprint location)
# MUST happen before any other imports that use src
blueprint_dir = Path(__file__).parent.absolute()
if str(blueprint_dir) not in sys.path:
    sys.path.insert(0, str(blueprint_dir))

from flask import Blueprint, render_template, jsonify, request, Response, url_for
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables - try consolidated root first, then blueprint directory
blueprint_dir = Path(__file__).parent.absolute()
consolidated_root = blueprint_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')  # Try consolidated app root first
load_dotenv(dotenv_path=blueprint_dir / '.env', override=False)  # Then blueprint directory (don't override)
import csv
import json
import io
from collections import Counter

# Import Config first (needed by logger)
from src.utils.config import Config

try:
    from src.database.neo4j_client import Neo4jClient
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    Neo4jClient = None

from src.database.postgres_client import PostgresClient
from src.enrichment.enrichment_pipeline import enrich_domain
from src.utils.logger import setup_logger, logger
from src.utils.validation import validate_domain
from datetime import datetime

# Create blueprint
# Use absolute path for template_folder to ensure Flask can find templates
blueprint_dir = Path(__file__).parent.absolute()
personaforge_bp = Blueprint(
    'personaforge',
    __name__,
    template_folder=str(blueprint_dir / 'templates'),
    static_folder=str(blueprint_dir / 'static'),
    static_url_path='/static'  # Flask will automatically prefix with /personaforge
)

# Setup logger
app_logger = setup_logger("personaforge.app", Config.LOG_LEVEL)

# Initialize database clients
neo4j_client = None
postgres_client = None

if NEO4J_AVAILABLE:
    try:
        neo4j_client = Neo4jClient()
        if neo4j_client and neo4j_client.driver:
            app_logger.info("✅ PersonaForge Neo4j client initialized and connected")
        else:
            app_logger.warning("⚠️  PersonaForge Neo4j client initialized but not connected")
    except Exception as e:
        app_logger.warning(f"⚠️  PersonaForge Neo4j not available: {e}")

try:
    postgres_client = PostgresClient()
    if postgres_client and postgres_client.conn:
        app_logger.info("✅ PersonaForge PostgreSQL client initialized")
    else:
        app_logger.warning("⚠️  PersonaForge PostgreSQL not available")
except Exception as e:
    app_logger.warning(f"⚠️  PersonaForge PostgreSQL not available: {e}")


# Register error handlers
try:
    from src.utils.error_handler import register_error_handlers
    register_error_handlers(personaforge_bp)
except ImportError:
    app_logger.warning("Error handlers not available")


@personaforge_bp.route('/api/homepage-stats', methods=['GET'])
def get_homepage_stats():
    """Get statistics and data for homepage display."""
    stats = {
        "total_domains": 0,
        "total_vendors": 0,
        "vendor_types": {},
        "top_vendors": [],
        "recent_discoveries": [],
        "infrastructure_clusters": 0,
        "high_risk_domains": 0,
        "database_available": False
    }
    
    stats["database_available"] = postgres_client is not None and postgres_client.conn is not None
    
    if postgres_client and postgres_client.conn:
        try:
            domains = postgres_client.get_all_enriched_domains()
            vendors = postgres_client.get_vendors(min_domains=1)
            
            stats["total_domains"] = len(domains)
            stats["total_vendors"] = len(vendors)
            
            # Vendor type distribution
            vendor_types = Counter()
            high_risk = 0
            for domain in domains:
                if domain.get('vendor_type'):
                    vendor_types[domain['vendor_type']] += 1
                
                # Get risk score (check both direct field and enrichment_data)
                risk = domain.get('vendor_risk_score', 0)
                if risk == 0:
                    # Try to get from enrichment_data
                    enrichment = domain.get('enrichment_data', {})
                    if isinstance(enrichment, str):
                        try:
                            import json
                            enrichment = json.loads(enrichment)
                        except:
                            enrichment = {}
                    risk = enrichment.get('vendor_risk_score', 0)
                
                if risk >= 70:
                    high_risk += 1
            
            stats["vendor_types"] = dict(vendor_types)
            stats["high_risk_domains"] = high_risk
            
            # Top vendors by domain count
            # If vendors table is empty, create vendor entries from domains grouped by vendor_type
            if len(vendors) == 0 and len(domains) > 0:
                # Group domains by vendor_type and create vendor entries
                from collections import defaultdict
                vendor_groups = defaultdict(list)
                for d in domains:
                    vtype = d.get('vendor_type') or d.get('enrichment_data', {}).get('vendor_type')
                    if vtype:
                        vendor_groups[vtype].append(d)
                
                # Create top vendors from grouped domains
                top_vendors = []
                for vtype, domain_list in sorted(vendor_groups.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
                    # Calculate average risk score
                    risks = []
                    for d in domain_list:
                        risk = d.get('vendor_risk_score', 0)
                        if risk == 0:
                            enrichment = d.get('enrichment_data', {})
                            if isinstance(enrichment, str):
                                try:
                                    import json
                                    enrichment = json.loads(enrichment)
                                except:
                                    enrichment = {}
                            risk = enrichment.get('vendor_risk_score', 0)
                        if risk > 0:
                            risks.append(risk)
                    
                    avg_risk = sum(risks) / len(risks) if risks else 0
                    vendor_name = vtype.replace('_', ' ').title() + ' Vendors'
                    
                    top_vendors.append({
                        "vendor_name": vendor_name,
                        "domain_count": len(domain_list),
                        "vendor_type": vtype,
                        "avg_risk_score": int(avg_risk)
                    })
                stats["top_vendors"] = top_vendors
            else:
                stats["top_vendors"] = [
                    {
                        "vendor_name": v.get('vendor_name', 'Unknown'),
                        "domain_count": v.get('domain_count', 0),
                        "vendor_type": v.get('vendor_type', 'unknown'),
                        "avg_risk_score": v.get('avg_risk_score', 0)
                    }
                    for v in sorted(vendors, key=lambda x: x.get('domain_count', 0), reverse=True)[:10]
                ]
            
            # Recent discoveries (last 10 domains, sorted by creation/update time)
            def get_sort_key(domain):
                enriched_at = domain.get('enriched_at')
                updated_at = domain.get('updated_at')
                created_at = domain.get('created_at')
                # Use the most recent timestamp available, default to epoch if none
                timestamp = enriched_at or updated_at or created_at or '1970-01-01T00:00:00'
                # Ensure it's a string for comparison
                return str(timestamp) if timestamp else '1970-01-01T00:00:00'
            
            sorted_domains = sorted(domains, key=get_sort_key, reverse=True)
            
            recent_discoveries = []
            for d in sorted_domains[:10]:
                # Get risk score from enrichment_data if not in direct field
                risk = d.get('vendor_risk_score', 0)
                vendor_type = d.get('vendor_type')
                if risk == 0 or not vendor_type:
                    enrichment = d.get('enrichment_data', {})
                    if isinstance(enrichment, str):
                        try:
                            import json
                            enrichment = json.loads(enrichment)
                        except:
                            enrichment = {}
                    if risk == 0:
                        risk = enrichment.get('vendor_risk_score', 0)
                    if not vendor_type:
                        vendor_type = enrichment.get('vendor_type')
                
                recent_discoveries.append({
                    "domain": d.get('domain'),
                    "vendor_type": vendor_type,
                    "risk_score": risk,
                    "source": d.get('source', 'Unknown')
                })
            stats["recent_discoveries"] = recent_discoveries
            
            # Infrastructure clusters
            try:
                # Import clustering module using importlib to avoid sys.path issues
                import importlib.util
                clustering_path = blueprint_dir / 'src' / 'clustering' / 'vendor_clustering.py'
                if clustering_path.exists():
                    spec = importlib.util.spec_from_file_location("vendor_clustering", clustering_path)
                    vendor_clustering = importlib.util.module_from_spec(spec)
                    # Add blueprint_dir to sys.path temporarily for any internal imports
                    import sys
                    original_path = sys.path[:]
                    if str(blueprint_dir) not in sys.path:
                        sys.path.insert(0, str(blueprint_dir))
                    try:
                        spec.loader.exec_module(vendor_clustering)
                        clusters = vendor_clustering.detect_vendor_clusters(postgres_client)
                        stats["infrastructure_clusters"] = len(clusters)
                        app_logger.debug(f"Found {len(clusters)} infrastructure clusters")
                    finally:
                        sys.path[:] = original_path
                else:
                    app_logger.warning(f"Clustering module not found at {clustering_path}")
                    stats["infrastructure_clusters"] = 0
            except Exception as e:
                app_logger.error(f"Error detecting clusters: {e}")
                import traceback
                traceback.print_exc()
                stats["infrastructure_clusters"] = 0
                
        except Exception as e:
            app_logger.error(f"Error getting homepage stats: {e}")
    
    return jsonify(stats), 200


@personaforge_bp.route('/')
def index():
    """Render the landing page."""
    # Use absolute path for template lookup
    template_path = blueprint_dir / 'templates' / 'index.html'
    root_index_path = blueprint_dir / 'index.html'
    
    # Try templates first, fallback to root index.html
    if template_path.exists():
        return render_template('index.html')
    elif root_index_path.exists():
        with open(root_index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return Response(content, mimetype='text/html')
    else:
        return jsonify({"message": "PersonaForge API", "endpoints": ["/api/enrich", "/api/check", "/api/domains", "/api/vendors", "/api/clusters", "/api/graph"]})


@personaforge_bp.route('/dashboard')
def dashboard():
    """Render the graph visualization dashboard."""
    # Explicitly use this blueprint's template by checking it exists first
    template_path = blueprint_dir / 'templates' / 'dashboard.html'
    if template_path.exists():
        # Use render_template - Flask should use this blueprint's template_folder
        # But to be safe, we can also try using the blueprint's template directly
        return render_template('dashboard.html')
    else:
        return jsonify({"message": "Dashboard coming soon"})


@personaforge_bp.route('/vendors')
def vendors():
    """Render the vendors listing page."""
    return render_template('vendors.html') if os.path.exists(os.path.join(blueprint_dir, 'templates/vendors.html')) else jsonify({"message": "Vendors page coming soon"})


@personaforge_bp.route('/methodology')
def methodology():
    """Render the sources and methodology page."""
    return render_template('methodology.html') if os.path.exists(os.path.join(blueprint_dir, 'templates/methodology.html')) else jsonify({"message": "Methodology page coming soon"})


@personaforge_bp.route('/analytics')
def analytics():
    """Render the analytics page."""
    return render_template('analytics.html') if os.path.exists(os.path.join(blueprint_dir, 'templates/analytics.html')) else jsonify({"message": "Analytics coming soon"})


# API Routes - copied from original app.py

@personaforge_bp.route('/api/vendors', methods=['GET'])
def get_vendors():
    """Get all vendors with their domain counts."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "clusters": [],
            "total_domains": 0,
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        min_size = int(request.args.get('min_size', 2))
        min_domains = int(request.args.get('min_domains', 1))
        
        # Get vendors
        vendors = postgres_client.get_vendors(min_domains=min_domains)
        
        # Get clusters
        # Use importlib to avoid sys.path issues
        import importlib.util
        clustering_path = blueprint_dir / 'src' / 'clustering' / 'vendor_clustering.py'
        if clustering_path.exists():
            spec = importlib.util.spec_from_file_location("vendor_clustering", clustering_path)
            vendor_clustering = importlib.util.module_from_spec(spec)
            # Add blueprint_dir to sys.path temporarily for any internal imports
            import sys
            original_path = sys.path[:]
            if str(blueprint_dir) not in sys.path:
                sys.path.insert(0, str(blueprint_dir))
            try:
                spec.loader.exec_module(vendor_clustering)
                clusters = vendor_clustering.detect_vendor_clusters(postgres_client)
            finally:
                sys.path[:] = original_path
        else:
            app_logger.error(f"Clustering module not found at {clustering_path}")
            clusters = []
        
        # Filter clusters by min_size
        filtered_clusters = [c for c in clusters if len(c.get('domains', [])) >= min_size]
        
        # Get total domains
        domains = postgres_client.get_all_enriched_domains()
        
        return jsonify({
            "vendors": vendors,
            "clusters": filtered_clusters,
            "total_domains": len(domains),
            "count": len(vendors)
        }), 200
    except Exception as e:
        app_logger.error(f"Error getting vendors: {e}")
        return jsonify({"error": str(e), "vendors": [], "clusters": []}), 500


@personaforge_bp.route('/api/clusters', methods=['GET'])
def get_clusters():
    """Get detected vendor clusters."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "clusters": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        # Import clustering module using importlib to avoid sys.path issues
        import importlib.util
        import sys
        clustering_path = blueprint_dir / 'src' / 'clustering' / 'vendor_clustering.py'
        if not clustering_path.exists():
            app_logger.warning("Clustering module not found")
            return jsonify({
                "clusters": [],
                "count": 0
            }), 200
        
        spec = importlib.util.spec_from_file_location("vendor_clustering", clustering_path)
        vendor_clustering = importlib.util.module_from_spec(spec)
        # Add blueprint_dir to sys.path temporarily for any internal imports
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        try:
            spec.loader.exec_module(vendor_clustering)
            clusters = vendor_clustering.detect_vendor_clusters(postgres_client)
            return jsonify({
                "clusters": clusters,
                "count": len(clusters)
            }), 200
        finally:
            sys.path[:] = original_path
    except Exception as e:
        app_logger.error(f"Error getting clusters: {e}", exc_info=True)
        return jsonify({
            "clusters": [],
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/graph', methods=['GET'])
def get_graph():
    """Get graph data from Neo4j or generate from PostgreSQL for visualization."""
    # Try Neo4j first if available
    if NEO4J_AVAILABLE and neo4j_client and neo4j_client.driver:
        try:
            graph_data = neo4j_client.get_all_nodes_and_relationships()
            if graph_data.get('nodes') and len(graph_data.get('nodes', [])) > 0:
                return jsonify(graph_data), 200
        except Exception as e:
            app_logger.warning(f"Neo4j graph data failed, falling back to PostgreSQL: {e}")
    
    # Fallback: Generate graph from PostgreSQL
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "nodes": [],
            "edges": [],
            "message": "No database available"
        }), 200
    
    try:
        domains = postgres_client.get_all_enriched_domains()
        
        if len(domains) == 0:
            return jsonify({
                "nodes": [],
                "edges": [],
                "message": "No domains available"
            }), 200
        
        # Use clustering to organize the graph better
        # Import clustering module using importlib to avoid sys.path issues
        import importlib.util
        clustering_path = blueprint_dir / 'src' / 'clustering' / 'vendor_clustering.py'
        if clustering_path.exists():
            spec = importlib.util.spec_from_file_location("vendor_clustering", clustering_path)
            vendor_clustering = importlib.util.module_from_spec(spec)
            # Add blueprint_dir to sys.path temporarily for any internal imports
            import sys
            original_path = sys.path[:]
            if str(blueprint_dir) not in sys.path:
                sys.path.insert(0, str(blueprint_dir))
            try:
                spec.loader.exec_module(vendor_clustering)
                clusters = vendor_clustering.detect_vendor_clusters(postgres_client)
            finally:
                sys.path[:] = original_path
        else:
            app_logger.warning(f"Clustering module not found at {clustering_path}")
            clusters = []
        
        # Build graph from PostgreSQL data with clustering
        nodes = []
        edges = []
        node_map = {}  # Track nodes by ID to avoid duplicates
        
        # Limit to top domains by risk score or most recent
        sorted_domains = sorted(domains, key=lambda d: (
            d.get('vendor_risk_score', 0) or 
            d.get('enrichment_data', {}).get('vendor_risk_score', 0) if isinstance(d.get('enrichment_data'), dict) else 0
        ), reverse=True)
        
        # Take top 40 domains for cleaner visualization
        top_domains = sorted_domains[:40]
        top_domain_names = {d.get('domain') for d in top_domains if d.get('domain')}
        
        # Only create cluster nodes for clusters that have at least one domain in top_domains
        cluster_node_map = {}
        clusters_with_top_domains = []
        
        for cluster in clusters:
            # Check if any domain in this cluster is in the top domains
            cluster_domains = set(cluster.get('domains', []))
            if cluster_domains & top_domain_names:  # Intersection - at least one domain matches
                clusters_with_top_domains.append(cluster)
        
        # Create cluster nodes only for clusters with domains in the graph
        for cluster in clusters_with_top_domains[:10]:  # Top 10 clusters that have domains in graph
            cluster_id = f"cluster_{hash(cluster['signature']) % 10000}"
            cluster_node_map[cluster['signature']] = cluster_id
            
            # Count how many domains from this cluster are actually in the graph
            cluster_domains = set(cluster.get('domains', []))
            domains_in_graph = list(cluster_domains & top_domain_names)  # Keep as list for display
            domains_in_graph_count = len(domains_in_graph)
            
            nodes.append({
                "id": cluster_id,
                "label": "Cluster",
                "properties": {
                    "name": f"Cluster ({domains_in_graph_count} domains)",
                    "domain_count": domains_in_graph_count,
                    "signature": cluster['signature'],
                    "domains": sorted(domains_in_graph)  # Store actual domain names
                }
            })
            node_map[cluster_id] = True
        
        # Add domain nodes and create relationships
        for domain in top_domains:
            domain_name = domain.get('domain')
            if not domain_name:
                continue
            
            domain_id = f"domain_{domain.get('id', domain_name)}"
            
            # Get enrichment data (needed for both node creation and cluster matching)
            enrichment = domain.get('enrichment_data', {})
            if isinstance(enrichment, str):
                try:
                    import json
                    enrichment = json.loads(enrichment)
                except:
                    enrichment = {}
            
            # Add domain node
            if domain_id not in node_map:
                vendor_type = domain.get('vendor_type') or enrichment.get('vendor_type')
                risk_score = domain.get('vendor_risk_score', 0) or enrichment.get('vendor_risk_score', 0)
                
                nodes.append({
                    "id": domain_id,
                    "label": "Domain",
                    "properties": {
                        "domain": domain_name,
                        "vendor_type": vendor_type,
                        "risk_score": risk_score
                    }
                })
                node_map[domain_id] = True
            
            # Add vendor node and edge (group by vendor_type)
            vendor_type = domain.get('vendor_type') or enrichment.get('vendor_type')
            if vendor_type:
                vendor_id = f"vendor_{vendor_type}"
                if vendor_id not in node_map:
                    nodes.append({
                        "id": vendor_id,
                        "label": "Vendor",
                        "properties": {
                            "name": vendor_type.replace('_', ' ').title(),
                            "vendor_type": vendor_type
                        }
                    })
                    node_map[vendor_id] = True
                
                edges.append({
                    "source": domain_id,
                    "target": vendor_id,
                    "type": "OWNED_BY"
                })
            
            # Link domain to cluster if it belongs to one
            # Build domain signature the same way clusters are built
            domain_signature_parts = []
            domain_host = enrichment.get('host_name') or domain.get('host_name')
            domain_cdn = enrichment.get('cdn') or domain.get('cdn')
            domain_registrar = enrichment.get('registrar') or domain.get('registrar')
            domain_payment = enrichment.get('payment_processor') or domain.get('payment_processor')
            
            if domain_host:
                domain_signature_parts.append(f"host:{domain_host}")
            if domain_cdn:
                domain_signature_parts.append(f"cdn:{domain_cdn}")
            if domain_registrar:
                domain_signature_parts.append(f"registrar:{domain_registrar}")
            if domain_payment:
                domain_signature_parts.append(f"payment:{domain_payment}")
            
            # Match domain signature to cluster signature (exact match)
            if domain_signature_parts:
                domain_signature = "|".join(sorted(domain_signature_parts))
                if domain_signature in cluster_node_map:
                    cluster_id = cluster_node_map[domain_signature]
                    edges.append({
                        "source": domain_id,
                        "target": cluster_id,
                        "type": "IN_CLUSTER"
                    })
        
        # Now create infrastructure nodes with complete domain lists
        # First pass: collect all infrastructure usage
        infra_tracking = {'hosts': {}, 'cdns': {}, 'payments': {}}
        for domain in top_domains:
            domain_name = domain.get('domain')
            if not domain_name:
                continue
            
            enrichment = domain.get('enrichment_data', {})
            if isinstance(enrichment, str):
                try:
                    import json
                    enrichment = json.loads(enrichment)
                except:
                    enrichment = {}
            
            host_name = enrichment.get('host_name') or domain.get('host_name')
            cdn = enrichment.get('cdn') or domain.get('cdn')
            payment = enrichment.get('payment_processor') or domain.get('payment_processor')
            
            if host_name:
                host_id = f"host_{host_name}"
                if host_id not in infra_tracking['hosts']:
                    infra_tracking['hosts'][host_id] = {'name': host_name, 'domains': []}
                if domain_name not in infra_tracking['hosts'][host_id]['domains']:
                    infra_tracking['hosts'][host_id]['domains'].append(domain_name)
            
            if cdn:
                cdn_id = f"cdn_{cdn}"
                if cdn_id not in infra_tracking['cdns']:
                    infra_tracking['cdns'][cdn_id] = {'name': cdn, 'domains': []}
                if domain_name not in infra_tracking['cdns'][cdn_id]['domains']:
                    infra_tracking['cdns'][cdn_id]['domains'].append(domain_name)
            
            if payment:
                payment_id = f"payment_{payment}"
                if payment_id not in infra_tracking['payments']:
                    infra_tracking['payments'][payment_id] = {'name': payment, 'domains': []}
                if domain_name not in infra_tracking['payments'][payment_id]['domains']:
                    infra_tracking['payments'][payment_id]['domains'].append(domain_name)
        
        # Second pass: create infrastructure nodes and edges for those with 2+ domains
        for host_id, host_data in infra_tracking['hosts'].items():
            if len(host_data['domains']) >= 2:
                if host_id not in node_map:
                    nodes.append({
                        "id": host_id,
                        "label": "Host",
                        "properties": {
                            "name": host_data['name'],
                            "domain_count": len(host_data['domains']),
                            "domains": host_data['domains']
                        }
                    })
                    node_map[host_id] = True
                
                # Create edges for all domains using this host
                for domain_name in host_data['domains']:
                    domain_node = next((n for n in nodes if n.get("properties", {}).get("domain") == domain_name), None)
                    if domain_node:
                        edges.append({
                            "source": domain_node["id"],
                            "target": host_id,
                            "type": "HOSTED_ON"
                        })
        
        for cdn_id, cdn_data in infra_tracking['cdns'].items():
            if len(cdn_data['domains']) >= 2:
                if cdn_id not in node_map:
                    nodes.append({
                        "id": cdn_id,
                        "label": "CDN",
                        "properties": {
                            "name": cdn_data['name'],
                            "domain_count": len(cdn_data['domains']),
                            "domains": cdn_data['domains']
                        }
                    })
                    node_map[cdn_id] = True
                
                for domain_name in cdn_data['domains']:
                    domain_node = next((n for n in nodes if n.get("properties", {}).get("domain") == domain_name), None)
                    if domain_node:
                        edges.append({
                            "source": domain_node["id"],
                            "target": cdn_id,
                            "type": "USES_CDN"
                        })
        
        for payment_id, payment_data in infra_tracking['payments'].items():
            if len(payment_data['domains']) >= 2:
                if payment_id not in node_map:
                    nodes.append({
                        "id": payment_id,
                        "label": "PaymentProcessor",
                        "properties": {
                            "name": payment_data['name'],
                            "domain_count": len(payment_data['domains']),
                            "domains": payment_data['domains']
                        }
                    })
                    node_map[payment_id] = True
                
                for domain_name in payment_data['domains']:
                    domain_node = next((n for n in nodes if n.get("properties", {}).get("domain") == domain_name), None)
                    if domain_node:
                        edges.append({
                            "source": domain_node["id"],
                            "target": payment_id,
                            "type": "USES_PAYMENT"
                        })
        
        return jsonify({
            "nodes": nodes,
            "edges": edges
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error generating graph from PostgreSQL: {e}")
        return jsonify({
            "error": str(e),
            "nodes": [],
            "edges": []
        }), 500


@personaforge_bp.route('/api/discover', methods=['POST'])
def discover_vendors():
    """
    Discover vendors from public sources and automatically enrich them.
    """
    try:
        # Use importlib to avoid sys.path issues
        import importlib.util
        import sys
        
        # Import vendor_discovery
        vendor_discovery_path = blueprint_dir / 'src' / 'enrichment' / 'vendor_discovery.py'
        if not vendor_discovery_path.exists():
            return jsonify({"error": "vendor_discovery module not found"}), 500
        
        spec = importlib.util.spec_from_file_location("vendor_discovery", vendor_discovery_path)
        vendor_discovery_module = importlib.util.module_from_spec(spec)
        original_path = sys.path[:]
        if str(blueprint_dir) not in sys.path:
            sys.path.insert(0, str(blueprint_dir))
        try:
            # Pre-import src modules to make them available
            import importlib
            try:
                importlib.import_module('src.utils.config')
                importlib.import_module('src.utils.logger')
                importlib.import_module('src.utils.rate_limiter')
            except ImportError:
                pass  # If they're already imported or don't exist, continue
            
            # Set __package__ and __name__ to help with relative imports
            vendor_discovery_module.__package__ = 'src.enrichment'
            vendor_discovery_module.__name__ = 'src.enrichment.vendor_discovery'
            spec.loader.exec_module(vendor_discovery_module)
            discover_all_sources = vendor_discovery_module.discover_all_sources
            ask_ai_for_data_sources = vendor_discovery_module.ask_ai_for_data_sources
        finally:
            sys.path[:] = original_path
        
        data = request.get_json() or {}
        limit_per_source = data.get('limit_per_source', 20)
        auto_enrich = data.get('auto_enrich', True)
        
        app_logger.info(f"🔍 Starting vendor discovery (limit: {limit_per_source})...")
        
        # First, ask AI for data sources and strategies
        ai_sources = ask_ai_for_data_sources()
        app_logger.info(f"🤖 AI suggested {len(ai_sources.get('sources', []))} data sources")
        
        # Discover from all sources (including AI)
        discovery_results = discover_all_sources(limit_per_source=limit_per_source)
        
        # Combine all discovered domains
        all_domains = set()
        for domains in discovery_results.values():
            all_domains.update(domains)
        
        enriched_domains = []
        errors = []
        
        # Optionally auto-enrich discovered domains
        if auto_enrich and all_domains:
            app_logger.info(f"📊 Auto-enriching {len(all_domains)} discovered domains...")
            
            for domain in list(all_domains)[:50]:  # Limit to 50 to avoid timeout
                try:
                    # Enrich the domain
                    enrichment_data = enrich_domain(domain)
                    
                    # Store in database
                    if postgres_client and postgres_client.conn:
                        try:
                            domain_id = postgres_client.insert_domain(
                                domain,
                                'Auto-discovery',
                                f"Discovered from public sources",
                                enrichment_data.get('vendor_type')
                            )
                            postgres_client.insert_enrichment(domain_id, enrichment_data)
                            enriched_domains.append({
                                'domain': domain,
                                'vendor_type': enrichment_data.get('vendor_type'),
                                'risk_score': enrichment_data.get('vendor_risk_score', 0)
                            })
                        except Exception as e:
                            app_logger.error(f"Error storing discovered domain {domain}: {e}")
                            errors.append(f"{domain}: Storage failed")
                except Exception as e:
                    app_logger.error(f"Error enriching discovered domain {domain}: {e}")
                    errors.append(f"{domain}: Enrichment failed")
        
        return jsonify({
            "message": f"Discovered {len(all_domains)} unique domains from public sources",
            "discovered": len(all_domains),
            "enriched": len(enriched_domains),
            "sources": {k: len(v) for k, v in discovery_results.items()},
            "domains_by_source": discovery_results,
            "enriched_domains": enriched_domains,
            "ai_suggestions": ai_sources,
            "errors": errors
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error in vendor discovery: {e}", exc_info=True)
        return jsonify({"error": f"Discovery failed: {str(e)}"}), 500


def run_initial_discovery():
    """Run discovery on startup if database is empty."""
    if not postgres_client or not postgres_client.conn:
        app_logger.info("⚠️  PostgreSQL not available - skipping initial discovery")
        return
    
    try:
        # FIRST: Check for dummy data and seed ONCE if needed
        try:
            cursor = postgres_client.conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM personaforge_domains WHERE source = 'DUMMY_DATA_FOR_TESTING'")
            dummy_count = cursor.fetchone()[0]
            cursor.close()
            
            if dummy_count == 0:
                app_logger.info("📊 No dummy data found - seeding dummy data for PersonaForge visualization (one-time only)...")
                # Use importlib to avoid sys.path issues
                import importlib.util
                import sys
                seed_dummy_data_path = blueprint_dir / 'src' / 'database' / 'seed_dummy_data.py'
                if seed_dummy_data_path.exists():
                    spec = importlib.util.spec_from_file_location("seed_dummy_data", seed_dummy_data_path)
                    seed_dummy_data_module = importlib.util.module_from_spec(spec)
                    # Add blueprint_dir to sys.path temporarily for any internal imports
                    # This ensures 'src.utils' can be found when the module imports it
                    original_path = sys.path[:]
                    if str(blueprint_dir) not in sys.path:
                        sys.path.insert(0, str(blueprint_dir))
                    try:
                        # Pre-import src modules to make them available
                        # This ensures src.utils can be found when seed_dummy_data imports it
                        import importlib
                        try:
                            importlib.import_module('src.utils.logger')
                            importlib.import_module('src.database.postgres_client')
                        except ImportError:
                            pass  # If they're already imported or don't exist, continue
                        
                        # Set __package__ and __name__ to help with relative imports
                        seed_dummy_data_module.__package__ = 'src.database'
                        seed_dummy_data_module.__name__ = 'src.database.seed_dummy_data'
                        spec.loader.exec_module(seed_dummy_data_module)
                        count = seed_dummy_data_module.seed_dummy_data(num_domains=50)
                        app_logger.info(f"✅ Seeded {count} dummy domains for PersonaForge visualization")
                    finally:
                        sys.path[:] = original_path
                else:
                    app_logger.error(f"seed_dummy_data module not found at {seed_dummy_data_path}")
            else:
                app_logger.info(f"✅ Dummy data already exists ({dummy_count} domains) - skipping seed")
        except Exception as e:
            app_logger.error(f"Error checking/seeding dummy data: {e}", exc_info=True)
        
        # THEN: Check if we have any real domains (not dummy data)
        domains = postgres_client.get_all_enriched_domains()
        # Filter out dummy data for discovery check
        real_domains = [d for d in domains if d.get('source') != 'DUMMY_DATA_FOR_TESTING']
        
        if len(real_domains) == 0:
            app_logger.info("🔍 Database is empty - running initial discovery...")
            try:
                # Use importlib to avoid sys.path issues
                import importlib.util
                import sys
                
                # Import vendor_discovery
                vendor_discovery_path = blueprint_dir / 'src' / 'enrichment' / 'vendor_discovery.py'
                if vendor_discovery_path.exists():
                    spec = importlib.util.spec_from_file_location("vendor_discovery", vendor_discovery_path)
                    vendor_discovery_module = importlib.util.module_from_spec(spec)
                    original_path = sys.path[:]
                    if str(blueprint_dir) not in sys.path:
                        sys.path.insert(0, str(blueprint_dir))
                    try:
                        # Pre-import src modules to make them available
                        try:
                            importlib.import_module('src.utils.config')
                            importlib.import_module('src.utils.logger')
                            importlib.import_module('src.utils.rate_limiter')
                        except ImportError:
                            pass  # If they're already imported or don't exist, continue
                        
                        # Set __package__ and __name__ to help with relative imports
                        vendor_discovery_module.__package__ = 'src.enrichment'
                        vendor_discovery_module.__name__ = 'src.enrichment.vendor_discovery'
                        spec.loader.exec_module(vendor_discovery_module)
                        discover_all_sources = vendor_discovery_module.discover_all_sources
                    finally:
                        sys.path[:] = original_path
                else:
                    app_logger.error(f"vendor_discovery module not found at {vendor_discovery_path}")
                    return
                
                # Import enrichment_pipeline
                enrichment_pipeline_path = blueprint_dir / 'src' / 'enrichment' / 'enrichment_pipeline.py'
                if enrichment_pipeline_path.exists():
                    spec = importlib.util.spec_from_file_location("enrichment_pipeline", enrichment_pipeline_path)
                    enrichment_pipeline_module = importlib.util.module_from_spec(spec)
                    original_path = sys.path[:]
                    if str(blueprint_dir) not in sys.path:
                        sys.path.insert(0, str(blueprint_dir))
                    try:
                        # Pre-import src modules to make them available
                        try:
                            importlib.import_module('src.utils.config')
                            importlib.import_module('src.utils.logger')
                        except ImportError:
                            pass  # If they're already imported or don't exist, continue
                        
                        # Set __package__ and __name__ to help with relative imports
                        enrichment_pipeline_module.__package__ = 'src.enrichment'
                        enrichment_pipeline_module.__name__ = 'src.enrichment.enrichment_pipeline'
                        spec.loader.exec_module(enrichment_pipeline_module)
                        enrich_domain = enrichment_pipeline_module.enrich_domain
                    finally:
                        sys.path[:] = original_path
                else:
                    app_logger.error(f"enrichment_pipeline module not found at {enrichment_pipeline_path}")
                    return
                
                # Run discovery
                discovery_results = discover_all_sources(limit_per_source=10)
                
                # Combine all discovered domains
                all_domains = set()
                for domains_list in discovery_results.values():
                    all_domains.update(domains_list)
                
                app_logger.info(f"📊 Discovered {len(all_domains)} domains, enriching top 20...")
                
                # Enrich and store top domains
                enriched = 0
                for domain in list(all_domains)[:20]:
                    try:
                        enrichment_data = enrich_domain(domain)
                        domain_id = postgres_client.insert_domain(
                            domain,
                            'Auto-discovery',
                            'Initial discovery on startup',
                            enrichment_data.get('vendor_type')
                        )
                        postgres_client.insert_enrichment(domain_id, enrichment_data)
                        enriched += 1
                    except Exception as e:
                        app_logger.debug(f"Error enriching {domain}: {e}")
                
                app_logger.info(f"✅ Initial discovery complete - enriched {enriched} domains")
                
                # If discovery found nothing, enrich a few test domains to demonstrate the system
                if enriched == 0:
                    app_logger.info("🔍 Discovery found no domains - enriching test domains to demonstrate system...")
                    test_domains = [
                        "example.com",
                        "test.com", 
                        "demo.com"
                    ]
                    for domain in test_domains:
                        try:
                            enrichment_data = enrich_domain(domain)
                            domain_id = postgres_client.insert_domain(
                                domain,
                                'Test data',
                                'Initial test to demonstrate system',
                                enrichment_data.get('vendor_type')
                            )
                            postgres_client.insert_enrichment(domain_id, enrichment_data)
                            app_logger.info(f"  ✓ Enriched test domain: {domain}")
                        except Exception as e:
                            app_logger.debug(f"Error enriching test domain {domain}: {e}")
            except Exception as e:
                app_logger.error(f"Initial discovery failed: {e}", exc_info=True)
        else:
            app_logger.info(f"✅ Database has {len(domains)} domains - skipping initial discovery")
    except Exception as e:
        app_logger.error(f"Error checking database for initial discovery: {e}")

