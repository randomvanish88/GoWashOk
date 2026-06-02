# 🔧 COMANDOS ÚTILES - GoWash POS

## 📋 COMANDOS DE VERCEL

### Login y Autenticación
```cmd
# Iniciar sesión
vercel.cmd login

# Ver usuario actual
vercel.cmd whoami

# Cerrar sesión
vercel.cmd logout
```

### Despliegue
```cmd
# Desplegar a producción
vercel.cmd --prod

# Desplegar a preview (testing)
vercel.cmd

# Desplegar sin preguntas (usa configuración existente)
vercel.cmd --prod --yes

# Desplegar forzando nuevo proyecto
vercel.cmd --prod --force --name gowash-nuevo
```

### Información y Gestión
```cmd
# Listar todos tus proyectos
vercel.cmd list

# Ver información del proyecto actual
vercel.cmd inspect

# Ver logs en tiempo real
vercel.cmd logs [tu-url] --follow

# Ver últimos logs
vercel.cmd logs [tu-url]

# Remover un deployment
vercel.cmd remove [deployment-url]
```

### Dominios
```cmd
# Listar dominios
vercel.cmd domains list

# Agregar dominio
vercel.cmd domains add [tu-dominio.com]

# Remover dominio
vercel.cmd domains rm [tu-dominio.com]
```

### Variables de Entorno
```cmd
# Listar variables
vercel.cmd env ls

# Agregar variable
vercel.cmd env add

# Remover variable
vercel.cmd env rm [NOMBRE_VARIABLE]
```

---

## 📦 COMANDOS DE NPM

### Instalación
```cmd
# Instalar todas las dependencias
npm install

# Instalar dependencia específica
npm install [paquete]

# Instalar dependencia de desarrollo
npm install --save-dev [paquete]

# Actualizar todas las dependencias
npm update

# Verificar dependencias desactualizadas
npm outdated
```

### Build y Desarrollo
```cmd
# Desarrollo normal (desktop)
npm run dev

# Desarrollo modo móvil
npm run dev:mobile

# Build para producción
npm run build

# Preview del build
npm run preview

# Build optimizado para Vercel
npm run vercel:build

# Limpiar caché y node_modules
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Electron
```cmd
# Iniciar app Electron (desktop)
npm run electron:dev

# Build instalador Windows
npm run electron:build

# Build solo portable
npm run electron:build:portable
```

### Testing y Calidad
```cmd
# Verificar errores de TypeScript
npm run type-check

# Linter
npm run lint

# Fix linter automático
npm run lint:fix

# Format código
npm run format
```

---

## 🔄 COMANDOS DE GIT

### Básicos
```cmd
# Ver estado
git status

# Ver cambios
git diff

# Agregar archivos
git add .
git add [archivo]

# Commit
git commit -m "Descripción del cambio"

# Push
git push

# Pull
git pull
```

### Branches
```cmd
# Listar branches
git branch

# Crear branch
git branch [nombre]

# Cambiar branch
git checkout [nombre]

# Crear y cambiar branch
git checkout -b [nombre]

# Merge branch
git merge [nombre]
```

### Historial
```cmd
# Ver log
git log

# Ver log resumido
git log --oneline

# Ver cambios de un commit
git show [commit-hash]
```

### Deshacer Cambios
```cmd
# Descartar cambios no guardados
git checkout -- [archivo]

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (borrar cambios)
git reset --hard HEAD~1

# Revertir commit específico
git revert [commit-hash]
```

---

## 🗄️ COMANDOS DE CAPACITOR (APK)

### Instalación y Configuración
```cmd
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# Inicializar Capacitor
npx cap init

# Agregar plataforma Android
npx cap add android

# Agregar plataforma iOS
npx cap add ios
```

### Sincronización
```cmd
# Sincronizar cambios del build
npx cap sync

# Sincronizar solo Android
npx cap sync android

# Copiar archivos web a nativo
npx cap copy

# Actualizar plugins
npx cap update
```

### Abrir en IDE
```cmd
# Abrir Android Studio
npx cap open android

# Abrir Xcode (Mac)
npx cap open ios
```

### Build
```cmd
# Build completo (web + sync)
npm run build
npx cap sync android
npx cap open android
```

---

## 🔍 COMANDOS DE DIAGNÓSTICO

### Verificar Instalaciones
```cmd
# Node.js
node --version

# NPM
npm --version

# Vercel CLI
vercel.cmd --version

# Git
git --version

# Java (para Android)
java -version

# Capacitor
npx cap --version
```

### Verificar Configuración
```cmd
# Ver configuración de NPM
npm config list

# Ver path
echo %PATH%

# Ver variables de entorno
set

# Ver información del sistema
systeminfo

# Ver espacio en disco
wmic logicaldisk get size,freespace,caption
```

### Limpiar Caché
```cmd
# Caché de NPM
npm cache clean --force

# Caché de Vercel
vercel.cmd dev --clean

# Limpiar build
rmdir /s /q dist
rmdir /s /q dist_electron

# Limpiar todo
rmdir /s /q node_modules
rmdir /s /q dist
rmdir /s /q dist_electron
del package-lock.json
npm install
```

---

## 🚀 FLUJOS DE TRABAJO COMPLETOS

### Flujo: Primer Despliegue
```cmd
# 1. Verificar que todo está listo
npm install
npm run build

