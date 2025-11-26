"""Messaging platform handle enrichment with OSINT and cross-platform intelligence."""

import re
import json
import requests
from typing import Dict, Optional, List
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.logger import logger
from src.utils.retry import retry_with_backoff
from src.utils.rate_limiter import check_rate_limit, record_api_request
from src.utils.cache import get_cached, set_cached
from src.enrichment.threat_intel import check_threat_intel


def enrich_handle(handle: str) -> Dict:
    """
    Enrich a messaging platform handle (WhatsApp, Telegram, Instagram, etc.).
    
    Args:
        handle: Messaging handle (phone number, username, etc.)
        
    Returns:
        Dictionary containing enrichment data
    """
    result = {
        "handle": handle,
        "normalized_handle": None,
        "platform": None,
        "detected_platforms": [],
        "possible_platforms": [],
        "is_phone": False,
        "is_username": False,
        "phone_linked": None,
        "profile_data": {},
        "cross_platform_presence": {},
        "profile_exists": {},
        "account_metadata": {},
        "associated_entities": [],
        "threat_intel": {},
        "osint_data": {},
        "errors": []
    }
    
    try:
        handle = handle.strip().lower()
        
        # Detect if it's a phone number
        phone_pattern = re.compile(r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}')
        if phone_pattern.match(handle.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")):
            result["is_phone"] = True
            result["phone_linked"] = handle
            result["detected_platforms"] = ["WhatsApp", "SMS", "Telegram"]
            result["platform"] = "WhatsApp"  # Default for phone numbers
        
        # Detect Instagram username (@username or username)
        elif handle.startswith("@") or (not "@" in handle and len(handle) > 0):
            username = handle.lstrip("@")
            if re.match(r'^[a-zA-Z0-9._]{1,30}$', username):
                result["is_username"] = True
                result["normalized_handle"] = username
                result["detected_platforms"].append("Instagram")
                result["possible_platforms"].extend(["Instagram", "Telegram", "Twitter/X"])
                if not result["platform"]:
                    result["platform"] = "Instagram"
                result["handle"] = username
        
        # Detect Telegram username (@username or t.me/username)
        if handle.startswith("@") or "t.me/" in handle:
            username = handle.replace("t.me/", "").lstrip("@")
            if "Telegram" not in result["detected_platforms"]:
                result["detected_platforms"].append("Telegram")
            if "Telegram" not in result["possible_platforms"]:
                result["possible_platforms"].append("Telegram")
            if not result["platform"]:
                result["platform"] = "Telegram"
            if not result["normalized_handle"]:
                result["normalized_handle"] = username
            result["handle"] = username
        
        # Enhanced enrichment: Cross-platform presence, profile checks, OSINT
        if result.get("normalized_handle"):
            username = result["normalized_handle"]
            
            # Check cross-platform presence
            cross_platform = _check_cross_platform_presence(username)
            result["cross_platform_presence"] = cross_platform
            result["profile_exists"] = {k: v.get("exists", False) for k, v in cross_platform.items()}
            
            # Get profile metadata where available
            profile_metadata = _get_profile_metadata(username, result.get("platform"))
            result["account_metadata"] = profile_metadata
            
            # OSINT data gathering
            osint_data = _gather_osint_data(username)
            result["osint_data"] = osint_data
            
            # Threat intelligence check
            threat_data = _check_handle_threat_intel(username)
            result["threat_intel"] = threat_data
            
            # Check for associated entities in our database
            # This will be populated by app.py with actual database queries
            # For now, leave empty - will be filled by _find_and_link_entities in app.py
            result["associated_entities"] = []
            result["investigation_count"] = 0  # Will be populated by database query
        
        # If it's a phone number, enrich it as a phone too
        if result.get("is_phone") and result.get("phone_linked"):
            try:
                from src.enrichment.phone_enrichment import enrich_phone
                phone_data = enrich_phone(result["phone_linked"])
                result["phone_enrichment"] = phone_data
            except Exception as e:
                logger.debug(f"Phone enrichment failed: {e}")
        
    except Exception as e:
        result["errors"].append(str(e))
        logger.debug(f"Handle enrichment error: {e}")
    
    return result


def _check_cross_platform_presence(username: str) -> Dict:
    """Check if username exists on multiple platforms."""
    results = {}
    
    # Check cache (but use shorter TTL for Instagram since structure changes)
    cached = get_cached("cross_platform", username, ttl_hours=24)  # 1 day (reduced from 7 days)
    if cached:
        return cached
    
    # Instagram check (public profile check)
    try:
        if check_rate_limit("instagram_check"):
            instagram_result = _check_instagram_profile(username)
            results["Instagram"] = instagram_result
            record_api_request("instagram_check")
    except Exception as e:
        logger.debug(f"Instagram check failed: {e}")
    
    # Telegram check (public API)
    try:
        if check_rate_limit("telegram_check"):
            telegram_result = _check_telegram_username(username)
            results["Telegram"] = telegram_result
            record_api_request("telegram_check")
    except Exception as e:
        logger.debug(f"Telegram check failed: {e}")
    
    # Twitter/X check (limited - would need API)
    # TikTok, Snapchat, etc. - limited public access
    
    # Cache results (shorter TTL)
    set_cached("cross_platform", username, results, ttl_hours=24)
    
    return results


@retry_with_backoff(max_retries=2)
def _check_instagram_profile(username: str) -> Dict:
    """
    Check if Instagram profile exists.
    
    Note: Instagram requires JavaScript to load profile data, so we can only
    detect if the profile exists, not extract detailed metadata without a headless browser.
    """
    result = {
        "exists": False,
        "url": f"https://www.instagram.com/{username}/",
        "status": None,
        "is_private": False
    }
    
    try:
        # Try to access profile page (public check)
        url = f"https://www.instagram.com/{username}/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
        response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        
        # 200 = profile exists, 404 = doesn't exist, 301/302 = redirect (might be private)
        if response.status_code == 200:
            result["exists"] = True
            result["status"] = "public"
            
            # Try to detect if profile is private by checking for login redirect indicators
            html_content = response.text.lower()
            if "log in" in html_content or "this account is private" in html_content:
                result["is_private"] = True
                result["status"] = "private"
        elif response.status_code in [301, 302]:
            result["exists"] = True
            result["status"] = "private_or_redirect"
            result["is_private"] = True
                
        elif response.status_code in [301, 302]:
            result["exists"] = True
            result["status"] = "private_or_redirect"
            result["is_private"] = True
        else:
            result["exists"] = False
            result["status"] = "not_found"
            
    except Exception as e:
        logger.debug(f"Instagram profile check error: {e}")
        result["error"] = str(e)
    
    return result


@retry_with_backoff(max_retries=2)
def _check_telegram_username(username: str) -> Dict:
    """Check if Telegram username exists."""
    result = {"exists": False, "url": f"https://t.me/{username}"}
    
    try:
        # Telegram public username check
        url = f"https://t.me/{username}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=False)
        
        # Telegram returns 200 if username exists, 404 if not
        if response.status_code == 200:
            result["exists"] = True
            # Try to extract basic info from page
            content = response.text.lower()
            if "telegram" in content:
                result["status"] = "exists"
        else:
            result["exists"] = False
            result["status"] = "not_found"
    except Exception as e:
        logger.debug(f"Telegram username check error: {e}")
        result["error"] = str(e)
    
    return result


def _get_profile_metadata(username: str, platform: Optional[str] = None) -> Dict:
    """Get profile metadata where available."""
    metadata = {}
    
    if platform == "Instagram":
        metadata["profile_url"] = f"https://www.instagram.com/{username}/"
        # Profile data will be populated by _check_instagram_profile
        # This function is kept for backward compatibility
    
    elif platform == "Telegram":
        metadata["profile_url"] = f"https://t.me/{username}"
        metadata["note"] = "Telegram metadata requires bot API access"
    
    return metadata


def _infer_gender_from_name(first_name: str) -> Optional[str]:
    """Infer gender from first name using common name patterns."""
    if not first_name or len(first_name) < 2:
        return None
    
    first_name_lower = first_name.lower().strip()
    
    # Common male first names (sample - would ideally use a comprehensive database)
    male_names = {
        "john", "james", "robert", "michael", "william", "david", "richard", "joseph", "thomas", "charles",
        "daniel", "matthew", "anthony", "mark", "donald", "steven", "paul", "andrew", "joshua", "kenneth",
        "kevin", "brian", "george", "timothy", "ronald", "jason", "edward", "jeffrey", "ryan", "jacob",
        "gary", "nicholas", "eric", "stephen", "jonathan", "larry", "justin", "scott", "brandon", "benjamin",
        "samuel", "frank", "gregory", "raymond", "alexander", "patrick", "jack", "dennis", "jerry", "tyler",
        "aaron", "jose", "henry", "adam", "douglas", "nathan", "zachary", "peter", "kyle", "noah",
        "ethan", "jeremy", "walter", "christian", "keith", "roger", "terry", "austin", "sean", "gerald",
        "carl", "harold", "dylan", "arthur", "jordan", "bryan", "billy", "joe", "bruce", "albert",
        "willie", "gabriel", "logan", "alan", "juan", "wayne", "roy", "ralph", "randy", "eugene",
        "vincent", "russell", "louis", "philip", "bobby", "johnny", "lawrence", "nicholas", "mason", "lucas"
    }
    
    # Common female first names (sample)
    female_names = {
        "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan", "jessica", "sarah", "karen",
        "nancy", "lisa", "betty", "margaret", "sandra", "ashley", "kimberly", "emily", "donna", "michelle",
        "dorothy", "carol", "amanda", "melissa", "deborah", "stephanie", "rebecca", "sharon", "laura", "cynthia",
        "kathleen", "amy", "angela", "shirley", "anna", "brenda", "pamela", "emma", "nicole", "virginia",
        "maria", "heather", "diane", "julie", "joyce", "victoria", "kelly", "christina", "joan", "evelyn",
        "judith", "megan", "cheryl", "andrea", "hannah", "jacqueline", "martha", "gloria", "teresa", "samantha",
        "janet", "rachel", "catherine", "maria", "frances", "ann", "kathryn", "sara", "janice", "jean",
        "alice", "madison", "doris", "abigail", "julia", "judy", "grace", "denise", "amber", "marilyn",
        "beverly", "danielle", "theresa", "sophia", "marie", "diana", "brittany", "natalie", "florence", "rose",
        "alexis", "kayla", "lauren", "lillian", "audrey", "eva", "lucy", "carolyn", "gabrielle", "avery",
        "chloe", "ella", "aria", "scarlett", "zoey", "penelope", "layla", "nora", "lily", "eleanor"
    }
    
    if first_name_lower in male_names:
        return "male"
    elif first_name_lower in female_names:
        return "female"
    
    # Additional pattern-based inference (less reliable)
    # Some name endings are more common for one gender
    if first_name_lower.endswith(("a", "ia", "ella", "ella", "ette", "ine")):
        return "female"  # Common female endings
    elif first_name_lower.endswith(("er", "on", "en", "an", "el")):
        return "male"  # Common male endings (less reliable)
    
    return None


def _normalize_country(location_text: str) -> Optional[str]:
    """Normalize location text to country name."""
    if not location_text:
        return None
    
    location_lower = location_text.lower().strip()
    
    # Country name mappings (common variations)
    country_mappings = {
        "usa": "United States", "us": "United States", "united states": "United States", "america": "United States",
        "uk": "United Kingdom", "united kingdom": "United Kingdom", "england": "United Kingdom", "britain": "United Kingdom",
        "canada": "Canada", "ca": "Canada",
        "australia": "Australia", "au": "Australia",
        "germany": "Germany", "de": "Germany", "deutschland": "Germany",
        "france": "France", "fr": "France",
        "spain": "Spain", "es": "Spain", "espana": "Spain",
        "italy": "Italy", "it": "Italy", "italia": "Italy",
        "japan": "Japan", "jp": "Japan",
        "south korea": "South Korea", "korea": "South Korea", "kr": "South Korea",
        "china": "China", "cn": "China",
        "india": "India", "in": "India",
        "brazil": "Brazil", "br": "Brazil", "brasil": "Brazil",
        "mexico": "Mexico", "mx": "Mexico",
        "netherlands": "Netherlands", "nl": "Netherlands", "holland": "Netherlands",
        "sweden": "Sweden", "se": "Sweden",
        "norway": "Norway", "no": "Norway",
        "denmark": "Denmark", "dk": "Denmark",
        "poland": "Poland", "pl": "Poland",
        "russia": "Russia", "ru": "Russia",
        "turkey": "Turkey", "tr": "Turkey",
        "saudi arabia": "Saudi Arabia", "sa": "Saudi Arabia",
        "uae": "United Arab Emirates", "united arab emirates": "United Arab Emirates",
        "south africa": "South Africa", "za": "South Africa",
        "nigeria": "Nigeria", "ng": "Nigeria",
        "egypt": "Egypt", "eg": "Egypt",
        "kenya": "Kenya", "ke": "Kenya",
        "philippines": "Philippines", "ph": "Philippines",
        "thailand": "Thailand", "th": "Thailand",
        "vietnam": "Vietnam", "vn": "Vietnam",
        "indonesia": "Indonesia", "id": "Indonesia",
        "malaysia": "Malaysia", "my": "Malaysia",
        "singapore": "Singapore", "sg": "Singapore"
    }
    
    # Direct match
    if location_lower in country_mappings:
        return country_mappings[location_lower]
    
    # Partial match (location contains country name)
    for key, country in country_mappings.items():
        if key in location_lower or location_lower in key:
            return country
    
    # Return original if no match found (might be a city)
    return location_text


def _gather_osint_data(username: str) -> Dict:
    """Gather OSINT data about the username."""
    osint = {
        "username_patterns": [],
        "similar_usernames": [],
        "potential_connections": []
    }
    
    # Analyze username patterns
    if re.match(r'^[a-z0-9]+$', username):
        osint["username_patterns"].append("alphanumeric_only")
    if re.match(r'^[a-z]+[0-9]+$', username):
        osint["username_patterns"].append("letters_then_numbers")
    if len(username) < 6:
        osint["username_patterns"].append("short_username")
    if len(username) > 20:
        osint["username_patterns"].append("long_username")
    
    # Check for common patterns that might indicate automated accounts
    if re.search(r'(bot|admin|support|official)', username, re.I):
        osint["potential_connections"].append("may_be_official_account")
    
    return osint


def _check_handle_threat_intel(username: str) -> Dict:
    """Check handle against threat intelligence sources."""
    # Check if username appears in known scam/abuse databases
    # This would integrate with threat intel feeds
    
    threat_data = {
        "is_suspicious": False,
        "threat_sources": [],
        "notes": []
    }
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r'^[0-9]{6,}$',  # All numbers
        r'^[a-z]{1,3}[0-9]{4,}$',  # Very short prefix + numbers
    ]
    
    for pattern in suspicious_patterns:
        if re.match(pattern, username):
            threat_data["is_suspicious"] = True
            threat_data["notes"].append("Matches suspicious username pattern")
            break
    
    return threat_data


def _find_associated_entities(username: str) -> List[Dict]:
    """
    Find entities in our database associated with this handle from previous investigations.
    This is the actionable intelligence - shows what this handle has been linked to.
    """
    associated = []
    
    try:
        # Import here to avoid circular dependencies
        from src.database.postgres_client import PostgresClient
        
        # Get database connection (if available)
        # Note: This requires the database to be initialized
        # For now, we'll return structure but actual queries need postgres_client instance
        # The app.py will call this with proper database access
        
        # Structure for what we'd find:
        # - Phone numbers that appeared in same investigation sessions
        # - Domains that appeared with this handle
        # - Wallets that appeared with this handle  
        # - Investigation count (how many times seen)
        # - Other handles from same investigations
        
    except Exception as e:
        logger.debug(f"Could not query associated entities: {e}")
    
    return associated

