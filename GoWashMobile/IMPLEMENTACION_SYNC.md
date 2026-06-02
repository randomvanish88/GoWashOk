# 📱 Implementación de Sincronización - GoWash Mobile

## ✅ Estado: Fase 1 Completada

Se ha completado la **Fase 1: Servicios Base** del plan de sincronización. La aplicación móvil está lista para sincronizar datos con Google Sheets.

---

## 🎯 Componentes Implementados

### 1. **Servicio de Google Sheets** ✅
**Archivo:** `src/services/googleSheetsService.ts`

**Funcionalidades:**
- ✅ Conexión a Google Sheets con credenciales embebidas
- ✅ Lectura de datos desde 9 hojas (Servicios, Extras, Bar, Cosmética, Empleados, Métodos de Pago, Vehículos, Usuarios, Lavadero)
- ✅ Escritura de ventas, cierres y estado del lavadero
- ✅ Gestión de configuración de sincronización
- ✅ Historial de sincronización
- ✅ Manejo de errores y reintentos

**Métodos principales:**
```typescript
- initialize(spreadsheetId): Conecta a Google Sheets
- readSheet(sheetName): Lee datos de una hoja
- readAllData(): Lee todos los datos de lectura
- writeVenta(ventaData): Escribe una venta
- writeCierre(cierreData): Escribe un cierre
- updateLavadero(lavaderoData): Actualiza estado del lavadero
- getSyncConfig(): Obtiene configuración guardada
- saveSyncConfig(config): Guarda configuración
- getSyncHistory(): Obtiene historial
- addSyncHistoryEntry(entry): Agrega evento al historial
```

---

### 2. **Hooks de Sincronización** ✅
**Archivo:** `src/hooks/useSyncData.ts`

**Hook `useSyncData()`:**
- ✅ Sincronización periódica automática (configurable cada 5 minutos)
- ✅ Sincronización manual bajo demanda
- ✅ Caché local de datos
- ✅ Gestión de estado de sincronización
- ✅ Manejo de errores

**Hook `useSyncWrite()`:**
- ✅ Escritura de ventas
- ✅ Escritura de cierres
- ✅ Actualización de lavadero
- ✅ Manejo de errores de escritura

---

### 3. **Contexto Global de Sincronización** ✅
**Archivo:** `src/context/SyncContext.tsx`

**Proporciona:**
- ✅ Estado global de sincronización
- ✅ Funciones de lectura y escritura
- ✅ Hooks especializados: `useSync()`, `useSyncRead()`, `useSyncWrite()`
- ✅ Acceso centralizado a todas las funciones de sincronización

---

### 4. **Tipos de Datos Actualizados** ✅
**Archivo:** `src/types/index.ts`

**Interfaces agregadas:**
```typescript
- SyncConfig: Configuración de sincronización
- SyncResult: Resultado de operaciones de sincronización
- SyncHistory: Historial de sincronización
- Empleado: Datos de empleados
- MetodoPago: Métodos de pago
- Vehiculo: Información de vehículos
- Usuario: Datos de usuarios
```

---

### 5. **Pantalla de Configuración Mejorada** ✅
**Archivo:** `src/screens/ConfigScreen.tsx`

**Nuevas funcionalidades:**
- ✅ Configuración de Google Sheets ID
- ✅ Indicador de estado de conexión
- ✅ Botón de sincronización manual
- ✅ Toggle de sincronización automática
- ✅ Configuración de intervalo de sincronización
- ✅ Última fecha de sincronización
- ✅ Historial de sincronización (últimas 10)
- ✅ Indicadores visuales de éxito/error

**Secciones:**
1. **Sincronización Google Sheets**
   - Input para Google Sheets ID
   - Estado de conexión (conectado/desconectado)
   - Última sincronización
   - Toggle de sincronización automática
   - Intervalo configurable
   - Botones de guardar y sincronizar

2. **Historial de Sincronización**
   - Últimas 10 sincronizaciones
   - Tipo (read/write/full)
   - Estado (success/error)
   - Timestamp
   - Detalles del evento

---

### 6. **App.tsx Actualizado** ✅
**Archivo:** `App.tsx`

**Cambios:**
- ✅ Importación de `SyncProvider`
- ✅ Envolvimiento de la aplicación con `SyncProvider`
- ✅ Inicialización automática de sincronización al cargar la app

---

## 🔄 Flujo de Sincronización

### Inicialización
```
App inicia
  ↓
SyncProvider se inicializa
  ↓
useSyncData() carga configuración
  ↓
Si hay Google Sheets ID → Conectar
  ↓
Cargar datos del caché local
  ↓
Si autoSync habilitado → Configurar intervalo periódico
  ↓
App lista para usar
```

