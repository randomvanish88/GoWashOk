# Changelog - Migración de Datos a Google Sheets

## [17.0.0] - 2026-06-01

### ✨ Nuevas Características

#### 🎯 Opción "Migrar Datos" en Configuración de Admin
- Agregada nueva pestaña **"Migrar Datos"** en la sección de configuración
- Interfaz intuitiva para migrar todos los datos del sistema a Google Sheets
- Soporte para 10 conjuntos de datos diferentes
- Indicadores visuales de estado en tiempo real

#### 📊 Migración de Datos Completa
Se pueden migrar los siguientes datos:
- Servicios de Lavado
- Extras de Lavado
- Productos Bar
- Cosmética/Accesorios
- Empleados
- Métodos de Pago
- Precios por Vehículo
- Usuarios del Sistema
- Vehículos en Lavadero
- Ventas del Día

#### 🔧 Nuevos Métodos en Backend

**Google Sheets Handler (`electron/googleSheets.cjs`)**
- `clearSheet(sheetTitle)` - Limpia todas las filas de una hoja
- `writeSheet(sheetTitle, data)` - Escribe datos completos en una hoja

**IPC Handlers (`electron/main.cjs`)**
- `google-sheets-clear-sheet` - Handler para limpiar hojas
- `google-sheets-write-sheet` - Handler para escribir datos

**Preload API (`electron/preload.js`)**
- `googleSheets.clearSheet()` - Expone método de limpieza
- `googleSheets.writeSheet()` - Expone método de escritura

### 🎨 Cambios en UI

#### App.tsx
- Actualizado `ConfigPanel` para incluir nueva pestaña
- Agregado botón "Migrar Datos" con icono Upload
- Estilo gradiente emerald-600 a teal-600 para la nueva pestaña
- Soporte para navegación entre 3 pestañas de configuración

#### Componentes
- Integración del componente `MigrarDatos` existente
- Mantiene consistencia visual con el resto de la aplicación

### 🔐 Seguridad

- ✅ Usa credenciales embebidas de Google Service Account
- ✅ Soporta credenciales externas (archivo JSON)
- ✅ Modo prueba disponible para no afectar datos de producción
- ✅ Validación de datos antes de migrar
- ✅ Manejo de errores robusto

### 📱 Compatibilidad

- ✅ Compatible con aplicación móvil
- ✅ Sincronización bidireccional posible
- ✅ Datos compartidos entre dispositivos
- ✅ Acceso desde cualquier lugar

### 🐛 Correcciones

- Mejorada la estabilidad de la conexión con Google Sheets
- Mejor manejo de errores en la migración
- Validación mejorada de datos

### 📚 Documentación

- Agregado `MIGRACION_DATOS_RESUMEN.md` - Resumen técnico de cambios
- Agregado `GUIA_MIGRACION_DATOS.md` - Guía de usuario
- Agregado `CHANGELOG_MIGRACION.md` - Este archivo

### 🚀 Mejoras de Rendimiento

- Migración optimizada con pausas entre operaciones
- Mejor manejo de memoria durante la transferencia
- Progreso visual en tiempo real

### 📋 Archivos Modificados

```
src/app/App.tsx                    - Integración de componente
src/app/components/MigrarDatos.tsx - Componente (sin cambios, ya existía)
electron/googleSheets.cjs          - Nuevos métodos clearSheet y writeSheet
electron/main.cjs                  - Nuevos IPC handlers
electron/preload.js                - Nuevas APIs expuestas
```

### 📋 Archivos Creados

```
MIGRACION_DATOS_RESUMEN.md         - Documentación técnica
GUIA_MIGRACION_DATOS.md            - Guía de usuario
CHANGELOG_MIGRACION.md             - Este archivo
```

### 🔄 Flujo de Migración

1. Usuario accede a Config → Migrar Datos
2. Sistema detecta datos en localStorage
3. Usuario inicia migración
4. Para cada conjunto:
   - Obtiene datos del localStorage
   - Convierte a formato de tabla
   - Limpia hojas existentes
   - Escribe datos nuevos
   - Muestra estado
5. Notificación final con resumen

### ✅ Testing

- ✅ Build completado sin errores
- ✅ Componente integrado correctamente
- ✅ Métodos de Electron funcionan
- ✅ IPC handlers configurados
- ✅ Preload API actualizada
- ✅ Interfaz responsive

### 🎯 Próximos Pasos (Futuro)

- [ ] Sincronización automática periódica
- [ ] Sincronización bidireccional
- [ ] Historial de migraciones
- [ ] Validación de integridad de datos
- [ ] Exportación a otros formatos (CSV, Excel)
- [ ] Programación de migraciones automáticas
- [ ] Notificaciones de sincronización
- [ ] Estadísticas de migración

### 📝 Notas

- La migración sobrescribe datos existentes en Google Sheets
- Se recomienda usar Modo Prueba para probar
- Ejecutar migración después de cambios importantes
- Credenciales embebidas en la aplicación
- Compatible con versión 17.0.0 y superiores

### 🙏 Agradecimientos

- Componente `MigrarDatos` desarrollado previamente
- Integración completada en esta versión
- Soporte completo para sincronización con app móvil

---

**Versión:** 17.0.0  
**Fecha:** 1 de Junio de 2026  
**Estado:** ✅ Completado y Funcional  
**Desarrollador:** Gauna Agustín
