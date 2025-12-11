"""
BlackWire Flask Blueprint for consolidated DarkAI platform.

This blueprint handles all BlackWire routes under /blackwire prefix.
"""

import os
import sys
from pathlib import Path
from flask import Blueprint, render_template, jsonify, request, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import csv
import io
from typing import Dict, List

# Add src to path (relative to blueprint location)
# Must happen before any src imports
blueprint_dir = Path(__file__).parent.absolute()
if str(blueprint_dir) not in sys.path:
    sys.path.insert(0, str(blueprint_dir))

# Import Config first (needed by logger)
from src.utils.config import Config

# Import utilities
from src.utils.logger import logger, setup_logger

# Import validation functions with fallbacks
try:
    from src.utils.validation import sanitize_input, validate_phone, validate_domain, validate_wallet, validate_handle
except ImportError:
    # Fallback if validation functions don't exist
    def sanitize_input(text):
        return str(text).strip() if text else ""
    def validate_phone(phone):
        if not phone or len(str(phone)) <= 5:
            return False, "Phone number must be at least 5 characters"
        return True, None
    def validate_domain(domain):
        if not domain or '.' not in str(domain):
            return False, "Domain must contain a dot (.)"
        return True, None
    def validate_wallet(wallet):
        if not wallet or len(str(wallet)) <= 10:
            return False, "Wallet address must be at least 10 characters"
        return True, None
    def validate_handle(handle):
        if not handle or len(str(handle)) == 0:
            return False, "Handle cannot be empty"
        return True, None

try:
    from src.utils.cache import get_cache_stats
except ImportError:
    def get_cache_stats():
        return {"hits": 0, "misses": 0, "size": 0}

# Don't import enrich_entity at top level - import it lazily in functions to avoid module conflicts

# Try to import database clients (optional)
# Ensure we import from BlackWire's directory, not other blueprints
import sys
from pathlib import Path

# Get BlackWire blueprint directory and ensure it's first in path
blueprint_dir = Path(__file__).parent.absolute()
blueprint_path = str(blueprint_dir)

# Remove other blueprint paths to avoid conflicts
for other in ['personaforge', 'shadowstack']:
    other_path = str((blueprint_dir.parent / other).absolute())
    if other_path in sys.path:
        sys.path.remove(other_path)

# Ensure BlackWire's path is first
if blueprint_path in sys.path:
    sys.path.remove(blueprint_path)
sys.path.insert(0, blueprint_path)

# Clear any cached src modules to force fresh import
modules_to_clear = [k for k in list(sys.modules.keys()) if k == 'src' or k.startswith('src.')]
for mod in modules_to_clear:
    del sys.modules[mod]

try:
    from src.database.neo4j_client import Neo4jClient
    # Verify it's the right client by checking for BlackWire-specific methods
    if not hasattr(Neo4jClient, 'create_phone'):
        raise ImportError("Imported Neo4jClient does not have create_phone method - wrong client imported")
    NEO4J_AVAILABLE = True
    logger.info("✅ BlackWire Neo4jClient imported successfully")
except ImportError as e:
    NEO4J_AVAILABLE = False
    Neo4jClient = None
    logger.warning(f"Neo4j client not available: {e}")

try:
    from src.database.postgres_client import PostgresClient
    # Verify it's the right client by checking for BlackWire-specific methods
    if not hasattr(PostgresClient, 'insert_phone'):
        raise ImportError("Imported PostgresClient does not have insert_phone method - wrong client imported")
    POSTGRES_AVAILABLE = True
    logger.info("✅ BlackWire PostgresClient imported successfully")
except ImportError as e:
    POSTGRES_AVAILABLE = False
    PostgresClient = None
    logger.warning(f"PostgreSQL client not available: {e}")

load_dotenv()

# Setup logger
app_logger = setup_logger("blackwire.app", Config.LOG_LEVEL)

# Create blueprint
# Use absolute path for template_folder to ensure Flask can find templates
blueprint_dir = Path(__file__).parent.absolute()
blackwire_bp = Blueprint(
    'blackwire',
    __name__,
    template_folder=str(blueprint_dir / 'templates'),
    static_folder=str(blueprint_dir / 'static'),
    static_url_path='/static'  # Will be prefixed with /blackwire automatically
)

# Initialize database clients
neo4j_client = None
postgres_client = None

if NEO4J_AVAILABLE:
    try:
        neo4j_client = Neo4jClient()
        if neo4j_client and neo4j_client.driver:
            app_logger.info("✅ BlackWire Neo4j client initialized and connected")
        else:
            app_logger.warning("⚠️  BlackWire Neo4j client initialized but not connected")
    except Exception as e:
        app_logger.warning(f"⚠️  BlackWire Neo4j not available: {e}")

if POSTGRES_AVAILABLE:
    try:
        postgres_client = PostgresClient()
        if postgres_client and postgres_client.conn:
            app_logger.info("✅ BlackWire PostgreSQL client initialized")
        else:
            app_logger.warning("⚠️  BlackWire PostgreSQL not available")
    except Exception as e:
        app_logger.warning(f"⚠️  BlackWire PostgreSQL not available: {e}")

# Add Content Security Policy to block browser extension scripts
@blackwire_bp.after_request
def set_security_headers(response):
    """Add security headers including CSP to block extension scripts."""
    # Content Security Policy: Allow self, block external extension scripts
    # Note: Browser extensions will still show warnings, but they're harmless
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://d3js.org; "  # Allow D3.js, blob URLs (for D3), and inline scripts
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "  # Allow inline styles and Google Fonts CSS
        "img-src 'self' data: https:; "  # Allow images from self, data URIs, and HTTPS
        "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; "  # Allow fonts from self, data URIs, and Google Fonts
        "connect-src 'self' https://api.ipapi.com https://api.numlookupapi.com https://www.virustotal.com https://api.etherscan.io https://blockchain.info https://api.blockchair.com https://*.databases.neo4j.io; "  # Allow API connections
        "frame-ancestors 'none'; "  # Prevent clickjacking
        "base-uri 'self'; "  # Restrict base tag
        "form-action 'self'; "  # Restrict form submissions
    )
    response.headers['Content-Security-Policy'] = csp
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

@blackwire_bp.route('/')
def index():
    """Render the landing page."""
    try:
        return render_template('blackwire_index.html')
    except Exception as e:
        app_logger.error(f"Error rendering blackwire_index.html: {e}", exc_info=True)
        # Fallback response
        return f"""
        <html>
        <head><title>BlackWire</title></head>
        <body>
            <h1>BlackWire Intelligence</h1>
            <p>Template rendering error: {str(e)}</p>
            <p>Template path: {blackwire_bp.template_folder}</p>
            <p>Available routes:</p>
            <ul>
                <li><a href="/blackwire/">Home</a></li>
                <li><a href="/blackwire/dashboard">Dashboard</a></li>
                <li><a href="/blackwire/trace">Trace</a></li>
                <li><a href="/blackwire/clusters">Clusters</a></li>
                <li><a href="/blackwire/support">Support</a></li>
            </ul>
        </body>
        </html>
        """, 200


