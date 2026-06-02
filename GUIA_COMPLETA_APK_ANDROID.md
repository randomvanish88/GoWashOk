# 📦 GUÍA COMPLETA - Crear APK Android para GoWash

## 🎯 Objetivo
Crear una APK nativa de Android que puedas instalar directamente o publicar en Google Play Store.

---

## ✅ REQUISITOS PREVIOS

###  1. Java Development Kit (JDK)

**Descargar e Instalar:**
```
1. Ve a: https://www.oracle.com/java/technologies/downloads/
2. Descarga: JDK 17 o superior (LTS)
3. Instala con opciones por defecto
4. Verifica instalación:
   - Abre CMD
   - Escribe: java -version
   - Deberías ver: java version "17.x.x"
```

### 2. Android Studio

**Descargar e Instalar:**
```
1. Ve a: https://developer.android.com/studio
2. Descarga: Android Studio (última versión)
3. Ejecuta el instalador
4. Durante la instalación:
   ✅ Android SDK
   ✅ Android SDK Platform
   ✅ Android Virtual Device
5. Primera vez que abres:
   - Sigue el asistente de configuración
   - Descargará componentes necesarios (2-3 GB)
   - Puede tardar 30-60 minutos
```

### 3. Variables de Entorno (Importante!)

**En Windows:**
```
1. Busca "Variables de entorno" en el menú Inicio
2. Click en "Variables de entorno"
3. En "Variables del sistema", click "Nueva"

Variable 1:
- Nombre: ANDROID_HOME
- Valor: C:\Users\TU_USUARIO\AppData\Local\Android\Sdk

Variable 2:
- Nombre: JAVA_HOME  
- Valor: C:\Program Files\Java\jdk-17 (ajusta según tu instalación)

4. Edita la variable "Path":
   - Agrega: %ANDROID_HOME%\platform-tools
   - Agrega: %ANDROID_HOME%\tools
   - Agrega: %JAVA_HOME%\bin

5. Reinicia el CMD/PowerShell
6. Verifica:
   adb --version
   (Debería mostrar la versión de ADB)
```

---

## 🚀 PROCESO COMPLETO

### PASO 1: Construir la Aplicación Web

```bash
# En la carpeta del proyecto:
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash

# Construir:
npm run build
```

**Resultado esperado:**
```
✓ building...
✓ built in 15.23s
dist/index.html                   0.50 kB │ gzip: 0.32 kB
dist/assets/index-abc123.css     45.67 kB │ gzip: 8.12 kB
dist/assets/index-def456.js     234.56 kB │ gzip: 78.90 kB
```

---

### PASO 2: Agregar Plataforma Android

```bash
# Agregar Android (solo la primera vez):
npx cap add android
```

**Qué hace esto:**
- Crea carpeta `android/` con proyecto nativo
- Configura Gradle
- Copia archivos de configuración
- Puede tardar 2-5 minutos

**Resultado esperado:**
```
✔ Adding native android project in android in 45.12ms
✔ Syncing Gradle in 2.34s
✔ add in 2.38s
✔ Copying web assets from dist to android/app/src/main/assets/public in 234ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 3ms
✔ copy android in 245ms
✔ Updating Android plugins in 5ms
[info] Found 0 Capacitor plugins for android
✔ update android in 12ms
```

---

### PASO 3: Sincronizar Archivos

```bash
# Copiar archivos web a Android:
npx cap sync android
```

**Qué hace esto:**
- Copia archivos de `dist/` a `android/`
- Actualiza plugins
- Sincroniza configuración

---

### PASO 4: Abrir en Android Studio

```bash
# Abrir proyecto en Android Studio:
npx cap open android
```

**O manualmente:**
```
1. Abre Android Studio
2. File → Open
3. Navega a: GoWash/android
4. Click "Open"
```

---

### PASO 5: Esperar Sincronización Gradle

**Primera vez (30-60 minutos):**
```
Android Studio descargará:
- Gradle wrapper
- Dependencias de Android
- Plugins necesarios
- Build tools

Verás en la parte inferior:
"Gradle Sync in progress..."

¡NO CIERRES Android Studio!
Deja que termine.
```

**Veces posteriores:**
```
Solo tardará 1-2 minutos
```

**Cuando termine:**
```
Verás en la parte inferior:
"Gradle sync finished" ✓
```

---

### PASO 6A: Instalar en Celular (Testing)

#### Preparar el Celular Android:

