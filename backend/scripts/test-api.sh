#!/bin/bash

# API Testing Script
# Usage: ./scripts/test-api.sh

BASE_URL="${API_URL:-http://localhost:3000}"

echo "🧪 Testing Mobile Auth API"
echo "=========================="
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
HEALTH=$(curl -s "${BASE_URL}/health")
echo "Response: $HEALTH"
echo ""

# Test protected route without auth (should fail)
echo "2. Testing protected route without auth (should fail with 401)..."
PROTECTED=$(curl -s -w "\nHTTP Status: %{http_code}" "${BASE_URL}/api/profile")
echo "$PROTECTED"
echo ""

# Test invalid token
echo "3. Testing with invalid token (should fail with 401)..."
INVALID=$(curl -s -w "\nHTTP Status: %{http_code}" \
  -H "Authorization: Bearer invalid_token" \
  "${BASE_URL}/api/profile")
echo "$INVALID"
echo ""

echo "✅ Basic API tests completed"
echo ""
echo "To test full authentication flow:"
echo "1. Run the mobile app"
echo "2. Sign in with a provider"
echo "3. Check the console for the access token"
echo "4. Use the token in API requests:"
echo ""
echo "curl -H \"Authorization: Bearer YOUR_ACCESS_TOKEN\" \\"
echo "     ${BASE_URL}/api/profile"
