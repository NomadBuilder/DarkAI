"""
PersonaForge Flask Blueprint for consolidated DarkAI platform.

This blueprint handles all PersonaForge routes under /personaforge prefix.
"""

import os
import sys
from pathlib import Path
from flask import Blueprint, render_template, jsonify, request, Response
import json
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

# Add src to path (relative to blueprint location)
blueprint_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(blueprint_dir))

# Load environment variables early - try from consolidated app root first, then blueprint directory
consolidated_root = blueprint_dir.parent.parent
load_dotenv(dotenv_path=consolidated_root / '.env')  # Try consolidated app root first
load_dotenv(dotenv_path=blueprint_dir / '.env', override=False)  # Then blueprint directory (don't override)

# Import with error handling
try:
    from src.utils.config import Config
except ImportError:
    # If direct import fails, try adding to path
    if str(blueprint_dir) not in sys.path:
        sys.path.insert(0, str(blueprint_dir))
    from src.utils.config import Config

try:
    from src.database.neo4j_client import Neo4jClient
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    Neo4jClient = None

from src.database.postgres_client import PostgresClient
from src.utils.logger import setup_logger, logger
from src.utils.validation import validate_domain

# Import modules that might be needed dynamically - import them normally here
# This avoids importlib issues
try:
    from src.database.seed_dummy_data import seed_dummy_data
    SEED_DUMMY_DATA_AVAILABLE = True
except ImportError:
    SEED_DUMMY_DATA_AVAILABLE = False
    seed_dummy_data = None

try:
    from src.enrichment.enrichment_pipeline import enrich_domain
    ENRICHMENT_PIPELINE_AVAILABLE = True
except ImportError:
    ENRICHMENT_PIPELINE_AVAILABLE = False
    enrich_domain = None

try:
    from src.enrichment.vendor_discovery import discover_all_sources
    VENDOR_DISCOVERY_AVAILABLE = True
except ImportError:
    VENDOR_DISCOVERY_AVAILABLE = False
    discover_all_sources = None

try:
    from src.clustering.vendor_clustering import detect_vendor_clusters
    VENDOR_CLUSTERING_AVAILABLE = True
except ImportError:
    VENDOR_CLUSTERING_AVAILABLE = False
    detect_vendor_clusters = None

try:
    from src.clustering.content_clustering import detect_content_clusters_from_db
    CONTENT_CLUSTERING_AVAILABLE = True
except ImportError:
    CONTENT_CLUSTERING_AVAILABLE = False
    detect_content_clusters_from_db = None

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
    except Exception as e:
        app_logger.warning(f"⚠️  PersonaForge Neo4j client initialization failed: {e}")

try:
    postgres_client = PostgresClient()
    if postgres_client and postgres_client.conn:
        app_logger.info("✅ PersonaForge PostgreSQL client initialized")
except Exception as e:
    app_logger.warning(f"⚠️  PersonaForge PostgreSQL client initialization failed: {e}")
    postgres_client = None

# Register error handlers
try:
    from src.utils.error_handler import register_error_handlers
    register_error_handlers(personaforge_bp)
except ImportError:
    pass  # Error handlers optional


def ensure_src_modules_available():
    """
    Ensure all src modules are available in sys.modules before loading dependent modules.
    This is a robust way to make sure imports work in importlib context.
    """
    import importlib
    import importlib.util
    
    # Ensure blueprint_dir is in sys.path (at the front)
    blueprint_dir_str = str(blueprint_dir)
    if blueprint_dir_str in sys.path:
        sys.path.remove(blueprint_dir_str)
    sys.path.insert(0, blueprint_dir_str)
    
    # CRITICAL: First, ensure src is importable as a package
    # Try normal import first (simplest and most reliable)
    if 'src' not in sys.modules:
        try:
            import src
            app_logger.debug("✅ Imported src package via normal import")
        except ImportError:
            # If normal import fails, try loading __init__.py directly
            try:
                src_init_path = blueprint_dir / 'src' / '__init__.py'
                if src_init_path.exists():
                    spec = importlib.util.spec_from_file_location("src", src_init_path)
                    if spec and spec.loader:
                        src_module = importlib.util.module_from_spec(spec)
                        src_module.__package__ = 'src'
                        src_module.__path__ = [str(blueprint_dir / 'src')]
                        src_module.__name__ = 'src'
                        spec.loader.exec_module(src_module)
                        sys.modules['src'] = src_module
                        app_logger.debug("✅ Imported src package via importlib")
            except Exception as e:
                app_logger.warning(f"Could not import src package: {e}")
                return 0, 1
    
    # List of modules to pre-import (in dependency order)
    modules_to_import = [
        'src.utils',
        'src.utils.logger',
        'src.utils.config',
        'src.utils.rate_limiter',
        'src.utils.validation',
        'src.utils.cache',
        'src.database',
        'src.database.postgres_client',
        'src.database.neo4j_client',
        'src.enrichment',
        'src.clustering',
    ]
    
    imported = []
    failed = []
    
    for module_name in modules_to_import:
        try:
            if module_name not in sys.modules:
                importlib.import_module(module_name)
                imported.append(module_name)
        except ImportError as e:
            failed.append(f"{module_name}: {e}")
            # Continue - some modules might not be needed
    
    if imported:
        app_logger.debug(f"Pre-imported {len(imported)} modules: {', '.join(imported)}")
    if failed:
        app_logger.warning(f"Failed to pre-import {len(failed)} modules: {', '.join(failed)}")
    
    return len(imported), len(failed)


def load_module_safely(module_path, module_name):
    """
    Safely load a module using importlib with all dependencies pre-loaded.
    
    Args:
        module_path: Path to the module file
        module_name: Simple name for the module (e.g., "seed_dummy_data")
    
    Returns:
        The loaded module or None if failed
    """
    import importlib.util
    
    if not module_path.exists():
        app_logger.error(f"Module not found: {module_path}")
        return None
    
    # Ensure all src modules are available first
    ensure_src_modules_available()
    
    # Determine the full module name from the module path
    # e.g., /opt/render/project/src/personaforge/src/database/seed_dummy_data.py
    # should be 'src.database.seed_dummy_data'
    module_path_str = str(module_path)
    blueprint_dir_str = str(blueprint_dir)
    
    if module_path_str.startswith(blueprint_dir_str):
        # Get relative path from blueprint_dir
        rel_path = module_path.relative_to(blueprint_dir)
        # Convert to full module name: src/database/seed_dummy_data.py -> src.database.seed_dummy_data
        parts = list(rel_path.parts)
        # Remove .py extension from last part
        if parts and parts[-1].endswith('.py'):
            parts[-1] = parts[-1][:-3]
        full_module_name = '.'.join(parts) if parts else module_name
        package_name = '.'.join(parts[:-1]) if len(parts) > 1 else None
    else:
        full_module_name = module_name
        package_name = None
    
    # CRITICAL: Use the full dotted name in spec_from_file_location
    # This ensures the loader can handle the name we set in __name__
    spec = importlib.util.spec_from_file_location(full_module_name, module_path)
    if spec is None or spec.loader is None:
        app_logger.error(f"Could not create spec for {module_path}")
        return None
    
    module = importlib.util.module_from_spec(spec)
    
    # Set __package__ and __name__ to match the spec
    module.__name__ = full_module_name
    if package_name:
        module.__package__ = package_name
    
    # Store original sys.path
    original_path = sys.path[:]
    
    # Ensure blueprint_dir is in sys.path
    if str(blueprint_dir) not in sys.path:
        sys.path.insert(0, str(blueprint_dir))
    
    try:
        # Execute the module - all dependencies should now be available
        spec.loader.exec_module(module)
        return module
    except Exception as e:
        app_logger.error(f"Error loading module {module_path}: {e}", exc_info=True)
        return None
    finally:
        # Restore sys.path
        sys.path[:] = original_path


@personaforge_bp.route('/')
def index():
    """Render the PersonaForge homepage."""
    return render_template('index.html')


@personaforge_bp.route('/dashboard')
def dashboard():
    """Render the main visualization dashboard."""
    return render_template('dashboard.html')


@personaforge_bp.route('/vendors')
def vendors():
    """Render the vendors/clusters page."""
    return render_template('vendors.html')

@personaforge_bp.route('/vendors-intel')
def vendors_intel():
    """Vendor intelligence directory page."""
    return render_template('vendors_intel.html')

@personaforge_bp.route('/vendor-intel/<int:vendor_id>')
def vendor_intel_profile(vendor_id):
    """Vendor intelligence profile page."""
    return render_template('vendor_intel_profile.html', vendor_id=vendor_id)

@personaforge_bp.route('/categories')
def categories():
    """Category analysis page."""
    return render_template('categories.html')

@personaforge_bp.route('/services')
def services():
    """Service catalog page."""
    return render_template('services.html')


@personaforge_bp.route('/analytics')
def analytics():
    """Render the analytics page."""
    return render_template('analytics.html')


@personaforge_bp.route('/methodology')
def methodology():
    """Render the methodology page."""
    return render_template('methodology.html')


@personaforge_bp.route('/glossary')
def glossary():
    """Render the glossary page."""
    return render_template('glossary.html')


