# 🚀 Guía Rápida - Sincronización GoWash Mobile

## ¿Qué se implementó?

Se completó la **Fase 1** del plan de sincronización. La aplicación móvil ahora tiene:

✅ Servicio de Google Sheets  
✅ Hooks de sincronización  
✅ Contexto global  
✅ UI en ConfigScreen  
✅ Caché local  
✅ Historial de sincronización  

---

## 🎯 Cómo Usar

### 1. Configurar Google Sheets ID

En la pantalla **Configuración** → **Sincronización Google Sheets**:

1. Obtén el ID de tu Google Sheets desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

2. Pega el ID en el campo "Google Sheets ID"

3. Habilita "Sincronización automática" (opcional)

4. Configura el intervalo (por defecto 5 minutos)

5. Haz clic en "Guardar Configuración"

### 2. Sincronizar Datos

**Automática:**
- Se ejecuta cada 5 minutos (configurable)
- Se ejecuta al iniciar la app
- Se ejecuta en background

**Manual:**
- Haz clic en "Sincronizar Ahora" en ConfigScreen
- Verás un indicador de carga mientras se sincroniza

### 3. Ver Historial

En ConfigScreen → **Historial de Sincronización**:
- Últimas 10 sincronizaciones
- Estado (éxito/error)
- Timestamp
- Detalles

---

## 💻 Para Desarrolladores

### Usar en Componentes

```typescript
import { useSync } from '../context/SyncContext';

function MiComponente() {
  const sync = useSync();
  
  // Acceder a datos sincronizados
  const servicios = sync.syncData['PWA_Servicios'];
  const empleados = sync.syncData['PWA_Empleados'];
  
  // Escribir una venta
  const success = await sync.writeVenta({
    fecha: new Date().toISOString(),
    total: 100,
    // ... más datos
  });
  
  // Sincronizar manualmente
  await sync.manualSync();
  
  // Ver estado
  console.log('Sincronizando:', sync.isSyncing);
  console.log('Última sincronización:', sync.lastSync);
  console.log('Error:', sync.syncError);
}
```

### Hooks Especializados

```typescript
// Solo lectura
import { useSyncRead } from '../context/SyncContext';
const { syncData, manualSync, lastSync } = useSyncRead();

// Solo escritura
import { useSyncWrite } from '../context/SyncContext';
const { writeVenta, writeCierre, updateLavadero } = useSyncWrite();
```

### Servicio Directo

```typescript
import googleSheetsService from '../services/googleSheetsService';

// Leer datos
const servicios = await googleSheetsService.readSheet('PWA_Servicios');

// Escribir venta
const result = await googleSheetsService.writeVenta(ventaData);

// Obtener configuración
const config = await googleSheetsService.getSyncConfig();
```

---

## 📊 Datos Disponibles

### Lectura (Desde Google Sheets)
```
PWA_Servicios      → Servicios de lavado
PWA_Extras         → Extras de lavado
PWA_Bar            → Productos bar
PWA_Cosmetica      → Cosmética/Accesorios
PWA_Empleados      → Empleados
PWA_MetodosPago    → Métodos de pago
PWA_Vehiculos      → Precios por vehículo
PWA_Usuarios       → Usuarios del sistema
PWA_Lavadero       → Estado del lavadero
```

### Escritura (Hacia Google Sheets)
```
PWA_Ventas         → Registros de ventas
PWA_Cierres        → Cierres de caja
PWA_Lavadero       → Actualizaciones de estado
```

---

## 🔧 Archivos Creados

```
src/
├── services/
│   └── googleSheetsService.ts      (Servicio principal)
├── hooks/
│   └── useSyncData.ts              (Hooks de sincronización)
├── context/
│   └── SyncContext.tsx             (Contexto global)
├── screens/
│   └── ConfigScreen.tsx            (UI actualizada)
├── types/
│   └── index.ts                    (Tipos actualizados)
└── App.tsx                         (Actualizado con SyncProvider)

Documentación/
├── PLAN_SINCRONIZACION.md          (Plan original)
├── IMPLEMENTACION_SYNC.md          (Detalles de implementación)
└── GUIA_RAPIDA_SYNC.md             (Esta guía)
```

---

## ⚙️ Configuración

### Intervalo de Sincronización
- Por defecto: 5 minutos
- Mínimo: 1 minuto
- Máximo: 60 minutos

### Caché Local
- Se guarda en AsyncStorage
- Se carga al iniciar la app
- Se actualiza con cada sincronización

### Historial
- Últimos 50 eventos
- Se guarda en AsyncStorage
- Se puede ver en ConfigScreen

---

## 🐛 Solución de Problemas

### "Google Sheets no inicializado"
- Verifica que ingresaste el Google Sheets ID
- Haz clic en "Guardar Configuración"
- Intenta "Sincronizar Ahora"

### "Error al conectar con Google Sheets"
- Verifica la conexión a internet
- Verifica que el ID sea correcto
- Revisa el historial para más detalles

### No se sincroniza automáticamente
- Verifica que "Sincronización automática" esté habilitada
- Verifica el intervalo configurado
- Revisa los logs en la consola

### Los datos no se actualizan
- Haz clic en "Sincronizar Ahora"
- Verifica que el Google Sheets ID sea correcto
- Revisa que las hojas existan en Google Sheets

---

## 📈 Próximas Fases

### Fase 2: Integración en Pantallas
- Cargar servicios en VentasScreen
- Cargar empleados en VentasScreen
- Cargar métodos de pago en VentasScreen
- Sincronizar ventas al guardar

### Fase 3: Escritura de Datos
- Sincronizar cierres al guardar
- Actualizar estado del lavadero
- Manejo de conflictos

### Fase 4: Testing
- Pruebas unitarias
- Pruebas de integración
- Pruebas offline

### Fase 5: Optimización
- Compresión de datos
- Reintentos automáticos
- Sincronización en background

---

## 📞 Notas

- La app funciona **offline** usando caché local
- Los datos se sincronizan **automáticamente** cada 5 minutos
- Se pueden **sincronizar manualmente** en cualquier momento
- El **historial** se guarda para debugging
- Las **credenciales** están embebidas (seguras)

---

**Versión:** 1.0.0  
**Estado:** ✅ Fase 1 Completada  
**Próximo:** Fase 2 - Integración en Pantallas
