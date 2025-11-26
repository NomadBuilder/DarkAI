"""Risk assessment and severity scoring for entities."""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils.logger import logger
from src.enrichment.threat_intel import check_threat_intel


def assess_risk(
    entity_type: str,
    value: str,
    enrichment_data: Dict,
    internal_history: Optional[Dict] = None,
    postgres_client=None
) -> Dict:
    """
    Assess risk level and provide actionable intelligence.
    Combines internal data with external threat intelligence.
    
    Args:
        entity_type: Type of entity (phone, domain, wallet, handle)
        value: Entity value
        enrichment_data: Enrichment data for the entity
        internal_history: Internal investigation history (if available)
        postgres_client: Database client for querying internal data
    
    Returns:
        Dict with risk assessment, severity score, and actionable insights
    """
    risk_factors = []
    severity_score = 0  # 0-100, higher = more severe
    threat_level = "low"
    
    # 1. External Threat Intelligence (works even with no internal data)
    external_threats = _assess_external_threats(entity_type, value, enrichment_data)
    if external_threats.get("is_malicious") or external_threats.get("threat_level") in ["medium", "high"]:
        severity_score += 40
        risk_factors.append({
            "type": "external_threat",
            "severity": "high",
            "message": f"Flagged by {len(external_threats.get('threat_sources', []))} threat intelligence source(s)",
            "sources": external_threats.get("threat_sources", [])
        })
    
    # 2. Infrastructure Patterns (indicators of abuse)
    infrastructure_risk = _assess_infrastructure_patterns(entity_type, enrichment_data)
    severity_score += infrastructure_risk.get("score", 0)
    if infrastructure_risk.get("score", 0) > 0:
        risk_factors.extend(infrastructure_risk.get("factors", []))
    
    # 3. Internal Investigation History (if available)
    if internal_history:
        internal_risk = _assess_internal_history(internal_history)
        severity_score += internal_risk.get("score", 0)
        if internal_risk.get("score", 0) > 0:
            risk_factors.extend(internal_risk.get("factors", []))
    elif postgres_client:
        # Try to get internal history from database
        try:
            internal_history = _get_internal_history(entity_type, value, postgres_client)
            if internal_history:
                internal_risk = _assess_internal_history(internal_history)
                severity_score += internal_risk.get("score", 0)
                if internal_risk.get("score", 0) > 0:
                    risk_factors.extend(internal_risk.get("factors", []))
        except Exception as e:
            logger.debug(f"Could not get internal history: {e}")
    
    # 4. Pattern Analysis (time-based, coordination indicators)
    pattern_risk = _assess_patterns(entity_type, enrichment_data, postgres_client)
    severity_score += pattern_risk.get("score", 0)
    if pattern_risk.get("score", 0) > 0:
        risk_factors.extend(pattern_risk.get("factors", []))
    
    # Cap severity score at 100
    severity_score = min(100, severity_score)
    
    # Determine threat level
    if severity_score >= 75:
        threat_level = "critical"
    elif severity_score >= 50:
        threat_level = "high"
    elif severity_score >= 25:
        threat_level = "medium"
    else:
        threat_level = "low"
    
    # Generate actionable insights
    insights = _generate_actionable_insights(
        entity_type, value, enrichment_data, risk_factors, threat_level, severity_score
    )
    
    return {
        "threat_level": threat_level,
        "severity_score": severity_score,
        "risk_factors": risk_factors,
        "actionable_insights": insights,
        "external_threats": external_threats,
        "infrastructure_risk": infrastructure_risk,
        "pattern_risk": pattern_risk
    }


def _assess_external_threats(entity_type: str, value: str, enrichment_data: Dict) -> Dict:
    """Assess threats from external intelligence sources."""
    threats = {
        "is_malicious": False,
        "threat_level": "clean",
        "threat_sources": [],
        "details": {}
    }
    
    if entity_type == "domain":
        threat_data = check_threat_intel(domain=value)
        threats.update(threat_data)
    elif entity_type == "phone":
        # Check phone against spam/scam databases
        # Most require paid APIs, but we can check patterns
        pass
    elif entity_type == "wallet":
        # Check wallet against known scam wallets
        # Could integrate with blockchain analysis services
        pass
    
    elif entity_type == "handle":
        # Check handle against suspicious patterns
        # Most external services require paid APIs, but we can check patterns
        handle = value.lower()
        suspicious_patterns = [
            r'^[0-9]{6,}$',  # All numbers (burner account pattern)
            r'^[a-z]{1,3}[0-9]{4,}$',  # Very short prefix + numbers (auto-generated)
        ]
        import re
        for pattern in suspicious_patterns:
            if re.match(pattern, handle):
                threats["threat_level"] = "low"
                threats["threat_sources"].append("Suspicious username pattern detected")
                break
    
    return threats


