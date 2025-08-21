#!/bin/bash
# test-deployment.sh - Script para probar el despliegue

echo "🧪 Testing deployment..."

# Cambiar por tu URL real de Railway/Render
BACKEND_URL="https://tu-app.railway.app"
FRONTEND_URL="https://CarlosCampoverde.github.io/Proyecto3Parcial"

echo "Testing backend health..."
curl -f "$BACKEND_URL/api/health" || echo "❌ Backend health check failed"

echo "Testing frontend..."
curl -f "$FRONTEND_URL" || echo "❌ Frontend check failed"

echo "✅ Deployment test completed!"