@personaforge_bp.route('/api/homepage-stats', methods=['GET'])
def get_homepage_stats():
    """Get statistics for the homepage."""
    database_available = postgres_client and postgres_client.conn is not None
    
    if not database_available:
        return jsonify({
            "total_domains": 0,
            "total_vendors": 0,
            "high_risk_domains": 0,
            "infrastructure_clusters": 0,
            "top_vendors": [],
            "recent_discoveries": [],
            "database_available": False
        }), 200
    
    try:
        # Get basic stats
        domains = postgres_client.get_all_enriched_domains()
        
        # Use vendor intelligence data instead of old vendors table
        vendor_intel = postgres_client.get_all_vendors_intel()
        
        # Get domain counts for each vendor intelligence vendor
        import psycopg2.extras
        cursor = postgres_client.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT 
                vi.id,
                vi.vendor_name,
                vi.category,
                COUNT(vid.domain_id) as domain_count
            FROM personaforge_vendors_intel vi
            LEFT JOIN personaforge_vendor_intel_domains vid ON vi.id = vid.vendor_intel_id
            GROUP BY vi.id, vi.vendor_name, vi.category
            HAVING COUNT(vid.domain_id) > 0
            ORDER BY domain_count DESC
        """)
        vendors_with_domains_data = cursor.fetchall()
        cursor.close()
        vendors_with_domains = [dict(row) for row in vendors_with_domains_data]
        
        # Count unique vendor types from domains (more accurate than vendors table)
        vendor_types = set()
        for domain in domains:
            vendor_type = domain.get('vendor_type')
            if vendor_type:
                vendor_types.add(vendor_type)
        
        # Use vendor intelligence count
        vendor_count = len(vendor_intel) if vendor_intel else len(vendor_types)
        
        # Count high-risk domains based on risk score or high-risk vendor types
        high_risk = 0
        high_risk_vendor_types = ['fraud-as-a-service', 'synthetic_id_kits', 'synthetic identity kits']
        
        for domain in domains:
            # Check risk score from enrichment_data
            enrichment = domain.get('enrichment_data', {})
            if isinstance(enrichment, str):
                try:
                    import json
                    enrichment = json.loads(enrichment)
                except:
                    enrichment = {}
            
            risk_score = domain.get('vendor_risk_score') or enrichment.get('vendor_risk_score') or 0
            vendor_type = domain.get('vendor_type') or enrichment.get('vendor_type') or ''
            
            # High risk if:
            # 1. Risk score >= 70
            # 2. Vendor type indicates high risk
            # 3. Domain has strong vendor indicators
            if risk_score >= 70:
                high_risk += 1
            elif vendor_type in high_risk_vendor_types:
                high_risk += 1
            elif vendor_type in ['fake_docs', 'kyc_tools'] and risk_score >= 50:
                # Medium-high risk for these types
                high_risk += 1
        
        # Get top vendors from vendor intelligence (those with domains)
        top_vendors = sorted(vendors_with_domains, key=lambda v: v.get('domain_count', 0), reverse=True)[:10]
        
        # Get recent discoveries (last 10 domains)
        recent_discoveries = sorted(domains, key=lambda x: x.get('updated_at', ''), reverse=True)[:10]
        recent_discoveries_data = []
        for domain in recent_discoveries:
            enrichment = domain.get('enrichment_data', {})
            if isinstance(enrichment, str):
                try:
                    import json
                    enrichment = json.loads(enrichment)
                except:
                    enrichment = {}
            
            recent_discoveries_data.append({
                "domain": domain.get('domain', 'Unknown'),
                "vendor_type": domain.get('vendor_type') or enrichment.get('vendor_type') or 'unknown',
                "risk_score": domain.get('vendor_risk_score') or enrichment.get('vendor_risk_score') or 0
            })
        
        # Get infrastructure clusters count
        stats = {
            "total_domains": len(domains),
            "total_vendors": vendor_count,
            "high_risk_domains": high_risk,
            "top_vendors": [
                {
                    "vendor_name": v.get('vendor_name', v.get('title', 'Unknown')),
                    "domain_count": v.get('domain_count', 0),
                    "vendor_type": v.get('category', 'unknown'),
                    "avg_risk_score": 0  # Vendor intelligence doesn't have risk scores yet
                }
                for v in top_vendors
            ],
            "recent_discoveries": recent_discoveries_data,
            "infrastructure_clusters": 0,  # Will be updated if clustering works
            "database_available": True
        }
        
        # Try to get cluster count
        try:
            if VENDOR_CLUSTERING_AVAILABLE and detect_vendor_clusters:
                clusters = detect_vendor_clusters(postgres_client)
                stats["infrastructure_clusters"] = len(clusters)
        except Exception as e:
            app_logger.debug(f"Could not get cluster count: {e}")
        
        return jsonify(stats), 200
    except Exception as e:
        app_logger.error(f"Error getting homepage stats: {e}", exc_info=True)
        return jsonify({
            "total_domains": 0,
            "total_vendors": 0,
            "high_risk_domains": 0,
            "infrastructure_clusters": 0,
            "top_vendors": []
        }), 200


@personaforge_bp.route('/api/vendors', methods=['GET'])
def get_vendors():
    """Get vendors and clusters."""
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
        clusters = []
        if VENDOR_CLUSTERING_AVAILABLE and detect_vendor_clusters:
            try:
                clusters = detect_vendor_clusters(postgres_client)
            except Exception as e:
                app_logger.error(f"Error getting clusters: {e}", exc_info=True)
        
        # Filter clusters by min_size
        filtered_clusters = [c for c in clusters if len(c.get('domains', [])) >= min_size]
        
        # Get total domains
        domains = postgres_client.get_all_enriched_domains()
        
        return jsonify({
            "vendors": vendors,
            "clusters": filtered_clusters,
            "total_domains": len(domains),
            "infrastructure_clusters": len(filtered_clusters)
        }), 200
    except Exception as e:
        app_logger.error(f"Error getting vendors: {e}", exc_info=True)
        return jsonify({
            "vendors": [],
            "clusters": [],
            "total_domains": 0,
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/clusters', methods=['GET'])
def get_clusters():
    """Get detected vendor clusters (infrastructure-based)."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "clusters": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        if not VENDOR_CLUSTERING_AVAILABLE or not detect_vendor_clusters:
            return jsonify({"clusters": [], "error": "Clustering module not available"}), 500
        
        clusters = detect_vendor_clusters(postgres_client)
        return jsonify({
            "clusters": clusters,
            "count": len(clusters)
        }), 200
    except Exception as e:
        app_logger.error(f"Error getting clusters: {e}", exc_info=True)
        return jsonify({
            "clusters": [],
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/content-clusters', methods=['GET'])
def get_content_clusters():
    """Get content-based clusters (similar descriptions)."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "clusters": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        if not CONTENT_CLUSTERING_AVAILABLE or not detect_content_clusters_from_db:
            return jsonify({"clusters": [], "error": "Content clustering module not available"}), 500
        
        # Get parameters
        similarity_threshold = float(request.args.get('similarity_threshold', 0.6))
        min_cluster_size = int(request.args.get('min_cluster_size', 2))
        include_duplicates = request.args.get('include_duplicates', 'true').lower() == 'true'
        
        clusters = detect_content_clusters_from_db(
            postgres_client,
            similarity_threshold=similarity_threshold,
            min_cluster_size=min_cluster_size,
            include_duplicates=include_duplicates
        )
        
        return jsonify({
            "clusters": clusters,
            "count": len(clusters),
            "parameters": {
                "similarity_threshold": similarity_threshold,
                "min_cluster_size": min_cluster_size,
                "include_duplicates": include_duplicates
            }
        }), 200
    except Exception as e:
        app_logger.error(f"Error getting content clusters: {e}", exc_info=True)
        return jsonify({
            "clusters": [],
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/graph', methods=['GET'])
def get_graph():
    """Get graph data for visualization."""
    try:
        return get_graph_from_postgres()
    except Exception as e:
        app_logger.error(f"Error generating graph: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "nodes": [],
            "edges": []
        }), 500


def get_graph_from_postgres():
    """Generate graph data from PostgreSQL."""
    from collections import Counter
    
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "nodes": [],
            "edges": [],
            "stats": {
                "total_domains": 0,
                "total_services": 0,
                "total_edges": 0
            }
        }), 200
    
    try:
        domains = postgres_client.get_all_enriched_domains()
        
            # Limit to 30 nodes for readability
        if len(domains) > 30:
            # Prioritize: Clusters > Vendors > Infrastructure > Domains
            clusters = []
            try:
                if VENDOR_CLUSTERING_AVAILABLE and detect_vendor_clusters:
                    clusters = detect_vendor_clusters(postgres_client)
            except:
                pass
            
            # Get domains from top clusters first
            cluster_domains = set()
            for cluster in clusters[:5]:  # Top 5 clusters
                cluster_domains.update(cluster.get('domains', []))
            
            # Get vendor domains
            vendors = postgres_client.get_vendors(min_domains=2)
            vendor_domains = set()
            for vendor in vendors[:10]:  # Top 10 vendors
                vendor_domains.update(vendor.get('domains', []))
            
            # Combine and limit
            priority_domains = list(cluster_domains | vendor_domains)[:30]
            domains = [d for d in domains if d.get('domain') in priority_domains]
        
        nodes = []
        edges = []
        node_id_map = {}
        node_counter = 0
        
        # Service frequency counters
        service_counts = Counter()
        
        # Track domains for each infrastructure service
        infrastructure_domains = {}  # {service_id: [domain1, domain2, ...]}
        
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
            
            # Add service nodes and edges
            services = []
            
            # Host
            if domain.get('host_name'):
                host_name = domain.get('host_name')
                service_id = f"host_{host_name}"
                if service_id not in node_id_map:
                    node_id_map[('host', host_name)] = service_id
                    infrastructure_domains[service_id] = []
                    nodes.append({
                        "id": service_id,
                        "label": "Host",
                        "node_type": "host",
                        "properties": {"name": host_name}
                    })
                    service_counts['host'] += 1
                if service_id in infrastructure_domains:
                    infrastructure_domains[service_id].append(domain_name)
                edges.append({"source": node_id, "target": service_id, "type": "hosted_by"})
            
            # CDN
            if domain.get('cdn'):
                cdn_name = domain.get('cdn')
                service_id = f"cdn_{cdn_name}"
                if service_id not in node_id_map:
                    node_id_map[('cdn', cdn_name)] = service_id
                    infrastructure_domains[service_id] = []
                    nodes.append({
                        "id": service_id,
                        "label": "CDN",
                        "node_type": "cdn",
                        "properties": {"name": cdn_name}
                    })
                    service_counts['cdn'] += 1
                if service_id in infrastructure_domains:
                    infrastructure_domains[service_id].append(domain_name)
                edges.append({"source": node_id, "target": service_id, "type": "uses_cdn"})
            
            # Payment Processor
            if domain.get('payment_processor'):
                payment_name = domain.get('payment_processor')
                # Handle comma-separated payment processors
                payment_names = [p.strip() for p in payment_name.split(',') if p.strip()]
                for payment_name in payment_names:
                    service_id = f"payment_{payment_name}"
                    if service_id not in node_id_map:
                        node_id_map[('payment', payment_name)] = service_id
                        infrastructure_domains[service_id] = []
                        nodes.append({
                            "id": service_id,
                            "label": "PaymentProcessor",
                            "node_type": "payment",
                            "properties": {"name": payment_name}
                        })
                        service_counts['payment'] += 1
                    if service_id in infrastructure_domains:
                        infrastructure_domains[service_id].append(domain_name)
                    edges.append({"source": node_id, "target": service_id, "type": "uses_payment"})
            
            # CMS
            if domain.get('cms'):
                cms_name = domain.get('cms')
                service_id = f"cms_{cms_name}"
                if service_id not in node_id_map:
                    node_id_map[('cms', cms_name)] = service_id
                    infrastructure_domains[service_id] = []
                    nodes.append({
                        "id": service_id,
                        "label": "CMS",
                        "node_type": "cms",
                        "properties": {"name": cms_name}
                    })
                    service_counts['cms'] += 1
                if service_id in infrastructure_domains:
                    infrastructure_domains[service_id].append(domain_name)
                edges.append({"source": node_id, "target": service_id, "type": "uses_cms"})
            
            # Registrar
            if domain.get('registrar'):
                registrar_name = domain.get('registrar')
                service_id = f"registrar_{registrar_name}"
                if service_id not in node_id_map:
                    node_id_map[('registrar', registrar_name)] = service_id
                    infrastructure_domains[service_id] = []
                    nodes.append({
                        "id": service_id,
                        "label": "Registrar",
                        "node_type": "registrar",
                        "properties": {"name": registrar_name}
                    })
                    service_counts['registrar'] += 1
                if service_id in infrastructure_domains:
                    infrastructure_domains[service_id].append(domain_name)
                edges.append({"source": node_id, "target": service_id, "type": "registered_with"})
        
        # Update infrastructure nodes with domain lists
        for node in nodes:
            if node.get('node_type') in ['host', 'cdn', 'payment', 'registrar']:
                service_id = node.get('id')
                if service_id in infrastructure_domains:
                    domains_list = infrastructure_domains[service_id]
                    node['properties']['domains'] = domains_list
                    node['properties']['domain_count'] = len(domains_list)
        
        return jsonify({
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_domains": len([n for n in nodes if n.get('node_type') == 'domain']),
                "total_services": len([n for n in nodes if n.get('node_type') != 'domain']),
                "total_edges": len(edges)
            }
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
        if not VENDOR_DISCOVERY_AVAILABLE or not discover_all_sources:
            return jsonify({"error": "vendor_discovery module not available"}), 500
        
        # Try to get ask_ai_for_data_sources if available
        try:
            from src.enrichment.vendor_discovery import ask_ai_for_data_sources
        except ImportError:
            ask_ai_for_data_sources = None
        
        data = request.get_json() or {}
        limit_per_source = data.get('limit_per_source', 20)
        auto_enrich = data.get('auto_enrich', True)
        
        app_logger.info(f"🔍 Starting vendor discovery (limit: {limit_per_source})...")
        
        # First, ask AI for data sources and strategies
        ai_sources = {}
        if ask_ai_for_data_sources:
            try:
                ai_sources = ask_ai_for_data_sources()
                app_logger.info(f"🤖 AI suggested {len(ai_sources.get('sources', []))} data sources")
            except Exception as e:
                app_logger.warning(f"AI source suggestion failed: {e}")
        
        # Discover from all sources (including AI)
        discovery_results = discover_all_sources(limit_per_source=limit_per_source)
        
        # Combine all discovered domains
        all_domains = set()
        for domains_list in discovery_results.values():
            all_domains.update(domains_list)
        
        enriched_domains = []
        errors = []
        
        if auto_enrich:
            enrich_domain_func = enrich_domain if ENRICHMENT_PIPELINE_AVAILABLE else None
            
            for domain in all_domains:
                try:
                    # Insert domain
                    domain_id = postgres_client.insert_domain(
                        domain=domain,
                        source="DISCOVERY",
                        notes="Discovered via vendor discovery API"
                    )
                    
                    # Enrich if function available
                    if enrich_domain_func:
                        enrichment_data = enrich_domain_func(domain)
                        postgres_client.insert_enrichment(domain_id, enrichment_data)
                        enriched_domains.append({
                            "domain": domain,
                            "enriched": True
                        })
                    else:
                        enriched_domains.append({
                            "domain": domain,
                            "enriched": False
                        })
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
        # Check for dummy data (but don't auto-seed - user must explicitly request it)
        # Dummy data was removed and should not be re-seeded automatically
        try:
            cursor = postgres_client.conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM personaforge_domains WHERE source = 'DUMMY_DATA_FOR_TESTING'")
            dummy_count = cursor.fetchone()[0]
            cursor.close()
            
            if dummy_count > 0:
                app_logger.info(f"⚠️  Found {dummy_count} dummy data domains. Use remove_dummy_data.py to clean them.")
            else:
                app_logger.info("✅ No dummy data found - database is clean")
        except Exception as e:
            app_logger.error(f"Error checking dummy data: {e}", exc_info=True)
        
        # THEN: Check if we have any real domains (not dummy data)
        domains = postgres_client.get_all_enriched_domains()
        # Filter out dummy data for discovery check
        real_domains = [d for d in domains if d.get('source') != 'DUMMY_DATA_FOR_TESTING']
        
        # Auto-discovery disabled - using CSV-provided vendor list only
        # To manually run discovery, use POST /personaforge/api/discover
        app_logger.info(f"✅ Found {len(real_domains)} domains - auto-discovery disabled (using CSV list only)")
    except Exception as e:
        app_logger.error(f"Error in run_initial_discovery: {e}", exc_info=True)


# ==================== Vendor Intelligence API Endpoints ====================

@personaforge_bp.route('/api/vendors-intel', methods=['GET'])
def get_vendors_intel():
    """Get all vendor intelligence with optional filters."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "total": 0,
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        # Get query parameters
        category = request.args.get('category')
        platform_type = request.args.get('platform_type')
        region = request.args.get('region')
        search = request.args.get('search')
        active = request.args.get('active')
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int)
        
        # Build filters
        filters = {}
        if category:
            filters['category'] = category
        if platform_type:
            filters['platform_type'] = platform_type
        if region:
            filters['region'] = region
        if search:
            filters['search'] = search
        if active is not None:
            filters['active'] = active.lower() == 'true'
        if limit:
            filters['limit'] = limit
        if offset:
            filters['offset'] = offset
        
        vendors = postgres_client.get_all_vendors_intel(filters)
        
        # Get total count (without limit)
        count_filters = {k: v for k, v in filters.items() if k not in ['limit', 'offset']}
        total = len(postgres_client.get_all_vendors_intel(count_filters))
        
        return jsonify({
            "vendors": vendors,
            "total": total,
            "count": len(vendors)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting vendor intelligence: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "vendors": [],
            "total": 0
        }), 500


@personaforge_bp.route('/api/vendor-intel/<int:vendor_id>', methods=['GET'])
def get_vendor_intel(vendor_id):
    """Get single vendor intelligence profile."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "error": "PostgreSQL not available"
        }), 500
    
    try:
        vendor = postgres_client.get_vendor_intel(vendor_id)
        if not vendor:
            return jsonify({"error": "Vendor not found"}), 404
        
        # Get associated domains
        domains = postgres_client.get_vendor_domains(vendor_id)
        vendor['domains'] = domains
        
        return jsonify(vendor), 200
    except Exception as e:
        app_logger.error(f"Error getting vendor intelligence: {e}", exc_info=True)
        return jsonify({
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/vendors-intel/search', methods=['GET'])
def search_vendors_intel():
    """Search vendors by name, summary, services."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({"vendors": [], "count": 0}), 200
        
        # Get additional filters
        filters = {'search': query}
        if request.args.get('category'):
            filters['category'] = request.args.get('category')
        if request.args.get('platform_type'):
            filters['platform_type'] = request.args.get('platform_type')
        
        vendors = postgres_client.search_vendors_intel(query, filters)
        
        return jsonify({
            "vendors": vendors,
            "count": len(vendors),
            "query": query
        }), 200
    except Exception as e:
        app_logger.error(f"Error searching vendor intelligence: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "vendors": []
        }), 500


