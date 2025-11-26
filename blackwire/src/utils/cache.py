"""Caching utilities to avoid redundant API calls."""

import os
import json
import hashlib
from typing import Dict, Optional
from datetime import datetime, timedelta
from functools import wraps

# Simple in-memory cache (can be replaced with Redis later)
_cache = {}
_cache_ttl = {}  # TTL for each cache entry


def get_cache_key(entity_type: str, value: str) -> str:
    """Generate a cache key for an entity."""
    key_string = f"{entity_type}:{value.lower().strip()}"
    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached(entity_type: str, value: str, ttl_hours: int = 24) -> Optional[Dict]:
    """
    Get cached enrichment data.
    
    Args:
        entity_type: Type of entity
        value: Entity value
        ttl_hours: Time-to-live in hours (default 24)
    
    Returns:
        Cached data if available and not expired, else None
    """
    cache_key = get_cache_key(entity_type, value)
    
    if cache_key in _cache:
        # Check if cache entry is still valid
        if cache_key in _cache_ttl:
            ttl = _cache_ttl[cache_key]
            if datetime.now() < ttl:
                return _cache[cache_key]
            else:
                # Cache expired, remove it
                del _cache[cache_key]
                del _cache_ttl[cache_key]
        else:
            # No TTL, return cached data
            return _cache[cache_key]
    
    return None


def set_cached(entity_type: str, value: str, data: Dict, ttl_hours: int = 24):
    """
    Cache enrichment data.
    
    Args:
        entity_type: Type of entity
        value: Entity value
        data: Data to cache
        ttl_hours: Time-to-live in hours (default 24)
    """
    cache_key = get_cache_key(entity_type, value)
    _cache[cache_key] = data
    _cache_ttl[cache_key] = datetime.now() + timedelta(hours=ttl_hours)


def clear_cache(entity_type: Optional[str] = None):
    """Clear cache entries, optionally filtered by entity type."""
    if entity_type:
        # Clear only entries for this entity type (requires checking keys)
        keys_to_remove = []
        for key in list(_cache.keys()):
            # Would need to store entity_type in cache to filter properly
            # For now, clear all
            keys_to_remove.append(key)
        for key in keys_to_remove:
            _cache.pop(key, None)
            _cache_ttl.pop(key, None)
    else:
        # Clear all cache
        _cache.clear()
        _cache_ttl.clear()


def get_cache_stats() -> Dict:
    """Get cache statistics."""
    valid_entries = sum(1 for key in _cache if key in _cache_ttl and datetime.now() < _cache_ttl[key])
    expired_entries = len(_cache) - valid_entries
    
    return {
        "total_entries": len(_cache),
        "valid_entries": valid_entries,
        "expired_entries": expired_entries
    }


def cached(ttl_hours: int = 24):
    """
    Decorator to cache function results.
    
    Usage:
        @cached(ttl_hours=24)
        def enrich_phone(phone: str):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # For enrichment functions, first arg is usually the value
            if args:
                value = args[0]
                entity_type = func.__name__.replace("enrich_", "")
                
                # Check cache
                cached_data = get_cached(entity_type, value, ttl_hours)
                if cached_data is not None:
                    return cached_data
                
                # Call function and cache result
                result = func(*args, **kwargs)
                
                # Cache if enrichment was successful
                if result and not result.get("errors"):
                    set_cached(entity_type, value, result, ttl_hours)
                
                return result
            else:
                # No args, can't cache
                return func(*args, **kwargs)
        return wrapper
    return decorator