def _assess_infrastructure_patterns(entity_type: str, enrichment_data: Dict) -> Dict:
    """Assess risk based on infrastructure patterns (burner domains, VOIP, etc.)."""
    factors = []
    score = 0
    
    if entity_type == "phone":
        # VOIP numbers are higher risk (easier to get, harder to trace)
        if enrichment_data.get("is_voip"):
            score += 15
            factors.append({
                "type": "voip_number",
                "severity": "medium",
                "message": "VOIP number - commonly used in scams (easy to obtain, hard to trace)"
            })
        
        # Unknown carrier or suspicious carrier
        carrier = (enrichment_data.get("carrier") or "").lower()
        if "unknown" in carrier or not carrier:
            score += 5
            factors.append({
                "type": "unknown_carrier",
                "severity": "low",
                "message": "Carrier information unavailable - may be burner number"
            })
    
    elif entity_type == "domain":
        # Shortlinks are suspicious
        if enrichment_data.get("is_shortlink"):
            score += 20
            factors.append({
                "type": "shortlink",
                "severity": "high",
                "message": "Shortlink domain - commonly used to hide malicious URLs"
            })
        
        # Recently created domains (burner domains)
        creation_date = enrichment_data.get("creation_date")
        if creation_date:
            try:
                created = datetime.strptime(creation_date, "%Y-%m-%d")
                days_old = (datetime.now() - created).days
                if days_old < 90:
                    score += 15
                    factors.append({
                        "type": "recent_domain",
                        "severity": "medium",
                        "message": f"Domain created {days_old} days ago - may be burner domain"
                    })
            except:
                pass
        
        # CDN/proxy hiding (Cloudflare, etc.)
        if enrichment_data.get("cdn"):
            score += 5
            factors.append({
                "type": "cdn_proxy",
                "severity": "low",
                "message": "Using CDN/proxy - may be hiding actual server location"
            })
    
    elif entity_type == "handle":
        # Suspicious handle patterns
        handle = enrichment_data.get("normalized_handle") or enrichment_data.get("handle", "").lower()
        
        # All numbers (burner account pattern)
        if handle and handle.isdigit() and len(handle) >= 6:
            score += 10
            factors.append({
                "type": "numeric_handle",
                "severity": "medium",
                "message": "Handle is all numbers - common pattern for burner accounts"
            })
        
        # Very short prefix + numbers (auto-generated pattern)
        import re
        if handle and re.match(r'^[a-z]{1,3}[0-9]{4,}$', handle):
            score += 8
            factors.append({
                "type": "auto_generated_pattern",
                "severity": "medium",
                "message": "Handle matches auto-generated account pattern"
            })
        
        # Recently created account (if we have that data)
        # This would require platform API access
        
        # Cross-platform presence (if handle exists on multiple platforms, may be legitimate)
        # If handle only exists on one platform, could be burner
        cross_platform = enrichment_data.get("cross_platform_presence", {})
        platforms_with_handle = sum(1 for exists in cross_platform.values() if exists)
        if platforms_with_handle == 0:
            score += 5
            factors.append({
                "type": "no_cross_platform",
                "severity": "low",
                "message": "Handle not found on multiple platforms - may be burner account"
            })
    
    elif entity_type == "wallet":
        # New wallet with transactions (may be receiving scam payments)
        if enrichment_data.get("transaction_count", 0) > 0:
            score += 10
            factors.append({
                "type": "active_wallet",
                "severity": "medium",
                "message": f"Wallet has {enrichment_data.get('transaction_count')} transactions - may be receiving payments"
            })
    
    return {
        "score": score,
        "factors": factors
    }