# 2. Login en Vercel
vercel.cmd login

# 3. Desplegar
vercel.cmd --prod

# 4. Copiar URL resultante
```

### Flujo: Actualización Normal
```cmd
# 1. Hacer cambios en código
# 2. Probar localmente
npm run dev

# 3. Build
npm run build

# 4. Desplegar
vercel.cmd --prod

# 5. Verificar URL
```

### Flujo: Actualización con Git
```cmd
# 1. Guardar cambios
git add .
git commit -m "Descripción"

# 2. Build y deploy
npm run build
vercel.cmd --prod

# 3. Push a Git
git push
```

### Flujo: Rollback (Volver Atrás)
```cmd
# 1. Ver deployments
vercel.cmd list

# 2. Promover deployment anterior
vercel.cmd promote [deployment-url]

# O redesplegar commit anterior
git log --oneline
git checkout [commit-hash]
npm run build
vercel.cmd --prod
git checkout main
```

### Flujo: Crear APK
```cmd
# 1. Build web
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Abrir Android Studio
npx cap open android

# 4. En Android Studio:
#    Build → Generate Signed Bundle / APK
#    Seguir wizard
```

### Flujo: Desarrollo Local Móvil
```cmd
# 1. Iniciar servidor
npm run dev:mobile

# 2. Escanear QR con móvil
#    O abrir URL mostrada

# 3. Hacer cambios
#    Se recarga automáticamente
```

---

## 🔐 COMANDOS DE SEGURIDAD

### Auditoría de Dependencias
```cmd
# Auditar vulnerabilidades
npm audit

# Fix automático
npm audit fix

# Fix forzado
npm audit fix --force

# Ver detalles
npm audit --json
```

### Limpiar Archivos Sensibles
```cmd
# Buscar archivos con secretos (revisar manualmente)
dir /s *.env
dir /s *secret*
dir /s *key*
dir /s *password*
```

---

## 📊 COMANDOS DE MONITOREO

### Vercel Analytics
```cmd
# Ver analytics en browser
vercel.cmd --analytics

# O visita:
# https://vercel.com/[usuario]/[proyecto]/analytics
```

### Logs y Debugging
```cmd
# Logs en tiempo real
vercel.cmd logs [url] --follow

# Logs con filtro
vercel.cmd logs [url] --filter error

# Últimos 100 logs
vercel.cmd logs [url] --limit 100
```

---

## 🎯 COMANDOS SEGÚN ESCENARIO

### Problema: "App no carga"
```cmd
# 1. Verificar build local
npm run build
npm run preview

# 2. Verificar logs de Vercel
vercel.cmd logs [tu-url]

# 3. Limpiar y rebuildar
rmdir /s /q dist
npm run build
vercel.cmd --prod
```

### Problema: "Cambios no se ven"
```cmd
# 1. Verificar que hay build nuevo
npm run build

# 2. Desplegar
vercel.cmd --prod

# 3. Limpiar caché navegador
# Ctrl + Shift + R (hard refresh)

# 4. Verificar URL correcta
vercel.cmd inspect
```

### Problema: "Error al desplegar"
```cmd
# 1. Ver error específico
vercel.cmd logs

# 2. Verificar build local
npm run build

# 3. Limpiar e intentar de nuevo
vercel.cmd dev --clean
vercel.cmd --prod
```

### Problema: "Dependencias desactualizadas"
```cmd
# 1. Ver qué está desactualizado
npm outdated

# 2. Actualizar todo
npm update

# 3. O actualizar específico
npm install [paquete]@latest

# 4. Rebuild y deploy
npm run build
vercel.cmd --prod
```

---

## 🔗 LINKS RÁPIDOS

### Dashboards
```cmd
# Abrir Vercel dashboard
start https://vercel.com/dashboard

# Abrir proyecto específico
start https://vercel.com/[usuario]/[proyecto]

# Abrir analytics
start https://vercel.com/[usuario]/[proyecto]/analytics

# Abrir logs
start https://vercel.com/[usuario]/[proyecto]/logs
```

---

## 💡 TIPS Y TRUCOS

### Alias Útiles (Crear archivo aliases.bat)
```cmd
@echo off
REM Alias para comandos frecuentes

:deploy
npm run build && vercel.cmd --prod
goto :eof

:dev
npm run dev:mobile
goto :eof

:clean
rmdir /s /q node_modules dist
npm install
goto :eof
```

### Variables de Entorno en CMD
```cmd
# Establecer variable temporal
set NODE_ENV=production

# Establecer variable permanente
setx VERCEL_ORG_ID "tu-org-id"

# Ver variable
echo %NODE_ENV%
```

---

## 📝 CHEAT SHEET RÁPIDO

```
DESPLEGAR:       vercel.cmd --prod
DESARROLLO:      npm run dev
BUILD:           npm run build
LOGIN:           vercel.cmd login
VER PROYECTOS:   vercel.cmd list
VER LOGS:        vercel.cmd logs [url]
LIMPIAR:         rmdir /s /q node_modules && npm install
GIT COMMIT:      git add . && git commit -m "mensaje"
GIT PUSH:        git push
```

---

_Comandos Útiles - GoWash POS v17.0.0_
