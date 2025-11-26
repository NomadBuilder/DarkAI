"""Main enrichment pipeline that orchestrates all enrichment steps."""

import sys
from pathlib import Path
from typing import Dict, Optional

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.cache import get_cached, set_cached
from src.utils.logger import logger
from src.utils.validation import (
    validate_phone, validate_domain, validate_wallet, validate_handle, sanitize_input
)
from src.utils.config import Config


def enrich_entity(entity_type: str, value: str) -> Dict:
    """
    Enrich an entity (phone, domain, wallet, handle) with all available data sources.
    Includes caching, validation, and error handling.
    
    Args:
        entity_type: Type of entity ('phone', 'domain', 'wallet', 'handle')
        value: The entity value to enrich
        
    Returns:
        Dictionary containing all enrichment data
    """
    # Sanitize input
    value = sanitize_input(value)
    
    result = {
        "entity_type": entity_type,
        "value": value,
        "enriched": False,
        "data": {},
        "errors": []
    }
    
    # Validate entity type
    if entity_type not in ["phone", "domain", "wallet", "handle"]:
        result["errors"].append(f"Unknown entity type: {entity_type}")
        return result
    
    # Validate input format
    is_valid = False
    validation_error = None
    
    if entity_type == "phone":
        is_valid, validation_error = validate_phone(value)
    elif entity_type == "domain":
        is_valid, validation_error = validate_domain(value)
    elif entity_type == "wallet":
        is_valid, validation_error = validate_wallet(value)
    elif entity_type == "handle":
        is_valid, validation_error = validate_handle(value)
    
    if not is_valid:
        result["errors"].append(validation_error or "Invalid input format")
        return result
    
    # Check cache first (if enabled)
    if Config.CACHE_ENABLED:
        cached_data = get_cached(entity_type, value, Config.CACHE_TTL_HOURS)
        if cached_data:
            logger.info(f"Cache hit for {entity_type}: {value[:20]}...")
            result["data"] = cached_data
            result["enriched"] = True
            return result
    
    logger.info(f"Enriching {entity_type}: {value[:50]}...")
    
    try:
        if entity_type == "phone":
            from .phone_enrichment import enrich_phone
            result["data"] = enrich_phone(value)
            result["enriched"] = True
            
        elif entity_type == "domain":
            from .domain_enrichment import enrich_domain
            result["data"] = enrich_domain(value)
            result["enriched"] = True
            
        elif entity_type == "wallet":
            from .wallet_enrichment import enrich_wallet
            result["data"] = enrich_wallet(value)
            result["enriched"] = True
            
        elif entity_type == "handle":
            from .messaging_enrichment import enrich_handle
            result["data"] = enrich_handle(value)
            result["enriched"] = True
        
        # Cache successful enrichment
        if result["enriched"] and Config.CACHE_ENABLED and not result["data"].get("errors"):
            set_cached(entity_type, value, result["data"], Config.CACHE_TTL_HOURS)
            logger.debug(f"Cached enrichment for {entity_type}: {value[:20]}...")
            
    except Exception as e:
        error_msg = str(e)
        result["errors"].append(error_msg)
        logger.error(f"Enrichment failed for {entity_type} {value[:20]}: {error_msg}", exc_info=True)
    
    return result