def _assess_internal_history(internal_history: Dict) -> Dict:
    """Assess risk based on internal investigation history."""
    factors = []
    score = 0
    
    investigation_count = internal_history.get("investigation_count", 0)
    associated_entities = internal_history.get("associated_entities", [])
    
    if investigation_count > 0:
        # More investigations = higher risk
        if investigation_count >= 10:
            score += 30
            factors.append({
                "type": "frequent_appearance",
                "severity": "critical",
                "message": f"⚠️ CRITICAL: This entity has appeared in {investigation_count} previous investigation(s) - likely part of organized operation"
            })
        elif investigation_count >= 5:
            score += 20
            factors.append({
                "type": "frequent_appearance",
                "severity": "high",
                "message": f"⚠️ HIGH RISK: This entity has appeared in {investigation_count} previous investigation(s)"
            })
        elif investigation_count >= 2:
            score += 10
            factors.append({
                "type": "frequent_appearance",
                "severity": "medium",
                "message": f"This entity has appeared in {investigation_count} previous investigation(s)"
            })
    
    # Multiple associated entities = coordination
    if len(associated_entities) >= 5:
        score += 15
        factors.append({
            "type": "coordinated_operation",
            "severity": "high",
            "message": f"Linked to {len(associated_entities)} other entities - indicates coordinated operation"
        })
    elif len(associated_entities) >= 2:
        score += 8
        factors.append({
            "type": "coordinated_operation",
            "severity": "medium",
            "message": f"Linked to {len(associated_entities)} other entities"
        })
    
    return {
        "score": score,
        "factors": factors
    }


