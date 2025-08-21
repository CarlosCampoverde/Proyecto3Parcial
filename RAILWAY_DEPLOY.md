# 🚀 Despliegue en Railway - Guía Rápida

## ⚡ Configuración Automática

Railway detectará automáticamente tu proyecto Node.js y configurará:
- PostgreSQL database
- Node.js runtime
- Variables de entorno

## 🔧 Variables de Entorno Requeridas

En tu proyecto de Railway, configura estas variables:

```bash
DATABASE_URL=postgresql://... # Automático
JWT_SECRET=tu-clave-super-secreta-aqui
NODE_ENV=production
```

## 🎯 Estructura Simplificada

```
ProyectoP2Preubas/
├── backend/
│   ├── app.js              # Express app principal
│   ├── server.js           # Servidor
│   ├── database.js         # Conexión Prisma
│   ├── controllers/        # Controladores
│   ├── routes/            # Rutas API
│   └── middlewares/       # Middlewares
├── frontend/              # Archivos estáticos
├── prisma/
│   └── schema.prisma      # Esquema DB
├── package.json
├── railway.json           # Config Railway
└── .env.example
```

## 🚀 Comandos de Despliegue

### 1. Conectar con Railway
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Link proyecto
railway link
```

### 2. Configurar Variables
```bash
railway variables set JWT_SECRET=tu-clave-secreta
```

### 3. Desplegar
```bash
railway up
```

## 📊 Health Check

Tu app estará disponible en: `https://tu-proyecto.railway.app`

- Frontend: `/`
- Health: `/api/health`
- API: `/api/usuarios`, `/api/servicios`, `/api/reservas`

## ✅ Verificación

1. ✅ Base de datos PostgreSQL conectada
2. ✅ Prisma schema migrado
3. ✅ Frontend servido desde `/`
4. ✅ API funcional en `/api/*`
5. ✅ Health check en `/api/health`

## 🐛 Troubleshooting

### Problema: "Cannot GET /"
- ✅ **Solucionado**: Express configurado para servir frontend

### Problema: Database connection
- Verificar que PostgreSQL esté agregado al proyecto
- Confirmar variable `DATABASE_URL`

### Problema: 500 errors
- Revisar logs: `railway logs`
- Verificar variables de entorno
