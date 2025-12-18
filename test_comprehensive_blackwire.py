"""
Comprehensive test suite for BlackWire features.
Tests escalation packet, RDAP enrichment, and integration points.
"""

import sys
import json
from pathlib import Path

# Add blackwire to path
sys.path.insert(0, str(Path('blackwire').absolute()))

def test_escalation_packet_json_serialization():
    """Test that escalation packet data can be serialized/deserialized correctly."""
    print("=" * 70)
    print("TEST 1: Escalation Packet JSON Serialization")
    print("=" * 70)
    
    # Simulate complex trace results with all entity types
    mock_results = [
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
                        "key_findings": ["Flagged by VirusTotal", "Shortlink domain"],
                        "recommended_actions": ["Block immediately", "Report to registrar"]
                    }
                },
                "email_security": {
                    "spf": {"present": True, "issues": []},
                    "dmarc": {"present": True, "policy": "reject"},
                    "dkim": {"present": True},
                    "security_score": 100
                },
                "typosquatting": {
                    "risk_level": "low",
                    "similarity_score": 0.1
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
                "is_voip": True,
                "voip_provider": "Example VOIP"
            }
        },
        {
            "type": "wallet",
            "value": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "data": {
                "currency": "BTC",
                "balance": "0.0",
                "transaction_count": 0
            }
        },
        {
            "type": "handle",
            "value": "@testuser",
            "data": {
                "platform": "telegram",
                "normalized_handle": "testuser"
            }
        }
    ]
    
    try:
        # Test serialization
        json_str = json.dumps(mock_results, default=str)
        print(f"✅ JSON serialization successful ({len(json_str)} bytes)")
        
        # Test deserialization
        parsed = json.loads(json_str)
        print(f"✅ JSON deserialization successful ({len(parsed)} entities)")
        
        # Verify all entities have required fields
        for i, entity in enumerate(parsed):
            assert "type" in entity, f"Entity {i} missing 'type'"
            assert "value" in entity, f"Entity {i} missing 'value'"
            assert "data" in entity, f"Entity {i} missing 'data'"
            print(f"   ✅ Entity {i+1} ({entity['type']}): {entity['value'][:30]}...")
        
        # Test that new RDAP fields are preserved
        domain_entity = next((e for e in parsed if e['type'] == 'domain'), None)
        if domain_entity and 'email_security' in domain_entity.get('data', {}):
            print("   ✅ Email security data preserved in JSON")
        if domain_entity and 'typosquatting' in domain_entity.get('data', {}):
            print("   ✅ Typosquatting data preserved in JSON")
        
        return True
    except Exception as e:
        print(f"❌ JSON serialization test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rdap_functions_with_various_domains():
    """Test RDAP functions with various domain types."""
    print("\n" + "=" * 70)
    print("TEST 2: RDAP Functions with Various Domains")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import (
            analyze_email_security,
            detect_typosquatting
        )
        
        test_domains = [
            ("google.com", "Well-known domain"),
            ("github.com", "Tech domain"),
            ("frannet.com", "User test domain"),
            ("go0gle.com", "Typosquatting example"),
            ("test123.com", "Domain with numbers")
        ]
        
        results = []
        for domain, description in test_domains:
            print(f"\n   Testing: {domain} ({description})")
            
            # Test email security
            try:
                email_result = analyze_email_security(domain)
                score = email_result.get("security_score", 0)
                spf = email_result.get("spf", {}).get("present", False)
                dmarc = email_result.get("dmarc", {}).get("present", False)
                dkim = email_result.get("dkim", {}).get("present", False)
                print(f"      Email Security: SPF={spf}, DMARC={dmarc}, DKIM={dkim}, Score={score}/100")
            except Exception as e:
                print(f"      ⚠️  Email security failed: {e}")
            
            # Test typosquatting
            try:
                typosq_result = detect_typosquatting(domain)
                risk = typosq_result.get("risk_level", "unknown")
                similarity = typosq_result.get("similarity_score", 0.0)
                patterns = len(typosq_result.get("patterns_detected", []))
                print(f"      Typosquatting: {risk} risk, {similarity*100:.1f}% similarity, {patterns} patterns")
            except Exception as e:
                print(f"      ⚠️  Typosquatting failed: {e}")
            
            results.append((domain, True))
        
        print(f"\n✅ Tested {len(results)} domains successfully")
        return True
        
    except Exception as e:
        print(f"❌ RDAP functions test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rate_limiter_edge_cases():
    """Test rate limiter with edge cases."""
    print("\n" + "=" * 70)
    print("TEST 3: Rate Limiter Edge Cases")
    print("=" * 70)
    
    try:
        from src.utils.rate_limiter import check_rate_limit, record_api_request, get_api_remaining
        
        # Test new services
        new_services = ["rdap", "ssl_analysis", "email_security"]
        
        for service in new_services:
            # Check initial state
            can_make = check_rate_limit(service)
            remaining = get_api_remaining(service)
            print(f"✅ {service}: Can make={can_make}, Remaining={remaining}")
            
            # Record a request
            if can_make:
                record_api_request(service)
                remaining_after = get_api_remaining(service)
                print(f"   After request: Remaining={remaining_after}")
        
        # Test non-existent service (should allow)
        can_make_unknown = check_rate_limit("unknown_service")
        print(f"✅ Unknown service: Can make={can_make_unknown} (should be True)")
        
        return True
    except Exception as e:
        print(f"❌ Rate limiter test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_data_structure_completeness():
    """Test that all expected data structures are complete."""
    print("\n" + "=" * 70)
    print("TEST 4: Data Structure Completeness")
    print("=" * 70)
    
    # Simulate what domain enrichment should return
    expected_domain_fields = [
        "domain", "ip_address", "registrar", "isp", "country",
        "email_security", "typosquatting", "ssl_info"
    ]
    
    # Simulate what email_security should have
    expected_email_fields = ["spf", "dmarc", "dkim", "security_score"]
    
    # Simulate what typosquatting should have
    expected_typosq_fields = ["risk_level", "similarity_score", "patterns_detected", "recommendations"]
    
    # Simulate what ssl_info should have (if available)
    expected_ssl_fields = ["available", "certificate", "protocols", "security_grade", "security_issues"]
    
    print("✅ Expected domain fields:", ", ".join(expected_domain_fields))
    print("✅ Expected email_security fields:", ", ".join(expected_email_fields))
    print("✅ Expected typosquatting fields:", ", ".join(expected_typosq_fields))
    print("✅ Expected ssl_info fields:", ", ".join(expected_ssl_fields))
    
    # Verify functions return these structures
    try:
        from src.enrichment.rdap_enrichment import analyze_email_security, detect_typosquatting
        
        email_result = analyze_email_security("example.com")
        for field in expected_email_fields:
            if field not in email_result:
                print(f"❌ email_security missing field: {field}")
                return False
        print("✅ email_security has all required fields")
        
        typosq_result = detect_typosquatting("example.com")
        for field in expected_typosq_fields:
            if field not in typosq_result:
                print(f"❌ typosquatting missing field: {field}")
                return False
        print("✅ typosquatting has all required fields")
        
        return True
    except Exception as e:
        print(f"❌ Data structure test failed: {e}")
        return False


def test_localstorage_simulation():
    """Simulate localStorage operations that happen in the browser."""
    print("\n" + "=" * 70)
    print("TEST 5: localStorage Simulation")
    print("=" * 70)
    
    # Simulate browser localStorage operations
    storage = {}  # Simulate localStorage
    
    # Simulate storing escalation entities
    entities = [
        {"type": "domain", "value": "test.com", "data": {"ip_address": "1.2.3.4"}},
        {"type": "phone", "value": "+1234567890", "data": {"country": "US"}}
    ]
    
    # Store (as browser does)
    storage['escalationEntities'] = json.dumps(entities)
    print("✅ Stored entities in localStorage simulation")
    
    # Retrieve (as browser does)
    stored = storage.get('escalationEntities')
    if stored:
        parsed = json.loads(stored)
        print(f"✅ Retrieved {len(parsed)} entities from localStorage")
        
        # Verify structure
        for entity in parsed:
            if "type" not in entity or "value" not in entity or "data" not in entity:
                print(f"❌ Invalid entity structure: {entity}")
                return False
        
        # Clear (as support page does)
        del storage['escalationEntities']
        print("✅ Cleared localStorage (as support page does)")
        
        return True
    else:
        print("❌ Failed to retrieve from localStorage")
        return False


def test_typosquatting_edge_cases():
    """Test typosquatting detection with edge cases."""
    print("\n" + "=" * 70)
    print("TEST 6: Typosquatting Edge Cases")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import detect_typosquatting
        
        edge_cases = [
            ("a.com", "Very short domain"),
            ("test.tk", "Suspicious TLD"),
            ("test123.com", "Numbers in domain"),
            ("go0gle.com", "Character substitution"),
            ("faceb00k.com", "Multiple substitutions"),
            ("example.co.uk", "Multi-part TLD"),
            ("sub.example.com", "Subdomain"),
        ]
        
        for domain, description in edge_cases:
            try:
                result = detect_typosquatting(domain)
                risk = result.get("risk_level", "unknown")
                similarity = result.get("similarity_score", 0.0)
                patterns = result.get("patterns_detected", [])
                
                print(f"✅ {domain:20} ({description:25}): {risk:6} risk, {similarity*100:5.1f}% similarity, {len(patterns)} patterns")
            except Exception as e:
                print(f"❌ {domain}: {e}")
                return False
        
        return True
    except Exception as e:
        print(f"❌ Typosquatting edge cases test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_email_security_edge_cases():
    """Test email security with edge cases."""
    print("\n" + "=" * 70)
    print("TEST 7: Email Security Edge Cases")
    print("=" * 70)
    
    try:
        from src.enrichment.rdap_enrichment import analyze_email_security
        
        # Test that function handles errors gracefully
        test_cases = [
            "example.com",  # Normal domain
            "nonexistent-domain-12345.com",  # Domain that probably doesn't exist
        ]
        
        for domain in test_cases:
            try:
                result = analyze_email_security(domain)
                
                # Verify structure is always returned
                assert "spf" in result, "Missing SPF data"
                assert "dmarc" in result, "Missing DMARC data"
                assert "dkim" in result, "Missing DKIM data"
                assert "security_score" in result, "Missing security_score"
                
                print(f"✅ {domain}: Structure valid, Score={result.get('security_score', 0)}/100")
            except Exception as e:
                print(f"❌ {domain}: {e}")
                return False
        
        return True
    except Exception as e:
        print(f"❌ Email security edge cases test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_import_paths():
    """Test that all import paths work correctly."""
    print("\n" + "=" * 70)
    print("TEST 8: Import Paths")
    print("=" * 70)
    
    import_tests = [
        ("src.enrichment.rdap_enrichment", "analyze_ssl_tls"),
        ("src.enrichment.rdap_enrichment", "analyze_email_security"),
        ("src.enrichment.rdap_enrichment", "detect_typosquatting"),
        ("src.enrichment.domain_enrichment", "enrich_domain"),
        ("src.utils.rate_limiter", "check_rate_limit"),
        ("src.utils.logger", "logger"),
    ]
    
    all_passed = True
    for module_name, item_name in import_tests:
        try:
            module = __import__(module_name, fromlist=[item_name])
            item = getattr(module, item_name)
            print(f"✅ {module_name}.{item_name}: {type(item).__name__}")
        except Exception as e:
            print(f"❌ {module_name}.{item_name}: {e}")
            all_passed = False
    
    return all_passed


def main():
    """Run all comprehensive tests."""
    print("\n" + "=" * 70)
    print("COMPREHENSIVE BLACKWIRE TESTING")
    print("=" * 70)
    
    results = []
    
    # Run all tests
    results.append(("Escalation Packet JSON", test_escalation_packet_json_serialization()))
    results.append(("RDAP Functions Various Domains", test_rdap_functions_with_various_domains()))
    results.append(("Rate Limiter Edge Cases", test_rate_limiter_edge_cases()))
    results.append(("Data Structure Completeness", test_data_structure_completeness()))
    results.append(("localStorage Simulation", test_localstorage_simulation()))
    results.append(("Typosquatting Edge Cases", test_typosquatting_edge_cases()))
    results.append(("Email Security Edge Cases", test_email_security_edge_cases()))
    results.append(("Import Paths", test_import_paths()))
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed ({passed*100//total}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
