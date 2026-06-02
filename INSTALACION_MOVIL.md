# 📱 INSTALACIÓN EN MÓVILES - GoWash

## 🎯 3 FORMAS DE USAR GOWASH EN EL CELULAR

---

## 🌐 OPCIÓN 1: PWA (Progressive Web App) ⭐ RECOMENDADA

### ✅ Ventajas:
- ✅ No necesitas Google Play ni App Store
- ✅ Se instala en segundos
- ✅ Funciona como app nativa
- ✅ Recibe actualizaciones automáticas
- ✅ Funciona offline (con caché)
- ✅ No consume espacio significativo

### 📋 Requisitos:
- Servidor web accesible (puede ser tu PC en la misma red WiFi)
- Navegador moderno (Chrome, Safari, Edge)

### 🚀 INSTALACIÓN - ANDROID (Chrome/Edge)

#### Paso 1: Hostear la Aplicación
```
1. Asegúrate que tu PC esté en la misma red WiFi que el celular
2. Obtén la IP de tu PC:
   - Windows: abre CMD y escribe: ipconfig
   - Busca "IPv4 Address": ej. 192.168.1.100
3. En la PC, ejecuta: npm run dev -- --host
4. Verás algo como: "Network: http://192.168.1.100:5173"
```

#### Paso 2: Acceder desde el Celular
```
1. Abre Chrome en tu Android
2. Escribe en la URL: http://192.168.1.100:5173
   (usa la IP que obtuviste)
3. La app se cargará en el navegador
```

#### Paso 3: Instalar como PWA
```
1. En Chrome, toca el menú (⋮) arriba a la derecha
2. Selecciona "Agregar a pantalla de inicio" o "Instalar app"
3. Toca "Instalar" o "Agregar"
4. ¡Listo! Un icono aparecerá en tu pantalla de inicio
```

### 🍎 INSTALACIÓN - iOS (Safari)

#### Paso 1 y 2: Igual que Android

#### Paso 3: Instalar como PWA
```
1. En Safari, toca el botón compartir (cuadrado con flecha ⬆️)
2. Desplázate y selecciona "Agregar a pantalla de inicio"
3. Edita el nombre si quieres: "GoWash"
4. Toca "Agregar"
5. ¡Listo! Un icono aparecerá en tu pantalla de inicio
```

---

## 📦 OPCIÓN 2: APK NATIVA (Solo Android)

### ✅ Ventajas:
- ✅ App nativa verdadera
- ✅ Mejor rendimiento
- ✅ Acceso completo a hardware
- ✅ No necesita servidor corriendo

### ⚠️ Desventajas:
- ❌ Solo Android (iOS requiere proceso diferente)
- ❌ Requiere compilación
- ❌ Mayor tamaño (50-100 MB)
- ❌ Actualizaciones manuales

### 🔧 CONSTRUCCIÓN DEL APK

**Necesitas instalar Capacitor:**

```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar Capacitor
npx cap init

# Cuando te pregunte:
# - App name: GoWash
# - App ID: com.gowash.mobile
# - Web asset directory: dist

# 3. Agregar plataforma Android
npx cap add android

# 4. Construir la app web
npm run build

# 5. Copiar archivos a Android
npx cap copy android

# 6. Abrir en Android Studio
npx cap open android
```

**En Android Studio:**
```
1. Espera a que termine de sincronizar Gradle
2. Conecta tu celular por USB o usa un emulador
3. Habilita "Depuración USB" en el celular
4. Click en el botón ▶️ (Run)
5. ¡La app se instalará en tu celular!
```

### 📤 GENERAR APK PARA DISTRIBUIR

**En Android Studio:**
```
1. Build → Generate Signed Bundle / APK
2. Selecciona "APK"
3. Crea un nuevo keystore (primera vez) o usa uno existente
4. Completa los datos del keystore
5. Selecciona "release"
6. Espera a que compile
7. El APK estará en: android/app/release/app-release.apk
```

**Distribuir el APK:**
```
1. Copia el archivo app-release.apk
2. Envíalo por WhatsApp, email, o súbelo a Google Drive
3. En el celular Android:
   - Descarga el APK
   - Abre el archivo
   - Permite "Instalar apps de origen desconocido"
   - Toca "Instalar"
   - ¡Listo!
```

---

## 🌍 OPCIÓN 3: SERVIDOR EN LA NUBE (Producción)

### ✅ Ventajas:
- ✅ Accesible desde cualquier lugar
- ✅ URL permanente (ej: gowash.tudominio.com)
- ✅ HTTPS seguro
- ✅ PWA instalable desde internet
- ✅ Sin necesidad de estar en la misma red

### 🚀 HOSTING GRATUITO - VERCEL (RECOMENDADO)

#### Paso 1: Crear cuenta en Vercel
```
1. Ve a: https://vercel.com
2. Regístrate con GitHub, Google o email
3. Es GRATIS para proyectos personales
```

#### Paso 2: Preparar el proyecto
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Desde la carpeta del proyecto
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash

# 3. Login en Vercel
vercel login

# 4. Desplegar
vercel
# (Sigue las instrucciones, acepta los valores por defecto)

# 5. Desplegar a producción
vercel --prod
```

#### Paso 3: Obtener URL
```
Vercel te dará una URL como:
https://gowash-xyz123.vercel.app