@personaforge_bp.route('/api/vendors-intel/categories', methods=['GET'])
def get_categories():
    """Get all categories with counts."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "categories": {},
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        stats = postgres_client.get_category_stats()
        return jsonify({
            "categories": stats,
            "count": len(stats)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting categories: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "categories": {}
        }), 500


@personaforge_bp.route('/api/vendors-intel/services', methods=['GET'])
def get_services():
    """Get all services with counts."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "services": {},
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        stats = postgres_client.get_service_stats()
        return jsonify({
            "services": stats,
            "count": len(stats)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting services: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "services": {}
        }), 500


@personaforge_bp.route('/api/vendors-intel/stats', methods=['GET'])
def get_vendor_intel_stats():
    """Get vendor intelligence statistics."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "error": "PostgreSQL not available"
        }), 500
    
    try:
        all_vendors = postgres_client.get_all_vendors_intel()
        
        # Calculate stats
        total_vendors = len(all_vendors)
        active_vendors = len([v for v in all_vendors if v.get('active', True)])
        
        # Platform distribution
        platforms = {}
        for vendor in all_vendors:
            platform = vendor.get('platform_type') or 'Unknown'
            platforms[platform] = platforms.get(platform, 0) + 1
        
        # Category stats
        category_stats = postgres_client.get_category_stats()
        
        # Service stats
        service_stats = postgres_client.get_service_stats()
        
        # Region stats
        regions = {}
        for vendor in all_vendors:
            region = vendor.get('region') or 'Unknown'
            regions[region] = regions.get(region, 0) + 1
        
        return jsonify({
            "total_vendors": total_vendors,
            "active_vendors": active_vendors,
            "platforms": platforms,
            "categories": category_stats,
            "services": service_stats,
            "regions": regions
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting vendor intelligence stats: {e}", exc_info=True)
        return jsonify({
            "error": str(e)
        }), 500


@personaforge_bp.route('/api/categories/<category>', methods=['GET'])
def get_category_vendors(category):
    """Get all vendors in a category."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        vendors = postgres_client.get_vendors_by_category(category)
        return jsonify({
            "category": category,
            "vendors": vendors,
            "count": len(vendors)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting category vendors: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "vendors": []
        }), 500