def _assess_patterns(entity_type: str, enrichment_data: Dict, postgres_client=None) -> Dict:
    """
    Assess risk based on patterns (time-based, coordination).
    Uses database to find similar entities - shows network connections.
    """
    factors = []
    score = 0
    
    if postgres_client and postgres_client.conn:
        try:
            cursor = postgres_client.conn.cursor()
            
            if entity_type == "phone":
                # Find other phones using same VOIP provider (network detection)
                voip_provider = enrichment_data.get("voip_provider")
                if voip_provider:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT phone) as count
                        FROM phone_numbers
                        WHERE voip_provider = %s AND phone != %s
                    """, (voip_provider, value))
                    result = cursor.fetchone()
                    voip_count = result[0] if result else 0
                    
                    if voip_count > 5:
                        score += 15
                        factors.append({
                            "type": "voip_cluster",
                            "severity": "high",
                            "message": f"⚠️ NETWORK DETECTED: {voip_count} other phone numbers use the same VOIP provider ({voip_provider}) - indicates coordinated operation"
                        })
                    elif voip_count > 1:
                        score += 8
                        factors.append({
                            "type": "voip_cluster",
                            "severity": "medium",
                            "message": f"Network connection: {voip_count} other phone numbers use the same VOIP provider"
                        })
                
                # Find phones from same country/carrier (geographic clustering)
                country = enrichment_data.get("country")
                carrier = enrichment_data.get("carrier")
                if country and carrier:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT phone) as count
                        FROM phone_numbers
                        WHERE country = %s AND carrier = %s AND phone != %s
                    """, (country, carrier, value))
                    result = cursor.fetchone()
                    cluster_count = result[0] if result else 0
                    
                    if cluster_count > 3:
                        score += 5
                        factors.append({
                            "type": "geographic_cluster",
                            "severity": "low",
                            "message": f"{cluster_count} other phones from same country/carrier - possible geographic cluster"
                        })
            
            elif entity_type == "domain":
                # Find other domains with same registrar/IP/hosting (network detection)
                registrar = enrichment_data.get("registrar")
                ip_address = enrichment_data.get("ip_address")
                isp = enrichment_data.get("isp")
                
                if registrar:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT domain) as count
                        FROM domains
                        WHERE registrar = %s AND domain != %s
                    """, (registrar, value))
                    result = cursor.fetchone()
                    registrar_count = result[0] if result else 0
                    
                    if registrar_count > 10:
                        score += 20
                        factors.append({
                            "type": "registrar_cluster",
                            "severity": "high",
                            "message": f"⚠️ NETWORK DETECTED: {registrar_count} other domains registered with {registrar} - part of larger operation"
                        })
                    elif registrar_count > 3:
                        score += 10
                        factors.append({
                            "type": "registrar_cluster",
                            "severity": "medium",
                            "message": f"Network connection: {registrar_count} other domains share the same registrar"
                        })
                
                if ip_address:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT domain) as count
                        FROM domains
                        WHERE (ip_address = %s OR %s = ANY(ip_addresses)) AND domain != %s
                    """, (ip_address, ip_address, value))
                    result = cursor.fetchone()
                    ip_count = result[0] if result else 0
                    
                    if ip_count > 5:
                        score += 15
                        factors.append({
                            "type": "ip_cluster",
                            "severity": "high",
                            "message": f"⚠️ NETWORK DETECTED: {ip_count} other domains share the same IP address ({ip_address}) - same hosting/operation"
                        })
                    elif ip_count > 1:
                        score += 8
                        factors.append({
                            "type": "ip_cluster",
                            "severity": "medium",
                            "message": f"Network connection: {ip_count} other domains on same IP"
                        })
                
                # Check hosting provider cluster
                if isp:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT domain) as count
                        FROM domains
                        WHERE isp = %s AND domain != %s
                    """, (isp, value))
                    result = cursor.fetchone()
                    isp_count = result[0] if result else 0
                    
                    if isp_count > 5:
                        score += 10
                        factors.append({
                            "type": "hosting_cluster",
                            "severity": "medium",
                            "message": f"Network connection: {isp_count} other domains use same hosting provider ({isp})"
                        })
            
            elif entity_type == "wallet":
                # Find wallets with similar transaction patterns
                # High transaction volume = may be receiving scam payments
                tx_count = enrichment_data.get("transaction_count", 0)
                if tx_count > 100:
                    score += 15
                    factors.append({
                        "type": "high_activity",
                        "severity": "high",
                        "message": f"⚠️ HIGH ACTIVITY: Wallet has {tx_count} transactions - likely receiving payments from multiple victims"
                    })
                elif tx_count > 20:
                    score += 8
                    factors.append({
                        "type": "high_activity",
                        "severity": "medium",
                        "message": f"Wallet has {tx_count} transactions - may be receiving scam payments"
                    })
                
                # Check currency (Bitcoin most common for scams)
                currency = (enrichment_data.get("currency") or "").lower()
                if currency == "bitcoin" and tx_count > 10:
                    score += 5
                    factors.append({
                        "type": "bitcoin_wallet",
                        "severity": "low",
                        "message": "Bitcoin wallet with activity - commonly used in extortion scams"
                    })
            
            elif entity_type == "handle":
                # Find other handles from same platform (network detection)
                platform = enrichment_data.get("platform") or enrichment_data.get("detected_platform")
                if platform:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT handle) as count
                        FROM messaging_handles
                        WHERE platform = %s AND handle != %s
                    """, (platform, value))
                    result = cursor.fetchone()
                    platform_count = result[0] if result else 0
                    
                    if platform_count > 10:
                        score += 10
                        factors.append({
                            "type": "platform_cluster",
                            "severity": "medium",
                            "message": f"Network connection: {platform_count} other handles on same platform ({platform})"
                        })
                
                # Find handles that appeared with same phone/domain/wallet (coordination)
                # This would require querying the investigations table
                # For now, this is handled by internal history assessment
            
            cursor.close()
        except Exception as e:
            logger.debug(f"Pattern assessment error: {e}")
    
    return {
        "score": score,
        "factors": factors
    }


def _get_internal_history(entity_type: str, value: str, postgres_client) -> Optional[Dict]:
    """Get internal investigation history from database."""
    if not postgres_client or not postgres_client.conn:
        return None
    
    try:
        cursor = postgres_client.conn.cursor()
        
        # Count investigations
        cursor.execute("""
            SELECT COUNT(DISTINCT session_id) as session_count
            FROM investigations
            WHERE entity_type = %s AND entity_value = %s
        """, (entity_type, value))
        result = cursor.fetchone()
        investigation_count = result[0] if result else 0
        
        # Get associated entities
        cursor.execute("""
            SELECT DISTINCT i2.entity_type, i2.entity_value, COUNT(DISTINCT i2.session_id) as co_occurrence_count
            FROM investigations i1
            JOIN investigations i2 ON i1.session_id = i2.session_id
            WHERE i1.entity_type = %s AND i1.entity_value = %s
            AND i2.entity_type != %s AND i2.entity_value != %s
            GROUP BY i2.entity_type, i2.entity_value
            ORDER BY co_occurrence_count DESC
            LIMIT 10
        """, (entity_type, value, entity_type, value))
        
        associated_entities = []
        for row in cursor.fetchall():
            associated_entities.append({
                "type": row[0],
                "value": row[1],
                "co_occurrence_count": row[2]
            })
        
        cursor.close()
        
        return {
            "investigation_count": investigation_count,
            "associated_entities": associated_entities
        }
    except Exception as e:
        logger.debug(f"Error getting internal history: {e}")
        return None


