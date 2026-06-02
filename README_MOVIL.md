# 📱 GoWash Mobile - README

## 🎯 ¿Qué es esto?

GoWash es una aplicación completa de gestión de lavadero que funciona tanto en:
- 🖥️ **Windows** (aplicación de escritorio con Electron)
- 📱 **Móvil** (PWA instalable en Android/iOS)
- 🌐 **Web** (navegador en cualquier dispositivo)

---

## 🚀 INICIO RÁPIDO

### Para usar en MÓVIL (3 minutos):

```bash
# En la PC (carpeta del proyecto):
npm run dev:mobile

# O doble clic en:
start-mobile.bat

# Luego en el celular:
# 1. Abre Chrome/Safari
# 2. Ve a la IP que aparece (ej: http://192.168.1.100:5173)
# 3. Instala como PWA
```

📖 **Guía completa:** `GUIA_VISUAL_INSTALACION_PWA.md`

---

## 📚 DOCUMENTACIÓN DISPONIBLE

### 🔥 Para empezar:

| Archivo | Para qué sirve | Tiempo |
|---------|---------------|--------|
| **INSTALACION_MOVIL.md** | 3 formas de instalar en móvil | 10 min |
| **GUIA_VISUAL_INSTALACION_PWA.md** | Guía con capturas paso a paso | 5 min |
| **start-mobile.bat** | Script para iniciar servidor móvil | Inmediato |
| **deploy-vercel.bat** | Script para desplegar en la nube | 5 min |

### 📊 Google Sheets:

| Archivo | Para qué sirve |
|---------|---------------|
| **LEEME_GOOGLE_SHEETS.md** | Índice de toda la documentación |
| **QUICKSTART_GOOGLE_SHEETS.md** | Conectar en 3 minutos |
| **INSTRUCCIONES_GOOGLE_SHEETS.md** | Tutorial completo |
| **EJEMPLO_GOOGLE_SHEETS.md** | Ejemplos visuales |
| **PRUEBA_GOOGLE_SHEETS.md** | Checklist de pruebas |

---

## ⚡ SCRIPTS DISPONIBLES

```bash
# Desarrollo normal (solo PC)
npm run dev

# Desarrollo para móviles (expone en red WiFi)
npm run dev:mobile

# Preview (probar build antes de desplegar)
npm run preview

# Build para producción
npm run build

# Electron (versión de escritorio)
npm run electron:dev
npm run electron:build
```

---

## 🌐 OPCIONES DE INSTALACIÓN MÓVIL

### 1️⃣ PWA Local (Red WiFi) ⭐ MÁS RÁPIDA

**Ventajas:**
- ✅ Setup en 5 minutos
- ✅ Gratis
- ✅ No requiere internet

**Desventajas:**
- ❌ Solo funciona en la misma WiFi
- ❌ La PC debe estar encendida

**Cómo:**
```bash
start-mobile.bat
# Sigue instrucciones en pantalla
```

### 2️⃣ PWA en Nube (Vercel) ⭐ RECOMENDADA PRODUCCIÓN

**Ventajas:**
- ✅ Acceso desde cualquier lugar
- ✅ Gratis (hasta 100GB/mes)
- ✅ HTTPS automático
- ✅ Actualizaciones automáticas

**Desventajas:**
- ❌ Requiere cuenta en Vercel
- ❌ Setup inicial 15 minutos

**Cómo:**
```bash
deploy-vercel.bat
# Sigue instrucciones en pantalla
```

### 3️⃣ APK Nativa (Solo Android)

**Ventajas:**
- ✅ App 100% nativa
- ✅ Publicable en Play Store

**Desventajas:**
- ❌ Solo Android
- ❌ Requiere Android Studio
- ❌ Proceso más complejo

**Cómo:**
Ver: `INSTALACION_MOVIL.md` → Opción 2

---

## 🔧 CONFIGURACIÓN

### Requisitos:

```
Node.js: v18 o superior
npm: v9 o superior
```

### Instalación inicial:

```bash
# Clonar o descargar el proyecto
cd GoWash

# Instalar dependencias
npm install

# Listo para usar!
```

---

## 📱 FUNCIONALIDADES EN MÓVIL

### ✅ Totalmente funcionales:

- 🔐 Login/Logout
- 🚗 Ingreso de vehículos
- 📸 Captura de fotos (cámara nativa)
- 🎫 Generación de códigos QR
- 📷 Escaneo de códigos QR
- ✅ Retiro/entrega de vehículos
- 📋 Lista de vehículos en patio
- 📊 Reportes y estadísticas
- ☕ Productos bar y cosméticos
- 💰 Descuentos
- 💳 Formas de pago (incluido Mixto)
- 🔍 Búsqueda y filtros
- 💬 Envío por WhatsApp
- 💾 Almacenamiento local
- 🌐 Funciona offline (excepto Google Sheets)

### ⚠️ Limitaciones móviles:

- 📊 **Google Sheets sync**: Solo en versión Electron (escritorio)
  - En móvil funciona todo excepto sincronización automática
  - Usa la versión de escritorio para sincronizar
  - Los datos se guardan localmente en el móvil

**Solución futura:** Implementar API REST de Google Sheets (sin Electron)

---