@blackwire_bp.route('/support')
def support():
    """Render the support page."""
    return render_template('support.html')


@blackwire_bp.route('/trace')
def trace_page():
    """Render the tracing interface."""
    return render_template('trace.html')


@blackwire_bp.route('/dashboard')
def dashboard():
    """Render the graph visualization dashboard."""
    return render_template('blackwire_dashboard.html')


@blackwire_bp.route('/clusters')
def clusters():
    """Render the cluster detection page."""
    return render_template('clusters.html')


# API Routes

@blackwire_bp.route('/api/trace', methods=['POST'])
def trace():
    """
    Trace one or more entities (phone, domain, wallet, handle).
    
    POST /api/trace
    Body: {
        "entities": {
            "phone": "+1234567890" (optional),
            "domain": "example.com" (optional),
            "wallet": "1A1zP1..." (optional),
            "handle": "@username" (optional)
        }
    }
    OR (backward compatibility):
    Body: {
        "type": "phone|domain|wallet|handle",
        "value": "value to trace"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Support both new multi-entity format and old single-entity format
    if 'entities' in data:
        # New format: multiple entities
        entities = data['entities']
        if not entities or not isinstance(entities, dict):
            return jsonify({"error": "Invalid entities format"}), 400
        
        # Validate at least one entity provided (handle both strings and arrays)
        entity_values = {}
        for k, v in entities.items():
            if isinstance(v, list):
                # Filter out empty values from array
                filtered = [str(item).strip() for item in v if item and str(item).strip()]
                if filtered:
                    entity_values[k] = filtered if len(filtered) > 1 else filtered[0]
            elif v and str(v).strip():
                entity_values[k] = str(v).strip()
        
        if not entity_values:
            return jsonify({"error": "At least one entity is required"}), 400
        
        try:
            return _trace_multiple_entities(entity_values, postgres_client, neo4j_client)
        except Exception as e:
            app_logger.error(f"Error in _trace_multiple_entities: {e}", exc_info=True)
            return jsonify({"error": f"Tracing failed: {str(e)}"}), 500
    
    elif 'type' in data and 'value' in data:
        # Old format: single entity (backward compatibility)
        entity_type = data['type'].lower().strip()
        value = sanitize_input(data['value'].strip())
        return _trace_single_entity(entity_type, value, postgres_client, neo4j_client)
    
    else:
        return jsonify({"error": "Invalid request format. Provide 'entities' dict or 'type' and 'value'"}), 400


def _trace_single_entity(entity_type: str, value: str, postgres_client, neo4j_client):
    """Trace a single entity (backward compatibility)."""
    if entity_type not in ['phone', 'domain', 'wallet', 'handle']:
        app_logger.warning(f"Invalid entity type: {entity_type}")
        return jsonify({"error": "Invalid type. Must be: phone, domain, wallet, or handle"}), 400
    
    # Validate input format
    if entity_type == "phone":
        is_valid, validation_error = validate_phone(value)
    elif entity_type == "domain":
        is_valid, validation_error = validate_domain(value)
    elif entity_type == "wallet":
        is_valid, validation_error = validate_wallet(value)
    elif entity_type == "handle":
        is_valid, validation_error = validate_handle(value)
    else:
        is_valid = False
        validation_error = "Invalid entity type"
    
    if not is_valid:
        app_logger.warning(f"Validation failed for {entity_type}: {validation_error}")
        return jsonify({
            "error": validation_error or "Invalid input format",
            "type": entity_type,
            "value": value[:50]
        }), 400
    
    try:
        # Import enrich_entity with proper path isolation
        import sys
        from pathlib import Path
        
        # Remove other blueprint paths
        blueprint_dir = Path(__file__).parent.absolute()
        for other in ['personaforge', 'shadowstack']:
            other_path = str((blueprint_dir.parent / other).absolute())
            if other_path in sys.path:
                sys.path.remove(other_path)
        
        # Ensure BlackWire's path is first
        blueprint_path = str(blueprint_dir)
        if blueprint_path in sys.path:
            sys.path.remove(blueprint_path)
        sys.path.insert(0, blueprint_path)
        
        # Clear ALL src modules to force completely fresh import
        modules_to_clear = [k for k in list(sys.modules.keys()) if k == 'src' or k.startswith('src.')]
        for mod in modules_to_clear:
            del sys.modules[mod]
        
        # Now import - should use BlackWire's module
        from src.enrichment.enrichment_pipeline import enrich_entity
        
        app_logger.info(f"Tracing {entity_type}: {value[:50]}...")
        enrichment_result = enrich_entity(entity_type, value)
        
        if not enrichment_result.get("enriched"):
            return jsonify({
                "error": "Enrichment failed",
                "type": entity_type,
                "value": value,
                "errors": enrichment_result.get("errors", [])
            }), 400
        
        enrichment_data = enrichment_result["data"]
        entity_id = _store_entity(entity_type, value, enrichment_data, postgres_client)
        related_entities = _find_and_link_entities(entity_type, value, enrichment_data, postgres_client, neo4j_client)
        
        # For handles, add investigation history (actionable intelligence)
        if entity_type == "handle" and postgres_client:
            investigation_data = _get_handle_investigation_history(value, postgres_client)
            enrichment_data.update(investigation_data)
        
        # Risk assessment (combines internal + external data) - ALWAYS run this
        try:
            from src.enrichment.risk_assessment import assess_risk
            risk_assessment = assess_risk(
                entity_type, value, enrichment_data,
                internal_history=None,  # Will be fetched inside assess_risk
                postgres_client=postgres_client
            )
            enrichment_data["risk_assessment"] = risk_assessment
            app_logger.info(f"✅ Risk assessment completed: {risk_assessment.get('threat_level')} (score: {risk_assessment.get('severity_score')})")
        except Exception as e:
            app_logger.error(f"Risk assessment failed: {e}", exc_info=True)
            # Provide a default risk assessment if it fails
            enrichment_data["risk_assessment"] = {
                "threat_level": "unknown",
                "severity_score": 0,
                "risk_factors": [],
                "actionable_insights": {
                    "summary": "Risk assessment could not be completed. Basic enrichment data is available.",
                    "key_findings": [],
                    "recommended_actions": []
                },
                "error": str(e)
            }
        
        return jsonify({
            "message": f"{entity_type.title()} traced successfully",
            "type": entity_type,
            "value": value,
            "data": enrichment_data,
            "entity_id": entity_id,
            "related_entities": related_entities,
            "status": "success"
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Tracing failed: {str(e)}",
            "type": entity_type,
            "value": value
        }), 500


def _trace_multiple_entities(entities: Dict, postgres_client, neo4j_client):
    """Trace multiple entities and detect relationships between them.
    
    Args:
        entities: Dict where values can be strings or lists of strings
                  e.g., {"phone": "+1234", "domain": ["example.com", "test.com"]}
    """
    try:
        # Import enrich_entity with proper path isolation (will be done in loop)
        # We'll import it inside the loop to ensure fresh import for each entity
        
        results = []
        all_related = []
        relationships = []  # Relationships between the traced entities themselves
        
        # Trace each entity (handle both single values and arrays)
        for entity_type, value in entities.items():
            if entity_type not in ['phone', 'domain', 'wallet', 'handle']:
                continue
            
            # Handle both single values and arrays
            values_to_trace = []
            if isinstance(value, list):
                values_to_trace = [sanitize_input(str(v).strip()) for v in value if v and str(v).strip()]
            else:
                value_str = sanitize_input(str(value).strip())
                if value_str:
                    values_to_trace = [value_str]
            
            # Trace each value
            for value in values_to_trace:
                if not value:
                    continue
                
                # Validate input format
                if entity_type == "phone":
                    is_valid, validation_error = validate_phone(value)
                elif entity_type == "domain":
                    is_valid, validation_error = validate_domain(value)
                elif entity_type == "wallet":
                    is_valid, validation_error = validate_wallet(value)
                elif entity_type == "handle":
                    is_valid, validation_error = validate_handle(value)
                else:
                    continue
                
                if not is_valid:
                    results.append({
                        "type": entity_type,
                        "value": value,
                        "status": "error",
                        "error": validation_error or "Invalid format",
                        "data": {},
                        "related_entities": []
                    })
                    continue
                
                app_logger.info(f"Tracing {entity_type}: {value[:50]}...")
                
                # Import enrich_entity with proper path isolation
                import sys
                from pathlib import Path
                
                # Remove other blueprint paths
                blueprint_dir = Path(__file__).parent.absolute()
                for other in ['personaforge', 'shadowstack']:
                    other_path = str((blueprint_dir.parent / other).absolute())
                    if other_path in sys.path:
                        sys.path.remove(other_path)
                
                # Ensure BlackWire's path is first
                blueprint_path = str(blueprint_dir)
                if blueprint_path in sys.path:
                    sys.path.remove(blueprint_path)
                sys.path.insert(0, blueprint_path)
                
                # Clear ALL src modules to force completely fresh import
                modules_to_clear = [k for k in list(sys.modules.keys()) if k == 'src' or k.startswith('src.')]
                for mod in modules_to_clear:
                    del sys.modules[mod]
                
                # Now import - should use BlackWire's module
                from src.enrichment.enrichment_pipeline import enrich_entity
                
                # Enrich the entity
                enrichment_result = enrich_entity(entity_type, value)
                
                if not enrichment_result.get("enriched"):
                    results.append({
                        "type": entity_type,
                        "value": value,
                        "status": "error",
                        "error": "Enrichment failed",
                        "errors": enrichment_result.get("errors", []),
                        "data": {},
                        "related_entities": []
                    })
                    continue
                
                enrichment_data = enrichment_result["data"]
                
                # Store entity
                entity_id = _store_entity(entity_type, value, enrichment_data, postgres_client)
                
                # Find related entities (from database)
                related_entities = _find_and_link_entities(entity_type, value, enrichment_data, postgres_client, neo4j_client)
                all_related.extend(related_entities)
                
                # Risk assessment (combines internal + external data) - ALWAYS run this
                try:
                    from src.enrichment.risk_assessment import assess_risk
                    risk_assessment = assess_risk(
                        entity_type, value, enrichment_data,
                        internal_history=None,  # Will be fetched inside assess_risk
                        postgres_client=postgres_client
                    )
                    enrichment_data["risk_assessment"] = risk_assessment
                    app_logger.info(f"✅ Risk assessment for {entity_type}: {risk_assessment.get('threat_level')} (score: {risk_assessment.get('severity_score')})")
                except Exception as e:
                    app_logger.error(f"Risk assessment failed for {entity_type}: {e}", exc_info=True)
                    # Provide a default risk assessment if it fails
                    enrichment_data["risk_assessment"] = {
                        "threat_level": "unknown",
                        "severity_score": 0,
                        "risk_factors": [],
                        "actionable_insights": {
                            "summary": "Risk assessment could not be completed. Basic enrichment data is available.",
                            "key_findings": [],
                            "recommended_actions": []
                        },
                        "error": str(e)
                    }
                
                results.append({
                    "type": entity_type,
                    "value": value,
                    "data": enrichment_data,
                    "entity_id": entity_id,
                    "related_entities": related_entities,
                    "status": "success"
                })
        
        # Store investigation session - entities traced together in this request
        # Use a separate transaction to avoid issues if previous operations failed
        import uuid
        session_id = str(uuid.uuid4())
        try:
            _store_investigation_session(session_id, results, postgres_client)
        except Exception as e:
            # Don't fail the whole request if session storage fails
            app_logger.warning(f"Could not store investigation session (non-critical): {e}")
        
        # Detect relationships between the traced entities themselves
        relationships = _detect_cross_entity_relationships(results, neo4j_client, postgres_client)
        
        # Link entities in Neo4j if relationships found
        if relationships:
            _create_relationships_in_neo4j(relationships, neo4j_client)
        
        return jsonify({
            "message": f"Traced {len(results)} entities successfully",
            "results": results,
            "relationships": relationships,
            "session_id": session_id,
            "status": "success"
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Tracing failed: {str(e)}",
            "entities": entities
        }), 500


def _store_entity(entity_type: str, value: str, enrichment_data: Dict, postgres_client):
    """Store entity in PostgreSQL."""
    if not postgres_client or not postgres_client.conn:
        return None
    
    try:
        # Rollback any failed transaction first to ensure clean state
        try:
            postgres_client.conn.rollback()
        except:
            pass  # Ignore rollback errors
        
        if entity_type == "phone":
            return postgres_client.insert_phone(value, enrichment_data)
        elif entity_type == "domain":
            return postgres_client.insert_domain(value, enrichment_data)
        elif entity_type == "wallet":
            return postgres_client.insert_wallet(value, enrichment_data)
        elif entity_type == "handle":
            return postgres_client.insert_handle(value, enrichment_data)
    except Exception as e:
        # Rollback on error to prevent transaction issues
        try:
            postgres_client.conn.rollback()
        except:
            pass
        app_logger.error(f"⚠️  Failed to store {entity_type} in PostgreSQL: {e}", exc_info=True)
    
    return None


def _find_and_link_entities(entity_type: str, value: str, enrichment_data: Dict, postgres_client, neo4j_client):
    """Find related entities and create links in Neo4j."""
    related_entities = []
    
    # Find related entities from database
    if postgres_client and postgres_client.conn:
        try:
            from src.utils.relationship_detector import find_related_entities
            related_entities = find_related_entities(
                entity_type, enrichment_data, postgres_client, neo4j_client
            )
            app_logger.info(f"Found {len(related_entities)} related entities for {entity_type}: {value[:50]}")
        except Exception as e:
            app_logger.debug(f"Error finding related entities: {e}")
    
    # Store and link in Neo4j
    if neo4j_client and neo4j_client.driver:
        try:
            if entity_type == "phone":
                # Store phone using formatted value as primary key to avoid duplicates
                # The formatted value (E.164) is used as the node key
                formatted = enrichment_data.get('formatted') or value
                app_logger.info(f"📞 Storing phone in Neo4j: value={value}, formatted={formatted}")
                try:
                    result = neo4j_client.create_phone(formatted, **enrichment_data)
                    if result:
                        app_logger.info(f"✅ Successfully stored phone {formatted} in Neo4j")
                    else:
                        app_logger.warning(f"⚠️  create_phone returned None for {formatted}")
                except Exception as store_error:
                    app_logger.error(f"❌ Error storing phone {formatted}: {store_error}", exc_info=True)
                    raise  # Re-raise to be caught by outer try/except
                
                # Link to country (use formatted phone as key)
                if enrichment_data.get("country"):
                    try:
                        neo4j_client.create_country(enrichment_data["country"])
                        neo4j_client.link_phone_to_country(formatted, enrichment_data["country"])
                    except Exception as e:
                        app_logger.debug(f"Error linking phone to country: {e}")
                
                if enrichment_data.get("voip_provider"):
                    neo4j_client.create_voip_provider(enrichment_data["voip_provider"])
                    neo4j_client.link_phone_to_voip(formatted, enrichment_data["voip_provider"])
                
                # Link to related phones (use formatted value from related entity data)
                for rel in related_entities:
                    if rel["type"] == "phone" and rel["relationship"] == "same_voip_provider":
                        try:
                            rel_formatted = rel.get("data", {}).get("formatted") or rel["id"]
                            neo4j_client.create_phone(rel_formatted, **rel.get("data", {}))
                            if enrichment_data.get("voip_provider"):
                                neo4j_client.create_voip_provider(enrichment_data["voip_provider"])
                                neo4j_client.link_phone_to_voip(rel_formatted, enrichment_data["voip_provider"])
                        except Exception as e:
                            app_logger.debug(f"Error linking related phone: {e}")
            
            elif entity_type == "domain":
                # Normalize domain before storing (remove protocol, www, paths)
                # Use the normalized domain from enrichment_data if available, otherwise normalize value
                domain_to_store = enrichment_data.get("domain") or value
                # Ensure it's normalized (enrich_domain normalizes it, but double-check)
                import re
                domain_normalized = domain_to_store.strip().lower()
                domain_normalized = re.sub(r'^https?://', '', domain_normalized)
                domain_normalized = re.sub(r'^www\.', '', domain_normalized)
                domain_normalized = domain_normalized.split('/')[0].split('?')[0].split('#')[0].rstrip('/')
                app_logger.info(f"🌐 Storing domain in Neo4j: value={value}, normalized={domain_normalized}")
                try:
                    # Remove 'domain' from enrichment_data to avoid conflict with positional argument
                    domain_props = {k: v for k, v in enrichment_data.items() if k != 'domain'}
                    result = neo4j_client.create_domain(domain_normalized, **domain_props)
                    if result:
                        app_logger.info(f"✅ Successfully stored domain {domain_normalized} in Neo4j")
                    else:
                        app_logger.warning(f"⚠️  create_domain returned None for {domain_normalized}")
                except Exception as store_error:
                    app_logger.error(f"❌ Error storing domain {domain_normalized}: {store_error}", exc_info=True)
                
                # Link to host
                if enrichment_data.get("host_name") or enrichment_data.get("isp"):
                    host_name = enrichment_data.get("host_name") or enrichment_data.get("isp", "Unknown")
                    try:
                        neo4j_client.create_host(
                            host_name,
                            ip=enrichment_data.get("ip_address"),
                            isp=enrichment_data.get("isp")
                        )
                        neo4j_client.link_domain_to_host(domain_normalized, host_name)
                    except Exception as e:
                        app_logger.debug(f"Error linking domain to host: {e}")
                
                # Link to CDN
                if enrichment_data.get("cdn"):
                    try:
                        neo4j_client.create_cdn(enrichment_data["cdn"])
                        neo4j_client.link_domain_to_cdn(domain_normalized, enrichment_data["cdn"])
                    except Exception as e:
                        app_logger.debug(f"Error linking domain to CDN: {e}")
                
                # Link to registrar
                if enrichment_data.get("registrar"):
                    try:
                        neo4j_client.create_registrar(enrichment_data["registrar"])
                        neo4j_client.link_domain_to_registrar(domain_normalized, enrichment_data["registrar"])
                    except Exception as e:
                        app_logger.debug(f"Error linking domain to registrar: {e}")
                
                # Link to CMS
                if enrichment_data.get("cms"):
                    try:
                        neo4j_client.create_cms(enrichment_data["cms"])
                        neo4j_client.link_domain_to_cms(domain_normalized, enrichment_data["cms"])
                    except Exception as e:
                        app_logger.debug(f"Error linking domain to CMS: {e}")
                
                # Skip nameservers - too much detail, clutter the graph
                # Nameservers are stored in enrichment_data but not shown in graph visualization
                
                # Link to related domains
                for rel in related_entities:
                    if rel["type"] == "domain":
                        try:
                            neo4j_client.create_domain(rel["id"], **rel.get("data", {}))
                            neo4j_client.link_domain_to_domain(value, rel["id"])
                        except Exception as e:
                            app_logger.debug(f"Error linking related domain: {e}")
            
            elif entity_type == "wallet":
                app_logger.info(f"💰 Storing wallet in Neo4j: value={value}")
                try:
                    result = neo4j_client.create_wallet(value, **enrichment_data)
                    if result:
                        app_logger.info(f"✅ Successfully stored wallet {value} in Neo4j")
                    else:
                        app_logger.warning(f"⚠️  create_wallet returned None for {value}")
                except Exception as store_error:
                    app_logger.error(f"❌ Error storing wallet {value}: {store_error}", exc_info=True)
                
                # Link to currency
                currency = enrichment_data.get("currency")
                if currency:
                    try:
                        neo4j_client.create_currency(currency)
                        neo4j_client.link_wallet_to_currency(value, currency)
                    except Exception as e:
                        app_logger.debug(f"Error linking wallet to currency: {e}")
                
                # Link to related wallets
                for rel in related_entities:
                    if rel["type"] == "wallet" and rel["relationship"] == "transacted_with":
                        try:
                            neo4j_client.create_wallet(rel["id"], **rel.get("data", {}))
                            neo4j_client.link_wallet_to_wallet(value, rel["id"])
                        except Exception as e:
                            app_logger.debug(f"Error linking related wallet: {e}")
            
            elif entity_type == "handle":
                platform = enrichment_data.get("platform", "Unknown")
                # Normalize handle (remove @ if present for storage, but we'll match both ways in queries)
                handle_normalized = value.strip()
                if handle_normalized.startswith('@'):
                    handle_normalized = handle_normalized[1:]
                app_logger.info(f"📱 Storing handle in Neo4j: value={value}, normalized={handle_normalized}, platform={platform}")
                try:
                    # Remove 'handle' and 'platform' from enrichment_data to avoid conflict with positional arguments
                    handle_props = {k: v for k, v in enrichment_data.items() if k not in ('handle', 'platform')}
                    result = neo4j_client.create_messaging_handle(handle_normalized, platform, **handle_props)
                    if result:
                        app_logger.info(f"✅ Successfully stored handle {handle_normalized} (platform: {platform}) in Neo4j")
                    else:
                        app_logger.warning(f"⚠️  create_messaging_handle returned None for {handle_normalized}")
                except Exception as store_error:
                    app_logger.error(f"❌ Error storing handle {handle_normalized}: {store_error}", exc_info=True)
                
                # Link to platform
                if platform and platform != "Unknown":
                    try:
                        neo4j_client.create_platform(platform)
                        neo4j_client.link_handle_to_platform(value, platform)
                    except Exception as e:
                        app_logger.debug(f"Error linking handle to platform: {e}")
                
                if enrichment_data.get("phone_linked"):
                    neo4j_client.create_phone(enrichment_data["phone_linked"])
                    neo4j_client.link_phone_to_handle(enrichment_data["phone_linked"], value, platform)
            
            app_logger.info(f"✅ Stored {entity_type} ({value}) in Neo4j graph")
        except Exception as e:
            app_logger.error(f"⚠️  Failed to store {entity_type} ({value}) in Neo4j: {e}", exc_info=True)
            # Re-raise to see full traceback in logs
            import traceback
            app_logger.error(f"Full traceback: {traceback.format_exc()}")
    
    return related_entities


def _get_handle_investigation_history(handle: str, postgres_client) -> Dict:
    """
    Get actionable intelligence about a handle:
    - How many times it's been seen in investigations
    - What phone numbers, domains, wallets it appeared with
    - Investigation patterns
    """
    if not postgres_client or not postgres_client.conn:
        return {}
    
    try:
        cursor = postgres_client.conn.cursor()
        
        # Count how many investigation sessions included this handle
        cursor.execute("""
            SELECT COUNT(DISTINCT session_id) as session_count
            FROM investigations
            WHERE entity_type = 'handle' AND entity_value = %s
        """, (handle,))
        result = cursor.fetchone()
        investigation_count = result[0] if result else 0
        
        # Find entities that appeared in the same investigation sessions
        cursor.execute("""
            SELECT DISTINCT i2.entity_type, i2.entity_value, COUNT(DISTINCT i2.session_id) as co_occurrence_count
            FROM investigations i1
            JOIN investigations i2 ON i1.session_id = i2.session_id
            WHERE i1.entity_type = 'handle' AND i1.entity_value = %s
            AND i2.entity_type != 'handle' AND i2.entity_value != %s
            GROUP BY i2.entity_type, i2.entity_value
            ORDER BY co_occurrence_count DESC
            LIMIT 10
        """, (handle, handle))
        
        associated_entities = []
        for row in cursor.fetchall():
            associated_entities.append({
                "type": row[0],
                "value": row[1],
                "co_occurrence_count": row[2],
                "description": f"Appeared together in {row[2]} investigation(s)"
            })
        
        cursor.close()
        
        return {
            "investigation_count": investigation_count,
            "associated_entities": associated_entities,
            "investigation_note": f"Seen in {investigation_count} previous investigation(s)" if investigation_count > 0 else "First time seen"
        }
    except Exception as e:
        app_logger.debug(f"Failed to get handle investigation history: {e}")
        return {}


def _store_investigation_session(session_id: str, results: List[Dict], postgres_client):
    """Store entities traced together in an investigation session."""
    if not postgres_client or not postgres_client.conn:
        return
    
    try:
        # Rollback any failed transaction first
        postgres_client.conn.rollback()
        
        cursor = postgres_client.conn.cursor()
        for result in results:
            if result.get("status") != "success":
                continue
            
            entity_type = result.get("type")
            entity_value = result.get("value")
            
            cursor.execute("""
                INSERT INTO investigations (session_id, entity_type, entity_id, entity_value)
                VALUES (%s, %s, %s, %s)
            """, (session_id, entity_type, entity_value, entity_value))
        
        postgres_client.conn.commit()
        cursor.close()
        app_logger.info(f"Stored investigation session {session_id} with {len(results)} entities")
    except Exception as e:
        postgres_client.conn.rollback()  # Rollback on error
        app_logger.error(f"Failed to store investigation session: {e}", exc_info=True)


def _detect_cross_entity_relationships(results: List[Dict], neo4j_client, postgres_client) -> List[Dict]:
    """Detect relationships between the traced entities themselves."""
    relationships = []
    
    if len(results) < 2:
        return relationships
    
    # Check for relationships based on enrichment data
    for i, result1 in enumerate(results):
        if result1.get("status") != "success":
            continue
        
        data1 = result1.get("data", {})
        type1 = result1.get("type")
        value1 = result1.get("value")
        
        for j, result2 in enumerate(results[i+1:], start=i+1):
            if result2.get("status") != "success":
                continue
            
            data2 = result2.get("data", {})
            type2 = result2.get("type")
            value2 = result2.get("value")
            
            # Check for shared infrastructure (cross-entity)
            # Same country - always check this first for any cross-entity type
            country1 = data1.get("country")
            country2 = data2.get("country")
            
            # Check for any cross-entity relationship when countries match
            if country1 and country2 and country1 == country2 and type1 != type2:
                relationships.append({
                    "from": f"{type1}:{value1}",
                    "to": f"{type2}:{value2}",
                    "relationship": "same_country",
                    "reason": f"Both entities in: {country1}"
                })
            
            # Store that these entities were traced together for future analysis
            # (No relationship created - just logging for pattern detection)
            
            # Same-type relationships
            if type1 == "domain" and type2 == "domain":
                # Same registrar
                if data1.get("registrar") and data2.get("registrar") and data1["registrar"] == data2["registrar"]:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_registrar",
                        "reason": f"Both domains registered through: {data1['registrar']}"
                    })
                
                # Same IP block
                ip1 = data1.get("ip_address", "").split(".")[:3] if data1.get("ip_address") else []
                ip2 = data2.get("ip_address", "").split(".")[:3] if data2.get("ip_address") else []
                if len(ip1) == 3 and len(ip2) == 3 and ip1 == ip2:
                    ip_block = ".".join(ip1)
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_ip_block",
                        "reason": f"Both domains on IP block: {ip_block}.x"
                    })
                
                # Same hosting provider (ISP)
                isp1 = data1.get("isp")
                isp2 = data2.get("isp")
                if isp1 and isp2 and isp1 == isp2:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_hosting",
                        "reason": f"Both domains hosted by: {isp1}"
                    })
                
                # Same ASN
                asn1 = data1.get("asn", "").split()[0] if data1.get("asn") else None
                asn2 = data2.get("asn", "").split()[0] if data2.get("asn") else None
                if asn1 and asn2 and asn1 == asn2:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_asn",
                        "reason": f"Both domains on ASN: {asn1}"
                    })
            
            elif type1 == "phone" and type2 == "phone":
                # Same VOIP provider
                if data1.get("voip_provider") and data2.get("voip_provider") and data1["voip_provider"] == data2["voip_provider"]:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_voip_provider",
                        "reason": f"Both phones use VOIP provider: {data1['voip_provider']}"
                    })
                
                # Same carrier
                carrier1 = data1.get("carrier")
                carrier2 = data2.get("carrier")
                if carrier1 and carrier2 and carrier1 == carrier2:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_carrier",
                        "reason": f"Both phones use carrier: {carrier1}"
                    })
            
            elif type1 == "wallet" and type2 == "wallet":
                # Same currency
                if data1.get("currency") and data2.get("currency") and data1["currency"] == data2["currency"]:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_currency",
                        "reason": f"Both wallets use: {data1['currency']}"
                    })
            
            # Cross-entity relationships
            elif type1 == "phone" and type2 == "domain":
                # Phone and domain in same country
                phone_country = data1.get("country")
                domain_country = data2.get("country")
                if phone_country and domain_country and phone_country == domain_country:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_country",
                        "reason": f"Both entities in: {phone_country}"
                    })
                
                # Domain registrar matches phone carrier pattern (weak signal)
                registrar = data2.get("registrar", "").lower()
                carrier = data1.get("carrier", "").lower()
                if registrar and carrier and any(word in registrar for word in carrier.split() if len(word) > 3):
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "potential_link",
                        "reason": f"Possible connection: phone carrier '{data1.get('carrier')}' and domain registrar '{data2.get('registrar')}'"
                    })
            
            elif type1 == "domain" and type2 == "phone":
                # Phone and domain in same country
                domain_country = data1.get("country")
                phone_country = data2.get("country")
                if domain_country and phone_country and domain_country == phone_country:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "same_country",
                        "reason": f"Both entities in: {domain_country}"
                    })
            
            elif type1 == "domain" and type2 == "wallet":
                # Domain may mention wallet address (check in domain name or registrar info)
                wallet_short = value2[:8]  # First 8 chars of wallet
                domain_lower = value1.lower()
                if wallet_short.lower() in domain_lower:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "mentions_wallet",
                        "reason": f"Domain name contains wallet address fragment"
                    })
            
            elif type1 == "handle" and type2 == "phone":
                if data1.get("phone_linked") == value2:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "linked_to_phone",
                        "reason": f"Handle linked to phone number"
                    })
            
            elif type2 == "handle" and type1 == "phone":
                if data2.get("phone_linked") == value1:
                    relationships.append({
                        "from": f"{type1}:{value1}",
                        "to": f"{type2}:{value2}",
                        "relationship": "linked_to_phone",
                        "reason": f"Handle linked to phone number"
                    })
            
            # Check historical investigations - count how many times these entities were traced together
            # This is meaningful - if entities appear together multiple times, they're likely connected
            if postgres_client and postgres_client.conn:
                try:
                    cursor = postgres_client.conn.cursor()
                    # Get the most recent session ID to exclude current session
                    cursor.execute("SELECT session_id FROM investigations ORDER BY traced_at DESC LIMIT 1")
                    current_session = cursor.fetchone()
                    current_session_id = current_session[0] if current_session else None
                    
                    if current_session_id:
                        # Count how many previous sessions contained both entities
                        cursor.execute("""
                            SELECT COUNT(DISTINCT i1.session_id) as session_count
                            FROM investigations i1
                            JOIN investigations i2 ON i1.session_id = i2.session_id
                            WHERE i1.entity_type = %s AND i1.entity_id = %s
                            AND i2.entity_type = %s AND i2.entity_id = %s
                            AND i1.session_id != %s
                        """, (type1, value1, type2, value2, current_session_id))
                        result = cursor.fetchone()
                        previous_count = result[0] if result and result[0] else 0
                        
                        if previous_count > 0:
                            # Format the count message
                            if previous_count == 1:
                                count_msg = "1 previous investigation"
                            else:
                                count_msg = f"{previous_count} previous investigations"
                            
                            relationships.append({
                                "from": f"{type1}:{value1}",
                                "to": f"{type2}:{value2}",
                                "relationship": "previously_traced_together",
                                "reason": f"These entities were traced together in {count_msg} - likely connected",
                                "previous_count": previous_count
                            })
                    
                    cursor.close()
                except Exception as e:
                    app_logger.debug(f"Error checking historical investigations: {e}")
            
            # Check Neo4j for existing relationships
            if neo4j_client and neo4j_client.driver:
                try:
                    if type1 == "phone" and type2 == "domain":
                        query = """
                        MATCH (p:PhoneNumber {phone: $phone})-[r]-(d:Domain {domain: $domain})
                        RETURN type(r) as rel_type, count(r) as count
                        LIMIT 1
                        """
                        existing = neo4j_client._execute_query(query, {"phone": value1, "domain": value2})
                        if existing and len(existing) > 0:
                            relationships.append({
                                "from": f"{type1}:{value1}",
                                "to": f"{type2}:{value2}",
                                "relationship": "existing_link",
                                "reason": "Previously linked in database"
                            })
                except Exception as e:
                    app_logger.debug(f"Error checking Neo4j relationship: {e}")
    
    return relationships


def _create_relationships_in_neo4j(relationships: List[Dict], neo4j_client):
    """Create relationships in Neo4j between traced entities."""
    if not neo4j_client or not neo4j_client.driver:
        return
    
    for rel in relationships:
        try:
            from_parts = rel["from"].split(":", 1)
            to_parts = rel["to"].split(":", 1)
            
            if len(from_parts) != 2 or len(to_parts) != 2:
                continue
            
            from_type, from_value = from_parts
            to_type, to_value = to_parts
            
            # Create relationships based on relationship type
            if from_type == "domain" and to_type == "domain":
                if rel["relationship"] in ["same_registrar", "same_ip_block", "same_hosting", "same_asn"]:
                    neo4j_client.link_domain_to_domain(from_value, to_value)
            elif from_type == "phone" and to_type == "phone":
                if rel["relationship"] in ["same_voip_provider", "same_carrier"]:
                    # Both phones already linked through VOIP provider node, or create carrier relationship
                    pass
            elif from_type == "phone" and to_type == "domain":
                neo4j_client.link_phone_to_domain(from_value, to_value)
            elif from_type == "domain" and to_type == "phone":
                neo4j_client.link_phone_to_domain(to_value, from_value)
            elif from_type == "domain" and to_type == "wallet":
                if rel["relationship"] == "mentions_wallet":
                    neo4j_client.link_domain_to_wallet(from_value, to_value)
            elif from_type == "handle" and to_type == "phone":
                if rel["relationship"] == "linked_to_phone":
                    platform = rel.get("platform", "Unknown")
                    neo4j_client.link_phone_to_handle(to_value, from_value, platform)
            elif from_type == "phone" and to_type == "handle":
                if rel["relationship"] == "linked_to_phone":
                    platform = rel.get("platform", "Unknown")
                    neo4j_client.link_phone_to_handle(from_value, to_value, platform)
        except Exception as e:
            app_logger.debug(f"Error creating relationship in Neo4j: {e}")


@blackwire_bp.route('/api/graph', methods=['GET'])
def get_graph():
    """Get graph data for visualization."""
    if not neo4j_client:
        app_logger.warning("Graph API called but neo4j_client is None")
        return jsonify({
            "nodes": [],
            "edges": [],
            "message": "Neo4j client not initialized",
            "error": "Neo4j client not initialized. Check Neo4j configuration."
        }), 503
    
    if not neo4j_client.driver:
        app_logger.warning("Graph API called but Neo4j driver not available")
        # Try to reconnect if client exists but driver is None
        try:
            if neo4j_client and hasattr(neo4j_client, '_reconnect_if_needed'):
                app_logger.info("Attempting to reconnect Neo4j...")
                neo4j_client._reconnect_if_needed()
                if neo4j_client.driver:
                    app_logger.info("✅ Neo4j reconnected successfully")
                else:
                    app_logger.warning("Neo4j reconnection failed - driver still None")
        except Exception as reconnect_error:
            app_logger.error(f"Neo4j reconnection attempt failed: {reconnect_error}")
        
        # Check if driver is still None after reconnection attempt
        if not neo4j_client.driver:
            # Check environment variables to provide better error message
            import os
            neo4j_uri = os.getenv("NEO4J_URI") or os.getenv("NEO4J_URI")
            neo4j_user = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER")
            neo4j_pass = os.getenv("NEO4J_PASSWORD")
            
            error_msg = "Neo4j connection not established. "
            if not neo4j_uri:
                error_msg += "NEO4J_URI is not set. "
            if not neo4j_user:
                error_msg += "NEO4J_USERNAME/NEO4J_USER is not set. "
            if not neo4j_pass:
                error_msg += "NEO4J_PASSWORD is not set. "
            if neo4j_uri and neo4j_user and neo4j_pass:
                error_msg += "Environment variables are set but connection failed. Check Neo4j server status and credentials."
            
            return jsonify({
                "nodes": [],
                "edges": [],
                "message": "Neo4j is required for BlackWire graph visualization",
                "error": error_msg
            }), 503  # Return 503 Service Unavailable to indicate required service is missing
    
    try:
        # Check if filtering by specific entities (from current search)
        entity_filter = request.args.get('entities')
        if entity_filter:
            # Parse entity list: "phone:+123,domain:example.com,wallet:0x..."
            entities_to_show = {}
            for entity_str in entity_filter.split(','):
                if ':' in entity_str:
                    entity_type, entity_value = entity_str.split(':', 1)
                    if entity_type not in entities_to_show:
                        entities_to_show[entity_type] = []
                    entities_to_show[entity_type].append(entity_value)
            
            # Get filtered graph data
            graph_data = neo4j_client.get_nodes_and_relationships_for_entities(entities_to_show)
        else:
            # Get all nodes (for dashboard view)
            graph_data = neo4j_client.get_all_nodes_and_relationships()
        
        nodes_count = len(graph_data.get('nodes', []))
        edges_count = len(graph_data.get('edges', []))
        app_logger.info(f"Graph API: Returning {nodes_count} nodes, {edges_count} edges")
        
        if nodes_count == 0:
            app_logger.warning("Graph API: No nodes found in Neo4j. Entities may not have been stored.")
            # Try to count nodes in Neo4j to verify
            try:
                with neo4j_client.driver.session() as count_session:
                    result = count_session.run("MATCH (n) RETURN count(n) as total")
                    total_nodes = result.single()["total"]
                    app_logger.info(f"Neo4j database contains {total_nodes} total nodes")
                    if total_nodes > 0:
                        app_logger.warning(f"Neo4j has {total_nodes} nodes but graph query returned 0. Check query filters.")
            except Exception as count_error:
                app_logger.error(f"Error counting Neo4j nodes: {count_error}")
        
        return jsonify(graph_data), 200
    except Exception as e:
        app_logger.error(f"Graph API error: {e}", exc_info=True)
        import traceback
        app_logger.error(f"Graph API traceback: {traceback.format_exc()}")
        return jsonify({
            "error": str(e),
            "nodes": [],
            "edges": [],
            "message": f"Error fetching graph data: {str(e)}"
        }), 200  # Return empty instead of error


@blackwire_bp.route('/api/clusters', methods=['GET'])
def get_clusters():
    """Get detected clusters."""
    if not postgres_client or not postgres_client.conn:
        return jsonify({
            "clusters": [],
            "message": "PostgreSQL not available"
        }), 200  # Return empty instead of error
    
    try:
        from src.clustering.cluster_detection import detect_clusters
        
        clusters = detect_clusters(postgres_client, neo4j_client)
        return jsonify({"clusters": clusters}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "clusters": [],
            "error": str(e)
        }), 200  # Return empty instead of error


@blackwire_bp.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """Upload CSV file and trace all entities in it."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File must be a CSV"}), 400
    
    try:
        # Read CSV content
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        entities = []
        errors = []
        
        # Parse CSV - support multiple column formats
        for row_num, row in enumerate(csv_input, start=2):  # Start at 2 (row 1 is header)
            try:
                # Try different column name variations
                phone = row.get('phone') or row.get('phone_number') or row.get('phoneNumber') or ''
                domain = row.get('domain') or row.get('url') or row.get('website') or ''
                wallet = row.get('wallet') or row.get('wallet_address') or row.get('crypto_wallet') or ''
                handle = row.get('handle') or row.get('username') or row.get('messaging_handle') or ''
                
                # Clean up values
                phone = phone.strip() if phone else ''
                domain = domain.strip() if domain else ''
                wallet = wallet.strip() if wallet else ''
                handle = handle.strip() if handle else ''
                
                # Remove http://https:// from domains
                if domain:
                    domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0].strip()
                
                # At least one entity must be present
                if phone or domain or wallet or handle:
                    entities.append({
                        'phone': phone,
                        'domain': domain,
                        'wallet': wallet,
                        'handle': handle,
                        'row': row_num,
                        'source': row.get('source', 'CSV Upload'),
                        'notes': row.get('notes', '')
                    })
                else:
                    errors.append(f"Row {row_num}: No valid entities found")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if not entities:
            return jsonify({
                "error": "No valid entities found in CSV",
                "details": errors
            }), 400
        
        # Trace all entities
        results = []
        traced_count = 0
        
        for entity_data in entities:
            try:
                # Build entities dict (remove empty values)
                entities_dict = {}
                if entity_data['phone']:
                    entities_dict['phone'] = entity_data['phone']
                if entity_data['domain']:
                    entities_dict['domain'] = entity_data['domain']
                if entity_data['wallet']:
                    entities_dict['wallet'] = entity_data['wallet']
                if entity_data['handle']:
                    entities_dict['handle'] = entity_data['handle']
                
                if entities_dict:
                    # Use the existing trace endpoint logic
                    result = _trace_multiple_entities(entities_dict, postgres_client, neo4j_client)
                    if result:
                        results.append({
                            'entities': entities_dict,
                            'result': result,
                            'row': entity_data['row']
                        })
                        traced_count += 1
            except Exception as e:
                errors.append(f"Row {entity_data['row']}: Trace failed - {str(e)}")
                app_logger.error(f"Error tracing entities from CSV row {entity_data['row']}: {e}")
        
        return jsonify({
            "message": f"Processed {len(entities)} rows, traced {traced_count} entities",
            "traced": traced_count,
            "total": len(entities),
            "errors": errors,
            "results": results
        }), 200
        
    except Exception as e:
        app_logger.error(f"Error processing CSV: {e}", exc_info=True)
        return jsonify({"error": f"Error processing CSV: {str(e)}"}), 500


