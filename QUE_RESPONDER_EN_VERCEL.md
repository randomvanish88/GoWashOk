# 📋 QUÉ RESPONDER EN CADA PASO DE VERCEL

## 🎯 GUÍA PASO A PASO CON RESPUESTAS EXACTAS

---

### ✅ PASO 1: Ejecutar el comando

Abre CMD y ejecuta:
```cmd
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash
vercel.cmd --prod
```

O haz doble clic en: **OPCION_RAPIDA.bat**

---

### ❓ PASO 2: Primera pregunta

```
? Which team?
> randomvanish88's projects
```

**RESPUESTA:** Presiona **ENTER** (ya está seleccionado)

---

### ❓ PASO 3: Link to existing project?

```
? Link to existing project? (y/N)
```

#### OPCIÓN A: Usar proyecto existente (RECOMENDADO)
**RESPUESTA:** Escribe **Y** y presiona ENTER

Luego verás:
```
? Which existing project do you want to link?
> go-wash-ok
  project-7sxfr
  go-wash-lavadero
```

**RESPUESTA:** Usa las flechas ↓ para seleccionar **go-wash-lavadero** y presiona ENTER

#### OPCIÓN B: Crear proyecto nuevo
**RESPUESTA:** Escribe **N** y presiona ENTER

---

### ❓ PASO 4: Project name (solo si elegiste N arriba)

```
? What's your project's name?
```

**RESPUESTA:** Escribe **gowash-mobile** y presiona ENTER

---

### ❓ PASO 5: Directory

```
? In which directory is your code located? ./
```

**RESPUESTA:** Presiona **ENTER** (usar el directorio actual)

---

### ❓ PASO 6: Override settings

```
? Want to override the settings? [y/N]
```

**RESPUESTA:** Presiona **ENTER** (No cambiar nada)

---

### ⏳ PASO 7: Esperar despliegue

Verás algo como:

```
🔗  Inspecting deployment...
🔍  Analyzing source code...
📦  Building...
✅  Production: https://go-wash-lavadero.vercel.app [2m 15s]
```

**ESTO TOMA 2-3 MINUTOS**

---

### 🎉 PASO 8: ¡LISTO!

Cuando termine, verás:

```
✅  Production: https://go-wash-lavadero-xyz123.vercel.app
```

**ESA ES TU URL! Cópiala completa.**

---

## 📱 CÓMO INSTALAR EN MÓVILES

### Android (Chrome o Edge):

1. Abre la URL en el navegador del teléfono
2. Toca el menú (⋮) arriba a la derecha
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. Confirma
5. ¡Ya tienes el ícono en tu pantalla!

### iPhone (Safari):

1. Abre la URL en Safari
2. Toca el botón Compartir (□↑) abajo
3. Desplázate y toca **"Agregar a inicio"**
4. Toca **"Agregar"**
5. ¡Ya tienes el ícono en tu pantalla!

---

## 🔧 RESUMEN DE RESPUESTAS RÁPIDAS

Para proyecto EXISTENTE:
```
Which team? → ENTER
Link to existing? → Y
Which project? → go-wash-lavadero → ENTER
```

Para proyecto NUEVO:
```
Which team? → ENTER
Link to existing? → N
Project name? → gowash-mobile → ENTER
Directory? → ENTER
Override settings? → ENTER
```

---

## ✅ VERIFICAR QUE FUNCIONA

Después de desplegar:

1. Abre la URL en tu computadora
2. Deberías ver la pantalla de login de GoWash
3. Si ves el login → **¡TODO FUNCIONÓ!**
4. Ahora prueba en el móvil

---

## 🆘 SI ALGO SALE MAL

### Error: "No such file or directory"
**Solución:** Asegúrate de estar en la carpeta correcta
```cmd
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash
```

### Error: "Not authenticated"
**Solución:** Vuelve a hacer login
```cmd
vercel.cmd login
```

### Error: "Build failed"
**Solución:** Reconstruye la aplicación
```cmd
npm run build
vercel.cmd --prod
```

### El comando no hace nada
**Solución:** Usa CMD en lugar de PowerShell
```cmd
cmd
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash
vercel.cmd --prod
```

---

## 💡 TIPS IMPORTANTES

1. **La primera vez** toma 2-3 minutos
2. **Actualizaciones futuras** toman 1 minuto
3. **La URL nunca cambia** (a menos que crees un proyecto nuevo)
4. **Funciona sin internet** después de la primera carga
5. **No necesitas reinstalar** en móviles al actualizar

---

## 🎬 ¡AHORA SÍ, A DESPLEGAR!

**Ejecuta:** OPCION_RAPIDA.bat

o

**Copia y pega en CMD:**
```cmd
cd C:\Users\Usuario\OneDrive\Escritorio\GoWash
vercel.cmd --prod
```

¡Y sigue esta guía! 🚀
