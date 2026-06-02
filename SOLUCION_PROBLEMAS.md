# 🆘 SOLUCIÓN DE PROBLEMAS - GoWash POS

## 📋 ÍNDICE RÁPIDO

- [Problemas de Despliegue](#problemas-de-despliegue)
- [Problemas de Instalación Móvil](#problemas-de-instalación-móvil)
- [Problemas de la Aplicación](#problemas-de-la-aplicación)
- [Problemas de Google Sheets](#problemas-de-google-sheets)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Red](#problemas-de-red)
- [Problemas Generales](#problemas-generales)

---

## 🚀 PROBLEMAS DE DESPLIEGUE

### ❌ Error: "vercel: command not found"

**Causa:** Vercel CLI no está instalado o no está en PATH

**Solución:**
```cmd
# Instalar Vercel CLI
npm install -g vercel

# Verificar instalación
vercel --version

# Si sigue sin funcionar, cerrar y abrir terminal
```

**Alternativa:**
```cmd
# Usar npx (no requiere instalación global)
npx vercel --prod
```

---

### ❌ Error: "Not authenticated"

**Causa:** No has iniciado sesión en Vercel

**Solución:**
```cmd
vercel.cmd login
# Sigue las instrucciones en el navegador
```

---

### ❌ Error: "No se puede cargar el archivo vercel.ps1"

**Causa:** PowerShell bloquea scripts externos

**Solución 1 (Recomendada):**
```cmd
# Usar CMD en lugar de PowerShell
cmd
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash
vercel.cmd --prod
```

**Solución 2:**
```cmd
# Agregar .cmd explícitamente
vercel.cmd --prod
```

**Solución 3 (No recomendada):**
```powershell
# Habilitar scripts en PowerShell (como administrador)
Set-ExecutionPolicy RemoteSigned
```

---

### ❌ Error: "Build failed" durante despliegue

**Causa:** Errores en el código o dependencias faltantes

**Solución:**
```cmd
# 1. Probar build local
npm run build

# 2. Ver errores específicos
# Si hay errores, corregirlos

# 3. Limpiar y reinstalar
rmdir /s /q node_modules
del package-lock.json
npm install

# 4. Build de nuevo
npm run build

# 5. Desplegar
vercel.cmd --prod
```

**Ver logs de Vercel:**
```cmd
vercel.cmd logs [tu-url]
```

---

### ❌ Error: "Error: ENOENT: no such file or directory, open 'dist/index.html'"

**Causa:** No se ha ejecutado el build antes de desplegar

**Solución:**
```cmd
# Ejecutar build
npm run build

# Verificar que existe dist/
dir dist

# Desplegar
vercel.cmd --prod
```

---

### ❌ El despliegue se queda "esperando"

**Causa:** Vercel está esperando input interactivo

**Solución:**
```cmd
# Presionar Ctrl+C para cancelar
# Ejecutar con --yes para auto-confirmar
vercel.cmd --prod --yes
```

---

### ❌ Error: "Rate limit exceeded"

**Causa:** Demasiados despliegues en poco tiempo

**Solución:**
- Esperar 5-10 minutos
- Limitar despliegues a solo cuando sea necesario
- Considerar plan de pago si despliegas muy frecuentemente

---

## 📱 PROBLEMAS DE INSTALACIÓN MÓVIL

### ❌ No aparece "Agregar a pantalla de inicio" (Android)

**Causas y Soluciones:**

1. **No es HTTPS:**
   - Vercel siempre usa HTTPS ✅
   - Si usas otro servidor, debe ser HTTPS

2. **Falta Service Worker:**
   ```cmd
   # Verificar que existe
   dir public\sw.js
   
   # Si no existe, crearlo (ya está en tu proyecto)
   ```

3. **Falta manifest.json:**
   ```cmd
   # Verificar
   dir public\manifest.json
   
   # Si no existe, crearlo (ya está en tu proyecto)
   ```

4. **Navegador incompatible:**
   - Usar Chrome o Edge
   - Samsung Internet también funciona
   - Firefox puede tener problemas

5. **Ya está instalado:**
   - Verifica en aplicaciones instaladas
   - Desinstala y reinstala

---

### ❌ No aparece "Agregar a inicio" (iOS)

**Causas y Soluciones:**

1. **No estás usando Safari:**
   - iOS solo permite PWA desde Safari
   - Chrome en iOS no funciona para PWA

2. **Modo privado activado:**
   - Sal del modo privado
   - Abre en pestaña normal

3. **iOS muy antiguo:**
   - Requiere iOS 11.3 o superior
   - Actualiza iOS si es posible

---

### ❌ La app se abre en el navegador, no como app

**Causa:** No se instaló correctamente como PWA

**Solución:**
1. Eliminar el ícono/marcador
2. Cerrar todas las pestañas
3. Abrir URL de nuevo
4. "Agregar a pantalla de inicio" correctamente
5. Abrir desde el ícono nuevo

---

### ❌ El ícono de la app es genérico

**Causa:** Los íconos no se cargaron correctamente

**Solución:**
```cmd
# Verificar que existen los íconos
dir public\*.png

# Si faltan, agregar íconos:
# - icon-192.png (192x192)
# - icon-512.png (512x512)

# Rebuild y redesplegar
npm run build
vercel.cmd --prod
```

---

## 💻 PROBLEMAS DE LA APLICACIÓN

### ❌ La app no carga / Pantalla blanca

**Diagnóstico:**
```cmd
# 1. Abrir DevTools (F12)
# 2. Ver la pestaña Console
# 3. Ver errores en rojo
```

**Soluciones según error:**

**Error: "Failed to fetch"**
- Verificar conexión a internet (primera carga)
- Limpiar caché del navegador (Ctrl+Shift+Del)
- Hacer hard refresh (Ctrl+Shift+R)

**Error de JavaScript:**
- Build corrupto
- Redesplegar:
  ```cmd
  npm run build
  vercel.cmd --prod
  ```

**Service Worker error:**
- Desregistrar Service Worker:
  - DevTools → Application → Service Workers → Unregister
  - Refrescar la página

---

### ❌ Login no funciona

**Causa:** Credenciales incorrectas o problema de localStorage

**Solución:**
```cmd
# 1. Verificar credenciales en el código
# Archivo: src/pwa/MobileApp.tsx (líneas ~50-80)

# 2. Limpiar localStorage
# DevTools (F12) → Console → ejecutar:
localStorage.clear()
location.reload()

# 3. Verificar que no hay errores de red
# DevTools → Network
```

---

### ❌ Las fotos no se guardan

**Causas y Soluciones:**

1. **Sin permisos de cámara:**
   - Android: Ajustes → Aplicaciones → Chrome → Permisos → Cámara
   - iOS: Ajustes → Safari → Cámara

2. **localStorage lleno:**
   ```javascript
   // DevTools Console
   // Ver uso de storage
   navigator.storage.estimate().then(console.log)
   
   // Limpiar si es necesario
   localStorage.clear()
   ```

3. **Cámara en uso por otra app:**
   - Cerrar otras apps que usan cámara
   - Reiniciar teléfono

---

### ❌ Los datos no se guardan

**Causa:** localStorage deshabilitado o lleno

**Solución:**
```javascript
// Probar en DevTools Console
localStorage.setItem('test', 'test')
localStorage.getItem('test')

// Si da error, localStorage está deshabilitado:
// - Salir de modo privado/incógnito
// - Habilitar cookies y almacenamiento
// - Limpiar datos del sitio
```

---

### ❌ El QR no se genera

**Causa:** Vehículo sin ID o librería QR no cargó

**Solución:**
```javascript
// DevTools Console
// Ver datos del vehículo
console.log(localStorage.getItem('vehicles'))

// Verificar que tienen ID
// Si no tiene ID, eliminar y recrear
```

---

### ❌ La búsqueda no funciona

**Causa:** JavaScript error o datos corruptos

**Solución:**
```cmd
# 1. Ver errores en Console (F12)

# 2. Limpiar datos corruptos
localStorage.clear()
location.reload()

# 3. Volver a ingresar datos de prueba
```

---

### ❌ Los filtros no funcionan

**Causa:** Similar a búsqueda

**Solución:**
```cmd
# Ver Console para errores
# Refrescar página (F5)
# Limpiar caché (Ctrl+Shift+R)
```

---

## 📊 PROBLEMAS DE GOOGLE SHEETS

### ❌ "Solo funciona en desktop" en móvil

**Causa:** Es comportamiento esperado

**Explicación:**
- Google Sheets sync usa Electron IPC
- Solo funciona en versión desktop (exe)
- En PWA móvil NO está disponible

**Solución:**
- Usar versión desktop para sincronizar
- O implementar API REST para móviles (desarrollo futuro)

---

### ❌ Error: "Failed to sync with Google Sheets"

**Causas y Soluciones:**

1. **Permisos incorrectos:**
   ```
   # Compartir la hoja con:
   gowash-sync@gowash-db-496413.iam.gserviceaccount.com
   
   # Con permisos de "Editor"
   ```

2. **Sheet ID incorrecto:**
   ```
   # Copiar ID de la URL de Google Sheets:
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   
   # Pegar solo el ID, no la URL completa
   ```

3. **Credenciales expiradas:**
   ```cmd
   # Verificar archivo:
   electron/googleSheets.cjs
   
   # Contactar administrador si hay problemas
   ```

---

### ❌ Los datos no aparecen en la hoja

**Solución:**
```cmd
# 1. Verificar que la hoja está compartida

# 2. Probar sincronización manual:
#    - Abrir app desktop
#    - Click en ícono de Google Sheets
#    - "Sincronizar Ahora"

# 3. Ver errores en DevTools:
#    - F12 → Console
#    - Buscar errores de Sheets

# 4. Verificar formato de la hoja:
#    - Debe tener columnas correctas
#    - Ver: EJEMPLO_GOOGLE_SHEETS.md
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### ❌ La app va muy lenta

**Causas y Soluciones:**

1. **Muchos vehículos en localStorage:**
   ```javascript
   // Ver tamaño de datos
   console.log(localStorage.getItem('vehicles').length)
   
   // Si es muy grande (>1MB), limpiar viejos:
   // Exportar, limpiar localStorage, reimportar solo recientes
   ```

2. **Muchas fotos almacenadas:**
   - Fotos en base64 ocupan mucho espacio
   - Considerar subir a cloud storage
   - Implementar límite de fotos

3. **Service Worker corrupto:**
   ```cmd
   # Desregistrar y recargar
   # DevTools → Application → Service Workers
   # Unregister all → Refresh
   ```

4. **Teléfono con poco espacio:**
   - Liberar espacio en el dispositivo
   - Cerrar otras apps
   - Reiniciar teléfono

---

### ❌ La carga inicial es lenta

**Causas:**
- Primera carga descarga todos los assets
- Conexión lenta

**Solución:**
```cmd
# Optimizar build
npm run build -- --minify

# Verificar tamaño de dist/
dir dist

# Si es muy grande, optimizar:
# - Comprimir imágenes
# - Remover código no usado
# - Code splitting
```

---

## 🌐 PROBLEMAS DE RED

### ❌ "Failed to fetch" en primera carga

**Causa:** Sin conexión o URL incorrecta

**Solución:**
```cmd
# 1. Verificar conexión a internet
ping google.com

# 2. Verificar URL correcta
# Debe ser: https://tu-proyecto.vercel.app

# 3. Probar en navegador de PC primero

# 4. Si funciona en PC pero no en móvil:
#    - Verificar DNS del móvil
#    - Cambiar a WiFi o datos móviles
#    - Desactivar VPN
```

---

### ❌ La app no funciona offline

**Causa:** Service Worker no se instaló

**Solución:**
```cmd
# 1. Verificar Service Worker
# DevTools → Application → Service Workers
# Debe estar "activated"

# 2. Si no está, verificar archivo
dir public\sw.js

# 3. Limpiar caché y reinstalar
# Application → Clear storage → Clear site data
# Refrescar y esperar a que se instale
```

---

### ❌ Los cambios no se ven después de actualizar

**Causa:** Caché agresivo

**Solución:**

**En PC:**
```cmd
# Hard refresh
Ctrl + Shift + R

# O limpiar caché
Ctrl + Shift + Del → Borrar caché
```

**En móvil:**
```cmd
# Android:
# Chrome → Ajustes → Privacidad → Borrar datos
# Seleccionar solo "Caché"

# iOS:
# Safari → Ajustes → Borrar historial y datos
```

---

## 🔧 PROBLEMAS GENERALES

### ❌ "npm: command not found"

**Causa:** Node.js no instalado

**Solución:**
```cmd
# Descargar e instalar Node.js
# https://nodejs.org/

# Reiniciar terminal

# Verificar
node --version
npm --version
```

---

### ❌ "EACCES: permission denied"

**Causa:** Permisos insuficientes

**Solución:**
```cmd
# Ejecutar terminal como Administrador
# Click derecho → "Ejecutar como administrador"

# O cambiar permisos de la carpeta
icacls "C:\Users\Usuario\OneDrive\Escritorio\GoWash" /grant %username%:F /t
```

---

### ❌ "Port 3000 already in use"

**Causa:** Puerto ocupado por otro proceso

**Solución:**
```cmd
# Ver qué usa el puerto
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID [número] /F

# O usar otro puerto
set PORT=3001
npm run dev
```

---

### ❌ Pantalla en blanco después de actualización

**Causa:** Caché desincronizado

**Solución:**
```cmd
# 1. Limpiar todo
localStorage.clear()
sessionStorage.clear()

# 2. Desregistrar Service Worker
# DevTools → Application → Service Workers → Unregister

# 3. Hard refresh
Ctrl + Shift + R

# 4. Si persiste, reinstalar app
# Eliminar ícono, limpiar datos, reinstalar
```

---

## 🔍 DIAGNÓSTICO GENERAL

### Checklist de Diagnóstico:

```
1. [ ] ¿Funciona en PC?
       → Si no: Problema de deploy/código
       → Si sí: Problema de móvil/red

2. [ ] ¿Hay errores en Console? (F12)
       → Si sí: Anotar error y buscar arriba

3. [ ] ¿Funciona en otro navegador?
       → Si no: Problema de navegador específico
       → Si sí: Limpiar caché del navegador problemático

4. [ ] ¿Funciona en otro dispositivo?
       → Si no: Problema del dispositivo
       → Si sí: Limpiar datos de la app

5. [ ] ¿Funcionaba antes?
       → Si sí: Revisar qué cambió
       → Si no: Problema de configuración inicial
```

---

## 📞 PEDIR AYUDA

Si ninguna solución funciona:

### Información a Recopilar:

1. **Descripción del problema:**
   - ¿Qué estabas haciendo?
   - ¿Qué esperabas?
   - ¿Qué pasó en realidad?

2. **Errores exactos:**
   - Screenshot de Console (F12)
   - Mensaje de error completo
   - Stack trace si hay

3. **Entorno:**
   - Navegador y versión
   - Sistema operativo
   - Dispositivo (móvil/PC)
   - URL exacta

4. **Pasos para reproducir:**
   - Paso 1...
   - Paso 2...
   - Error ocurre aquí

5. **Lo que ya intentaste:**
   - Lista de soluciones probadas

### Dónde Pedir Ayuda:

- Vercel Support: https://vercel.com/support
- Stack Overflow: Buscar error específico
- GitHub Issues: Si es bug del framework
- Documentación: https://vercel.com/docs

---

## 💡 PREVENCIÓN

### Mejores Prácticas:

```
✅ Hacer backup antes de cambios grandes
✅ Probar en local antes de desplegar
✅ Desplegar en horarios de bajo uso
✅ Mantener dependencias actualizadas
✅ Monitorear logs regularmente
✅ Tener plan de rollback
✅ Documentar cambios importantes
✅ Probar en múltiples dispositivos
```

---

## 🎯 HERRAMIENTAS ÚTILES

### Para Debugging:

- **Chrome DevTools** (F12)
- **Lighthouse** (DevTools → Lighthouse)
- **Network tab** (ver requests)
- **Application tab** (ver storage)
- **Console tab** (ver errores)

### Para Testing:

- **BrowserStack** (probar en múltiples dispositivos)
- **ngrok** (exponer localhost a internet)
- **Postman** (probar APIs)

---

_Solución de Problemas - GoWash POS v17.0.0_
