"""Crypto wallet enrichment."""

import os
import re
import requests
from typing import Dict, Optional
from dotenv import load_dotenv

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.rate_limiter import check_rate_limit, record_api_request
from src.utils.retry import retry_with_backoff
from src.utils.logger import logger
from src.utils.config import Config

load_dotenv()


def enrich_wallet(wallet_address: str) -> Dict:
    """
    Enrich a crypto wallet address with blockchain data.
    
    Args:
        wallet_address: Crypto wallet address (Bitcoin, Ethereum, etc.)
        
    Returns:
        Dictionary containing enrichment data
    """
    result = {
        "wallet_address": wallet_address,
        "currency": None,
        "is_valid": False,
        "transaction_count": None,
        "first_seen": None,
        "last_seen": None,
        "balance": None,
        "associated_addresses": [],
        "errors": []
    }
    
    try:
        wallet_address = wallet_address.strip()
        
        # Detect currency based on address format
        # Bitcoin addresses start with 1, 3, or bc1
        if re.match(r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$', wallet_address) or wallet_address.startswith('bc1'):
            result["currency"] = "Bitcoin"
            result["is_valid"] = True
            
        # Ethereum addresses start with 0x and are 40 hex characters
        elif re.match(r'^0x[a-fA-F0-9]{40}$', wallet_address):
            result["currency"] = "Ethereum"
            result["is_valid"] = True
            
        # Litecoin addresses start with L or M
        elif re.match(r'^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$', wallet_address):
            result["currency"] = "Litecoin"
            result["is_valid"] = True
            
        # Basic validation for other formats
        elif len(wallet_address) > 20:
            result["currency"] = "Unknown"
            result["is_valid"] = True  # Assume valid if format is reasonable
        
        # Blockchain API lookups (FREE APIs)
        if result["is_valid"]:
            currency = result.get("currency", "")
            if currency == "Bitcoin":
                enrich_bitcoin_wallet(wallet_address, result)
            elif currency == "Ethereum":
                enrich_ethereum_wallet(wallet_address, result)
            elif currency in ["Litecoin", "Bitcoin Cash"]:
                enrich_blockchair_wallet(wallet_address, result, currency)
        
    except Exception as e:
        result["errors"].append(str(e))
        import traceback
        traceback.print_exc()
    
    return result


@retry_with_backoff(max_retries=2, base_delay=1.0)
def enrich_bitcoin_wallet(address: str, result: Dict):
    """Enrich Bitcoin wallet using blockchain.info API (FREE, no key required)."""
    # Check rate limit
    if not check_rate_limit("blockchain.info"):
        logger.debug(f"blockchain.info rate limited for {address[:10]}...")
        return
    
    try:
        # blockchain.info API - free, no key required
        url = f"https://blockchain.info/rawaddr/{address}?limit=0"  # limit=0 to get full tx count
        response = requests.get(url, timeout=Config.API_TIMEOUT_SECONDS)
        record_api_request("blockchain.info")
        
        if response.status_code == 200:
            data = response.json()
            result["transaction_count"] = data.get("n_tx", 0)
            result["balance"] = data.get("final_balance", 0) / 100000000  # Convert satoshis to BTC
            result["total_received"] = data.get("total_received", 0) / 100000000
            result["total_sent"] = data.get("total_sent", 0) / 100000000
            
            # Get first and last seen from transactions
            if data.get("txs"):
                txs = data["txs"]
                if txs:
                    result["last_seen"] = str(txs[0].get("time", ""))  # Most recent first
                    result["first_seen"] = str(txs[-1].get("time", ""))  # Oldest last
    
    except Exception as e:
        error_msg = str(e)
        logger.debug(f"Bitcoin lookup failed for {address[:10]}...: {error_msg}")
        result["errors"].append(f"Bitcoin lookup failed: {error_msg}")


def enrich_ethereum_wallet(address: str, result: Dict):
    """Enrich Ethereum wallet using blockchair.com API (FREE tier: 100 req/hour)."""
    try:
        # blockchair.com API - free tier: 100 requests/hour, no key required for basic
        url = f"https://api.blockchair.com/ethereum/dashboards/address/{address}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            address_data = data.get("data", {}).get(address, {})
            
            if address_data:
                result["transaction_count"] = address_data.get("address", {}).get("transaction_count", 0)
                # Balance in Wei, convert to ETH
                balance_wei = address_data.get("address", {}).get("balance", 0)
                result["balance"] = int(balance_wei) / 1e18 if balance_wei else 0
        
        # Fallback: Try Etherscan API (requires free API key)
        api_key = os.getenv("ETHERSCAN_API_KEY", "")
        if api_key:
            url = f"https://api.etherscan.io/api?module=account&action=balance&address={address}&tag=latest&apikey={api_key}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "1":
                    balance_wei = int(data.get("result", 0))
                    result["balance"] = balance_wei / 1e18
    
    except Exception as e:
        result["errors"].append(f"Ethereum lookup failed: {str(e)}")


def enrich_blockchair_wallet(address: str, result: Dict, currency: str):
    """Enrich wallet using blockchair.com multi-currency API (FREE tier)."""
    try:
        currency_map = {
            "Litecoin": "litecoin",
            "Bitcoin Cash": "bitcoin-cash"
        }
        
        currency_code = currency_map.get(currency, "bitcoin")
        url = f"https://api.blockchair.com/{currency_code}/dashboards/address/{address}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            address_data = data.get("data", {}).get(address, {})
            
            if address_data:
                addr_info = address_data.get("address", {})
                result["transaction_count"] = addr_info.get("transaction_count", 0)
                # Balance handling - convert from satoshis/smallest unit
                balance = addr_info.get("balance", 0)
                if balance:
                    # Most cryptocurrencies use 8 decimal places
                    result["balance"] = int(balance) / 1e8
    
    except Exception as e:
        result["errors"].append(f"Blockchair lookup failed: {str(e)}")

