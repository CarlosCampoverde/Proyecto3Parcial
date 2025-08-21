# 🚀 Quick Setup Guide - Railway CD

## ⚡ Configuración Rápida (5 minutos)

### 1️⃣ **Crear cuenta y proyecto en Railway**

1. Ve a [railway.app](https://railway.app) y regístrate
2. Crea un nuevo proyecto: **"New Project" → "Empty Project"**
3. Nombra tu proyecto: `proyectop2preubas`
4. **Importante**: Copia el **Project ID** de la URL (ejemplo: `a1b2c3d4-...`)

### 2️⃣ **Obtener Railway API Token**

1. En Railway Dashboard → **Settings** → **Tokens**
2. **"Create New Token"** → Nombra: `github-cd-token`
3. **Copia el token** (solo se muestra una vez)

### 3️⃣ **Configurar GitHub Secrets**

Ve a tu repositorio GitHub:
```
Repository → Settings → Secrets and Variables → Actions → New Repository Secret
```

Agregar estos 4 secrets:

| Secret Name | Valor | Ejemplo |
|-------------|-------|---------|
| `RAILWAY_TOKEN` | Token de Railway | `6a7b8c9d-1234-5678-...` |
| `RAILWAY_PROJECT_ID` | ID del proyecto | `a1b2c3d4-5678-90ab-...` |
| `JWT_SECRET` | Clave para production | `ultra-secure-prod-key-2024` |
| `JWT_SECRET_STAGING` | Clave para staging | `secure-staging-key-2024` |

### 4️⃣ **Agregar PostgreSQL al proyecto**

1. En Railway Dashboard del proyecto
2. **"+ New"** → **"Database"** → **"PostgreSQL"**
3. Railway auto-configurará `DATABASE_URL`

### 5️⃣ **Verificar que el CD funcione**

1. Haz cualquier cambio pequeño y push a `main`:
   ```bash
   git commit --allow-empty -m "🧪 Test CD pipeline"
   git push origin main
   ```

2. Ve a GitHub Actions:
   ```
   Repository → Actions → Workflows
   ```

3. Deberías ver 2 workflows:
   - ✅ **CI/CD Pipeline** (debe pasar primero)
   - 🚀 **Continuous Deployment** (se ejecuta automáticamente si CI pasa)

### 6️⃣ **Verificar despliegue**

Una vez que CD termine exitosamente:

- **Production**: https://proyectop2preubas-production.railway.app
- **Staging**: https://proyectop2preubas-staging.railway.app
- **Health Check**: `/api/health` en ambas URLs

## 🔍 **Troubleshooting Rápido**

### ❌ **CD no se ejecuta**
- Verifica que CI haya pasado completamente
- Revisa que el push sea a rama `main`

### ❌ **Railway deployment falla**
- Verifica que los secrets estén configurados correctamente
- Revisa que PostgreSQL esté agregado al proyecto

### ❌ **Health check falla**
- El backend puede tardar 1-2 minutos en estar listo
- Verifica que el endpoint `/api/health` responda localmente

### ❌ **No encuentra proyecto**
- Verifica que `RAILWAY_PROJECT_ID` sea correcto
- El ID debe copiarse de la URL del proyecto en Railway

## 🎯 **¿Funcionó todo?**

Si todo está bien configurado:

1. ✅ GitHub Actions muestra workflows verdes
2. ✅ URLs de Railway responden
3. ✅ Health check retorna status OK
4. ✅ README se actualiza automáticamente con URLs

---

## 📞 **¿Necesitas ayuda?**

- Revisa los logs de GitHub Actions para errores específicos
- Verifica la documentación completa en `CD_IMPLEMENTATION_FINAL.md`
- Los scripts `railway-setup.sh` pueden ayudar con configuración local