## 🎨 CARACTERÍSTICAS PWA

### Service Worker
- ✅ Caché inteligente
- ✅ Funciona offline
- ✅ Actualizaciones automáticas

### Manifest
- ✅ Instalable en home screen
- ✅ Pantalla completa
- ✅ Splash screen
- ✅ Icono personalizado

### Responsive
- ✅ Optimizado para móviles
- ✅ Touch-friendly
- ✅ Orientación vertical

---

## 📊 COMPATIBILIDAD

### Navegadores Móviles:

| Navegador | Android | iOS | Funcionalidad |
|-----------|---------|-----|--------------|
| **Chrome** | ✅ 90+ | ❌ No | PWA completa |
| **Safari** | ❌ No | ✅ 13+ | PWA completa |
| **Edge** | ✅ 90+ | ✅ 13+ | PWA completa |
| **Firefox** | ⚠️ Limitado | ⚠️ Limitado | Solo web |

### Sistemas Operativos:

```
✅ Android 8.0+
✅ iOS 13+
✅ iPadOS 13+
```

---

## 🔒 SEGURIDAD

### HTTPS Automático
- Vercel proporciona HTTPS gratis
- Certificado SSL incluido
- Renovación automática

### Datos Locales
- Los datos se guardan en localStorage del navegador
- Cada dispositivo tiene su propia copia
- Sincronización mediante Google Sheets (opcional)

### Service Worker
- Firmado automáticamente
- Solo carga desde tu dominio
- No puede modificarse externamente

---

## 🌟 MEJORES PRÁCTICAS

### Para Producción:

1. **Despliega en Vercel**
   ```bash
   deploy-vercel.bat
   ```

2. **Configura dominio propio** (opcional)
   ```
   En Vercel → Settings → Domains
   Agrega: app.tulavadero.com
   ```

3. **Activa Google Sheets**
   ```
   Ver: QUICKSTART_GOOGLE_SHEETS.md
   ```

4. **Capacita a empleados**
   ```
   1. Comparte la URL
   2. Muestra cómo instalar PWA
   3. Explica funciones básicas
   ```

### Para Desarrollo:

```bash
# Terminal 1: Servidor de desarrollo
npm run dev:mobile

# Terminal 2: Sync server (si usas Google Sheets)
npm run sync

# O todo junto:
npm run dev:full
```

---

## 📈 ROADMAP

### ✅ Completado (v17.0.0):
- Aplicación móvil responsive
- PWA instalable
- Google Sheets sync (escritorio)
- Captura de fotos
- Escaneo QR
- Offline support

### 🚧 Próximamente:
- [ ] Google Sheets API REST (funciona en móvil sin Electron)
- [ ] Notificaciones push
- [ ] Sincronización en tiempo real
- [ ] Modo oscuro personalizable
- [ ] Exportación de reportes a PDF
- [ ] Geolocalización (registrar ubicación del empleado)

---

## 🆘 SOPORTE

### Problemas comunes:

**"No puedo acceder desde el celular"**
→ Ver: `INSTALACION_MOVIL.md` → Solución de problemas

**"Google Sheets no sincroniza"**
→ Ver: `INSTRUCCIONES_GOOGLE_SHEETS.md` → Solución de problemas

**"La app no se instala"**
→ Ver: `GUIA_VISUAL_INSTALACION_PWA.md` → Solución de problemas

### Logs y debugging:

```bash
# Ver logs de desarrollo
npm run dev:mobile

# Android Chrome DevTools
chrome://inspect

# iOS Safari DevTools
Safari → Develop → [tu iPhone]
```

---

## 📄 LICENCIA

Proyecto propietario de GoWash Del Viso.
Todos los derechos reservados.

---

## 👥 EQUIPO

**Desarrollado para:** GoWash Del Viso  
**Versión:** 17.0.0  
**Fecha:** Junio 2026

---

## 🎉 ¡TODO LISTO!

Tu aplicación GoWash ahora funciona en:
- ✅ Windows (escritorio)
- ✅ Android (PWA)
- ✅ iOS (PWA)
- ✅ Web (navegador)
- ✅ Sincronización con Google Sheets

**Siguiente paso:** Ejecuta `start-mobile.bat` y prueba en tu celular! 📱

---

## 📖 Índice de Documentación

```
📁 Documentación Móvil
├── 📄 README_MOVIL.md (este archivo)
├── 📄 INSTALACION_MOVIL.md
├── 📄 GUIA_VISUAL_INSTALACION_PWA.md
├── 🔧 start-mobile.bat
└── 🔧 deploy-vercel.bat

📁 Documentación Google Sheets
├── 📄 LEEME_GOOGLE_SHEETS.md
├── 📄 QUICKSTART_GOOGLE_SHEETS.md
├── 📄 INSTRUCCIONES_GOOGLE_SHEETS.md
├── 📄 EJEMPLO_GOOGLE_SHEETS.md
├── 📄 PRUEBA_GOOGLE_SHEETS.md
└── 📄 RESUMEN_INTEGRACION_GOOGLE_SHEETS.md
```

---

**¿Preguntas?** Lee la documentación correspondiente según tu necesidad.  
**¿Listo para empezar?** Ejecuta `start-mobile.bat` ahora! 🚀
