#!/bin/bash

# 🧪 Script para probar el despliegue de Railway
# Ejecuta pruebas contra los entornos desplegados

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funciones de utilidad
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# URLs de los entornos (serán populadas dinámicamente)
STAGING_URL=""
PRODUCTION_URL=""

# Obtener URLs de Railway
get_deployment_urls() {
    log_info "Obteniendo URLs de despliegue..."
    
    # Obtener URL de staging
    if railway environment staging && railway status --json > /dev/null 2>&1; then
        STAGING_URL=$(railway status --json | jq -r '.deployments[0].url // ""')
        log_success "Staging URL: $STAGING_URL"
    else
        log_warning "No se pudo obtener URL de staging"
    fi
    
    # Obtener URL de production
    if railway environment production && railway status --json > /dev/null 2>&1; then
        PRODUCTION_URL=$(railway status --json | jq -r '.deployments[0].url // ""')
        log_success "Production URL: $PRODUCTION_URL"
    else
        log_warning "No se pudo obtener URL de production"
    fi
}

# Test básico de conectividad
test_connectivity() {
    local url=$1
    local environment=$2
    
    log_info "Probando conectividad con $environment..."
    
    if curl -f -s --max-time 10 "$url" > /dev/null; then
        log_success "Conectividad OK con $environment"
        return 0
    else
        log_error "Falló conectividad con $environment"
        return 1
    fi
}

# Test de health check
test_health_endpoint() {
    local url=$1
    local environment=$2
    
    log_info "Probando health endpoint en $environment..."
    
    local health_response=$(curl -f -s --max-time 10 "$url/api/health" 2>/dev/null || echo "ERROR")
    
    if [[ "$health_response" != "ERROR" ]]; then
        log_success "Health check OK en $environment"
        echo "   Respuesta: $health_response"
        return 0
    else
        log_error "Health check falló en $environment"
        return 1
    fi
}

# Test de API endpoints
test_api_endpoints() {
    local url=$1
    local environment=$2
    
    log_info "Probando API endpoints en $environment..."
    
    local endpoints=("usuarios" "servicios" "reservas")
    local failed=0
    
    for endpoint in "${endpoints[@]}"; do
        local response=$(curl -f -s --max-time 10 "$url/api/$endpoint" 2>/dev/null || echo "ERROR")
        
        if [[ "$response" != "ERROR" ]]; then
            log_success "Endpoint /$endpoint OK"
        else
            log_error "Endpoint /$endpoint falló"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        log_success "Todos los endpoints funcionan en $environment"
        return 0
    else
        log_error "$failed endpoints fallaron en $environment"
        return 1
    fi
}

# Test de performance básico con k6
test_performance() {
    local url=$1
    local environment=$2
    
    log_info "Ejecutando pruebas de performance en $environment..."
    
    if command -v k6 &> /dev/null; then
        # Crear script temporal de k6
        cat > "/tmp/k6-test-$environment.js" << EOF
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 2,
  duration: '30s',
};

export default function () {
  const response = http.get('$url/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
}
EOF
        
        # Ejecutar test de k6
        if k6 run "/tmp/k6-test-$environment.js" --quiet; then
            log_success "Pruebas de performance OK en $environment"
            rm -f "/tmp/k6-test-$environment.js"
            return 0
        else
            log_error "Pruebas de performance fallaron en $environment"
            rm -f "/tmp/k6-test-$environment.js"
            return 1
        fi
    else
        log_warning "k6 no está instalado, omitiendo pruebas de performance"
        return 0
    fi
}

# Test completo de un entorno
test_environment() {
    local url=$1
    local environment=$2
    
    if [ -z "$url" ]; then
        log_warning "URL vacía para $environment, omitiendo pruebas"
        return 1
    fi
    
    log_info "🧪 Ejecutando batería completa de pruebas para $environment"
    echo "   URL: $url"
    echo ""
    
    local failed=0
    
    # Conectividad básica
    test_connectivity "$url" "$environment" || ((failed++))
    
    # Health check
    test_health_endpoint "$url" "$environment" || ((failed++))
    
    # API endpoints
    test_api_endpoints "$url" "$environment" || ((failed++))
    
    # Performance (opcional)
    test_performance "$url" "$environment" || ((failed++))
    
    echo ""
    if [ $failed -eq 0 ]; then
        log_success "✅ Todas las pruebas pasaron para $environment"
        return 0
    else
        log_error "❌ $failed prueba(s) fallaron para $environment"
        return 1
    fi
}

# Función principal
main() {
    log_info "🚀 Iniciando pruebas de despliegue Railway..."
    echo ""
    
    # Obtener URLs de los entornos
    get_deployment_urls
    echo ""
    
    local total_failed=0
    
    # Probar staging
    if [ -n "$STAGING_URL" ]; then
        test_environment "$STAGING_URL" "STAGING" || ((total_failed++))
    else
        log_warning "No hay URL de staging para probar"
    fi
    
    echo ""
    echo "=================================="
    echo ""
    
    # Probar production
    if [ -n "$PRODUCTION_URL" ]; then
        test_environment "$PRODUCTION_URL" "PRODUCTION" || ((total_failed++))
    else
        log_warning "No hay URL de production para probar"
    fi
    
    echo ""
    echo "=================================="
    echo ""
    
    # Resumen final
    if [ $total_failed -eq 0 ]; then
        log_success "🎉 Todas las pruebas de despliegue fueron exitosas!"
        echo ""
        log_info "📋 URLs de acceso:"
        [ -n "$STAGING_URL" ] && echo "   🔧 Staging: $STAGING_URL"
        [ -n "$PRODUCTION_URL" ] && echo "   🌟 Production: $PRODUCTION_URL"
        echo ""
        exit 0
    else
        log_error "💥 $total_failed entorno(s) fallaron las pruebas"
        echo ""
        log_info "🔍 Revisa los logs anteriores para más detalles"
        echo ""
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
