# ⚡ PASOS RÁPIDOS - Crear APK Android

## ✅ YA ESTÁ LISTO:

- ✅ Aplicación web construida (`npm run build`) 
- ✅ Carpeta `dist/` creada con todos los archivos
- ✅ Capacitor 6 instalado
- ✅ Configuración `capacitor.config.json` creada
- ✅ Scripts automatizados listos

---

## 🚀 LO QUE FALTA (Requiere acción tuya):

### 📋 OPCIÓN A: Usando el Script Automático (RECOMENDADO)

```bash
# Simplemente ejecuta:
build-apk.bat

# Sigue las instrucciones en pantalla
```

El script hará:
1. Agregar plataforma Android
2. Sincronizar archivos
3. Abrir Android Studio

---

### 📋 OPCIÓN B: Manual (Paso a Paso)

#### 1. Agregar Android (Primera vez - 2 minutos)

```bash
npx cap add android
```

#### 2. Sincronizar (Cada vez que cambies algo)

```bash
npx cap sync android
```

#### 3. Abrir Android Studio

```bash
npx cap open android
```

**O manualmente:**
- Abre Android Studio
- File → Open
- Selecciona: `GoWash/android`

---

## ⚠️ REQUISITOS QUE DEBES INSTALAR:

### 1. Java JDK 17+

**¿Ya lo tienes?**
```bash
java -version
```

Si ves: `java version "17.x.x"` → ✅ Todo bien

Si no:
1. Descarga: https://www.oracle.com/java/technologies/downloads/
2. Instala JDK 17
3. Reinicia terminal

### 2. Android Studio

**¿Ya lo tienes?**
- Busca "Android Studio" en tu PC

Si no:
1. Descarga: https://developer.android.com/studio
2. Instala (descargará ~3 GB de componentes)
3. Primera vez tardará 30-60 minutos en configurarse

### 3. Variables de Entorno

Después de instalar Android Studio, configura:

```
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
```

**Cómo configurar:**
1. Busca "Variables de entorno" en Windows
2. Variables del sistema → Nueva
3. Agrega las dos variables de arriba
4. Edita "Path" → Agrega:
   - %ANDROID_HOME%\platform-tools
   - %JAVA_HOME%\bin

---

## 🎯 DESPUÉS DE INSTALAR TODO:

### Primera Compilación:

```bash
# 1. Ejecuta el script:
build-apk.bat

# 2. Android Studio se abrirá
# 3. Espera "Gradle Sync" (puede tardar 30-60 min la primera vez)
# 4. Cuando termine, verás "Gradle sync finished"
```

### Probar en Celular:

```
1. Conecta celular por USB
2. Activa "Depuración USB" en el celular:
   - Configuración → Acerca del teléfono
   - Toca "Número de compilación" 7 veces
   - Configuración → Opciones de desarrollador
   - Activa "Depuración USB"

3. En Android Studio:
   - Selecciona tu dispositivo en el dropdown
   - Click en ▶️ (Run)
   - La app se instalará en tu celular
```

### Generar APK para Distribuir:

```
1. En Android Studio:
   Build → Generate Signed Bundle / APK
   
2. Selecciona "APK"

3. Crea un keystore (primera vez):
   - Guarda el archivo .jks
   - ¡GUARDA LAS CONTRASEÑAS!
   
4. Espera la compilación (5-10 min)

5. APK estará en:
   android/app/release/app-release.apk
   
6. Distribuye este APK!
```

---

## 📚 DOCUMENTACIÓN COMPLETA:

- **`GUIA_COMPLETA_APK_ANDROID.md`** → Tutorial detallado
- **`build-apk.bat`** → Script automático
- **`INSTALACION_MOVIL.md`** → Todas las opciones

---

## 🎁 LO QUE OBTIENES:

**APK Nativa de Android con:**
- ✅ Todas las funcionalidades de GoWash
- ✅ Captura de fotos con cámara
- ✅ Escaneo de códigos QR
- ✅ Funciona 100% offline (excepto Google Sheets)
- ✅ Icono en el launcher
- ✅ App nativa de verdad
- ✅ Rendimiento máximo

**Tamaño:**
- APK Debug: ~60-80 MB
- APK Release: ~30-50 MB

---

## 🆘 SI TIENES PROBLEMAS:

### "No tengo Android Studio"
→ Descarga e instala desde: https://developer.android.com/studio

### "Gradle sync failed"
→ File → Invalidate Caches / Restart

### "Device not found"
→ Verifica que "Depuración USB" esté activada

### "ANDROID_HOME not set"
→ Configura las variables de entorno (ver arriba)

### Más problemas
→ Lee: `GUIA_COMPLETA_APK_ANDROID.md` → Solución de Problemas

---

## ⏱️ TIEMPOS ESTIMADOS:

**Primera vez (con instalaciones):**
- Instalar JDK: 5 minutos
- Instalar Android Studio: 30-60 minutos
- Configurar variables: 5 minutos
- Agregar Android a proyecto: 5 minutos
- Primera sincronización Gradle: 30-60 minutos
- Primera compilación: 10-15 minutos
**TOTAL: 2-3 horas**

**Veces posteriores:**
- Hacer cambios en la app: X minutos
- Rebuild web: 10 segundos
- Sync Android: 30 segundos
- Compilar: 1-2 minutos
**TOTAL: 2-3 minutos**

---

## 🎯 SIGUIENTE PASO:

1. **¿Tienes Java y Android Studio?**
   - SÍ → Ejecuta `build-apk.bat` ahora
   - NO → Instala primero (ver requisitos arriba)

2. **Lee la guía completa:**
   - `GUIA_COMPLETA_APK_ANDROID.md`

3. **¿Prefieres PWA?**
   - Más rápido y fácil
   - Ver: `INSTALACION_MOVIL.md` → Opción 1 o 2

---

**Tu aplicación está LISTA para ser compilada! 🚀**
**Solo faltan las herramientas de Android (Java + Android Studio)**
