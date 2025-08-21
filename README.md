# Proyecto3Parcial

[![CI](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlosCampoverde/Proyecto3Parcial/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial/branch/main/graph/badge.svg)](https://codecov.io/gh/CarlosCampoverde/Proyecto3Parcial)

Sistema de gestión de reservas de gimnasio con backend en Node.js y frontend web.

## 🚀 Integración Continua

Este proyecto utiliza GitHub Actions para CI/CD con los siguientes checks:

- ✅ **Pruebas Unitarias**: Ejecución automática de tests con Jest
- ✅ **Cobertura de Código**: Reporte de cobertura con umbrales del 90%
- ✅ **Múltiples Versiones**: Testing en Node.js 18.x y 20.x
- ✅ **Auditoría de Seguridad**: Verificación de vulnerabilidades en dependencias
- ✅ **Artefactos**: Publicación automática de reportes de cobertura

### Status Checks

El workflow se ejecuta automáticamente en:
- Push a `main` o `master`
- Pull Requests hacia `main` o `master`

## 🧪 Ejecutar Pruebas Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar pruebas con cobertura
npm test

# Ver reporte de cobertura
# El reporte HTML se genera en ./coverage/lcov-report/index.html
```

## 📊 Cobertura de Código

El proyecto mantiene un umbral mínimo del 90% de cobertura en:
- Líneas de código
- Funciones
- Ramas (branches)
- Declaraciones (statements)

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **CI/CD**: GitHub Actions