@personaforge_bp.route('/api/services/<service>', methods=['GET'])
def get_service_vendors(service):
    """Get all vendors offering a service."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        vendors = postgres_client.get_vendors_by_service(service)
        return jsonify({
            "service": service,
            "vendors": vendors,
            "count": len(vendors)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting service vendors: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "vendors": []
        }), 500


@personaforge_bp.route('/api/platforms/<platform_type>', methods=['GET'])
def get_platform_vendors(platform_type):
    """Get all vendors on a platform."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "vendors": [],
            "message": "PostgreSQL not available"
        }), 200
    
    try:
        vendors = postgres_client.get_vendors_by_platform(platform_type)
        return jsonify({
            "platform_type": platform_type,
            "vendors": vendors,
            "count": len(vendors)
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error getting platform vendors: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "vendors": []
        }), 500


def _generate_vendor_intelligence_data():
    """Internal function to generate vendor intelligence report data.
    Returns the data dictionary (not a Flask response).
    """
    if not postgres_client or not postgres_client.conn:
        raise Exception("PostgreSQL not available")
    
    try:
        # Rollback any failed transaction first
        try:
            postgres_client.conn.rollback()
        except:
            pass
        from collections import Counter, defaultdict
        import psycopg2.extras
        
        cursor = postgres_client.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # OPTIMIZATION: Use SQL aggregations instead of loading all data into Python
        # This is MUCH faster - database does the counting/grouping
        
        # Get platform distribution (SQL aggregation)
        cursor.execute("""
            SELECT platform_type, COUNT(*) as count, COUNT(CASE WHEN active = true THEN 1 END) as active_count
            FROM personaforge_vendors_intel
            WHERE platform_type IS NOT NULL
            GROUP BY platform_type
        """)
        platform_rows = cursor.fetchall()
        platforms = Counter({row['platform_type']: row['count'] for row in platform_rows})
        platform_breakdown = {row['platform_type']: {'total': row['count'], 'active': row['active_count']} for row in platform_rows}
        
        # Get category distribution (SQL aggregation)
        cursor.execute("""
            SELECT category, COUNT(*) as count, COUNT(CASE WHEN active = true THEN 1 END) as active_count
            FROM personaforge_vendors_intel
            WHERE category IS NOT NULL
            GROUP BY category
        """)
        category_rows = cursor.fetchall()
        categories = Counter()
        category_breakdown = {}
        
        # Normalize categories from SQL results (will be applied after normalize_category_name is defined)
        
        # Get region distribution (SQL aggregation)
        cursor.execute("""
            SELECT region, COUNT(*) as count
            FROM personaforge_vendors_intel
            WHERE region IS NOT NULL
            GROUP BY region
        """)
        region_rows = cursor.fetchall()
        # Regions will be normalized after normalize_region_name is defined
        # regions = Counter({row['region']: row['count'] for row in region_rows})  # Will be replaced with normalized version
        
        # Get total counts (lightweight)
        cursor.execute("SELECT COUNT(*) as total, COUNT(CASE WHEN active = true THEN 1 END) as active FROM personaforge_vendors_intel")
        vendor_counts = cursor.fetchone()
        total_vendors = vendor_counts['total']
        active_count = vendor_counts['active']
        
        # Get vendors with domains count
        cursor.execute("SELECT COUNT(DISTINCT vendor_intel_id) as count FROM personaforge_vendor_intel_domains")
        vendors_with_domains = cursor.fetchone()['count']
        
        # Get services distribution (SQL aggregation - unnest array)
        cursor.execute("""
            SELECT unnest(services) as service, COUNT(*) as count
            FROM personaforge_vendors_intel
            WHERE services IS NOT NULL AND array_length(services, 1) > 0
            GROUP BY unnest(services)
        """)
        service_rows = cursor.fetchall()
        services_list = [row['service'] for row in service_rows for _ in range(row['count'])]
        
        # OPTIMIZATION: Load infrastructure data efficiently, then load full enrichment only for enhanced analysis
        # This prevents loading massive JSONB fields for all domains at once
        
        # Get infrastructure data using direct SQL (much faster - no JSONB parsing)
        cursor.execute("""
            SELECT 
                de.cdn,
                de.host_name as hosting,
                de.payment_processor,
                de.registrar
            FROM personaforge_domain_enrichment de
            WHERE de.enriched_at IS NOT NULL
        """)
        infrastructure_rows = cursor.fetchall()
        
        # Convert to list of dicts for infrastructure processing (lightweight)
        infrastructure_domains = [dict(row) for row in infrastructure_rows]
        
        # OPTIMIZATION: Use SQL JSONB functions to extract stats directly, don't load full JSONB objects
        # This prevents loading massive JSONB data into memory
        enhanced_data_stats = {
            "web_scraping": {
                "domains_with_data": 0,
                "total_pages_scraped": 0,
                "avg_load_time": 0,
                "structured_data_found": 0
            },
            "nlp_analysis": {
                "domains_with_data": 0,
                "total_keywords": 0,
                "total_entities": 0,
                "sentiment_analysis": {"positive": 0, "negative": 0, "neutral": 0}
            },
            "ssl_certificates": {
                "domains_with_data": 0,
                "valid_certs": 0,
                "self_signed": 0,
                "expired": 0,
                "tls_versions": Counter()
            },
            "security_headers": {
                "domains_with_data": 0,
                "csp_enabled": 0,
                "hsts_enabled": 0,
                "avg_security_score": 0,
                "common_missing_headers": Counter()
            },
            "extracted_content": {
                "domains_with_pricing": 0,
                "domains_with_contact": 0,
                "domains_with_services": 0,
                "total_faqs": 0
            }
        }
        
        # Get enhanced enrichment stats using SQL JSONB functions (no need to load full objects)
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE web_scraping IS NOT NULL) as web_scraping_count,
                COUNT(*) FILTER (WHERE web_scraping->>'html' IS NOT NULL) as pages_scraped,
                COUNT(*) FILTER (WHERE web_scraping->'structured_data' IS NOT NULL AND jsonb_typeof(web_scraping->'structured_data') = 'array' AND jsonb_array_length(web_scraping->'structured_data') > 0) as structured_data_count,
                AVG((web_scraping->>'load_time')::numeric) FILTER (WHERE web_scraping->>'load_time' IS NOT NULL) as avg_load_time,
                COUNT(*) FILTER (WHERE nlp_analysis IS NOT NULL) as nlp_count,
                COUNT(*) FILTER (WHERE ssl_certificate IS NOT NULL) as ssl_count,
                COUNT(*) FILTER (WHERE ssl_certificate->>'valid' = 'true') as valid_ssl_count,
                COUNT(*) FILTER (WHERE ssl_certificate->>'self_signed' = 'true') as self_signed_count,
                COUNT(*) FILTER (WHERE ssl_certificate->>'expired' = 'true') as expired_ssl_count,
                COUNT(*) FILTER (WHERE security_headers IS NOT NULL) as security_headers_count,
                COUNT(*) FILTER (WHERE security_headers->>'csp' IS NOT NULL) as csp_count,
                COUNT(*) FILTER (WHERE security_headers->>'hsts' IS NOT NULL) as hsts_count,
                AVG((security_headers->>'security_score')::numeric) FILTER (WHERE security_headers->>'security_score' IS NOT NULL) as avg_security_score,
                COUNT(*) FILTER (WHERE extracted_content->'pricing' IS NOT NULL AND jsonb_typeof(extracted_content->'pricing') = 'array' AND jsonb_array_length(extracted_content->'pricing') > 0) as pricing_count,
                COUNT(*) FILTER (WHERE extracted_content->'contact_info' IS NOT NULL) as contact_count,
                COUNT(*) FILTER (WHERE extracted_content->'service_descriptions' IS NOT NULL AND jsonb_typeof(extracted_content->'service_descriptions') = 'array' AND jsonb_array_length(extracted_content->'service_descriptions') > 0) as services_count
            FROM personaforge_domain_enrichment
            WHERE enriched_at IS NOT NULL
        """)
        enhanced_stats_row = cursor.fetchone()
        
        if enhanced_stats_row:
            enhanced_data_stats["web_scraping"]["domains_with_data"] = enhanced_stats_row['web_scraping_count'] or 0
            enhanced_data_stats["web_scraping"]["total_pages_scraped"] = enhanced_stats_row['pages_scraped'] or 0
            enhanced_data_stats["web_scraping"]["structured_data_found"] = enhanced_stats_row['structured_data_count'] or 0
            enhanced_data_stats["web_scraping"]["avg_load_time"] = round(float(enhanced_stats_row['avg_load_time'] or 0), 2)
            enhanced_data_stats["nlp_analysis"]["domains_with_data"] = enhanced_stats_row['nlp_count'] or 0
            enhanced_data_stats["ssl_certificates"]["domains_with_data"] = enhanced_stats_row['ssl_count'] or 0
            enhanced_data_stats["ssl_certificates"]["valid_certs"] = enhanced_stats_row['valid_ssl_count'] or 0
            enhanced_data_stats["ssl_certificates"]["self_signed"] = enhanced_stats_row['self_signed_count'] or 0
            enhanced_data_stats["ssl_certificates"]["expired"] = enhanced_stats_row['expired_ssl_count'] or 0
            enhanced_data_stats["security_headers"]["domains_with_data"] = enhanced_stats_row['security_headers_count'] or 0
            enhanced_data_stats["security_headers"]["csp_enabled"] = enhanced_stats_row['csp_count'] or 0
            enhanced_data_stats["security_headers"]["hsts_enabled"] = enhanced_stats_row['hsts_count'] or 0
            enhanced_data_stats["security_headers"]["avg_security_score"] = round(float(enhanced_stats_row['avg_security_score'] or 0), 1)
            enhanced_data_stats["extracted_content"]["domains_with_pricing"] = enhanced_stats_row['pricing_count'] or 0
            enhanced_data_stats["extracted_content"]["domains_with_contact"] = enhanced_stats_row['contact_count'] or 0
            enhanced_data_stats["extracted_content"]["domains_with_services"] = enhanced_stats_row['services_count'] or 0
        
        # Get TLS versions distribution (lightweight - only extract version strings)
        cursor.execute("""
            SELECT ssl_certificate->>'tls_version' as tls_version, COUNT(*) as count
            FROM personaforge_domain_enrichment
            WHERE ssl_certificate IS NOT NULL AND ssl_certificate->>'tls_version' IS NOT NULL
            GROUP BY ssl_certificate->>'tls_version'
        """)
        tls_version_rows = cursor.fetchall()
        for row in tls_version_rows:
            if row['tls_version']:
                enhanced_data_stats["ssl_certificates"]["tls_versions"][row['tls_version']] = row['count']
        
        # Skip loading full enhanced_domains - we have all the stats we need from SQL
        enhanced_domains = []  # Empty - we don't need the full objects anymore
        
        # Use infrastructure_domains for infrastructure stats, enhanced_domains for enhanced analysis
        domains = infrastructure_domains  # For infrastructure processing
        
        # Normalize category names function
        def normalize_category_name(category):
            """Normalize and format category names - remove duplicates, fix casing, remove underscores."""
            if not category:
                return 'Unknown'
            
            cat_lower = category.lower().strip()
            
            category_map = {
                'synthetic_id_kits': 'Synthetic Identity Kits',
                'synthetic identity kits': 'Synthetic Identity Kits',
                'synthetic identity kit': 'Synthetic Identity Kits',
                'synthetic_id_kit': 'Synthetic Identity Kits',
                'synthetic identity': 'Synthetic Identity Kits',
                'synthetic identity vendors': 'Synthetic Identity Kits',
                'synthetic identity service': 'Synthetic Identity Kits',
                'synthetic identity services': 'Synthetic Identity Kits',
                'fake_docs': 'Fake Documents',
                'fake docs': 'Fake Documents',
                'fake documents': 'Fake Documents',
                'document forger': 'Fake Documents',
                'document_forger': 'Fake Documents',
                'kyc bypass / selfie-pass services': 'KYC Bypass Services',
                'kyc_bypass': 'KYC Bypass Services',
                'kyc bypass': 'KYC Bypass Services',
                'kyc_tools': 'KYC Bypass Services',
                'kyc tools': 'KYC Bypass Services',
                'selfie-pass': 'KYC Bypass Services',
                'selfie pass': 'KYC Bypass Services',
                'fraud-as-a-service': 'Fraud as a Service',
                'fraud_as_a_service': 'Fraud as a Service',
                'fraud as a service': 'Fraud as a Service',
                'fraud_tools': 'Fraud Tools',
                'fraud tools': 'Fraud Tools',
            }
            
            if cat_lower in category_map:
                return category_map[cat_lower]
            
            formatted = category.replace('_', ' ').strip()
            words = formatted.split()
            formatted_words = [word.capitalize() for word in words]
            return ' '.join(formatted_words)
        
        # Normalize region names
        def normalize_region_name(region):
            """Normalize region names to combine duplicates."""
            if not region:
                return None
            
            region = region.strip()
            region_lower = region.lower()
            
            # US variations
            if region_lower in ['us', 'usa', 'united states', 'united states of america']:
                return 'US'
            
            # Canada variations
            if region_lower in ['canada', 'ca']:
                return 'Canada'
            
            # US + Canada variations
            if 'us' in region_lower and 'canada' in region_lower:
                return 'US, Canada'
            
            # If no match, capitalize properly
            return ' '.join(word.capitalize() for word in region.split(','))
        
        # Normalize categories from SQL results (apply after function is defined)
        for row in category_rows:
            normalized_cat = normalize_category_name(row['category'])
            categories[normalized_cat] += row['count']
            if normalized_cat not in category_breakdown:
                category_breakdown[normalized_cat] = {'total': 0, 'active': 0}
            category_breakdown[normalized_cat]['total'] += row['count']
            category_breakdown[normalized_cat]['active'] += row['active_count']
        
        # Normalize regions from SQL results
        normalized_regions = Counter()
        for row in region_rows:
            normalized_region = normalize_region_name(row['region'])
            if normalized_region:
                normalized_regions[normalized_region] += row['count']
        regions = normalized_regions  # Use normalized regions
        
        # Service distribution (normalize and combine duplicates)
        def normalize_service_name(service):
            """Normalize service names to combine duplicates and format properly."""
            if not service:
                return None
            
            service = service.strip()
            # Remove underscores and hyphens, normalize apostrophes
            service_clean = service.replace('_', ' ').replace('-', ' ').replace("'", "'").replace("'", "'")
            service_lower = service_clean.lower()
            
            # Normalize multiple spaces
            service_lower = ' '.join(service_lower.split())
            
            # ID variations (check plurals and variations first)
            if service_lower in ['ids', 'id cards', 'identifications', 'fake id', 'fake ids', 'id card', 'identification']:
                return 'ID'
            if service_lower == 'id':
                return 'ID'
            
            # SSN variations
            if service_lower in ['ssn', 'social security number', 'social security']:
                return 'SSN'
            
            # Driver License variations (handle apostrophes, plurals, and case)
            # Normalize apostrophes first - remove all apostrophe variations
            service_lower_no_apos = service_lower.replace("'", "").replace("'", "").replace("'", "")
            # Check if it contains "driver" and "license/licence" (handles "driving license", "driver license", etc.)
            if ('driver' in service_lower_no_apos or 'driving' in service_lower_no_apos) and ('license' in service_lower_no_apos or 'licence' in service_lower_no_apos):
                return 'Driver License'
            # Also check specific variations
            driver_license_variations = [
                'dl', 'driver license', 'drivers license', 'driving license',
                'driver licenses', 'drivers licenses', 'driver', 'drivers',
                "driver's license", "drivers' license", "driver's licence", "drivers' licence"
            ]
            if service_lower in driver_license_variations:
                return 'Driver License'
            
            # Passport variations
            if service_lower in ['passport', 'passport card', 'passports']:
                return 'Passport'
            
            # EIN variations
            if service_lower in ['ein', 'employer identification number']:
                return 'EIN'
            
            # Tax ID variations
            if service_lower in ['tax id', 'tax identification', 'tax id number', 'tin']:
                return 'Tax ID'
            
            # LLC variations
            if service_lower in ['llc', 'limited liability company']:
                return 'LLC'
            
            # LTD variations
            if service_lower in ['ltd', 'limited', 'ltd company']:
                return 'Ltd'
            
            # Credit variations
            if service_lower in ['credit', 'credit card', 'credit report', 'credit score']:
                return 'Credit'
            
            # Bank variations (handle "accounts" separately)
            if service_lower in ['bank', 'bank account', 'bank statement', 'bank accounts', 'accounts']:
                return 'Bank Account'
            
            # Utility variations
            if service_lower in ['utility', 'utility bill', 'utility statement']:
                return 'Utility Bill'
            
            # Phone variations
            if service_lower in ['phone', 'phone number', 'mobile', 'mobile number']:
                return 'Phone Number'
            
            # Email variations
            if service_lower in ['email', 'email address']:
                return 'Email'
            
            # KYC Bypass variations (handle underscores, spacing, and case)
            if service_lower in ['kyc bypass', 'kyc_bypass', 'kyc-bypass', 'know your customer bypass', 'kyc']:
                return 'KYC Bypass'
            
            # Birth Certificate variations
            if service_lower in ['birth certificate', 'birth cert', 'birth certs']:
                return 'Birth Certificate'
            
            # Visa variations
            if service_lower in ['visa', 'visas']:
                return 'Visa'
            
            # Degree variations
            if service_lower in ['degree', 'degrees', 'diploma', 'diplomas']:
                return 'Degree'
            
            # Student Card variations
            if service_lower in ['student card', 'student cards', 'student id', 'student ids']:
                return 'Student Card'
            
            # If no match, capitalize first letter of each word and handle special cases
            words = service.split()
            normalized_words = []
            for word in words:
                word_lower = word.lower()
                # Handle special cases
                if word_lower in ['id', 'ids']:
                    normalized_words.append('ID')
                elif word_lower == 'ssn':
                    normalized_words.append('SSN')
                elif word_lower == 'kyc':
                    normalized_words.append('KYC')
                elif word_lower in ['dl', 'driver', 'drivers']:
                    # If we see "driver" alone, it's likely "Driver License"
                    if len(words) == 1:
                        return 'Driver License'
                    normalized_words.append(word.capitalize())
                else:
                    normalized_words.append(word.capitalize())
            
            result = ' '.join(normalized_words)
            
            # Final cleanup: handle common patterns
            if result.lower() == 'id':
                return 'ID'
            if result.lower() == 'ssn':
                return 'SSN'
            
            return result
        
        service_counts = Counter()
        for service in services_list:
            normalized = normalize_service_name(service)
            if normalized:
                # Final normalization pass: handle any remaining variations
                # Remove apostrophes and check for driver license patterns
                normalized_clean = normalized.replace("'", "").replace("'", "").replace("'", "").lower()
                if ('driver' in normalized_clean or 'driving' in normalized_clean) and ('license' in normalized_clean or 'licence' in normalized_clean):
                    normalized = 'Driver License'
                # Also catch "etc" variations and clean them up
                if normalized.endswith(' Etc') or normalized.endswith(' etc'):
                    normalized = normalized.replace(' Etc', '').replace(' etc', '').strip()
                    # Re-check if it's a driver license after removing "etc"
                    normalized_clean = normalized.replace("'", "").replace("'", "").replace("'", "").lower()
                    if ('driver' in normalized_clean or 'driving' in normalized_clean) and ('license' in normalized_clean or 'licence' in normalized_clean):
                        normalized = 'Driver License'
                service_counts[normalized] += 1
        
        # Infrastructure analysis from PersonaForge domains only (keep separate from ShadowStack)
        hosting_providers = Counter()
        cdns = Counter()
        registrars = Counter()
        payment_processors = Counter()
        
        # Process infrastructure data from lightweight domains list (no JSONB parsing needed)
        for domain in infrastructure_domains:
            host = domain.get('hosting')  # Note: SQL query aliases host_name as 'hosting'
            if host and host.strip() and host.lower() not in ['', 'none', 'unknown', 'n/a']:
                hosting_providers[host.strip()] += 1
            
            cdn = domain.get('cdn')
            if cdn and cdn.strip() and cdn.lower() not in ['', 'none', 'unknown', 'n/a']:
                cdns[cdn.strip()] += 1
            
            registrar = domain.get('registrar')
            if registrar and registrar.strip() and registrar.lower() not in ['', 'none', 'unknown', 'n/a']:
                registrars[registrar.strip()] += 1
            
            payment = domain.get('payment_processor')
            if payment and payment.strip() and payment.lower() not in ['', 'none', 'unknown', 'n/a']:
                # Split multiple payment processors if comma-separated
                for p in payment.split(','):
                    p_clean = p.strip()
                    if p_clean:
                        payment_processors[p_clean] += 1
        
        # Normalize category names function
        def normalize_category_name(category):
            """Normalize and format category names - remove duplicates, fix casing, remove underscores."""
            if not category:
                return 'Unknown'
            
            # Convert to lowercase for comparison
            cat_lower = category.lower().strip()
            
            # Handle duplicates and variations
            category_map = {
                # Synthetic Identity variations
                'synthetic_id_kits': 'Synthetic Identity Kits',
                'synthetic identity kits': 'Synthetic Identity Kits',
                'synthetic identity kit': 'Synthetic Identity Kits',
                'synthetic_id_kit': 'Synthetic Identity Kits',
                'synthetic identity': 'Synthetic Identity Kits',
                'synthetic identity vendors': 'Synthetic Identity Kits',
                'synthetic identity service': 'Synthetic Identity Kits',
                'synthetic identity services': 'Synthetic Identity Kits',
                
                # Fake Documents variations
                'fake_docs': 'Fake Documents',
                'fake docs': 'Fake Documents',
                'fake documents': 'Fake Documents',
                'document forger': 'Fake Documents',
                'document_forger': 'Fake Documents',
                
                # KYC Bypass variations
                'kyc bypass / selfie-pass services': 'KYC Bypass Services',
                'kyc_bypass': 'KYC Bypass Services',
                'kyc bypass': 'KYC Bypass Services',
                'kyc_tools': 'KYC Bypass Services',
                'kyc tools': 'KYC Bypass Services',
                'selfie-pass': 'KYC Bypass Services',
                'selfie pass': 'KYC Bypass Services',
                
                # Fraud variations
                'fraud-as-a-service': 'Fraud as a Service',
                'fraud_as_a_service': 'Fraud as a Service',
                'fraud as a service': 'Fraud as a Service',
                'fraud_tools': 'Fraud Tools',
                'fraud tools': 'Fraud Tools',
            }
            
            # Check if we have a mapping
            if cat_lower in category_map:
                return category_map[cat_lower]
            
            # If no mapping, format the category name properly
            # Replace underscores with spaces, capitalize words
            formatted = category.replace('_', ' ').strip()
            # Capitalize first letter of each word
            words = formatted.split()
            formatted_words = [word.capitalize() for word in words]
            return ' '.join(formatted_words)
        
        # Text analysis of summaries and descriptions (only load text fields for analysis)
        import re
        cursor.execute("""
            SELECT summary, telegram_description
            FROM personaforge_vendors_intel
            WHERE summary IS NOT NULL OR telegram_description IS NOT NULL
        """)
        text_rows = cursor.fetchall()
        all_summaries = [row['summary'] or '' for row in text_rows if row.get('summary')]
        all_descriptions = [row['telegram_description'] or '' for row in text_rows if row.get('telegram_description')]
        all_text = ' '.join(all_summaries + all_descriptions).lower()
        
        # Analyze keywords
        keyword_categories = {
            "quality_claims": ['scannable', 'high quality', 'real', 'authentic', 'verified', 'genuine', 'premium'],
            "verification_bypass": ['pass', 'bypass', 'kyc', 'verification', 'scannable'],
            "payment_methods": ['bitcoin', 'crypto', 'cryptocurrency', 'btc', 'ethereum', 'payment', 'paypal', 'stripe'],
            "operational_claims": ['fast', 'quick', 'delivery', 'shipping', 'discrete', 'privacy', 'secure', 'trusted', 'reliable'],
            "service_features": ['customer', 'clients', 'years', 'experience', 'affordable', 'cheap', 'price']
        }
        
        keyword_analysis = {}
        for category, keywords in keyword_categories.items():
            keyword_analysis[category] = {}
            for keyword in keywords:
                count = all_text.count(keyword)
                if count > 0:
                    keyword_analysis[category][keyword] = count
        
        # Extract customer count claims
        customer_counts = []
        customer_patterns = [
            r'(\d+)\s*customer',
            r'(\d+)\s*client',
            r'serving\s*(\d+)',
            r'(\d+)\s*users?',
            r'over\s*(\d+)',
            r'more than\s*(\d+)'
        ]
        for text in all_summaries + all_descriptions:
            for pattern in customer_patterns:
                matches = re.findall(pattern, text.lower())
                for match in matches:
                    num = int(match)
                    if 10 <= num <= 1000000:  # Reasonable range
                        customer_counts.append(num)
        
        # Service combination analysis (load only services array, not full vendor records)
        cursor.execute("""
            SELECT services
            FROM personaforge_vendors_intel
            WHERE services IS NOT NULL AND array_length(services, 1) > 1
        """)
        service_combinations = []
        for row in cursor.fetchall():
            services = row['services'] or []
            if len(services) > 1:
                normalized_services = [normalize_service_name(s) for s in services if normalize_service_name(s)]
                normalized_services = [s for s in normalized_services if s]  # Remove None values
                for i in range(len(normalized_services)):
                    for j in range(i+1, len(normalized_services)):
                        combo = tuple(sorted([normalized_services[i], normalized_services[j]]))
                        service_combinations.append(combo)
        
        combo_counts = Counter(service_combinations)
        
        # Extract meaningful phrases (2-word combinations)
        phrases = []
        stop_words = {'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by'}
        for text in all_summaries + all_descriptions:
            words = text.lower().split()
            for i in range(len(words) - 1):
                word1, word2 = words[i], words[i+1]
                # Filter out stop words and very short words
                if (len(word1) > 2 and len(word2) > 2 and 
                    word1 not in stop_words and word2 not in stop_words):
                    phrase = f"{word1} {word2}"
                    if len(phrase) > 5:
                        phrases.append(phrase)
        
        phrase_counts = Counter(phrases)
        
        # Enhanced enrichment stats are already calculated via SQL above (no need to load full JSONB)
        
        # DERIVE INSIGHTS FROM ENHANCED DATA
        # Analyze operational sophistication based on enhanced enrichment
        sophistication_analysis = {
            "high_sophistication": 0,  # Valid SSL, strong security headers, professional content
            "medium_sophistication": 0,  # Basic security, some missing headers
            "low_sophistication": 0,  # Self-signed certs, poor security, unprofessional
            "security_posture": {
                "professional": 0,  # High security scores, valid certs, proper headers
                "amateur": 0,  # Poor security, self-signed, missing headers
                "mixed": 0
            },
            "operational_patterns": {
                "legitimate_infrastructure": 0,  # Using legitimate hosting/CDN with proper security
                "minimal_security": 0,  # Basic or no security measures
                "suspicious_patterns": 0  # Self-signed certs, expired, poor security
            }
        }
        
        # Analyze pricing transparency and market positioning
        pricing_analysis = {
            "domains_with_pricing": 0,
            "pricing_ranges": [],
            "transparency_score": 0  # Higher = more transparent pricing
        }
        
        # Analyze content sophistication from NLP
        content_sophistication = {
            "professional_content": 0,  # Positive sentiment, clear entities, structured
            "amateur_content": 0,  # Negative sentiment, unclear, unstructured
            "marketing_focused": 0,  # High positive sentiment, many keywords
            "technical_focused": 0  # Neutral sentiment, technical entities
        }
        
        # Security posture correlation with infrastructure
        security_infrastructure_correlation = {
            "secure_with_legitimate_hosting": 0,
            "insecure_with_legitimate_hosting": 0,
            "secure_with_suspicious_hosting": 0,
            "insecure_with_suspicious_hosting": 0
        }
        
        # Calculate sophistication analysis using SQL aggregations (no need to load full JSONB)
        # Reuse existing cursor (don't create a new one)
        cursor.execute("""
            SELECT 
                COUNT(*) FILTER (
                    WHERE ssl_certificate->>'valid' = 'true' 
                    AND ssl_certificate->>'self_signed' != 'true'
                    AND (security_headers->>'security_score')::numeric >= 50
                    AND (nlp_analysis->'sentiment'->>'polarity')::numeric > 0
                ) as high_sophistication,
                COUNT(*) FILTER (
                    WHERE (ssl_certificate->>'self_signed' = 'true' OR (security_headers->>'security_score')::numeric < 30)
                ) as low_sophistication,
                COUNT(*) FILTER (
                    WHERE ssl_certificate->>'valid' = 'true' 
                    AND ssl_certificate->>'self_signed' != 'true'
                    AND (security_headers->>'security_score')::numeric >= 50
                ) as professional_security,
                COUNT(*) FILTER (
                    WHERE ssl_certificate->>'self_signed' = 'true' OR (security_headers->>'security_score')::numeric < 30
                ) as amateur_security,
                COUNT(*) FILTER (
                    WHERE (host_name IS NOT NULL AND host_name != '' AND host_name != 'unknown')
                    AND (security_headers->>'security_score')::numeric >= 50
                ) as legitimate_infra_secure,
                COUNT(*) FILTER (
                    WHERE extracted_content->'pricing' IS NOT NULL 
                    AND jsonb_array_length(extracted_content->'pricing') > 0
                ) as domains_with_pricing
            FROM personaforge_domain_enrichment
            WHERE enriched_at IS NOT NULL
        """)
        sophistication_row = cursor.fetchone()
        
        if sophistication_row:
            sophistication_analysis["high_sophistication"] = sophistication_row['high_sophistication'] or 0
            sophistication_analysis["low_sophistication"] = sophistication_row['low_sophistication'] or 0
            sophistication_analysis["security_posture"]["professional"] = sophistication_row['professional_security'] or 0
            sophistication_analysis["security_posture"]["amateur"] = sophistication_row['amateur_security'] or 0
            sophistication_analysis["operational_patterns"]["legitimate_infrastructure"] = sophistication_row['legitimate_infra_secure'] or 0
            pricing_analysis["domains_with_pricing"] = sophistication_row['domains_with_pricing'] or 0
        
        # Calculate medium sophistication (total - high - low)
        total_enriched = enhanced_data_stats["web_scraping"]["domains_with_data"]
        if total_enriched > 0:
            sophistication_analysis["medium_sophistication"] = total_enriched - sophistication_analysis["high_sophistication"] - sophistication_analysis["low_sophistication"]
            sophistication_analysis["security_posture"]["mixed"] = total_enriched - sophistication_analysis["security_posture"]["professional"] - sophistication_analysis["security_posture"]["amateur"]
        
        # Calculate percentages
        total_enriched = enhanced_data_stats["web_scraping"]["domains_with_data"]
        if total_enriched > 0:
            sophistication_analysis["high_sophistication_pct"] = round(sophistication_analysis["high_sophistication"] / total_enriched * 100, 1)
            sophistication_analysis["medium_sophistication_pct"] = round(sophistication_analysis["medium_sophistication"] / total_enriched * 100, 1)
            sophistication_analysis["low_sophistication_pct"] = round(sophistication_analysis["low_sophistication"] / total_enriched * 100, 1)
            pricing_analysis["transparency_score"] = round(pricing_analysis["transparency_score"] / total_enriched * 100, 1)
        
        # Key insights derived from enhanced data
        key_insights = {
            "operational_sophistication": {
                "finding": "",
                "implication": ""
            },
            "security_posture": {
                "finding": "",
                "implication": ""
            },
            "content_strategy": {
                "finding": "",
                "implication": ""
            },
            "infrastructure_security_correlation": {
                "finding": "",
                "implication": ""
            }
        }
        
        # Generate insights
        if sophistication_analysis["high_sophistication"] > sophistication_analysis["low_sophistication"]:
            key_insights["operational_sophistication"]["finding"] = f"{sophistication_analysis['high_sophistication_pct']}% of enriched domains show high operational sophistication"
            key_insights["operational_sophistication"]["implication"] = "Vendors are investing in professional infrastructure, suggesting established operations and potential for persistence"
        elif sophistication_analysis["low_sophistication"] > sophistication_analysis["high_sophistication"]:
            key_insights["operational_sophistication"]["finding"] = f"{sophistication_analysis['low_sophistication_pct']}% show low sophistication indicators"
            key_insights["operational_sophistication"]["implication"] = "Many vendors operate with minimal security, potentially indicating rapid deployment or lower concern about detection"
        
        if sophistication_analysis["security_posture"]["professional"] > sophistication_analysis["security_posture"]["amateur"]:
            key_insights["security_posture"]["finding"] = "Majority of domains implement professional security measures"
            key_insights["security_posture"]["implication"] = "Vendors are aware of security best practices, suggesting technical competence and operational maturity"
        else:
            key_insights["security_posture"]["finding"] = "Many domains lack proper security configurations, with missing or weak security headers and SSL/TLS settings"
            key_insights["security_posture"]["implication"] = "Security vulnerabilities may present opportunities for disruption, but also indicate vendors may prioritize speed over security"
        
        if content_sophistication["marketing_focused"] > content_sophistication["technical_focused"]:
            key_insights["content_strategy"]["finding"] = "Vendors emphasize marketing and customer acquisition"
            key_insights["content_strategy"]["implication"] = "Focus on growth suggests active customer acquisition and potential market expansion"
        elif content_sophistication["technical_focused"] > content_sophistication["marketing_focused"]:
            key_insights["content_strategy"]["finding"] = "Vendors focus on technical capabilities"
            key_insights["content_strategy"]["implication"] = "Technical emphasis may indicate specialized services or B2B operations"
        
        if security_infrastructure_correlation["secure_with_legitimate_hosting"] > security_infrastructure_correlation["insecure_with_suspicious_hosting"]:
            key_insights["infrastructure_security_correlation"]["finding"] = "Vendors using legitimate infrastructure also implement proper security"
            key_insights["infrastructure_security_correlation"]["implication"] = "Blending in with legitimate traffic while maintaining security suggests sophisticated operational security practices"
        
        return {
            "total_vendors": total_vendors,
            "active_vendors": active_count,
            "vendors_with_domains": vendors_with_domains,
            "total_domains": len(infrastructure_domains),
            "categories": category_breakdown,
            "platforms": platform_breakdown,
            "regions": dict(regions.most_common(15)),
            "services": dict(service_counts.most_common(30)),
            "infrastructure": {
                "hosting_providers": dict(hosting_providers.most_common(15)) if hosting_providers else {},
                "cdns": dict(cdns.most_common(10)) if cdns else {},
                "registrars": dict(registrars.most_common(15)) if registrars else {},
                "payment_processors": dict(payment_processors.most_common(10)) if payment_processors else {}
            },
            "text_analysis": {
                "total_summaries": len(all_summaries),
                "total_descriptions": len(all_descriptions),
                "keywords": keyword_analysis,
                "customer_count_claims": {
                    "total_mentions": len(customer_counts),
                    "average": round(sum(customer_counts) / len(customer_counts), 0) if customer_counts else 0,
                    "max": max(customer_counts) if customer_counts else 0,
                    "min": min(customer_counts) if customer_counts else 0,
                    "common_values": dict(Counter(customer_counts).most_common(10))
                },
                "service_combinations": {f"{combo[0]} + {combo[1]}": count for combo, count in combo_counts.most_common(15)},
                "common_phrases": dict(phrase_counts.most_common(20))
            },
            "enhanced_enrichment": enhanced_data_stats,
            "sophistication_analysis": sophistication_analysis,
            "pricing_analysis": pricing_analysis,
            "content_sophistication": content_sophistication,
            "security_infrastructure_correlation": security_infrastructure_correlation,
            "key_insights": key_insights,
            "stats": {
                "telegram_percentage": round((platforms.get('Telegram', 0) + platforms.get('Website + Telegram', 0)) / total_vendors * 100, 1) if total_vendors > 0 else 0,
                "website_percentage": round((platforms.get('Website', 0) + platforms.get('Website + Telegram', 0)) / total_vendors * 100, 1) if total_vendors > 0 else 0,
                "top_category": categories.most_common(1)[0][0] if categories else "N/A",
                "top_service": service_counts.most_common(1)[0][0] if service_counts else "N/A",
                "top_region": regions.most_common(1)[0][0] if regions else "N/A"
            }
        }
    except Exception as e:
        app_logger.error(f"Error generating vendor intelligence report data: {e}", exc_info=True)
        import traceback
        traceback.print_exc()
        raise
    finally:
        # Close cursor if it exists
        try:
            if 'cursor' in locals() and cursor:
                cursor.close()
        except:
            pass


@personaforge_bp.route('/api/domains/<domain>', methods=['GET'])
def get_domain_details(domain):
    """Get full enrichment data for a specific domain."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({"error": "Database not available"}), 503
    
    try:
        # Use optimized helper method (fast direct query)
        domain_data = postgres_client.get_domain_by_name(domain)
        
        if not domain_data:
            return jsonify({"error": "Domain not found"}), 404
        
        # Return full enrichment data including all new fields
        return jsonify({
            "domain": domain_data.get('domain'),
            "source": domain_data.get('source'),
            "notes": domain_data.get('notes'),
            "vendor_type": domain_data.get('vendor_type'),
            "vendor_risk_score": domain_data.get('vendor_risk_score', 0),
            "enriched_at": str(domain_data.get('enriched_at')) if domain_data.get('enriched_at') else None,
            # Basic infrastructure
            "ip_address": domain_data.get('ip_address'),
            "ip_addresses": domain_data.get('ip_addresses'),
            "host_name": domain_data.get('host_name'),
            "asn": domain_data.get('asn'),
            "isp": domain_data.get('isp'),
            "cdn": domain_data.get('cdn'),
            "cms": domain_data.get('cms'),
            "payment_processor": domain_data.get('payment_processor'),
            "registrar": domain_data.get('registrar'),
            "creation_date": str(domain_data.get('creation_date')) if domain_data.get('creation_date') else None,
            "expiration_date": str(domain_data.get('expiration_date')) if domain_data.get('expiration_date') else None,
            "name_servers": domain_data.get('name_servers'),
            # Enhanced enrichment data (Phase 1 & 2)
            "web_scraping": domain_data.get('web_scraping'),
            "extracted_content": domain_data.get('extracted_content'),
            "nlp_analysis": domain_data.get('nlp_analysis'),
            # SSL/TLS & Security (Phase 4)
            "ssl_certificate": domain_data.get('ssl_certificate'),
            "certificate_transparency": domain_data.get('certificate_transparency'),
            "security_headers": domain_data.get('security_headers'),
            # Threat intelligence
            "threat_intel": domain_data.get('threat_intel'),
            # Tech stack
            "tech_stack": domain_data.get('tech_stack'),
            "frameworks": domain_data.get('frameworks'),
            "analytics": domain_data.get('analytics'),
            "javascript_frameworks": domain_data.get('javascript_frameworks'),
            "web_servers": domain_data.get('web_servers'),
            "programming_languages": domain_data.get('programming_languages'),
            # Full enrichment data backup
            "enrichment_data": domain_data.get('enrichment_data')
        }), 200
    except Exception as e:
        app_logger.error(f"Error fetching domain details: {e}")
        return jsonify({"error": str(e)}), 500


