#!/bin/bash
# Test all API endpoints to ensure functionality is intact

BASE_URL="http://localhost:5001"
FAILED=0
PASSED=0

echo "🧪 Testing all API endpoints..."
echo ""

# Health check
echo "1. Testing health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/healthz")
if [ "$STATUS" = "200" ]; then
    echo "   ✅ Health check: PASSED ($STATUS)"
    ((PASSED++))
else
    echo "   ❌ Health check: FAILED ($STATUS)"
    ((FAILED++))
fi

# PersonaForge APIs
echo ""
echo "2. Testing PersonaForge APIs..."
echo "   a. /personaforge/api/clusters"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/personaforge/api/clusters")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   b. /personaforge/api/graph"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/personaforge/api/graph")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   c. /personaforge/api/vendors"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/personaforge/api/vendors")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

# ShadowStack APIs
echo ""
echo "3. Testing ShadowStack APIs..."
echo "   a. /shadowstack/api/domains"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/shadowstack/api/domains")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   b. /shadowstack/api/analytics"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/shadowstack/api/analytics")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   c. /shadowstack/api/graph"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/shadowstack/api/graph")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   d. /shadowstack/api/stats"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/shadowstack/api/stats")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

# BlackWire APIs
echo ""
echo "4. Testing BlackWire APIs..."
echo "   a. /blackwire/api/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/blackwire/api/health")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

echo "   b. /blackwire/api/graph"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/blackwire/api/graph")
if [ "$STATUS" = "200" ]; then
    echo "      ✅ PASSED ($STATUS)"
    ((PASSED++))
else
    echo "      ❌ FAILED ($STATUS)"
    ((FAILED++))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary:"
echo "   ✅ Passed: $PASSED"
echo "   ❌ Failed: $FAILED"
echo "   📈 Total:  $((PASSED + FAILED))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! All APIs are working correctly."
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Please check the endpoints above."
    exit 1
fi

