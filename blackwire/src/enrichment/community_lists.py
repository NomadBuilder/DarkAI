"""Community-maintained lists of scam accounts, phone numbers, and domains."""

import requests
from typing import Dict, List, Set, Optional
from src.utils.logger import logger
from src.utils.cache import get_cached, set_cached
from src.utils.retry import retry_with_backoff


def get_scam_phone_numbers() -> Set[str]:
    """Fetch community-maintained list of scam phone numbers."""
    # Check cache first (update daily)
    cached = get_cached("community_lists", "scam_phones", ttl_hours=24)
    if cached:
        return set(cached)
    
    phone_numbers = set()
    
    # Source 1: GitHub repos with spam/scam number lists
    github_sources = [
        # Add known GitHub repos with scam number lists
        # Example format (if such repos exist):
        # "https://raw.githubusercontent.com/user/repo/main/scam-numbers.txt"
    ]
    
    for url in github_sources:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                for line in response.text.strip().split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Clean phone number
                        phone_clean = ''.join(filter(str.isdigit, line))
                        if len(phone_clean) >= 10:  # Valid phone length
                            phone_numbers.add(phone_clean)
        except Exception as e:
            logger.debug(f"Failed to fetch phone list from {url}: {e}")
    
    # Cache for 24 hours
    if phone_numbers:
        set_cached("community_lists", "scam_phones", list(phone_numbers), ttl_hours=24)
    
    return phone_numbers


def get_scam_instagram_accounts() -> Set[str]:
    """Fetch community-maintained list of scam Instagram accounts."""
    # Check cache first (update daily)
    cached = get_cached("community_lists", "scam_instagram", ttl_hours=24)
    if cached:
        return set(cached)
    
    accounts = set()
    
    # Source 1: GitHub repos with scam account lists
    github_sources = [
        # Add known GitHub repos with scam Instagram account lists
        # Example format (if such repos exist):
        # "https://raw.githubusercontent.com/user/repo/main/scam-instagram.txt"
    ]
    
    for url in github_sources:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                for line in response.text.strip().split('\n'):
                    line = line.strip().lower()
                    if line and not line.startswith('#'):
                        # Remove @ if present
                        if line.startswith('@'):
                            line = line[1:]
                        # Instagram usernames: 1-30 chars, alphanumeric, dots, underscores
                        if 1 <= len(line) <= 30 and all(c.isalnum() or c in '._' for c in line):
                            accounts.add(line)
        except Exception as e:
            logger.debug(f"Failed to fetch Instagram list from {url}: {e}")
    
    # Cache for 24 hours
    if accounts:
        set_cached("community_lists", "scam_instagram", list(accounts), ttl_hours=24)
    
    return accounts


def check_phone_against_community_lists(phone: str) -> Optional[Dict]:
    """Check if phone number is in community scam lists."""
    try:
        # Clean phone number for comparison
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        scam_numbers = get_scam_phone_numbers()
        
        # Check exact match
        if phone_clean in scam_numbers:
            return {
                "found": True,
                "source": "Community scam list",
                "note": "Phone number found in community-maintained scam database"
            }
        
        # Check if last 10 digits match (for numbers with country codes)
        if len(phone_clean) > 10:
            last_10 = phone_clean[-10:]
            if last_10 in scam_numbers:
                return {
                    "found": True,
                    "source": "Community scam list",
                    "note": "Phone number found in community-maintained scam database (partial match)"
                }
    except Exception as e:
        logger.debug(f"Community list phone check error: {e}")
    
    return None


def check_instagram_against_community_lists(username: str) -> Optional[Dict]:
    """Check if Instagram username is in community scam lists."""
    try:
        username_lower = username.lower().strip()
        # Remove @ if present
        if username_lower.startswith('@'):
            username_lower = username_lower[1:]
        
        scam_accounts = get_scam_instagram_accounts()
        
        if username_lower in scam_accounts:
            return {
                "found": True,
                "source": "Community scam list",
                "note": "Instagram account found in community-maintained scam database"
            }
    except Exception as e:
        logger.debug(f"Community list Instagram check error: {e}")
    
    return None