def _generate_actionable_insights(
    entity_type: str,
    value: str,
    enrichment_data: Dict,
    risk_factors: List[Dict],
    threat_level: str,
    severity_score: int
) -> Dict:
    """Generate actionable insights and next steps."""
    insights = {
        "summary": "",
        "key_findings": [],
        "recommended_actions": [],
        "reporting_links": []
    }
    
    # Generate summary based on threat level and findings
    network_detected = any("NETWORK DETECTED" in f.get("message", "") for f in risk_factors)
    external_threat = any(f.get("type") == "external_threat" for f in risk_factors)
    
    if threat_level == "critical":
        if network_detected:
            insights["summary"] = f"⚠️ CRITICAL RISK: This {entity_type} is part of a coordinated extortion network. Multiple indicators suggest this is an organized operation affecting multiple victims."
        else:
            insights["summary"] = f"⚠️ CRITICAL RISK: This {entity_type} shows strong indicators of being part of an organized extortion operation."
    elif threat_level == "high":
        if network_detected:
            insights["summary"] = f"⚠️ HIGH RISK: This {entity_type} is connected to other entities in our database, indicating it's part of a larger operation. {len([f for f in risk_factors if 'NETWORK' in f.get('message', '')])} network connection(s) detected."
        elif external_threat:
            insights["summary"] = f"⚠️ HIGH RISK: This {entity_type} has been flagged by external threat intelligence sources and shows suspicious patterns."
        else:
            insights["summary"] = f"⚠️ HIGH RISK: This {entity_type} has been linked to multiple extortion cases or shows suspicious patterns."
    elif threat_level == "medium":
        insights["summary"] = f"⚠️ MEDIUM RISK: This {entity_type} shows some indicators of abuse (VOIP, burner domain, or suspicious patterns) but may be isolated."
    else:
        insights["summary"] = f"✓ LOW RISK: This {entity_type} shows minimal indicators of abuse. However, remain cautious and document all interactions."
    
    # Key findings from risk factors
    for factor in risk_factors[:5]:  # Top 5 factors
        insights["key_findings"].append(factor.get("message", ""))
    
    # Recommended actions based on entity type and threat level
    if threat_level in ["high", "critical"]:
        insights["recommended_actions"].extend([
            "🚨 Block and report to platform immediately",
            "📋 Generate evidence packet for law enforcement (use 'Generate escalation packet' button)",
            "📧 Report to infrastructure providers (VOIP/hosting) - see 'Report & Escalate' page",
            "📸 Document all interactions with timestamps",
            "👮 Contact local police if you are a minor or feel unsafe"
        ])
    elif threat_level == "medium":
        insights["recommended_actions"].extend([
            "🚫 Block the entity",
            "📱 Report to platform (WhatsApp/Telegram/Instagram)",
            "👀 Monitor for further activity",
            "📋 Consider generating evidence packet if threats continue"
        ])
    else:
        insights["recommended_actions"].extend([
            "🚫 Block the entity",
            "📱 Report to platform",
            "👀 Monitor for further activity"
        ])
    
    # Generate reporting links based on entity type
    if entity_type == "phone":
        insights["reporting_links"].append({
            "platform": "WhatsApp",
            "url": "https://faq.whatsapp.com/general/security-and-privacy/reporting-abuse-or-spam"
        })
        insights["reporting_links"].append({
            "platform": "Telegram",
            "url": "https://telegram.org/support"
        })
    elif entity_type == "domain":
        registrar = enrichment_data.get("registrar", "")
        if registrar:
            insights["reporting_links"].append({
                "platform": f"Registrar: {registrar}",
                "url": "#"  # Would need registrar abuse contact
            })
    
    return insights

