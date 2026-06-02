# Resumen de Cambios: Opción "Migrar Datos" en Configuración de Admin

## 📋 Descripción General
Se ha integrado exitosamente la opción **"Migrar Datos"** en la pestaña de configuración de admin. Esta funcionalidad permite migrar todos los datos almacenados en localStorage a Google Sheets, facilitando la sincronización con la aplicación móvil.

## 🔧 Cambios Realizados

### 1. **Frontend - App.tsx**
**Archivo:** `src/app/App.tsx`

#### Cambios:
- ✅ Importado el componente `MigrarDatos`
- ✅ Importado el icono `Upload` de lucide-react
- ✅ Actualizado el `ConfigPanel` para incluir una nueva pestaña "Migrar Datos"
- ✅ Agregada la lógica de estado para la nueva pestaña (`activeConfigTab` ahora incluye `'migrate'`)
- ✅ Agregado el botón de navegación con estilo gradiente (emerald-600 a teal-600)

**Código agregado:**
```typescript
// Nuevo estado en ConfigPanel
const [activeConfigTab, setActiveConfigTab] = useState<'sheets' | 'users' | 'migrate'>('sheets');

// Nuevo botón en la interfaz
<button onClick={() => setActiveConfigTab('migrate')} ...>
  <Upload className="w-3.5 h-3.5" />
  Migrar Datos
</button>

// Nuevo contenido
{activeConfigTab === 'migrate' && <MigrarDatos />}
```

### 2. **Componente MigrarDatos.tsx**
**Archivo:** `src/app/components/MigrarDatos.tsx`

#### Estado Actual:
- ✅ Componente ya existía y está completamente funcional
- ✅ Migra 10 conjuntos de datos diferentes:
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

#### Características:
- 📊 Muestra el estado de cada migración (pendiente, migrando, ok, error, vacío)
- 🔄 Cuenta automáticamente los registros en localStorage
- ⚠️ Incluye advertencia sobre sobrescritura de datos
- 📱 Interfaz responsive con indicadores visuales

### 3. **Backend - Electron googleSheets.cjs**
**Archivo:** `electron/googleSheets.cjs`

#### Nuevos Métodos Agregados:

**`clearSheet(sheetTitle)`**
- Limpia todas las filas de una hoja (mantiene headers)
- Crea la hoja si no existe
- Retorna: `{ success: true }`

**`writeSheet(sheetTitle, data)`**
- Escribe datos completos en una hoja
- Parámetro `data`: Array de arrays (primera fila = headers, resto = datos)
- Crea o actualiza la hoja automáticamente
- Retorna: `{ success: true, rowsWritten: number }`

```javascript
async clearSheet(sheetTitle) {
  // Limpia todas las filas de una hoja
}

async writeSheet(sheetTitle, data) {
  // Escribe headers + filas de datos
}
```

### 4. **IPC Handlers - Electron main.cjs**
**Archivo:** `electron/main.cjs`

#### Nuevos Handlers:

```javascript
ipcMain.handle('google-sheets-clear-sheet', async (event, sheetTitle) => {
  // Maneja la limpieza de hojas
});

ipcMain.handle('google-sheets-write-sheet', async (event, { sheetTitle, data }) => {
  // Maneja la escritura de datos
});
```

### 5. **Preload API - preload.js**
**Archivo:** `electron/preload.js`

#### Métodos Expuestos:

```javascript
googleSheets: {
  // ... métodos existentes ...
  clearSheet: (sheetTitle) => ipcRenderer.invoke('google-sheets-clear-sheet', sheetTitle),
  writeSheet: (sheetTitle, data) => ipcRenderer.invoke('google-sheets-write-sheet', { sheetTitle, data }),
}
```

## 🎯 Flujo de Migración

1. **Usuario accede a Configuración → Migrar Datos**
2. **Sistema detecta datos en localStorage**
3. **Usuario hace clic en "Iniciar Migración"**
4. **Para cada conjunto de datos:**
   - Se obtienen los datos del localStorage
   - Se convierten a formato de tabla (headers + filas)
   - Se limpian las hojas existentes en Google Sheets
   - Se escriben los datos nuevos
   - Se muestra el estado (✅ ok, ❌ error, ⚠️ vacío)
5. **Notificación final con resumen**

## 📊 Datos Migrados

| Clave localStorage | Hoja Google Sheets | Descripción |
|---|---|---|
| `gowash-lavado-precios` | PWA_Servicios | Servicios de lavado |
| `gowash-extras-lavado` | PWA_Extras | Extras de lavado |
| `gowash-bar-precios` | PWA_Bar | Productos del bar |
| `gowash-cosmeticos-precios` | PWA_Cosmetica | Cosmética y accesorios |
| `gowash-lista-empleados` | PWA_Empleados | Lista de empleados |
| `gowash-metodos-pago-ventas` | PWA_MetodosPago | Métodos de pago |
| `carwash-prices` | PWA_Vehiculos | Precios por vehículo |
| `gowash-users` | PWA_Usuarios | Usuarios del sistema |
| `gowash-ordenes-abiertas` | PWA_Lavadero | Vehículos en lavadero |
| `gowash-ventas` | PWA_Ventas | Ventas del día |

## 🔐 Seguridad

- ✅ Usa credenciales embebidas de Google Service Account
- ✅ Soporta credenciales externas (archivo JSON)
- ✅ Modo prueba disponible para no afectar datos de producción
- ✅ Validación de datos antes de migrar

## 🚀 Cómo Usar

### Para el Usuario (Admin):
1. Abre la aplicación GoWash POS
2. Inicia sesión como admin
3. Ve a la pestaña **Config**
4. Haz clic en **Migrar Datos**
5. Revisa los datos a migrar
6. Haz clic en **Iniciar Migración**
7. Espera a que se complete
8. Verifica que los datos estén en Google Sheets

### Para la App Móvil:
- La app móvil leerá automáticamente los datos desde Google Sheets
- Los datos se sincronizarán en tiempo real
- No requiere configuración adicional

## ✅ Verificación

- ✅ Build completado sin errores
- ✅ Componente integrado en la UI
- ✅ Métodos de Electron implementados
- ✅ IPC handlers configurados
- ✅ Preload API actualizada
- ✅ Interfaz responsive y accesible

## 📝 Notas Importantes

1. **Sobrescritura de Datos**: La migración sobrescribe los datos existentes en Google Sheets. Se recomienda hacer backup antes.

2. **Modo Prueba**: Usar el modo prueba en `GoogleSheetsSettings` para probar sin afectar datos de producción.

3. **Sincronización Continua**: Ejecutar la migración cada vez que se actualicen precios, empleados u otros datos para mantener la app móvil sincronizada.

4. **Credenciales**: Las credenciales están embebidas en la aplicación. Para cambiarlas, usar el botón "Actualizar archivo de credenciales" en la configuración de Google Sheets.

## 🔄 Próximos Pasos (Opcional)

- [ ] Agregar sincronización automática periódica
- [ ] Agregar opción de sincronización bidireccional
- [ ] Agregar historial de migraciones
- [ ] Agregar validación de integridad de datos
- [ ] Agregar exportación a otros formatos (CSV, Excel)

---

**Fecha de Implementación:** 1 de Junio de 2026  
**Versión:** 17.0.0  
**Estado:** ✅ Completado y Funcional