@personaforge_bp.route('/domains/<domain>')
def domain_detail_page(domain):
    """Render the domain detail page."""
    return render_template('domain_detail.html', domain=domain)


@personaforge_bp.route('/api/vendors-intel/enrich-domains', methods=['POST'])
def enrich_vendor_intel_domains():
    """Enrich all unenriched domains from vendor intelligence."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "error": "PostgreSQL not available"
        }), 500
    
    if not ENRICHMENT_PIPELINE_AVAILABLE or not enrich_domain:
        return jsonify({
            "error": "Enrichment pipeline not available"
        }), 500
    
    try:
        # Get unenriched domains
        unenriched = postgres_client.get_unenriched_vendor_intel_domains()
        
        if not unenriched:
            return jsonify({
                "message": "All domains are already enriched",
                "enriched": 0,
                "total": 0
            }), 200
        
        enriched_count = 0
        errors = []
        
        for domain_data in unenriched:
            domain_id = domain_data['id']
            domain = domain_data['domain']
            
            try:
                enrichment_data = enrich_domain(domain)
                if enrichment_data:
                    postgres_client.insert_enrichment(domain_id, enrichment_data)
                    enriched_count += 1
                else:
                    errors.append(f"{domain}: No data returned")
            except Exception as e:
                errors.append(f"{domain}: {str(e)}")
                continue
        
        return jsonify({
            "message": f"Enriched {enriched_count} domains",
            "enriched": enriched_count,
            "total": len(unenriched),
            "errors": errors[:10]  # Limit errors in response
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error enriching vendor intelligence domains: {e}", exc_info=True)
        return jsonify({
            "error": str(e)
        }), 500


# Auto-discovery disabled - using CSV-provided vendor list only
# If you need to run discovery manually, use the /api/discover endpoint
# import threading
# import time
# 
# def delayed_discovery():
#     """Run initial discovery after app starts."""
#     time.sleep(5)  # Wait for app to fully start
#     run_initial_discovery()
# 
# discovery_thread = threading.Thread(target=delayed_discovery, daemon=True)
# discovery_thread.start()
