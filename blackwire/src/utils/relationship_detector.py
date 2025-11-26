"""Automatic relationship detection between entities."""

from typing import Dict, List, Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.logger import logger


def find_related_entities(
    entity_type: str,
    enrichment_data: Dict,
    postgres_client=None,
    neo4j_client=None
) -> List[Dict]:
    """
    Find existing entities that are related to the newly traced entity.
    
    Args:
        entity_type: Type of entity ('phone', 'domain', 'wallet', 'handle')
        enrichment_data: Enrichment data for the new entity
        postgres_client: PostgreSQL client to query existing entities
        neo4j_client: Neo4j client to check relationships
    
    Returns:
        List of related entities with relationship type
    """
    related = []
    
    if not postgres_client or not postgres_client.conn:
        return related
    
    try:
        if entity_type == "phone":
            related.extend(_find_related_phones(enrichment_data, postgres_client, neo4j_client))
            related.extend(_find_related_domains_for_phone(enrichment_data, postgres_client, neo4j_client))
            
        elif entity_type == "domain":
            related.extend(_find_related_domains(enrichment_data, postgres_client, neo4j_client))
            related.extend(_find_related_phones_for_domain(enrichment_data, postgres_client, neo4j_client))
            related.extend(_find_related_wallets_for_domain(enrichment_data, postgres_client, neo4j_client))
            
        elif entity_type == "wallet":
            related.extend(_find_related_wallets(enrichment_data, postgres_client, neo4j_client))
            related.extend(_find_related_domains_for_wallet(enrichment_data, postgres_client, neo4j_client))
            
        elif entity_type == "handle":
            related.extend(_find_related_handles(enrichment_data, postgres_client, neo4j_client))
            related.extend(_find_related_phones_for_handle(enrichment_data, postgres_client, neo4j_client))
    
    except Exception as e:
        logger.error(f"Error finding related entities: {e}", exc_info=True)
    
    return related


