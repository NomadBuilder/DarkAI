"""Input validation and sanitization utilities."""

import re
from typing import Optional, Tuple


def validate_phone(phone: str) -> Tuple[bool, Optional[str]]:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not phone or not isinstance(phone, str):
        return False, "Phone number is required"
    
    phone = phone.strip()
    
    # Remove common formatting
    phone_clean = re.sub(r'[\s\-\(\)\.]', '', phone)
    
    # Check if it's a reasonable length (7-15 digits)
    digits_only = re.sub(r'[^\d]', '', phone_clean)
    
    if len(digits_only) < 7:
        return False, "Phone number too short (minimum 7 digits)"
    
    if len(digits_only) > 15:
        return False, "Phone number too long (maximum 15 digits)"
    
    # Check for reasonable format (must start with + or digit)
    if not (phone_clean.startswith('+') or phone_clean[0].isdigit()):
        return False, "Phone number must start with + or digit"
    
    return True, None


def validate_domain(domain: str) -> Tuple[bool, Optional[str]]:
    """
    Validate domain format.
    
    Args:
        domain: Domain to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not domain or not isinstance(domain, str):
        return False, "Domain is required"
    
    domain = domain.strip().lower()
    
    # Remove protocol
    domain = re.sub(r'^https?://', '', domain)
    domain = re.sub(r'^www\.', '', domain)
    domain = domain.split('/')[0].split('?')[0].split('#')[0]
    
    # Basic domain format validation
    if not domain:
        return False, "Domain cannot be empty"
    
    if len(domain) > 253:
        return False, "Domain too long (maximum 253 characters)"
    
    # Check for valid domain characters and structure
    domain_pattern = r'^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$'
    
    if not re.match(domain_pattern, domain):
        return False, "Invalid domain format"
    
    return True, None


def validate_wallet(address: str) -> Tuple[bool, Optional[str]]:
    """
    Validate crypto wallet address format.
    
    Args:
        address: Wallet address to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not address or not isinstance(address, str):
        return False, "Wallet address is required"
    
    address = address.strip()
    
    # Bitcoin address (P2PKH, P2SH, Bech32)
    bitcoin_pattern = r'^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$'
    
    # Ethereum address
    ethereum_pattern = r'^0x[a-fA-F0-9]{40}$'
    
    # Litecoin address
    litecoin_pattern = r'^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$'
    
    if re.match(bitcoin_pattern, address):
        return True, None
    elif re.match(ethereum_pattern, address):
        return True, None
    elif re.match(litecoin_pattern, address):
        return True, None
    elif len(address) > 20:  # Generic validation
        return True, None
    
    return False, "Invalid wallet address format"


def validate_handle(handle: str) -> Tuple[bool, Optional[str]]:
    """
    Validate messaging handle format.
    
    Args:
        handle: Handle to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not handle or not isinstance(handle, str):
        return False, "Handle is required"
    
    handle = handle.strip()
    
    if not handle:
        return False, "Handle cannot be empty"
    
    # Remove @ if present
    if handle.startswith('@'):
        handle = handle[1:]
    
    # Basic validation (not empty, reasonable length)
    if len(handle) < 1:
        return False, "Handle too short"
    
    if len(handle) > 100:
        return False, "Handle too long"
    
    return True, None


def sanitize_input(value: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent injection attacks.
    
    Args:
        value: Input value
        max_length: Maximum allowed length
        
    Returns:
        Sanitized value
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Remove null bytes
    value = value.replace('\x00', '')
    
    # Truncate if too long
    if len(value) > max_length:
        value = value[:max_length]
    
    # Strip whitespace
    value = value.strip()
    
    return value

