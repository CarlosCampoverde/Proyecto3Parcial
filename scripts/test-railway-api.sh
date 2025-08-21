# test-railway-api.sh - Script para probar la API en Railway

# Cambiar por tu URL real de Railway
RAILWAY_URL="https://proyecto3parcial-production.railway.app"

echo "🧪 Testing Railway deployment..."

echo "1. Testing health endpoint..."
curl -f "$RAILWAY_URL/api/health" | jq '.' || echo "❌ Health check failed"

echo -e "\n2. Testing user registration..."
curl -X POST "$RAILWAY_URL/api/usuarios/registro" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@railway.com",
    "password": "password123"
  }' | jq '.' || echo "❌ Registration failed"

echo -e "\n3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/usuarios/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@railway.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

echo -e "\n4. Testing services list..."
curl -f "$RAILWAY_URL/api/servicios" | jq '.' || echo "❌ Services list failed"

echo -e "\n✅ Railway deployment test completed!"
