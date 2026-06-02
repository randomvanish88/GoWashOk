# 🚀 DESPLIEGUE MANUAL DE GOWASH A VERCEL

## ✅ YA COMPLETADO:
- ✅ Vercel CLI instalado
- ✅ Sesión iniciada exitosamente
- ✅ Aplicación construida (carpeta `dist/` lista)

## 📋 SIGUIENTE PASO - COMPLETAR DESPLIEGUE

Vercel está esperando que selecciones un proyecto. Tienes dos opciones:

### OPCIÓN A: Usar Proyecto Existente (Recomendado si ya desplegaste antes)

1. Abre una terminal nueva (CMD o PowerShell)
2. Ve a la carpeta: `cd C:\Users\Usuario\OneDrive\Escritorio\GoWash`
3. Ejecuta: `vercel.cmd --prod`
4. Selecciona con las flechas: **go-wash-lavadero** (o el que prefieras)
5. Presiona ENTER
6. Espera 2-3 minutos

### OPCIÓN B: Crear Nuevo Proyecto

1. Abre una terminal nueva (CMD o PowerShell)
2. Ve a la carpeta: `cd C:\Users\Usuario\OneDrive\Escritorio\GoWash`
3. Ejecuta: `vercel.cmd --prod`
4. Cuando pregunte "Link to existing project?": escribe **N** y presiona ENTER
5. Cuando pregunte "What's your project's name?": escribe **gowash-mobile** y presiona ENTER
6. Cuando pregunte "In which directory...?": presiona ENTER (usar ./)
7. Cuando pregunte "Override settings?": presiona **N** dos veces
8. Espera 2-3 minutos

## 🌐 DESPUÉS DEL DESPLIEGUE

Vercel te dará una URL como:
```
https://gowash-mobile-abc123.vercel.app
```

**Esa URL es tu aplicación móvil funcionando en la nube!**

## 📱 INSTALAR EN TELÉFONOS

1. Abre la URL en el navegador del teléfono (Chrome o Safari)
2. En Chrome Android:
   - Toca los 3 puntos (⋮)
   - Selecciona "Agregar a pantalla de inicio"
   
3. En Safari iOS:
   - Toca el botón compartir (□↑)
   - Selecciona "Agregar a inicio"

## 🔧 ACTUALIZACIONES FUTURAS

Cada vez que quieras actualizar la app:

1. Haz cambios en el código
2. Ejecuta: `npm run build`
3. Ejecuta: `vercel.cmd --prod`
4. La URL no cambia, se actualiza automáticamente

## ❓ ¿PROBLEMAS?

Si el comando se queda esperando en la terminal:
- Presiona Ctrl+C para cancelar
- Ejecuta en CMD normal (no PowerShell): `cmd`
- Luego ejecuta: `vercel.cmd --prod`