@blackwire_bp.route('/api/health', methods=['GET'])
@blackwire_bp.route('/api/ping', methods=['GET'])  # Keep-alive endpoint to prevent Render spin-down
def health():
    """Health check endpoint."""
    from src.utils.rate_limiter import get_api_remaining
    
    cache_stats = get_cache_stats()
    api_status = {
        "ipapi.com": get_api_remaining("ipapi.com"),
        "ip-api.com": get_api_remaining("ip-api.com"),
        "blockchain.info": get_api_remaining("blockchain.info"),
        "blockchair.com": get_api_remaining("blockchair.com")
    }
    
    # Check Neo4j connection status
    neo4j_status = {
        "available": NEO4J_AVAILABLE,
        "client_initialized": neo4j_client is not None,
        "driver_connected": neo4j_client is not None and neo4j_client.driver is not None,
        "connection_test": False,
        "node_count": 0
    }
    
    if neo4j_client and neo4j_client.driver:
        # Try to reconnect if connection is dead (e.g., after Render spin-down)
        # But don't fail the health check if it can't reconnect
        try:
            neo4j_client._reconnect_if_needed()
        except Exception as reconnect_error:
            # Log but don't fail - Neo4j might be temporarily unavailable
            logger.debug(f"Neo4j reconnection check failed (non-critical): {reconnect_error}")
        
        try:
            # Test connection
            with neo4j_client.driver.session() as session:
                result = session.run("RETURN 1 as test")
                list(result)  # Consume result
                neo4j_status["connection_test"] = True
                
                # Count nodes
                count_result = session.run("MATCH (n) RETURN count(n) as total")
                for record in count_result:
                    neo4j_status["node_count"] = record["total"]
                    
                # Sample phone numbers
                phone_result = session.run("MATCH (n:PhoneNumber) RETURN n.phone as phone, n.formatted as formatted LIMIT 5")
                phones = [(r.get("phone", ""), r.get("formatted", "")) for r in phone_result]
                neo4j_status["sample_phones"] = phones
        except Exception as e:
            neo4j_status["error"] = str(e)
    
    return jsonify({
        "status": "ok",
        "neo4j": neo4j_status,
        "postgres": POSTGRES_AVAILABLE and postgres_client is not None,
        "cache": cache_stats,
        "api_quotas": api_status,
        "cache_enabled": Config.CACHE_ENABLED
    }), 200


