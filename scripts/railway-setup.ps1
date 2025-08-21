# 🚀 Railway Setup Script para Windows PowerShell
# Script para configurar el proyecto Railway desde Windows

param(
    [switch]$Setup,
    [switch]$Deploy,
    [switch]$Test,
    [switch]$Help
)

# Colores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($msg) { Write-ColorOutput Blue "ℹ️  $msg" }
function Write-Success($msg) { Write-ColorOutput Green "✅ $msg" }
function Write-Warning($msg) { Write-ColorOutput Yellow "⚠️  $msg" }
function Write-Error($msg) { Write-ColorOutput Red "❌ $msg" }

function Show-Help {
    Write-Host ""
    Write-ColorOutput Cyan "🚀 Railway CD Setup Script para Windows"
    Write-Host ""
    Write-Host "Uso:"
    Write-Host "  .\railway-setup.ps1 -Setup    # Configurar Railway CLI y proyecto"
    Write-Host "  .\railway-setup.ps1 -Deploy   # Desplegar a Railway"
    Write-Host "  .\railway-setup.ps1 -Test     # Probar endpoints desplegados"
    Write-Host "  .\railway-setup.ps1 -Help     # Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\railway-setup.ps1 -Setup -Deploy -Test  # Configurar, desplegar y probar"
    Write-Host ""
}

function Test-RailwayCLI {
    Write-Info "Verificando Railway CLI..."
    
    try {
        $version = railway --version 2>$null
        if ($version) {
            Write-Success "Railway CLI encontrado: $version"
            return $true
        }
    }
    catch {
        Write-Warning "Railway CLI no encontrado"
    }
    
    Write-Info "Instalando Railway CLI..."
    try {
        npm install -g @railway/cli@latest
        Write-Success "Railway CLI instalado exitosamente"
        return $true
    }
    catch {
        Write-Error "Error instalando Railway CLI"
        Write-Host "Prueba manualmente: npm install -g @railway/cli@latest"
        return $false
    }
}

function Test-RailwayAuth {
    Write-Info "Verificando autenticación con Railway..."
    
    try {
        $whoami = railway whoami 2>$null
        if ($whoami) {
            Write-Success "Autenticado en Railway como: $whoami"
            return $true
        }
    }
    catch {
        Write-Warning "No estás autenticado en Railway"
        Write-Host ""
        Write-Host "Para autenticarte:"
        Write-Host "1. Ejecuta: railway login"
        Write-Host "2. Sigue las instrucciones del navegador"
        Write-Host "3. Vuelve a ejecutar este script"
        return $false
    }
}

function Setup-Railway {
    Write-Info "🚀 Configurando proyecto Railway..."
    
    # Verificar CLI
    if (-not (Test-RailwayCLI)) {
        return $false
    }
    
    # Verificar auth
    if (-not (Test-RailwayAuth)) {
        return $false
    }
    
    # Crear/configurar proyecto
    Write-Info "Configurando proyecto 'proyectop2preubas'..."
    
    try {
        # Intentar crear proyecto (fallará si ya existe, está OK)
        railway create "proyectop2preubas" 2>$null
        Write-Success "Proyecto creado o ya existe"
        
        # Link al proyecto
        railway link "proyectop2preubas"
        Write-Success "Proyecto linkeado"
        
        # Crear entornos
        railway environment create staging 2>$null
        railway environment create production 2>$null
        Write-Success "Entornos staging y production configurados"
        
        return $true
    }
    catch {
        Write-Error "Error configurando proyecto Railway"
        Write-Host "Error: $_"
        return $false
    }
}

function Deploy-ToRailway {
    Write-Info "🚀 Desplegando a Railway..."
    
    try {
        # Deploy a staging primero
        Write-Info "Desplegando a staging..."
        railway environment staging
        railway up --detach
        Write-Success "Staging desplegado"
        
        # Deploy a production
        Write-Info "Desplegando a production..."
        railway environment production
        railway up --detach
        Write-Success "Production desplegado"
        
        return $true
    }
    catch {
        Write-Error "Error durante despliegue"
        Write-Host "Error: $_"
        return $false
    }
}

function Test-Deployment {
    Write-Info "🧪 Probando despliegues..."
    
    # Obtener URLs
    try {
        railway environment staging
        $stagingUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty deployments | Select-Object -First 1 -ExpandProperty url
        
        railway environment production
        $productionUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty deployments | Select-Object -First 1 -ExpandProperty url
        
        Write-Success "URLs obtenidas:"
        Write-Host "  Staging: $stagingUrl"
        Write-Host "  Production: $productionUrl"
        
        # Test health checks
        if ($stagingUrl) {
            Write-Info "Probando staging health check..."
            try {
                $response = Invoke-WebRequest -Uri "$stagingUrl/api/health" -TimeoutSec 10
                Write-Success "Staging health check OK - Status: $($response.StatusCode)"
            }
            catch {
                Write-Warning "Staging health check falló (puede estar iniciándose)"
            }
        }
        
        if ($productionUrl) {
            Write-Info "Probando production health check..."
            try {
                $response = Invoke-WebRequest -Uri "$productionUrl/api/health" -TimeoutSec 10
                Write-Success "Production health check OK - Status: $($response.StatusCode)"
            }
            catch {
                Write-Warning "Production health check falló (puede estar iniciándose)"
            }
        }
        
        return $true
    }
    catch {
        Write-Error "Error probando despliegues"
        Write-Host "Error: $_"
        return $false
    }
}

# Script principal
if ($Help -or (-not $Setup -and -not $Deploy -and -not $Test)) {
    Show-Help
    exit 0
}

Write-Host ""
Write-ColorOutput Cyan "🚀 Railway CD Setup - Windows PowerShell"
Write-Host ""

$success = $true

if ($Setup) {
    if (-not (Setup-Railway)) {
        $success = $false
    }
}

if ($Deploy -and $success) {
    if (-not (Deploy-ToRailway)) {
        $success = $false
    }
}

if ($Test -and $success) {
    if (-not (Test-Deployment)) {
        $success = $false
    }
}

Write-Host ""
if ($success) {
    Write-Success "🎉 Setup completado exitosamente!"
    Write-Host ""
    Write-Info "Próximos pasos:"
    Write-Host "1. Configura los GitHub Secrets (ver QUICK_SETUP_RAILWAY.md)"
    Write-Host "2. Haz push a main para activar el CD pipeline"
    Write-Host "3. Ve a GitHub Actions para ver el progreso"
} else {
    Write-Error "💥 Hubo errores durante el setup"
    Write-Host ""
    Write-Info "Revisa los mensajes anteriores y:"
    Write-Host "1. Verifica que tengas Node.js instalado"
    Write-Host "2. Verifica tu conexión a internet"
    Write-Host "3. Consulta la documentación completa"
}

Write-Host ""
