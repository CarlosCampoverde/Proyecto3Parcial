# Proyecto3Parcial

[![CI/CD Pipeline](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/cd.yml/badge.svg)](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/cd.yml)
[![codecov](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial/branch/main/graph/badge.svg)](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial)

Sistema de gestión de reservas de gimnasio con backend en Node.js y frontend web.

## 🚀 Live Deployment

### � Production Environment
- **🌐 Live Application**: [https://proyectop2preubas-production.railway.app](https://proyectop2preubas-production.railway.app)
- **⚡ API Health Check**: [https://proyectop2preubas-production.railway.app/api/health](https://proyectop2preubas-production.railway.app/api/health)
- **📊 Railway Dashboard**: [View Deployment](https://railway.app/dashboard)

### 🧪 Staging Environment
- **🔧 Staging API**: [https://proyectop2preubas-staging.railway.app](https://proyectop2preubas-staging.railway.app)
- **✅ Health Check**: [https://proyectop2preubas-staging.railway.app/api/health](https://proyectop2preubas-staging.railway.app/api/health)

> **📅 Last Deploy**: Auto-updated by CD pipeline  
> **🏗️ Infrastructure**: Railway (PostgreSQL + Node.js)  
> **🔄 Auto-Deploy**: Only on `main` branch when CI + k6 tests pass

## 🏗️ CI/CD Pipeline Architecture

### ✅ **Continuous Integration (CI)** 
Ejecuta en cada push/PR:

- **🧪 Unit Tests**: Jest con cobertura > 70%
- **🔍 Code Quality**: ESLint + formato de código
- **🛡️ Security Audit**: Verificación de vulnerabilidades
- **⚡ Performance Tests**: k6 con thresholds estrictos
- **🐳 Multi-Environment**: Node.js 18.x y 20.x

### 🚀 **Continuous Deployment (CD)**
Despliegue condicionado (**solo si CI + k6 = ✅**):

1. **🔒 Gate Check**: Verifica que CI haya pasado
2. **🧪 Staging Deploy**: Despliegue a entorno de pruebas
3. **🔍 Smoke Tests**: Verificación básica en staging
4. **🌟 Production Deploy**: Despliegue a producción
5. **✅ Health Checks**: Verificación post-despliegue

#### 🌍 **Environment Protection Rules**
- **Staging**: Auto-deploy desde main
- **Production**: Requiere aprobación manual + CI success
- **Variables separadas** por entorno
- **Health checks** obligatorios antes de promover

### 📊 **Infrastructure as Code**
```bash
# Configurar infraestructura Railway
./scripts/railway-setup.sh

# Probar despliegues
./scripts/test-railway-deployment.sh

# Variables de entorno
source .env.railway
```

### 📊 **Pruebas de Rendimiento k6**
- **RAMP Test**: 10→100 usuarios en 12min (usuarios)
- **SPIKE Test**: 0→300 usuarios en 15s (servicios)
- **SOAK Test**: 50 usuarios durante 30min (reservas)
- **Thresholds**: p(95)<500ms, error<1%, checks>99%

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Testing**: Jest + Supertest + k6
- **CI/CD**: GitHub Actions
- **Deploy**: Railway + Vercel + Docker
- **Monitoring**: Health checks + performance metrics

## 🧪 Ejecutar Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar backend
npm start

# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas de rendimiento
npm run perf:all

# Ejecutar pruebas específicas
npm run perf:ramp    # Test RAMP
npm run perf:spike   # Test SPIKE  
npm run perf:soak    # Test SOAK
```

## � Despliegue con Docker

```bash
# Build imagen
docker build -t proyectop2preubas .

# Ejecutar container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongo_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  proyectop2preubas
```

## 📈 Monitoreo y Métricas

- **Health Check**: `/api/health`
- **Performance Reports**: Artifacts en GitHub Actions
- **Coverage Reports**: Codecov integration
- **Error Tracking**: Console logs + GitHub Issues

## 🔐 GitHub Secrets Configuration

Para que el CD funcione correctamente, configura estos secrets en tu repositorio:

### 🚂 **Railway Secrets**
```bash
RAILWAY_TOKEN=your-railway-api-token
RAILWAY_PROJECT_ID=your-project-id
```

### 🔑 **Environment Secrets**
```bash
# Production
JWT_SECRET=ultra-secure-production-secret-key-2024
DATABASE_URL=postgresql://... # Auto-managed by Railway

# Staging  
JWT_SECRET_STAGING=secure-staging-secret-key-2024
DATABASE_URL_STAGING=postgresql://... # Auto-managed by Railway
```

### 📋 **Cómo obtener Railway Token**
1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Settings → Tokens → Create New Token
3. Copia el token y agrégalo como secret `RAILWAY_TOKEN`
4. Obtén Project ID desde la URL del proyecto

## 🛠️ Setup Local para Development

```bash
# 1. Clonar repositorio
git clone https://github.com/CarlosCampoverde/Proyecto3Parcial.git
cd Proyecto3Parcial

# 2. Instalar dependencias
npm install

# 3. Configurar variables locales
cp .env.example .env
# Editar .env con tus valores

# 4. Ejecutar aplicación
npm start

# 5. Ejecutar tests
npm test
npm run perf:all
```

## � Scripts Disponibles

```bash
# Testing
npm test              # Unit tests + coverage
npm run test:watch    # Watch mode
npm run test:ci       # CI mode

# Performance
npm run perf          # All scenarios
npm run perf:ramp     # Ramp test
npm run perf:spike    # Spike test
npm run perf:soak     # Soak test

# PowerShell scripts
.\run-all-k6-tests.ps1     # All k6 tests
.\run-parallel-k6-tests.ps1  # Parallel execution
.\run-strict-k6-tests.ps1    # Strict thresholds
```

## 🎯 Criterios de Despliegue

El despliegue automático se ejecuta **SOLO SI**:
- ✅ Todas las pruebas unitarias pasan
- ✅ Cobertura de código > 70%
- ✅ Auditoría de seguridad pasa
- ✅ Pruebas k6 cumplen thresholds
- ✅ Push a rama `main`

¡Sistema listo para producción! 🚀
- **CI/CD**: GitHub Actions
