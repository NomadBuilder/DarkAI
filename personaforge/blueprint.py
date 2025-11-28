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


@personaforge_bp.route('/analytics')
def analytics():
    """Render the analytics page."""
    return render_template('analytics.html')


@personaforge_bp.route('/methodology')
def methodology():
    """Render the methodology page."""
    return render_template('methodology.html')


@personaforge_bp.route('/api/homepage-stats', methods=['GET'])
def get_homepage_stats():
    """Get statistics for the homepage."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "total_domains": 0,
            "total_vendors": 0,
            "high_risk_domains": 0,
            "infrastructure_clusters": 0,
            "top_vendors": []
        }), 200
    
    try:
        # Get basic stats
        domains = postgres_client.get_all_enriched_domains()
        vendors = postgres_client.get_vendors(min_domains=1)
        
        # Count high-risk domains (you can define this based on your criteria)
        high_risk = len([d for d in domains if d.get('vendor_type') == 'high_risk'])
        
        # Get top vendors
        top_vendors = sorted(vendors, key=lambda v: v.get('domain_count', 0), reverse=True)[:10]
        
        # Get infrastructure clusters count
        stats = {
            "total_domains": len(domains),
            "total_vendors": len(vendors),
            "high_risk_domains": high_risk,
            "top_vendors": [
                {
                    "name": v.get('name', 'Unknown'),
                    "domain_count": v.get('domain_count', 0)
                }
                for v in top_vendors
            ],
            "infrastructure_clusters": 0  # Will be updated if clustering works
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
    """Get detected vendor clusters."""
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
                    nodes.append({
                        "id": service_id,
                        "label": "Host",
                        "node_type": "host",
                        "properties": {"name": host_name}
                    })
                    service_counts['host'] += 1
                edges.append({"source": node_id, "target": service_id, "type": "hosted_by"})
            
            # CDN
            if domain.get('cdn'):
                cdn_name = domain.get('cdn')
                service_id = f"cdn_{cdn_name}"
                if service_id not in node_id_map:
                    node_id_map[('cdn', cdn_name)] = service_id
                    nodes.append({
                        "id": service_id,
                        "label": "CDN",
                        "node_type": "cdn",
                        "properties": {"name": cdn_name}
                    })
                    service_counts['cdn'] += 1
                edges.append({"source": node_id, "target": service_id, "type": "uses_cdn"})
            
            # CMS
            if domain.get('cms'):
                cms_name = domain.get('cms')
                service_id = f"cms_{cms_name}"
                if service_id not in node_id_map:
                    node_id_map[('cms', cms_name)] = service_id
                    nodes.append({
                        "id": service_id,
                        "label": "CMS",
                        "node_type": "cms",
                        "properties": {"name": cms_name}
                    })
                    service_counts['cms'] += 1
                edges.append({"source": node_id, "target": service_id, "type": "uses_cms"})
            
            # Registrar
            if domain.get('registrar'):
                registrar_name = domain.get('registrar')
                service_id = f"registrar_{registrar_name}"
                if service_id not in node_id_map:
                    node_id_map[('registrar', registrar_name)] = service_id
                    nodes.append({
                        "id": service_id,
                        "label": "Registrar",
                        "node_type": "registrar",
                        "properties": {"name": registrar_name}
                    })
                    service_counts['registrar'] += 1
                edges.append({"source": node_id, "target": service_id, "type": "registered_with"})
        
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
        # FIRST: Check for dummy data and seed ONCE if needed
        try:
            cursor = postgres_client.conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM personaforge_domains WHERE source = 'DUMMY_DATA_FOR_TESTING'")
            dummy_count = cursor.fetchone()[0]
            cursor.close()
            
            if dummy_count == 0:
                app_logger.info("📊 No dummy data found - seeding dummy data for PersonaForge visualization (one-time only)...")
                
                if SEED_DUMMY_DATA_AVAILABLE and seed_dummy_data:
                    try:
                        count = seed_dummy_data(num_domains=50)
                        app_logger.info(f"✅ Seeded {count} dummy domains for PersonaForge visualization")
                    except Exception as e:
                        app_logger.error(f"Error seeding dummy data: {e}", exc_info=True)
                else:
                    app_logger.warning("seed_dummy_data function not available - skipping dummy data seed")
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
                if not VENDOR_DISCOVERY_AVAILABLE or not discover_all_sources:
                    app_logger.warning("vendor_discovery module not available - skipping initial discovery")
                    return
                
                if not ENRICHMENT_PIPELINE_AVAILABLE or not enrich_domain:
                    app_logger.warning("enrichment_pipeline module not available - skipping initial discovery")
                    return
                
                # Run discovery
                discovery_results = discover_all_sources(limit_per_source=10)
                
                # Combine all discovered domains
                all_domains = set()
                for domains_list in discovery_results.values():
                    all_domains.update(domains_list)
                
                # Enrich and store domains
                for domain in list(all_domains)[:20]:  # Limit to 20 for initial discovery
                    try:
                        domain_id = postgres_client.insert_domain(
                            domain=domain,
                            source="INITIAL_DISCOVERY",
                            notes="Auto-discovered on startup"
                        )
                        enrichment_data = enrich_domain(domain)
                        postgres_client.insert_enrichment(domain_id, enrichment_data)
                    except Exception as e:
                        app_logger.error(f"Error storing discovered domain {domain}: {e}")
                
                app_logger.info(f"✅ Initial discovery complete - added {len(all_domains)} domains")
            except Exception as e:
                app_logger.error(f"Initial discovery failed: {e}", exc_info=True)
    except Exception as e:
        app_logger.error(f"Error in run_initial_discovery: {e}", exc_info=True)


# Run initial discovery in background thread
import threading
import time

def delayed_discovery():
    """Run initial discovery after app starts."""
    time.sleep(5)  # Wait for app to fully start
    run_initial_discovery()

discovery_thread = threading.Thread(target=delayed_discovery, daemon=True)
discovery_thread.start()
