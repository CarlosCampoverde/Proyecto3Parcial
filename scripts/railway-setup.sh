#!/bin/bash

# 🚀 Railway Infrastructure as Code
# Script para configurar y desplegar en Railway

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Configuración
PROJECT_NAME="proyectop2preubas"
STAGING_SERVICE="${PROJECT_NAME}-staging"
PRODUCTION_SERVICE="${PROJECT_NAME}-production"

# Verificar Railway CLI
check_railway_cli() {
    log_info "Verificando Railway CLI..."
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI no está instalado"
        log_info "Instalando Railway CLI..."
        npm install -g @railway/cli@latest
        log_success "Railway CLI instalado"
    else
        log_success "Railway CLI encontrado"
    fi
}

# Login a Railway
railway_login() {
    log_info "Verificando autenticación con Railway..."
    if ! railway whoami &> /dev/null; then
        log_warning "No estás logueado en Railway"
        log_info "Ejecuta: railway login"
        exit 1
    else
        log_success "Autenticado en Railway"
    fi
}

# Crear proyecto en Railway
create_project() {
    log_info "Creando proyecto en Railway..."
    
    # Crear proyecto principal si no existe
    if ! railway list | grep -q "$PROJECT_NAME"; then
        railway create "$PROJECT_NAME"
        log_success "Proyecto $PROJECT_NAME creado"
    else
        log_success "Proyecto $PROJECT_NAME ya existe"
    fi
    
    # Link al proyecto
    railway link "$PROJECT_NAME"
}

# Configurar entornos
setup_environments() {
    log_info "Configurando entornos..."
    
    # Crear entorno de staging
    railway environment create staging 2>/dev/null || log_info "Entorno staging ya existe"
    
    # Crear entorno de production
    railway environment create production 2>/dev/null || log_info "Entorno production ya existe"
    
    log_success "Entornos configurados"
}

# Configurar base de datos PostgreSQL
setup_database() {
    local environment=$1
    log_info "Configurando base de datos para $environment..."
    
    railway environment $environment
    
    # Agregar servicio PostgreSQL si no existe
    if ! railway services | grep -q "postgresql"; then
        railway add postgresql
        log_success "Servicio PostgreSQL agregado para $environment"
    else
        log_success "Servicio PostgreSQL ya existe para $environment"
    fi
}

# Configurar variables de entorno
setup_environment_variables() {
    local environment=$1
    log_info "Configurando variables de entorno para $environment..."
    
    railway environment $environment
    
    # Variables comunes
    railway variables set NODE_ENV=$environment
    railway variables set PORT=3000
    
    # Variables específicas por entorno
    if [ "$environment" = "staging" ]; then
        railway variables set JWT_SECRET="${JWT_SECRET_STAGING:-staging-jwt-secret-key-2024}"
    elif [ "$environment" = "production" ]; then
        railway variables set JWT_SECRET="${JWT_SECRET:-production-jwt-secret-key-2024}"
    fi
    
    log_success "Variables configuradas para $environment"
}

# Desplegar aplicación
deploy_application() {
    local environment=$1
    log_info "Desplegando aplicación a $environment..."
    
    railway environment $environment
    
    # Desplegar
    railway up --detach
    
    # Obtener URL
    local deployment_url=$(railway status --json | jq -r '.deployments[0].url // "unknown"')
    log_success "Aplicación desplegada a $environment: $deployment_url"
    
    # Guardar URL en archivo
    echo "$deployment_url" > ".railway-url-$environment"
}

# Health check
health_check() {
    local environment=$1
    local url_file=".railway-url-$environment"
    
    if [ -f "$url_file" ]; then
        local url=$(cat "$url_file")
        log_info "Verificando salud de $environment en $url..."
        
        # Esperar que el servicio esté listo
        sleep 30
        
        # Health check con reintentos
        for i in {1..10}; do
            if curl -f -s "$url/api/health" > /dev/null; then
                log_success "Health check pasó para $environment (intento $i)"
                return 0
            else
                log_warning "Health check falló para $environment (intento $i), reintentando..."
                sleep 10
            fi
        done
        
        log_error "Health check falló para $environment después de 10 intentos"
        return 1
    else
        log_error "No se encontró URL para $environment"
        return 1
    fi
}

# Configurar dominios personalizados (opcional)
setup_custom_domains() {
    local environment=$1
    log_info "Configurando dominios personalizados para $environment..."
    
    railway environment $environment
    
    # Ejemplo de configuración de dominio
    if [ "$environment" = "production" ] && [ -n "${CUSTOM_DOMAIN}" ]; then
        railway domain add "${CUSTOM_DOMAIN}"
        log_success "Dominio personalizado configurado: ${CUSTOM_DOMAIN}"
    fi
}

# Función principal
main() {
    log_info "🚀 Iniciando configuración de infraestructura Railway..."
    
    # Verificaciones preliminares
    check_railway_cli
    railway_login
    
    # Configuración del proyecto
    create_project
    setup_environments
    
    # Configurar staging
    log_info "📦 Configurando entorno STAGING..."
    setup_database "staging"
    setup_environment_variables "staging"
    
    # Configurar production
    log_info "🌟 Configurando entorno PRODUCTION..."
    setup_database "production"
    setup_environment_variables "production"
    
    # Despliegues
    if [ "${DEPLOY:-false}" = "true" ]; then
        log_info "🚀 Iniciando despliegues..."
        
        deploy_application "staging"
        health_check "staging"
        
        deploy_application "production"
        health_check "production"
        
        # Configurar dominios si están disponibles
        setup_custom_domains "production"
    fi
    
    log_success "🎉 Configuración de infraestructura completada!"
    
    # Mostrar información útil
    echo ""
    log_info "📋 Información del proyecto:"
    echo "   - Proyecto: $PROJECT_NAME"
    echo "   - Staging: $(cat .railway-url-staging 2>/dev/null || echo 'No desplegado')"
    echo "   - Production: $(cat .railway-url-production 2>/dev/null || echo 'No desplegado')"
    echo ""
    log_info "🔧 Comandos útiles:"
    echo "   - Ver logs: railway logs"
    echo "   - Ver status: railway status"
    echo "   - Cambiar entorno: railway environment [staging|production]"
    echo "   - Desplegar: railway up"
}

# Ejecutar función principal
main "$@"
