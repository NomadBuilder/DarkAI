"""
Validation utilities for vendor intelligence data.
"""

import re
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse


def validate_vendor_name(name: str) -> Tuple[bool, Optional[str]]:
    """Validate vendor name."""
    if not name or not name.strip():
        return False, "Vendor name is required"
    
    name = name.strip()
    
    if len(name) < 2:
        return False, "Vendor name must be at least 2 characters"
    
    if len(name) > 255:
        return False, "Vendor name must be less than 255 characters"
    
    # Check for potentially malicious content
    if re.search(r'[<>"\']', name):
        return False, "Vendor name contains invalid characters"
    
    return True, None


def validate_category(category: str) -> Tuple[bool, Optional[str]]:
    """Validate category."""
    if not category:
        return True, None  # Category is optional
    
    valid_categories = [
        'kyc_tools', 'fake_docs', 'synthetic_id_kits', 'fraud_tools',
        'KYC bypass / selfie-pass services', 'Synthetic Identity Vendors',
        'Synthetic Identity Service', 'synthetic_id_kits', 'fraud-as-a-service'
    ]
    
    # Normalize category
    category_lower = category.lower().strip()
    
    # Check if it matches any valid category (case-insensitive)
    for valid_cat in valid_categories:
        if category_lower == valid_cat.lower():
            return True, None
    
    # If not in list, still allow it but log
    if len(category) > 100:
        return False, "Category must be less than 100 characters"
    
    return True, None


def validate_platform_type(platform: str) -> Tuple[bool, Optional[str]]:
    """Validate platform type."""
    if not platform:
        return True, None  # Optional
    
    valid_platforms = ['Telegram', 'Website', 'Website + Telegram']
    
    if platform not in valid_platforms:
        return False, f"Platform must be one of: {', '.join(valid_platforms)}"
    
    return True, None


def validate_region(region: str) -> Tuple[bool, Optional[str]]:
    """Validate region."""
    if not region:
        return True, None  # Optional
    
    if len(region) > 100:
        return False, "Region must be less than 100 characters"
    
    return True, None


def validate_telegram_channel(channel: str) -> Tuple[bool, Optional[str]]:
    """Validate Telegram channel URL."""
    if not channel:
        return True, None  # Optional
    
    channel = channel.strip()
    
    # Must be a valid URL
    try:
        parsed = urlparse(channel)
        if not parsed.scheme or not parsed.netloc:
            return False, "Telegram channel must be a valid URL"
        
        # Should be telegram URL
        if 't.me' not in parsed.netloc and 'telegram.org' not in parsed.netloc:
            return False, "Telegram channel must be a valid Telegram URL"
    except Exception:
        return False, "Telegram channel must be a valid URL"
    
    return True, None


def validate_services(services: List[str]) -> Tuple[bool, Optional[str]]:
    """Validate services list."""
    if not services:
        return True, None  # Optional
    
    if not isinstance(services, list):
        return False, "Services must be a list"
    
    if len(services) > 100:
        return False, "Too many services (max 100)"
    
    for service in services:
        if not isinstance(service, str):
            return False, "Each service must be a string"
        
        if len(service) > 200:
            return False, f"Service '{service[:50]}...' is too long (max 200 characters)"
        
        if not service.strip():
            return False, "Service cannot be empty"
    
    return True, None


def validate_summary(summary: str) -> Tuple[bool, Optional[str]]:
    """Validate summary text."""
    if not summary:
        return True, None  # Optional
    
    if len(summary) > 5000:
        return False, "Summary must be less than 5000 characters"
    
    return True, None


def validate_vendor_data(vendor_data: Dict) -> Tuple[bool, Optional[str], List[str]]:
    """
    Validate complete vendor intelligence data.
    
    Returns:
        (is_valid, error_message, warnings)
    """
    errors = []
    warnings = []
    
    # Required fields
    vendor_name = vendor_data.get('vendor_name') or vendor_data.get('title', '')
    is_valid, error = validate_vendor_name(vendor_name)
    if not is_valid:
        errors.append(error)
    
    # Optional fields with validation
    if vendor_data.get('category'):
        is_valid, error = validate_category(vendor_data['category'])
        if not is_valid:
            errors.append(f"Category: {error}")
    
    if vendor_data.get('platform_type'):
        is_valid, error = validate_platform_type(vendor_data['platform_type'])
        if not is_valid:
            errors.append(f"Platform: {error}")
    
    if vendor_data.get('region'):
        is_valid, error = validate_region(vendor_data['region'])
        if not is_valid:
            errors.append(f"Region: {error}")
    
    if vendor_data.get('telegram_channel'):
        is_valid, error = validate_telegram_channel(vendor_data['telegram_channel'])
        if not is_valid:
            errors.append(f"Telegram channel: {error}")
    
    if vendor_data.get('services'):
        is_valid, error = validate_services(vendor_data['services'])
        if not is_valid:
            errors.append(f"Services: {error}")
    
    if vendor_data.get('summary'):
        is_valid, error = validate_summary(vendor_data['summary'])
        if not is_valid:
            errors.append(f"Summary: {error}")
    
    # Warnings for missing recommended fields
    if not vendor_data.get('category'):
        warnings.append("Category is recommended")
    
    if not vendor_data.get('services') or len(vendor_data.get('services', [])) == 0:
        warnings.append("Services list is recommended")
    
    if errors:
        return False, "; ".join(errors), warnings
    
    return True, None, warnings


def sanitize_vendor_data(vendor_data: Dict) -> Dict:
    """Sanitize vendor data by trimming and cleaning."""
    sanitized = {}
    
    for key, value in vendor_data.items():
        if isinstance(value, str):
            # Trim whitespace
            value = value.strip()
            # Remove null bytes
            value = value.replace('\x00', '')
            # Limit length for text fields
            if key in ['summary', 'telegram_description']:
                value = value[:5000]
            elif key in ['vendor_name', 'title']:
                value = value[:255]
            elif key in ['category', 'region', 'platform_type']:
                value = value[:100]
        elif isinstance(value, list):
            # Sanitize list items
            value = [str(item).strip()[:200] for item in value if item]
        elif value is None:
            value = None
        else:
            value = value
        
        sanitized[key] = value
    
    return sanitized

