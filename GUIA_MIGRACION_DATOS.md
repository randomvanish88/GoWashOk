# 📱 Guía: Migrar Datos a Google Sheets

## ¿Qué es la Migración de Datos?

La migración de datos permite sincronizar todos los datos de tu sistema GoWash POS (precios, empleados, ventas, etc.) con Google Sheets. Esto es esencial para que la **aplicación móvil** pueda acceder a los mismos datos que la versión de escritorio.

## 🎯 ¿Por Qué Migrar?

- ✅ **Sincronización**: La app móvil lee los datos desde Google Sheets
- ✅ **Compartir Datos**: Todos los dispositivos acceden a la misma información
- ✅ **Backup Automático**: Los datos se guardan en la nube
- ✅ **Acceso Remoto**: Consulta datos desde cualquier lugar

## 📋 Datos que se Migran

| Datos | Descripción |
|---|---|
| 🛁 **Servicios de Lavado** | Precios y tipos de lavado |
| ➕ **Extras de Lavado** | Servicios adicionales |
| ☕ **Productos Bar** | Bebidas y snacks |
| 💄 **Cosmética/Accesorios** | Productos de cuidado |
| 👥 **Empleados** | Lista de trabajadores |
| 💳 **Métodos de Pago** | Formas de pago disponibles |
| 🚗 **Precios por Vehículo** | Tarifas según tipo de auto |
| 👤 **Usuarios del Sistema** | Cuentas de acceso |
| 🚙 **Vehículos en Lavadero** | Autos siendo lavados |
| 💰 **Ventas del Día** | Registro de transacciones |

## 🚀 Pasos para Migrar

### Paso 1: Abre la Configuración
1. Inicia sesión como **Admin**
2. Haz clic en la pestaña **Config** (engranaje ⚙️)

### Paso 2: Accede a Migrar Datos
1. En el panel de configuración, haz clic en **Migrar Datos** (botón verde)
2. Verás una lista de todos los datos a migrar

### Paso 3: Revisa los Datos
- Cada elemento muestra:
  - ✅ **Estado**: Pendiente, Migrando, OK, Error o Vacío
  - 📊 **Cantidad**: Número de registros en tu sistema
  - 📄 **Hoja**: Nombre de la pestaña en Google Sheets

### Paso 4: Inicia la Migración
1. Haz clic en el botón **Iniciar Migración** (azul)
2. El sistema comenzará a procesar cada conjunto de datos
3. Verás indicadores de progreso para cada elemento

### Paso 5: Espera a que Termine
- ⏳ La migración toma entre 30 segundos y 2 minutos
- 🔄 No cierres la aplicación durante el proceso
- 📊 Verás el estado actualizado en tiempo real

### Paso 6: Verifica el Resultado
- ✅ **Verde**: Datos migrados correctamente
- ⚠️ **Gris**: Sin datos en ese conjunto
- ❌ **Rojo**: Error en la migración

## ⚠️ Advertencias Importantes

### 🔴 IMPORTANTE: Sobrescritura de Datos
La migración **sobrescribe** los datos existentes en Google Sheets. Si tienes datos importantes allí, considera hacer un backup primero.

### 🔵 Modo Prueba
Si quieres probar sin afectar tus datos reales:
1. Ve a **Config → Google Sheets**
2. Activa **Modo Prueba**
3. Los datos se guardarán en hojas con prefijo "PRUEBA-"

## 🔄 ¿Cuándo Migrar?

Debes migrar datos cuando:
- 📝 Cambies precios
- 👥 Agregues o elimines empleados
- 💳 Modifiques métodos de pago
- 🚗 Actualices tipos de vehículos
- 🆕 Hagas cambios importantes en la configuración

**Recomendación**: Migra al final del día o cuando hayas terminado de hacer cambios.

## 🛠️ Solución de Problemas

### ❌ Error: "API de Google Sheets no disponible"
- **Causa**: Problema de conexión con Google
- **Solución**: 
  1. Verifica tu conexión a internet
  2. Reinicia la aplicación
  3. Intenta de nuevo

### ❌ Error: "JSON inválido"
- **Causa**: Datos corruptos en localStorage
- **Solución**:
  1. Limpia el navegador (caché)
  2. Recarga la aplicación
  3. Intenta migrar de nuevo

### ❌ Algunos datos no se migran
- **Causa**: Esos datos pueden estar vacíos
- **Solución**: Es normal, solo se migran datos que existen

### ❌ La app móvil no ve los datos
- **Causa**: Los datos no se sincronizaron correctamente
- **Solución**:
  1. Verifica que la migración haya terminado (estado ✅)
  2. Recarga la app móvil
  3. Verifica que uses el mismo Google Sheets ID

## 📱 Después de Migrar

### En la App Móvil:
1. Abre la app móvil
2. Ve a Configuración
3. Verifica que el Google Sheets ID sea el mismo
4. Los datos deberían aparecer automáticamente

### Sincronización:
- Los datos se actualizan automáticamente
- Si cambias algo en la app de escritorio, migra de nuevo
- Si cambias algo en la app móvil, se sincroniza en tiempo real

## 💡 Consejos

1. **Migra regularmente**: Hazlo cada vez que hagas cambios importantes
2. **Usa Modo Prueba**: Para probar cambios sin afectar producción
3. **Verifica los datos**: Después de migrar, revisa Google Sheets
4. **Mantén backup**: Guarda copias de tus datos importantes
5. **Comunica cambios**: Avisa al equipo cuando migres datos nuevos

## 📞 Soporte

Si tienes problemas:
1. Verifica que tengas conexión a internet
2. Intenta migrar de nuevo
3. Revisa el estado de cada elemento
4. Contacta al administrador del sistema

---

**Última actualización:** 1 de Junio de 2026  
**Versión:** 17.0.0
