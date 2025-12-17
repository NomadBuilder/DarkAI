#!/usr/bin/env python3
"""Test risk assessment for a domain to see contributing factors."""

import os
import sys
from pathlib import Path

# Add blackwire to path
blackwire_path = Path(__file__).parent / "blackwire"
sys.path.insert(0, str(blackwire_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import risk assessment
from src.enrichment.risk_assessment import assess_risk
from src.enrichment.enrichment_pipeline import enrich_entity
from src.database.postgres_client import PostgresClient

def test_risk_assessment(domain):
    """Test risk assessment for a domain."""
    print(f"\n{'='*60}")
    print(f"Testing Risk Assessment for: {domain}")
    print(f"{'='*60}\n")
    
    # Initialize postgres client
    try:
        postgres_client = PostgresClient()
        print("✅ PostgreSQL client initialized\n")
    except Exception as e:
        print(f"⚠️  PostgreSQL not available: {e}")
        postgres_client = None
    
    # Enrich the domain
    print(f"📊 Enriching domain: {domain}...")
    try:
        result = enrich_entity("domain", domain)
        if result.get("errors"):
            print(f"⚠️  Enrichment warnings: {result.get('errors')}")
        enrichment_data = result.get("data", {})
        print("✅ Enrichment complete\n")
        
        # Show threat intelligence data if available
        print("🌐 THREAT INTELLIGENCE DATA:")
        threat_intel = enrichment_data.get("threat_intel", {})
        if threat_intel:
            if threat_intel.get("virustotal"):
                vt_data = threat_intel["virustotal"]
                print(f"\n   📊 VirusTotal Summary:")
                print(f"     - Malicious URLs: {vt_data.get('malicious_count', 0)}/{vt_data.get('total_scans', 0)}")
                print(f"     - Max Positives: {vt_data.get('max_positives', 0)} security engines flagged")
                print(f"     - Avg Positives: {vt_data.get('avg_positives', 0)} engines per URL")
                print(f"     - Domain Reputation: {vt_data.get('reputation', 0)}/100")
                if vt_data.get("categories"):
                    print(f"     - Categories: {', '.join(list(vt_data.get('categories', {}).keys())[:5])}")
                if vt_data.get("note"):
                    print(f"     - Note: {vt_data.get('note')}")
            if threat_intel.get("is_malicious"):
                print(f"   Is Malicious: {threat_intel.get('is_malicious')}")
            if threat_intel.get("threat_level"):
                print(f"   Threat Level: {threat_intel.get('threat_level')}")
            if threat_intel.get("sources"):
                print(f"   Sources: {', '.join(threat_intel.get('sources', []))}")
        else:
            print("   No threat intelligence data found")
            print("   (This could mean no API key, rate limit, or no threats detected)")
        print()
        
        # Try to get raw VirusTotal API response to show flagged URLs and what they detected
        print("🔍 Fetching detailed VirusTotal data...")
        try:
            import os
            import requests
            from dotenv import load_dotenv
            load_dotenv()
            
            api_key = os.getenv("VIRUSTOTAL_API_KEY")
            if api_key:
                url = f"https://www.virustotal.com/vtapi/v2/domain/report"
                params = {"apikey": api_key, "domain": domain}
                response = requests.get(url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("response_code") == 1:
                        detected_urls = data.get("detected_urls", [])
                        if detected_urls:
                            print(f"\n   🚨 Flagged URLs ({len(detected_urls)} total):")
                            print(f"   {'='*70}")
                            
                            # Show first 5 URLs with detailed scan results
                            for i, url_data in enumerate(detected_urls[:5], 1):
                                url = url_data.get("url", "N/A")
                                positives = url_data.get("positives", 0)
                                total = url_data.get("total", 0)
                                scan_date = url_data.get("scan_date", "N/A")
                                
                                print(f"\n   {i}. {url}")
                                print(f"      ⚠️  {positives}/{total} security engines flagged")
                                print(f"      📅 Last scanned: {scan_date}")
                                
                                # Get detailed scan results for this URL
                                if url_data.get("url"):
                                    scan_url = f"https://www.virustotal.com/vtapi/v2/url/report"
                                    scan_params = {"apikey": api_key, "resource": url_data.get("url")}
                                    scan_response = requests.get(scan_url, params=scan_params, timeout=10)
                                    if scan_response.status_code == 200:
                                        scan_data = scan_response.json()
                                        if scan_data.get("response_code") == 1:
                                            scans = scan_data.get("scans", {})
                                            flagged_scans = {k: v for k, v in scans.items() if v.get("detected")}
                                            if flagged_scans:
                                                print(f"      🔍 What engines detected:")
                                                for engine, result in list(flagged_scans.items())[:5]:  # Show first 5
                                                    result_name = result.get("result", "suspicious")
                                                    print(f"         • {engine}: {result_name}")
                                                if len(flagged_scans) > 5:
                                                    print(f"         ... and {len(flagged_scans) - 5} more")
                                    
                                    # Small delay to avoid rate limits
                                    import time
                                    time.sleep(0.25)
                            
                            if len(detected_urls) > 5:
                                print(f"\n   ... and {len(detected_urls) - 5} more flagged URLs")
                            
                            print(f"\n   📊 Summary:")
                            print(f"      • Total URLs scanned: {len(detected_urls)}")
                            print(f"      • All {len(detected_urls)} URLs have at least 1 engine flagging them")
                            print(f"      • This suggests a pattern, not isolated false positives")
                        else:
                            print("   ✅ No URLs flagged by VirusTotal")
        except Exception as e:
            print(f"   ⚠️  Could not fetch detailed VirusTotal data: {e}")
            import traceback
            traceback.print_exc()
        print()
    except Exception as e:
        print(f"❌ Enrichment failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Assess risk
    print(f"🔍 Assessing risk...")
    try:
        risk_assessment = assess_risk(
            entity_type="domain",
            value=domain,
            enrichment_data=enrichment_data,
            internal_history=None,
            postgres_client=postgres_client
        )
        
        print(f"\n{'='*60}")
        print("RISK ASSESSMENT RESULTS")
        print(f"{'='*60}\n")
        
        print(f"Threat Level: {risk_assessment.get('threat_level', 'unknown').upper()}")
        print(f"Severity Score: {risk_assessment.get('severity_score', 0)}/100\n")
        
        # Show all risk factors
        risk_factors = risk_assessment.get('risk_factors', [])
        if risk_factors:
            print(f"📊 RISK FACTORS BREAKDOWN ({len(risk_factors)} factors):")
            print("-" * 60)
            for i, factor in enumerate(risk_factors, 1):
                severity = factor.get('severity', 'unknown')
                message = factor.get('message', 'No message')
                factor_type = factor.get('type', 'unknown')
                sources = factor.get('sources', [])
                
                severity_color = {
                    'critical': '🔴',
                    'high': '🟠',
                    'medium': '🟡',
                    'low': '🟢'
                }.get(severity, '⚪')
                
                print(f"\n{i}. {severity_color} [{severity.upper()}] {factor_type}")
                print(f"   {message}")
                if sources:
                    print(f"   Sources: {', '.join(sources)}")
            print("\n" + "-" * 60)
        else:
            print("No risk factors identified.\n")
        
        # Show infrastructure risk breakdown
        infrastructure_risk = risk_assessment.get('infrastructure_risk', {})
        if infrastructure_risk:
            infra_score = infrastructure_risk.get('score', 0)
            infra_factors = infrastructure_risk.get('factors', [])
            if infra_score > 0:
                print(f"\n🏗️  INFRASTRUCTURE RISK: +{infra_score} points")
                for factor in infra_factors:
                    print(f"   • {factor.get('message', '')}")
        
        # Show pattern risk breakdown
        pattern_risk = risk_assessment.get('pattern_risk', {})
        if pattern_risk:
            pattern_score = pattern_risk.get('score', 0)
            pattern_factors = pattern_risk.get('factors', [])
            if pattern_score > 0:
                print(f"\n🔗 PATTERN RISK: +{pattern_score} points")
                for factor in pattern_factors:
                    print(f"   • {factor.get('message', '')}")
        
        # Show external threats
        external_threats = risk_assessment.get('external_threats', {})
        if external_threats:
            is_malicious = external_threats.get('is_malicious', False)
            threat_level = external_threats.get('threat_level', 'clean')
            threat_sources = external_threats.get('threat_sources', [])
            
            if is_malicious or threat_level in ['medium', 'high']:
                print(f"\n🌐 EXTERNAL THREAT INTELLIGENCE: +40 points")
                print(f"   Threat Level: {threat_level}")
                print(f"   Is Malicious: {is_malicious}")
                if threat_sources:
                    print(f"   Sources: {', '.join(threat_sources)}")
            else:
                print(f"\n🌐 EXTERNAL THREAT INTELLIGENCE: No threats found")
        
        # Show actionable insights
        insights = risk_assessment.get('actionable_insights', {})
        if insights:
            print(f"\n💡 SUMMARY:")
            print(f"   {insights.get('summary', 'No summary')}")
            
            key_findings = insights.get('key_findings', [])
            if key_findings:
                print(f"\n🔍 KEY FINDINGS:")
                for finding in key_findings:
                    print(f"   • {finding}")
        
        # Check internal history if postgres is available
        if postgres_client:
            print(f"\n📋 CHECKING INTERNAL HISTORY:")
            try:
                from src.enrichment.risk_assessment import _get_internal_history
                internal_history = _get_internal_history("domain", domain, postgres_client)
                if internal_history:
                    investigation_count = internal_history.get("investigation_count", 0)
                    associated_entities = internal_history.get("associated_entities", [])
                    print(f"   Investigation Count: {investigation_count}")
                    print(f"   Associated Entities: {len(associated_entities)}")
                    if investigation_count > 0:
                        print(f"   ⚠️  This domain has been searched {investigation_count} time(s) - this would add points IF external threats exist")
                else:
                    print(f"   No internal history found")
            except Exception as e:
                print(f"   Could not check internal history: {e}")
        
        print(f"\n{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Risk assessment failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    domain = sys.argv[1] if len(sys.argv) > 1 else "frannet.com"
    test_risk_assessment(domain)

