"""Parallel processing utilities for enrichment pipeline."""

import concurrent.futures
from typing import Dict, List, Callable, Any, Optional
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)


def parallel_execute(
    tasks: List[Dict[str, Any]],
    max_workers: int = 5,
    timeout: Optional[float] = None
) -> Dict[str, Any]:
    """
    Execute multiple enrichment tasks in parallel.
    
    Args:
        tasks: List of task dictionaries with:
            - 'name': str - Task identifier
            - 'func': Callable - Function to execute
            - 'args': tuple - Positional arguments
            - 'kwargs': dict - Keyword arguments
        max_workers: Maximum number of parallel workers
        timeout: Maximum time to wait for all tasks (seconds)
    
    Returns:
        Dictionary mapping task names to results (or None if failed)
    """
    results = {}
    
    if not tasks:
        return results
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_task = {}
        for task in tasks:
            name = task.get('name', 'unknown')
            func = task.get('func')
            args = task.get('args', ())
            kwargs = task.get('kwargs', {})
            
            if func:
                future = executor.submit(func, *args, **kwargs)
                future_to_task[future] = name
        
        # Collect results with timeout
        try:
            for future in concurrent.futures.as_completed(future_to_task, timeout=timeout):
                task_name = future_to_task[future]
                try:
                    result = future.result()
                    results[task_name] = result
                except Exception as e:
                    logger.warning(f"Task '{task_name}' failed: {e}")
                    results[task_name] = None
        except concurrent.futures.TimeoutError:
            logger.warning(f"Parallel execution timed out after {timeout} seconds")
            # Cancel remaining tasks
            for future in future_to_task:
                future.cancel()
    
    return results


def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    max_delay: float = 60.0,
    exceptions: tuple = (Exception,)
):
    """
    Decorator for retrying functions with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        backoff_factor: Multiplier for delay after each retry
        max_delay: Maximum delay between retries
        exceptions: Tuple of exceptions to catch and retry on
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_retries:
                        logger.warning(
                            f"{func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}): {e}. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                        delay = min(delay * backoff_factor, max_delay)
                    else:
                        logger.error(f"{func.__name__} failed after {max_retries + 1} attempts: {e}")
                        raise
            
            if last_exception:
                raise last_exception
        
        return wrapper
    return decorator


def rate_limit(calls_per_second: float = 1.0):
    """
    Decorator to rate limit function calls.
    
    Args:
        calls_per_second: Maximum number of calls per second
    """
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = min_interval - elapsed
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            ret = func(*args, **kwargs)
            last_called[0] = time.time()
            return ret
        return wrapper
    return decorator


def timeout_handler(timeout_seconds: float = 30.0):
    """
    Decorator to add timeout to function calls.
    
    Args:
        timeout_seconds: Maximum execution time in seconds
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(func, *args, **kwargs)
                try:
                    return future.result(timeout=timeout_seconds)
                except concurrent.futures.TimeoutError:
                    logger.warning(f"{func.__name__} timed out after {timeout_seconds}s")
                    raise TimeoutError(f"{func.__name__} exceeded timeout of {timeout_seconds}s")
        return wrapper
    return decorator


def group_parallel_tasks(enrichment_steps: List[Dict]) -> List[List[Dict]]:
    """
    Group enrichment steps into batches that can run in parallel.
    
    Steps that depend on previous results cannot run in parallel.
    
    Args:
        enrichment_steps: List of step dictionaries with:
            - 'name': str
            - 'func': Callable
            - 'args': tuple
            - 'kwargs': dict
            - 'depends_on': List[str] - Names of steps this depends on
    
    Returns:
        List of batches, where each batch can run in parallel
    """
    if not enrichment_steps:
        return []
    
    # Create dependency graph
    step_names = {step['name'] for step in enrichment_steps}
    completed = set()
    batches = []
    
    while len(completed) < len(step_names):
        # Find steps that can run now (all dependencies completed)
        ready_steps = []
        for step in enrichment_steps:
            if step['name'] in completed:
                continue
            
            depends_on = step.get('depends_on', [])
            if all(dep in completed for dep in depends_on):
                ready_steps.append(step)
        
        if not ready_steps:
            # Circular dependency or missing dependency
            remaining = step_names - completed
            logger.warning(f"Could not resolve dependencies for: {remaining}")
            break
        
        batches.append(ready_steps)
        completed.update(step['name'] for step in ready_steps)
    
    return batches