O puedes configurar tu propio dominio:
https://gowash.tudominio.com
```

#### Paso 4: Acceder desde celular
```
1. Abre Chrome/Safari en el celular
2. Ve a tu URL de Vercel
3. Instala como PWA (igual que Opción 1)
4. ¡Funciona desde cualquier lugar con internet!
```

### 🌐 OTRAS OPCIONES DE HOSTING

**Netlify** (Gratis)
- Similar a Vercel
- https://netlify.com

**Firebase Hosting** (Gratis)
- De Google
- https://firebase.google.com/docs/hosting

**GitHub Pages** (Gratis)
- Requiere repositorio público
- https://pages.github.com

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | PWA Local | APK Nativa | PWA en Nube |
|----------------|-----------|------------|-------------|
| **Tiempo de setup** | 5 minutos | 1-2 horas | 15 minutos |
| **Costo** | Gratis | Gratis | Gratis |
| **Funciona sin PC** | ❌ No | ✅ Sí | ✅ Sí |
| **Actualizaciones** | Automáticas | Manuales | Automáticas |
| **Acceso desde cualquier lugar** | ❌ No | ✅ Sí | ✅ Sí |
| **Tamaño instalación** | ~5 MB | ~60 MB | ~5 MB |
| **Dificultad** | ⭐ Fácil | ⭐⭐⭐ Difícil | ⭐⭐ Medio |
| **iOS compatible** | ✅ Sí | ❌ No | ✅ Sí |

---

## 🎯 RECOMENDACIÓN SEGÚN USO

### 🏠 USO EN CASA/OFICINA (Misma red WiFi)
**→ Usa PWA LOCAL (Opción 1)**
- Más rápido de configurar
- Sin costos de hosting
- Suficiente para uso local

### 🚗 USO MÓVIL (Fuera de la oficina)
**→ Usa PWA EN NUBE (Opción 3)**
- Accesible desde cualquier lugar
- Gratis con Vercel
- Actualizaciones automáticas

### 📱 APP STORE (Publicar oficialmente)
**→ Usa APK NATIVA (Opción 2)**
- Necesario para Google Play Store
- Más profesional
- Mayor control

---

## 🔥 GUÍA RÁPIDA - PWA LOCAL (5 MINUTOS)

### En la PC:

```bash
# 1. Abre terminal en la carpeta del proyecto
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash

# 2. Ejecuta con --host para exponer en la red
npm run dev -- --host

# 3. Anota la IP que aparece en "Network:"
# Ejemplo: http://192.168.1.100:5173
```

### En el Celular Android:

```
1. Conecta a la misma WiFi que la PC
2. Abre Chrome
3. Ve a: http://192.168.1.100:5173 (usa tu IP)
4. Menú (⋮) → "Agregar a pantalla de inicio"
5. Toca "Instalar"
6. ¡Listo! Busca el icono "GoWash" en tu pantalla
```

### En el Celular iOS:

```
1. Conecta a la misma WiFi que la PC
2. Abre Safari
3. Ve a: http://192.168.1.100:5173 (usa tu IP)
4. Botón compartir (⬆️) → "Agregar a pantalla de inicio"
5. Toca "Agregar"
6. ¡Listo! Busca el icono "GoWash" en tu pantalla
```

---

## 🔒 IMPORTANTE - GOOGLE SHEETS EN MÓVIL

⚠️ **La integración con Google Sheets requiere Electron**

Las funcionalidades de Google Sheets **solo funcionarán en la versión de escritorio** (Windows/Mac/Linux) porque usan las APIs de Electron.

**En el móvil:**
- ✅ Funciona: Ingreso de vehículos, fotos, QR, retiro, reportes
- ❌ No funciona: Sincronización automática con Google Sheets
- 💡 Solución: Usa la versión de escritorio para sincronizar

**Alternativa:**
Puedes modificar el código para usar la API REST de Google Sheets directamente desde el navegador (sin Electron), pero requiere configuración adicional de OAuth.

---

## 📱 CARACTERÍSTICAS EN MÓVIL

### ✅ Lo que funciona perfectamente:
- Login/Logout
- Ingreso de vehículos
- Captura de fotos con cámara
- Generación de códigos QR
- Escaneo de códigos QR
- Retiro de vehículos
- Lista de vehículos en patio
- Reportes
- Productos bar y cosméticos
- Descuentos
- Forma de pago (incluido Mixto)
- Búsqueda y filtros
- Envío por WhatsApp
- Almacenamiento local (localStorage)

### ⚠️ Limitaciones:
- Google Sheets sync (solo en versión Electron)
- Selección de imágenes del sistema (usa cámara)

---

## 🎓 TIPS PARA MÓVIL

### Rendimiento
```
- La app está optimizada para móviles
- Usa diseño responsive
- Funciona sin conexión (excepto Google Sheets)
- Los datos se guardan localmente
```

### Orientación
```
- La app funciona mejor en modo vertical (portrait)
- Puedes rotar para algunas vistas
```

### Compatibilidad
```
✅ Android 8.0+
✅ iOS 13+
✅ Chrome 90+
✅ Safari 13+
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### No puedo acceder desde el celular
```
1. Verifica que estén en la misma red WiFi
2. Verifica que usaste --host al ejecutar
3. Prueba desactivar el firewall temporalmente
4. Usa la IP correcta (ipconfig en Windows)
```

### La app no se instala como PWA
```
1. Asegúrate de usar HTTPS o localhost
2. Para red local, algunos navegadores requieren configuración
3. Prueba con Chrome (mejor soporte PWA)
```

### Las fotos no funcionan
```
1. Permite acceso a la cámara cuando te pregunte
2. En iOS usa Safari (Chrome tiene limitaciones)
3. Verifica permisos en Configuración del celular
```

---

## 🚀 SIGUIENTE PASO

**Para probar YA:**
1. Ejecuta `npm run dev -- --host` en tu PC
2. Abre la IP en Chrome del celular
3. Instala como PWA

**Para producción:**
1. Despliega en Vercel (15 minutos)
2. Accede desde cualquier lugar
3. Instala como PWA

---

**¿Quieres que te ayude a configurar alguna de estas opciones? 📱**
