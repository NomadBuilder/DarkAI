"""Centralized ShadowStack module imports to avoid duplication."""

import sys
from pathlib import Path
from typing import Optional, Callable, Any


def get_shadowstack_path() -> Optional[Path]:
    """Get the path to ShadowStack's enrichment directory."""
    current_file = Path(__file__)
    shadowstack_path = current_file.parent.parent.parent.parent / 'shadowstack' / 'src' / 'enrichment'
    return shadowstack_path if shadowstack_path.exists() else None


def import_shadowstack_module(module_name: str, function_name: str) -> tuple[bool, Optional[Callable]]:
    """
    Import a function from ShadowStack's enrichment modules.
    
    Args:
        module_name: Module name (e.g., 'tech_stack_enrichment')
        function_name: Function name to import
        
    Returns:
        Tuple of (success: bool, function: Optional[Callable])
    """
    shadowstack_path = get_shadowstack_path()
    if not shadowstack_path:
        return False, None
    
    try:
        # Add ShadowStack's parent directory to path
        shadowstack_parent = shadowstack_path.parent.parent
        if str(shadowstack_parent) not in sys.path:
            sys.path.insert(0, str(shadowstack_parent))
        
        # Import the module
        full_module_name = f"shadowstack.src.enrichment.{module_name}"
        module = __import__(full_module_name, fromlist=[function_name])
        function = getattr(module, function_name)
        return True, function
    except (ImportError, AttributeError) as e:
        return False, None
    except Exception:
        return False, None


# Cache for imported functions
_import_cache: dict[str, tuple[bool, Optional[Callable]]] = {}


def get_shadowstack_function(module_name: str, function_name: str, fallback: Optional[Callable] = None) -> Callable:
    """
    Get a ShadowStack function with caching and fallback.
    
    Args:
        module_name: Module name
        function_name: Function name
        fallback: Fallback function if import fails
        
    Returns:
        The imported function or fallback
    """
    cache_key = f"{module_name}.{function_name}"
    
    if cache_key not in _import_cache:
        success, func = import_shadowstack_module(module_name, function_name)
        _import_cache[cache_key] = (success, func)
    
    success, func = _import_cache[cache_key]
    
    if success and func:
        return func
    
    # Return fallback or no-op function
    if fallback:
        return fallback
    
    def noop(*args, **kwargs):
        return {}
    
    return noop