```
1. En el celular:
   - Configuración → Acerca del teléfono
   - Toca "Número de compilación" 7 veces
   - Aparecerá "Eres un desarrollador"

2. Configuración → Opciones de desarrollador
   - Activa "Opciones de desarrollador"
   - Activa "Depuración USB"

3. Conecta el celular a la PC con cable USB

4. En el celular aparecerá:
   "¿Permitir depuración USB?"
   - Marca "Siempre permitir desde este equipo"
   - Toca "Permitir"

5. En Android Studio:
   - Arriba verás tu dispositivo en el dropdown
   - Si no aparece, click en el dropdown
   - Debería mostrar: "Samsung Galaxy..." o similar
```

#### Ejecutar la App:

```
1. En Android Studio:
   - Click en el botón ▶️ verde (Run 'app')
   - O presiona: Shift + F10

2. Espera la compilación:
   "Building 'app' APK..."
   (Primera vez: 5-10 minutos)
   (Veces posteriores: 1-2 minutos)

3. La app se instalará automáticamente en tu celular
4. Se abrirá automáticamente
5. ¡Prueba todas las funciones!
```

---

### PASO 6B: Generar APK para Distribuir

#### Opción 1: APK Debug (Para probar)

```
1. En Android Studio:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

2. Espera a que compile:
   "Building APK..."

3. Cuando termine:
   "APK(s) generated successfully"
   - Click en "locate"

4. El APK estará en:
   android/app/build/outputs/apk/debug/app-debug.apk

5. Tamaño: ~60-80 MB
```

**Este APK es solo para probar, NO para publicar.**

#### Opción 2: APK Release (Para distribuir/publicar)

**Primera vez - Crear Keystore:**

```
1. En Android Studio:
   - Build → Generate Signed Bundle / APK
   - Selecciona: APK
   - Click "Next"

2. En "Key store path":
   - Click "Create new..."

3. Llenar el formulario:
   Key store path: C:\Users\TU_USUARIO\gowash-release-key.jks
   Password: [tu contraseña segura] (¡Guárdala!)
   Confirm: [repite la contraseña]
   
   Alias: gowash
   Password: [tu contraseña] (puede ser la misma)
   Confirm: [repite]
   
   Validity (years): 25
   
   Certificate:
   First and Last Name: Tu Nombre
   Organizational Unit: GoWash
   Organization: Tu Empresa
   City: Tu Ciudad
   State: Tu Provincia
   Country Code: AR (o tu país)

4. Click "OK"
5. ¡IMPORTANTE! Guarda el keystore y las contraseñas:
   - Haz backup del archivo .jks
   - Anota las contraseñas
   - ¡Si los pierdes, no podrás actualizar la app!
```

**Compilar APK Release:**

```
1. Build → Generate Signed Bundle / APK
2. Selecciona: APK
3. Click "Next"
4. Selecciona tu keystore (si ya lo creaste)
5. Ingresa las contraseñas
6. Click "Next"
7. Destination folder: (por defecto está bien)
8. Build Variants: release
9. Signature Versions: ✅ V1 ✅ V2
10. Click "Finish"

Compilando...
(Puede tardar 5-10 minutos)

Cuando termine:
"APK(s) generated successfully"

El APK estará en:
android/app/release/app-release.apk

Tamaño: ~30-50 MB (más pequeño que debug)
```

---

## 📤 DISTRIBUIR EL APK

### Opción 1: Instalar Directamente

```
1. Copia app-release.apk a tu celular
   (USB, WhatsApp, email, Google Drive, etc.)

2. En el celular:
   - Abre el archivo APK
   - Puede aparecer: "Instalar apps desconocidas"
   - Toca "Configuración"
   - Activa "Permitir desde esta fuente"
   - Vuelve atrás
   - Toca "Instalar"

3. ¡Listo! La app se instalará
```

### Opción 2: Compartir con Empleados

```
1. Sube el APK a Google Drive
2. Comparte el enlace
3. Cada empleado:
   - Descarga el APK
   - Lo instala (permite apps desconocidas)
   - ¡Listo!
```

### Opción 3: Publicar en Google Play Store

**Requiere:**
- Cuenta de Google Play Developer ($25 única vez)
- APK o AAB firmado
- Iconos, capturas, descripción
- Cumplir políticas de Google

**Pasos básicos:**
```
1. Crea cuenta en:
   https://play.google.com/console

2. Crea una nueva aplicación

3. Sube el APK/AAB

4. Completa información:
   - Nombre
   - Descripción
   - Capturas de pantalla
   - Icono
   - Categoría

5. Envía a revisión

6. Espera aprobación (1-7 días)

7. ¡Publicada!
```

---

## 🎨 PERSONALIZAR LA APK

### Cambiar Icono

