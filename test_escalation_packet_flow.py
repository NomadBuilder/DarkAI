"""
Test script to verify escalation packet flow and other BlackWire features.
"""

import sys
import json
from pathlib import Path

# Add blackwire to path
sys.path.insert(0, str(Path('blackwire').absolute()))

def test_escalation_packet_data_structure():
    """Test that escalation packet data structure is correct."""
    print("=" * 70)
    print("TEST 1: Escalation Packet Data Structure")
    print("=" * 70)
    
    # Simulate trace results that would be stored in localStorage
    mock_trace_results = [
        {
            "type": "domain",
            "value": "example.com",
            "data": {
                "ip_address": "93.184.216.34",
                "registrar": "Example Registrar",
                "isp": "Example ISP",
                "country": "US",
                "threat_level": "high",
                "risk_assessment": {
                    "threat_level": "high",
                    "severity_score": 75,
                    "actionable_insights": {
                        "key_findings": ["Flagged by VirusTotal", "Shortlink domain"]
                    }
                }
            }
        },
        {
            "type": "phone",
            "value": "+1234567890",
            "data": {
                "formatted": "+1234567890",
                "country": "US",
                "carrier": "Example Carrier",
                "is_voip": True
            }
        }
    ]
    
    # Test JSON serialization (what happens in localStorage)
    try:
        json_str = json.dumps(mock_trace_results)
        parsed = json.loads(json_str)
        print("✅ JSON serialization/deserialization works")
        print(f"   Stored {len(parsed)} entities")
        
        # Verify structure
        for entity in parsed:
            assert "type" in entity, "Missing 'type' field"
            assert "value" in entity, "Missing 'value' field"
            assert "data" in entity, "Missing 'data' field"
        print("✅ All entities have required fields (type, value, data)")
        
    except Exception as e:
        print(f"❌ JSON serialization failed: {e}")
        return False
    
    return True


def test_rdap_enrichment_imports():
    """Test that RDAP enrichment module can be imported."""
    print("\n" + "=" * 70)
    print("TEST 2: RDAP Enrichment Module Imports")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import (
            analyze_ssl_tls,
            analyze_email_security,
            detect_typosquatting
        )
        print("✅ All RDAP enrichment functions imported successfully")
        print(f"   - analyze_ssl_tls: {analyze_ssl_tls}")
        print(f"   - analyze_email_security: {analyze_email_security}")
        print(f"   - detect_typosquatting: {detect_typosquatting}")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_email_security_function():
    """Test email security analysis function."""
    print("\n" + "=" * 70)
    print("TEST 3: Email Security Analysis")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import analyze_email_security
        
        # Test with a real domain (this will do DNS lookups)
        result = analyze_email_security("example.com")
        
        # Verify structure
        required_keys = ["spf", "dmarc", "dkim", "security_score"]
        for key in required_keys:
            if key not in result:
                print(f"❌ Missing key: {key}")
                return False
        
        print("✅ Email security function returns correct structure")
        print(f"   SPF present: {result['spf'].get('present', False)}")
        print(f"   DMARC present: {result['dmarc'].get('present', False)}")
        print(f"   DKIM present: {result['dkim'].get('present', False)}")
        print(f"   Security score: {result.get('security_score', 0)}/100")
        
        return True
    except Exception as e:
        print(f"❌ Email security test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_typosquatting_function():
    """Test typosquatting detection function."""
    print("\n" + "=" * 70)
    print("TEST 4: Typosquatting Detection")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import detect_typosquatting
        
        # Test with various domains
        test_domains = [
            "example.com",
            "go0gle.com",  # Typosquatting example
            "faceb00k.com",  # Typosquatting example
            "frannet.com"  # User's test domain
        ]
        
        for domain in test_domains:
            result = detect_typosquatting(domain)
            
            # Verify structure
            required_keys = ["risk_level", "similarity_score", "patterns_detected", "recommendations"]
            for key in required_keys:
                if key not in result:
                    print(f"❌ Missing key: {key} for domain {domain}")
                    return False
            
            print(f"✅ {domain}: {result['risk_level']} risk ({result['similarity_score']*100:.1f}% similarity)")
        
        return True
    except Exception as e:
        print(f"❌ Typosquatting test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_domain_enrichment_integration():
    """Test that domain enrichment integrates RDAP features."""
    print("\n" + "=" * 70)
    print("TEST 5: Domain Enrichment Integration")
    print("=" * 70)
    
    try:
        from src.enrichment.domain_enrichment import enrich_domain
        
        # Test with a simple domain (this will do real lookups)
        print("Testing domain enrichment with RDAP features...")
        print("(This may take a moment - doing real DNS/SSL lookups)")
        
        result = enrich_domain("example.com")
        
        # Check if new fields are present
        has_email_security = "email_security" in result
        has_typosquatting = "typosquatting" in result
        has_ssl_info = "ssl_info" in result
        
        print(f"✅ Domain enrichment completed")
        print(f"   Email security data: {'✅' if has_email_security else '❌'}")
        print(f"   Typosquatting data: {'✅' if has_typosquatting else '❌'}")
        print(f"   SSL/TLS data: {'✅' if has_ssl_info else '❌ (domain may not have HTTPS)'}")
        
        if has_email_security:
            email_sec = result["email_security"]
            print(f"      Security score: {email_sec.get('security_score', 0)}/100")
        
        if has_typosquatting:
            typosq = result["typosquatting"]
            print(f"      Risk level: {typosq.get('risk_level', 'unknown')}")
        
        return has_email_security and has_typosquatting
        
    except Exception as e:
        print(f"❌ Domain enrichment test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rate_limiter():
    """Test rate limiter functionality."""
    print("\n" + "=" * 70)
    print("TEST 6: Rate Limiter")
    print("=" * 70)
    
    try:
        from src.utils.rate_limiter import check_rate_limit, record_api_request
        
        # Test rate limits for new services
        services = ["rdap", "ssl_analysis", "email_security"]
        
        for service in services:
            can_make = check_rate_limit(service)
            print(f"✅ {service}: {'Can make request' if can_make else 'Rate limited'}")
            
            if can_make:
                record_api_request(service)
                print(f"   Recorded request for {service}")
        
        return True
    except Exception as e:
        print(f"❌ Rate limiter test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n" + "=" * 70)
    print("BLACKWIRE FEATURE TESTING")
    print("=" * 70)
    
    results = []
    
    # Run tests
    results.append(("Escalation Packet Data", test_escalation_packet_data_structure()))
    results.append(("RDAP Imports", test_rdap_enrichment_imports()))
    results.append(("Email Security", test_email_security_function()))
    results.append(("Typosquatting", test_typosquatting_function()))
    results.append(("Domain Enrichment", test_domain_enrichment_integration()))
    results.append(("Rate Limiter", test_rate_limiter()))
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