def _find_related_phones(phone_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find phones related by VOIP provider, country, or similar patterns."""
    related = []
    
    try:
        voip_provider = phone_data.get("voip_provider")
        country_code = phone_data.get("country_code")
        carrier = phone_data.get("carrier")
        
        # Find phones with same VOIP provider
        if voip_provider:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT phone, voip_provider, country_code, carrier
                    FROM phone_numbers
                    WHERE voip_provider = %s AND phone != %s
                    LIMIT 10
                """, (voip_provider, phone_data.get("phone_number")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "phone",
                        "id": row[0],
                        "relationship": "same_voip_provider",
                        "reason": f"Same VOIP provider: {voip_provider}",
                        "data": {"voip_provider": voip_provider}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related phones by VOIP: {e}")
        
        # Find phones with same country code and carrier
        if country_code and carrier:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT phone, country_code, carrier
                    FROM phone_numbers
                    WHERE country_code = %s AND carrier = %s AND phone != %s
                    LIMIT 5
                """, (country_code, carrier, phone_data.get("phone_number")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "phone",
                        "id": row[0],
                        "relationship": "same_carrier",
                        "reason": f"Same carrier: {carrier}",
                        "data": {"country_code": country_code, "carrier": carrier}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related phones by carrier: {e}")
    
    except Exception as e:
        logger.debug(f"Error finding related phones: {e}")
    
    return related


def _find_related_domains(domain_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find domains related by registrar, IP block, or hosting provider."""
    related = []
    
    try:
        registrar = domain_data.get("registrar")
        ip_address = domain_data.get("ip_address")
        isp = domain_data.get("isp")
        asn = domain_data.get("asn")
        
        # Find domains with same registrar
        if registrar:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT domain, registrar
                    FROM domains
                    WHERE registrar = %s AND domain != %s
                    LIMIT 10
                """, (registrar, domain_data.get("domain")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "domain",
                        "id": row[0],
                        "relationship": "same_registrar",
                        "reason": f"Same registrar: {registrar}",
                        "data": {"registrar": registrar}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related domains by registrar: {e}")
        
        # Find domains on same IP block (first 3 octets)
        if ip_address:
            ip_parts = ip_address.split(".")
            if len(ip_parts) == 4:
                ip_block = ".".join(ip_parts[:3])
                try:
                    cursor = postgres_client.conn.cursor()
                    pattern = f"{ip_block}.%"
                    cursor.execute("""
                        SELECT domain, ip_address
                        FROM domains
                        WHERE ip_address LIKE %s AND domain != %s
                        LIMIT 10
                    """, (pattern, domain_data.get("domain")))
                    for row in cursor.fetchall():
                        related.append({
                            "type": "domain",
                            "id": row[0],
                            "relationship": "same_ip_block",
                            "reason": f"Same IP block: {ip_block}.x",
                            "data": {"ip_block": ip_block}
                        })
                    cursor.close()
                except Exception as e:
                    logger.debug(f"Error querying related domains by IP block: {e}")
        
        # Find domains with same hosting provider (ISP/ASN)
        if isp:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT domain, isp
                    FROM domains
                    WHERE isp = %s AND domain != %s
                    LIMIT 5
                """, (isp, domain_data.get("domain")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "domain",
                        "id": row[0],
                        "relationship": "same_hosting",
                        "reason": f"Same hosting provider: {isp}",
                        "data": {"isp": isp}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related domains by ISP: {e}")
    
    except Exception as e:
        logger.debug(f"Error finding related domains: {e}")
    
    return related


def _find_related_wallets(wallet_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find wallets related by currency or transaction patterns."""
    related = []
    
    try:
        currency = wallet_data.get("currency")
        
        # Find wallets with same currency (basic relationship)
        if currency:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT address, currency
                    FROM wallets
                    WHERE currency = %s AND address != %s
                    LIMIT 10
                """, (currency, wallet_data.get("address")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "wallet",
                        "id": row[0],
                        "relationship": "same_currency",
                        "reason": f"Same currency: {currency}",
                        "data": {"currency": currency}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related wallets by currency: {e}")
        
        # Check Neo4j for transaction relationships
        if neo4j_client and neo4j_client.driver:
            try:
                query = """
                MATCH (w:Wallet {address: $address})-[r:TRANSACTED_WITH]-(other:Wallet)
                RETURN other.address as address, count(r) as tx_count
                ORDER BY tx_count DESC
                LIMIT 5
                """
                results = neo4j_client._execute_query(query, {"address": wallet_data.get("address")})
                for record in results:
                    # Neo4j returns Record objects with values() method
                    try:
                        if hasattr(record, 'values'):
                            values = record.values()
                            address = values[0] if len(values) > 0 else None
                            tx_count = values[1] if len(values) > 1 else 0
                        elif isinstance(record, dict):
                            address = record.get('address')
                            tx_count = record.get('tx_count', 0)
                        else:
                            continue
                        
                        if address:
                            related.append({
                                "type": "wallet",
                                "id": address,
                                "relationship": "transacted_with",
                                "reason": f"Transaction relationship ({tx_count} transactions)",
                                "data": {"tx_count": tx_count}
                            })
                    except Exception as e:
                        logger.debug(f"Error parsing wallet transaction record: {e}")
                        continue
            except Exception as e:
                logger.debug(f"Error checking wallet transactions: {e}")
    
    except Exception as e:
        logger.debug(f"Error finding related wallets: {e}")
    
    return related


def _find_related_handles(handle_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find handles related by platform or linked phone."""
    related = []
    
    try:
        platform = handle_data.get("platform")
        phone_linked = handle_data.get("phone_linked")
        
        # Find handles on same platform
        if platform:
            try:
                cursor = postgres_client.conn.cursor()
                cursor.execute("""
                    SELECT handle, platform
                    FROM messaging_handles
                    WHERE platform = %s AND handle != %s
                    LIMIT 5
                """, (platform, handle_data.get("handle")))
                for row in cursor.fetchall():
                    related.append({
                        "type": "handle",
                        "id": f"{row[0]}|{row[1]}",
                        "relationship": "same_platform",
                        "reason": f"Same platform: {platform}",
                        "data": {"platform": platform}
                    })
                cursor.close()
            except Exception as e:
                logger.debug(f"Error querying related handles by platform: {e}")
    
    except Exception as e:
        logger.debug(f"Error finding related handles: {e}")
    
    return related


def _find_related_domains_for_phone(phone_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find domains that might be related to a phone (via shared patterns)."""
    # Could check if phone number appears in domain WHOIS data, etc.
    return []


def _find_related_phones_for_domain(domain_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find phones that might be related to a domain."""
    # Could check if domain registrar info matches phone carrier patterns
    return []


def _find_related_wallets_for_domain(domain_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find wallets that might be related to a domain."""
    # Check Neo4j for existing ASSOCIATED_WITH relationships
    related = []
    
    if neo4j_client and neo4j_client.driver:
        try:
            query = """
            MATCH (d:Domain {domain: $domain})-[r:ASSOCIATED_WITH]-(w:Wallet)
            RETURN w.address as address
            LIMIT 5
            """
            results = neo4j_client._execute_query(query, {"domain": domain_data.get("domain")})
            for record in results:
                try:
                    if hasattr(record, 'values'):
                        values = record.values()
                        address = values[0] if len(values) > 0 else None
                    elif isinstance(record, dict):
                        address = record.get('address')
                    else:
                        continue
                    
                    if address:
                        related.append({
                            "type": "wallet",
                            "id": address,
                            "relationship": "associated_with_domain",
                            "reason": "Previously associated with this domain",
                            "data": {}
                        })
                except Exception as e:
                    logger.debug(f"Error parsing domain-wallet record: {e}")
                    continue
        except Exception as e:
            logger.debug(f"Error checking domain-wallet associations: {e}")
    
    return related


def _find_related_domains_for_wallet(wallet_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find domains associated with a wallet."""
    related = []
    
    if neo4j_client and neo4j_client.driver:
        try:
            query = """
            MATCH (w:Wallet {address: $address})-[r:ASSOCIATED_WITH]-(d:Domain)
            RETURN d.domain as domain
            LIMIT 5
            """
            results = neo4j_client._execute_query(query, {"address": wallet_data.get("address")})
            for record in results:
                try:
                    if hasattr(record, 'values'):
                        values = record.values()
                        domain = values[0] if len(values) > 0 else None
                    elif isinstance(record, dict):
                        domain = record.get('domain')
                    else:
                        continue
                    
                    if domain:
                        related.append({
                            "type": "domain",
                            "id": domain,
                            "relationship": "associated_with_wallet",
                            "reason": "Previously associated with this wallet",
                            "data": {}
                        })
                except Exception as e:
                    logger.debug(f"Error parsing wallet-domain record: {e}")
                    continue
        except Exception as e:
            logger.debug(f"Error checking wallet-domain associations: {e}")
    
    return related


def _find_related_phones_for_handle(handle_data: Dict, postgres_client, neo4j_client) -> List[Dict]:
    """Find phones linked to a handle."""
    related = []
    
    phone_linked = handle_data.get("phone_linked")
    if phone_linked:
        related.append({
            "type": "phone",
            "id": phone_linked,
            "relationship": "linked_to_handle",
            "reason": "Phone number linked to this handle",
            "data": {}
        })
    
    return related