@blackwire_bp.route('/api/debug/neo4j', methods=['GET'])
def debug_neo4j():
    """Debug endpoint to check Neo4j status and contents."""
    if not neo4j_client:
        return jsonify({
            "error": "Neo4j client not initialized",
            "neo4j_available": NEO4J_AVAILABLE
        }), 200
    
    if not neo4j_client.driver:
        return jsonify({
            "error": "Neo4j driver is None - connection failed",
            "neo4j_available": NEO4J_AVAILABLE,
            "client_initialized": True,
            "driver_connected": False
        }), 200
    
    try:
        with neo4j_client.driver.session() as session:
            # Test connection
            result = session.run("RETURN 1 as test")
            list(result)
            
            # Count all nodes
            count_result = session.run("MATCH (n) RETURN count(n) as total")
            total_nodes = 0
            for record in count_result:
                total_nodes = record["total"]
            
            # Count phone nodes
            phone_count_result = session.run("MATCH (n:PhoneNumber) RETURN count(n) as total")
            phone_count = 0
            for record in phone_count_result:
                phone_count = record["total"]
            
            # Get sample phone numbers
            phone_result = session.run("MATCH (n:PhoneNumber) RETURN n.phone as phone, n.formatted as formatted LIMIT 10")
            sample_phones = [{"phone": r.get("phone", ""), "formatted": r.get("formatted", "")} for r in phone_result]
            
            return jsonify({
                "status": "connected",
                "total_nodes": total_nodes,
                "phone_nodes": phone_count,
                "sample_phones": sample_phones,
                "connection_test": True
            }), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "connection_test": False
        }), 200


