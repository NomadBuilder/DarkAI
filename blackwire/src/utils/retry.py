"""Retry utilities with exponential backoff for API calls."""

import time
import random
from typing import Callable, TypeVar, Any, Optional
from functools import wraps

T = TypeVar('T')


def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retry_on: tuple = (Exception,)
):
    """
    Decorator to retry a function with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds before first retry
        max_delay: Maximum delay in seconds
        exponential_base: Base for exponential backoff
        jitter: Add random jitter to prevent thundering herd
        retry_on: Tuple of exceptions to retry on
    
    Usage:
        @retry_with_backoff(max_retries=3)
        def api_call():
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                
                except retry_on as e:
                    last_exception = e
                    
                    # Don't retry on last attempt
                    if attempt >= max_retries:
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    
                    # Add jitter to prevent thundering herd
                    if jitter:
                        delay = delay * (0.5 + random.random() * 0.5)
                    
                    time.sleep(delay)
            
            # Should never reach here, but just in case
            if last_exception:
                raise last_exception
            
        return wrapper
    return decorator


def retry_api_call(
    func: Callable[..., T],
    max_retries: int = 3,
    base_delay: float = 1.0,
    retry_on_network_errors: bool = True
) -> T:
    """
    Retry an API call with exponential backoff.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retries
        base_delay: Base delay in seconds
        retry_on_network_errors: Whether to retry on network errors
    
    Returns:
        Function result
    """
    import requests
    
    retry_exceptions = (requests.exceptions.Timeout, requests.exceptions.ConnectionError)
    if not retry_on_network_errors:
        retry_exceptions = ()
    
    for attempt in range(max_retries + 1):
        try:
            return func()
        except retry_exceptions as e:
            if attempt >= max_retries:
                raise
            
            delay = base_delay * (2 ** attempt)
            time.sleep(delay)