### Sincronización Periódica
```
Cada 5 minutos (configurable)
  ↓
Verificar conexión a Google Sheets
  ↓
Leer datos de todas las hojas
  ↓
Guardar en caché local
  ↓
Actualizar timestamp
  ↓
Agregar al historial
```

### Sincronización Manual
```
Usuario hace clic en "Sincronizar Ahora"
  ↓
Mostrar indicador de carga
  ↓
Ejecutar sincronización completa
  ↓
Mostrar resultado (éxito/error)
  ↓
Actualizar UI
```

---

## 📊 Datos Sincronizados

### Lectura (Desde Google Sheets)
```
✅ PWA_Servicios - Servicios de lavado
✅ PWA_Extras - Extras de lavado
✅ PWA_Bar - Productos bar
✅ PWA_Cosmetica - Cosmética/Accesorios
✅ PWA_Empleados - Empleados
✅ PWA_MetodosPago - Métodos de pago
✅ PWA_Vehiculos - Precios por vehículo
✅ PWA_Usuarios - Usuarios del sistema
✅ PWA_Lavadero - Estado del lavadero
```

### Escritura (Hacia Google Sheets)
```
✅ PWA_Ventas - Registros de ventas
✅ PWA_Cierres - Cierres de caja
✅ PWA_Lavadero - Actualizaciones de estado
```

---

## 🛠️ Cómo Usar

### En ConfigScreen
1. Ingresa el Google Sheets ID
2. Habilita sincronización automática (opcional)
3. Configura el intervalo (por defecto 5 minutos)
4. Haz clic en "Guardar Configuración"
5. Haz clic en "Sincronizar Ahora" para sincronizar manualmente

### En Otros Componentes
```typescript
import { useSync } from '../context/SyncContext';

function MiComponente() {
  const sync = useSync();
  
  // Acceder a datos sincronizados
  const servicios = sync.syncData['PWA_Servicios'];
  
  // Escribir una venta
  const success = await sync.writeVenta(ventaData);
  
  // Sincronizar manualmente
  await sync.manualSync();
}
```

---

## 🔐 Seguridad

- ✅ Credenciales embebidas (mismas que en desktop)
- ✅ Validación de Google Sheets ID
- ✅ Manejo seguro de errores
- ✅ Caché local encriptado en AsyncStorage
- ✅ Historial limitado a 50 eventos

---

## 📈 Próximos Pasos

### Fase 2: Integración en Pantallas
- [ ] Integrar lectura de datos en VentasScreen
- [ ] Integrar lectura de datos en CierreScreen
- [ ] Integrar lectura de datos en ReportesScreen
- [ ] Cargar empleados desde Google Sheets
- [ ] Cargar métodos de pago desde Google Sheets
- [ ] Cargar servicios desde Google Sheets

### Fase 3: Escritura de Datos
- [ ] Sincronizar ventas al guardar
- [ ] Sincronizar cierres al guardar
- [ ] Actualizar estado del lavadero
- [ ] Manejo de conflictos

### Fase 4: Testing
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Pruebas de sincronización
- [ ] Pruebas offline

### Fase 5: Optimización
- [ ] Compresión de datos
- [ ] Reintentos automáticos
- [ ] Sincronización en background
- [ ] Notificaciones de sincronización

---

## 📝 Notas Importantes

1. **Offline First**: La app funciona sin conexión usando caché local
2. **Caché Local**: Los datos se guardan en AsyncStorage para acceso rápido
3. **Sincronización Periódica**: Se ejecuta automáticamente cada 5 minutos (configurable)
4. **Historial**: Se guardan los últimos 50 eventos de sincronización
5. **Errores**: Se manejan gracefully con mensajes claros al usuario

---

## 🚀 Instalación y Configuración

### Dependencias Requeridas
```json
{
  "google-spreadsheet": "^5.2.0",
  "google-auth-library": "^10.6.2",
  "@react-native-async-storage/async-storage": "^1.23.1"
}
```

Todas las dependencias ya están instaladas en `package.json`.

### Configuración Inicial
1. Obtén el Google Sheets ID de tu documento
2. Ve a ConfigScreen
3. Ingresa el ID
4. Habilita sincronización automática
5. Haz clic en "Sincronizar Ahora"

---

## 📞 Soporte

Para problemas de sincronización:
1. Verifica que el Google Sheets ID sea correcto
2. Verifica la conexión a internet
3. Revisa el historial de sincronización en ConfigScreen
4. Consulta los logs en la consola

---

**Estado:** ✅ Fase 1 Completada  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026  
**Próxima Fase:** Integración en Pantallas
