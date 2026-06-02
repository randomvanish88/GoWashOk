# 🔧 Documentación Técnica - Migración de Datos

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App.tsx (ConfigPanel)                               │  │
│  │  └─ MigrarDatos.tsx (Componente)                     │  │
│  │     └─ Interfaz de usuario                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ IPC Communication
┌────────────────────────▼─────────────────────────────────────┐
│                    Electron (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  main.cjs (IPC Handlers)                             │  │
│  │  ├─ google-sheets-clear-sheet                        │  │
│  │  └─ google-sheets-write-sheet                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  googleSheets.cjs (Handler)                          │  │
│  │  ├─ clearSheet()                                     │  │
│  │  └─ writeSheet()                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ Google Sheets API
┌────────────────────────▼─────────────────────────────────────┐
│                    Google Sheets                             │
│  ├─ PWA_Servicios                                            │
│  ├─ PWA_Extras                                               │
│  ├─ PWA_Bar                                                  │
│  ├─ PWA_Cosmetica                                            │
│  ├─ PWA_Empleados                                            │
│  ├─ PWA_MetodosPago                                          │
│  ├─ PWA_Vehiculos                                            │
│  ├─ PWA_Usuarios                                             │
│  ├─ PWA_Lavadero                                             │
│  └─ PWA_Ventas                                               │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Lectura desde localStorage

```typescript
// MigrarDatos.tsx
const raw = localStorage.getItem(key);
const datos = JSON.parse(raw);
const arr = Array.isArray(datos) ? datos : [datos];
```

### 2. Conversión a Formato de Tabla

```typescript
// Obtener headers del primer elemento
const headers = Object.keys(arr[0]);

// Crear array de arrays
const filas = [
  headers,
  ...arr.map(item => headers.map(h => {
    const val = item[h];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }))
];
```

### 3. Llamada a Electron API

```typescript
// MigrarDatos.tsx
const api = window.electronAPI?.googleSheets;
await api.clearSheet(hoja);
await api.writeSheet(hoja, filas);
```

### 4. Procesamiento en Electron

```javascript
// preload.js
clearSheet: (sheetTitle) => ipcRenderer.invoke('google-sheets-clear-sheet', sheetTitle),
writeSheet: (sheetTitle, data) => ipcRenderer.invoke('google-sheets-write-sheet', { sheetTitle, data }),
```

### 5. Handlers IPC

```javascript
// main.cjs
ipcMain.handle('google-sheets-clear-sheet', async (event, sheetTitle) => {
  return await googleSheets.clearSheet(sheetTitle);
});

ipcMain.handle('google-sheets-write-sheet', async (event, { sheetTitle, data }) => {
  return await googleSheets.writeSheet(sheetTitle, data);
});
```

### 6. Operaciones en Google Sheets

```javascript
// googleSheets.cjs
async clearSheet(sheetTitle) {
  // 1. Obtener o crear hoja
  // 2. Obtener todas las filas
  // 3. Borrar cada fila
}

async writeSheet(sheetTitle, data) {
  // 1. Obtener o crear hoja
  // 2. Establecer headers
  // 3. Agregar filas de datos
}
```

## Métodos Principales

### clearSheet(sheetTitle)

**Propósito:** Limpia todas las filas de una hoja manteniendo los headers

**Parámetros:**
- `sheetTitle` (string): Nombre de la pestaña en Google Sheets

**Retorna:**
```javascript
{ success: true }
```

**Proceso:**
1. Obtiene la hoja por título
2. Si no existe, la crea
3. Obtiene todas las filas
4. Borra cada fila iterativamente
5. Retorna éxito

**Ejemplo:**
```javascript
await googleSheets.clearSheet('PWA_Servicios');
```

### writeSheet(sheetTitle, data)

**Propósito:** Escribe datos completos en una hoja (headers + filas)

**Parámetros:**
- `sheetTitle` (string): Nombre de la pestaña
- `data` (array): Array de arrays donde:
  - Primera fila = headers
  - Resto = datos

**Retorna:**
```javascript
{ success: true, rowsWritten: number }
```

**Proceso:**
1. Valida que haya datos
2. Obtiene o crea la hoja
3. Si existe, limpia filas previas
4. Establece headers
5. Agrega cada fila de datos
6. Retorna cantidad de filas escritas

**Ejemplo:**
```javascript
const data = [
  ['Nombre', 'Precio', 'Descripción'],
  ['Lavado Básico', 15, 'Lavado estándar'],
  ['Lavado Premium', 25, 'Lavado con encerado']
];
await googleSheets.writeSheet('PWA_Servicios', data);
```

## Estructura de Datos

### Formato localStorage

```javascript
// Ejemplo: gowash-lavado-precios
[
  {
    id: '1',
    nombre: 'Lavado Básico',
    precio: 15,
    descripcion: 'Lavado estándar'
  },
  {
    id: '2',
    nombre: 'Lavado Premium',
    precio: 25,
    descripcion: 'Lavado con encerado'
  }
]
```

### Formato Google Sheets

```
| id | nombre           | precio | descripcion        |
|----|------------------|--------|-------------------|
| 1  | Lavado Básico    | 15     | Lavado estándar   |
| 2  | Lavado Premium   | 25     | Lavado con encerado|
```

## Manejo de Errores

### Errores Comunes

#### 1. "API de Google Sheets no disponible"
```typescript
if (!api) {
  setResultado(key, { 
    estado: 'error', 
    mensaje: 'API de Google Sheets no disponible' 
  });
  return false;
}
```

**Causa:** `window.electronAPI` no está disponible  
**Solución:** Verificar que preload.js esté correctamente configurado

#### 2. "JSON inválido"
```typescript
try {
  datos = JSON.parse(raw);
} catch {
  setResultado(key, { 
    estado: 'error', 
    mensaje: 'JSON inválido' 
  });
  return false;
}
```

**Causa:** Datos corruptos en localStorage  
**Solución:** Limpiar localStorage y reintentar

#### 3. "Hoja no encontrada"
```javascript
if (!sheet) {
  console.log(`La hoja "${sheetTitle}" no existe. Creándola...`);
  sheet = await this.doc.addSheet({ 
    title: sheetTitle, 
    headerValues: headers 
  });
}
```

**Causa:** La hoja no existe en Google Sheets  
**Solución:** Se crea automáticamente

## Configuración de Credenciales

### Credenciales Embebidas

```javascript
// googleSheets.cjs
const EMBEDDED_CREDENTIALS = {
  type: "service_account",
  project_id: "gowash-db-496413",
  private_key_id: "...",
  private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  client_email: "gowash-sync@gowash-db-496413.iam.gserviceaccount.com",
  // ... más campos
};
```

### Credenciales Externas

```javascript
// Rutas de fallback
this.possiblePaths = [
  path.join(app.getPath('userData'), 'google-credentials.json'),
  path.join(process.cwd(), 'google-credentials.json'),
  path.join(path.dirname(process.execPath), 'google-credentials.json'),
  path.join(__dirname, '..', 'google-credentials.json')
];
```

## Modo Prueba

### Activación

```typescript
// googleSheetsSync.ts
const isTest = this.isTestMode();
const activeId = isTest ? (testId || prodId) : prodId;
```

### Prefijo de Hojas

```typescript
getSheetName(baseName: string) {
  if (this.isTestMode()) {
    return `PRUEBA-${baseName}`;
  }
  return baseName;
}
```

**Ejemplo:**
- Producción: `PWA_Servicios`
- Prueba: `PRUEBA-PWA_Servicios`

## Performance

### Optimizaciones

1. **Pausas entre operaciones**
   ```typescript
   await new Promise(r => setTimeout(r, 300));
   ```

2. **Procesamiento por lotes**
   - Se migra un conjunto a la vez
   - No se sobrecargan las APIs

3. **Validación previa**
   - Se valida JSON antes de procesar
   - Se verifica disponibilidad de API

### Tiempos Esperados

- Migración pequeña (< 100 registros): 30-60 segundos
- Migración mediana (100-500 registros): 1-2 minutos
- Migración grande (> 500 registros): 2-5 minutos

## Testing

### Pruebas Unitarias (Recomendadas)

```typescript
describe('MigrarDatos', () => {
  it('debería migrar datos correctamente', async () => {
    // Setup
    localStorage.setItem('test-key', JSON.stringify([{ id: 1, name: 'Test' }]));
    
    // Execute
    const result = await migrarClave('test-key', 'TestSheet');
    
    // Assert
    expect(result).toBe(true);
  });

  it('debería manejar JSON inválido', async () => {
    // Setup
    localStorage.setItem('test-key', 'invalid json');
    
    // Execute
    const result = await migrarClave('test-key', 'TestSheet');
    
    // Assert
    expect(result).toBe(false);
  });
});
```

### Pruebas Manuales

1. **Modo Prueba**
   - Activar Modo Prueba en Google Sheets Settings
   - Migrar datos
   - Verificar que se crean hojas con prefijo "PRUEBA-"

2. **Datos Vacíos**
   - Limpiar localStorage
   - Intentar migrar
   - Verificar que muestra "Sin datos"

3. **Errores de Conexión**
   - Desconectar internet
   - Intentar migrar
   - Verificar manejo de errores

## Debugging

### Logs en Consola

```javascript
// googleSheets.cjs
console.log(`[GoogleSheets] Conectado a: ${this.doc.title}`);
console.log(`[GoogleSheets] La hoja "${sheetTitle}" no existe. Creándola...`);
console.log(`[GoogleSheets] Escribiendo ${data.length - 1} filas...`);
```

### DevTools

```typescript
// En MigrarDatos.tsx
console.log('Migrando:', key);
console.log('Datos:', datos);
console.log('Resultado:', resultado);
```

## Extensiones Futuras

### 1. Sincronización Automática

```typescript
// Cada 30 minutos
setInterval(() => {
  migrarDatos();
}, 30 * 60 * 1000);
```

### 2. Sincronización Bidireccional

```typescript
// Leer desde Google Sheets
const datosRemoto = await googleSheets.getRows('PWA_Servicios');

// Comparar con local
const datosLocal = JSON.parse(localStorage.getItem('gowash-lavado-precios'));

// Sincronizar diferencias
```

### 3. Historial de Migraciones

```typescript
interface MigracionHistorial {
  fecha: Date;
  usuario: string;
  conjuntos: number;
  exitosos: number;
  errores: number;
  duracion: number;
}
```

### 4. Validación de Integridad

```typescript
// Verificar que los datos se escribieron correctamente
const rowsEscritas = await googleSheets.getRows('PWA_Servicios');
const rowsEsperadas = data.length - 1;
if (rowsEscritas.length !== rowsEsperadas) {
  throw new Error('Integridad de datos comprometida');
}
```

## Referencias

- [Google Sheets API](https://developers.google.com/sheets/api)
- [google-spreadsheet npm](https://www.npmjs.com/package/google-spreadsheet)
- [Electron IPC](https://www.electronjs.org/docs/api/ipc-main)
- [React Hooks](https://react.dev/reference/react)

---

**Versión:** 17.0.0  
**Última actualización:** 1 de Junio de 2026  
**Autor:** Gauna Agustín