```
1. Prepara tu icono:
   - 512x512 px
   - Formato PNG
   - Fondo transparente (opcional)

2. Ve a: https://icon.kitchen

3. Sube tu icono

4. Descarga el pack de iconos

5. Copia los archivos a:
   android/app/src/main/res/

   Reemplaza:
   - mipmap-hdpi/ic_launcher.png
   - mipmap-mdpi/ic_launcher.png
   - mipmap-xhdpi/ic_launcher.png
   - mipmap-xxhdpi/ic_launcher.png
   - mipmap-xxxhdpi/ic_launcher.png

6. Recompila
```

### Cambiar Nombre de la App

```
1. Edita: android/app/src/main/res/values/strings.xml

<resources>
    <string name="app_name">GoWash Del Viso</string>
    <string name="title_activity_main">GoWash</string>
    <string name="package_name">com.gowash.mobile</string>
    <string name="custom_url_scheme">com.gowash.mobile</string>
</resources>

2. Recompila
```

### Cambiar Color del Splash Screen

```
1. Edita: android/app/src/main/res/values/styles.xml

<item name="android:background">@color/splash_background</item>

2. Edita: android/app/src/main/res/values/colors.xml

<color name="splash_background">#0a0f1d</color>

3. Recompila
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "ANDROID_HOME not set"

```
Solución:
1. Configura variable de entorno ANDROID_HOME
2. Ver "Requisitos Previos" arriba
3. Reinicia Android Studio
```

### Error: "Gradle sync failed"

```
Solución:
1. File → Invalidate Caches / Restart
2. Click "Invalidate and Restart"
3. Espera a que reinicie y vuelva a sincronizar
```

### Error: "SDK location not found"

```
Solución:
1. En Android Studio:
   File → Project Structure → SDK Location
2. Establece Android SDK location:
   C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
3. Click "Apply" y "OK"
```

### Error: "Device not found"

```
Solución:
1. Verifica que el celular esté conectado por USB
2. Verifica que "Depuración USB" esté activada
3. En CMD: adb devices
   Debería mostrar tu dispositivo
4. Si no aparece:
   - Desconecta y reconecta el USB
   - Prueba otro puerto USB
   - Prueba otro cable USB
```

### La app se instala pero no abre

```
Solución:
1. Verifica que el build de web funcionó:
   npm run build
2. Sincroniza nuevamente:
   npx cap sync android
3. Recompila en Android Studio
```

### APK muy grande (>100 MB)

```
Solución:
1. Usa APK Release (no Debug)
2. En android/app/build.gradle, agrega:

android {
    ...
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            ...
        }
    }
}

3. Recompila
```

---

## 📊 TAMAÑOS ESPERADOS

```
APK Debug:   60-80 MB (para testing)
APK Release: 30-50 MB (para distribuir)
AAB (Bundle): 20-30 MB (para Play Store)

Instalada en cel: 80-120 MB
```

---

## 🎓 TIPS PRO

### 1. Usar AAB en lugar de APK

```
AAB (Android App Bundle) es más moderno:
- Tamaño más pequeño
- Google Play lo optimiza automáticamente
- Requerido para nuevas apps en Play Store

Para generar AAB:
Build → Generate Signed Bundle / APK
→ Selecciona "Android App Bundle"
→ Sigue los mismos pasos que APK
```

### 2. Habilitar Proguard (Ofuscar código)

```
En android/app/build.gradle:

buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}

Beneficios:
- APK más pequeño
- Código más difícil de reverse engineer
```

### 3. Versiones Automáticas

```
En android/app/build.gradle:

android {
    defaultConfig {
        versionCode 1
        versionName "17.0.0"
    }
}

Incrementa versionCode cada vez que publicas
```

### 4. Firma Automática (Avanzado)

```
Crea: android/keystore.properties

storePassword=tu_password
keyPassword=tu_password
keyAlias=gowash
storeFile=../gowash-release-key.jks

En android/app/build.gradle:

def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
```

---

## 📝 CHECKLIST FINAL

Antes de distribuir tu APK:

- [ ] La app abre correctamente
- [ ] Todas las funciones funcionan
- [ ] Las fotos se capturan
- [ ] Los códigos QR se generan y escanean
- [ ] El diseño se ve bien en diferentes tamaños de pantalla
- [ ] El icono es el correcto
- [ ] El nombre de la app es el correcto
- [ ] La versión es la correcta
- [ ] Probaste en al menos 2 celulares diferentes
- [ ] Guardaste backup del keystore y contraseñas
- [ ] El APK es la versión "release" (no "debug")

---

## 🚀 SCRIPT AUTOMÁTICO

Usa el script que creamos:

```bash
build-apk.bat
```

Este script hace todo automáticamente:
1. ✅ Construye la app web
2. ✅ Agrega plataforma Android
3. ✅ Sincroniza archivos
4. ✅ Abre Android Studio

---

**¡Tu GoWash APK está lista para el mundo Android! 📱🚀**
