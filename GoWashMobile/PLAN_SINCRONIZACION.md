# 📱 Plan de Sincronización - GoWash Mobile

## 🎯 Objetivo

Preparar la aplicación móvil GoWash para sincronizar datos con Google Sheets, permitiendo que la app móvil lea y escriba datos desde/hacia el mismo lugar que la versión de escritorio.

## 📊 Arquitectura de Sincronización

```
┌─────────────────────────────────────────────────────────────┐
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
         ↑                                    ↑
         │ Lectura (Sincronización)          │ Escritura (Ventas)
         │                                    │
┌────────┴────────────────────────────────────┴────────────────┐
│                  GoWash Mobile App                            │
│  ├─ VentasScreen (Registra ventas)                           │
│  ├─ CierreScreen (Cierre de caja)                            │
│  ├─ ReportesScreen (Consulta datos)                          │
│  └─ ConfigScreen (Sincronización)                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes a Crear/Modificar

### 1. **Servicio de Google Sheets** (Nuevo)
**Archivo:** `src/services/googleSheetsService.ts`

```typescript
// Funcionalidades:
- Conectar a Google Sheets
- Leer datos de hojas específicas
- Escribir datos (ventas, cierres)
- Sincronizar datos locales
- Manejo de errores y reintentos
```

### 2. **Hook de Sincronización** (Nuevo)
**Archivo:** `src/hooks/useSyncData.ts`

```typescript
// Funcionalidades:
- Sincronizar datos al iniciar app
- Sincronizar periódicamente
- Detectar cambios locales
- Actualizar datos remotos
- Manejo de conflictos
```

### 3. **Pantalla de Sincronización** (Modificar)
**Archivo:** `src/screens/ConfigScreen.tsx`

```typescript
// Agregar:
- Configuración de Google Sheets ID
- Estado de sincronización
- Botón de sincronización manual
- Historial de sincronizaciones
- Indicador de última sincronización
```

### 4. **Tipos de Datos** (Actualizar)
**Archivo:** `src/types/index.ts`

```typescript
// Agregar interfaces para:
- Configuración de Google Sheets
- Estado de sincronización
- Historial de sincronización
- Datos de ventas/cierres
```

### 5. **Contexto Global** (Nuevo)
**Archivo:** `src/context/SyncContext.tsx`

```typescript
// Proporcionar:
- Estado global de sincronización
- Funciones de sincronización
- Datos compartidos
- Notificaciones de sincronización
```

## 📋 Datos a Sincronizar

### Lectura (Desde Google Sheets)
```
✅ Servicios de Lavado (PWA_Servicios)
✅ Extras de Lavado (PWA_Extras)
✅ Productos Bar (PWA_Bar)
✅ Cosmética/Accesorios (PWA_Cosmetica)
✅ Empleados (PWA_Empleados)
✅ Métodos de Pago (PWA_MetodosPago)
✅ Precios por Vehículo (PWA_Vehiculos)
✅ Usuarios (PWA_Usuarios)
```

### Escritura (Hacia Google Sheets)
```
✅ Ventas (PWA_Ventas)
✅ Cierres de Caja (PWA_Cierres)
✅ Vehículos en Lavadero (PWA_Lavadero)
```

## 🔄 Flujo de Sincronización

### 1. **Inicialización**
```
App inicia
  ↓
Cargar configuración (Google Sheets ID)
  ↓
Conectar a Google Sheets
  ↓
Sincronizar datos de lectura
  ↓
Mostrar pantalla principal
```

### 2. **Sincronización Periódica**
```
Cada 5 minutos (configurable)
  ↓
Verificar cambios locales
  ↓
Si hay cambios → Escribir a Google Sheets
  ↓
Verificar cambios remotos
  ↓
Si hay cambios → Actualizar local
```

### 3. **Sincronización Manual**
```
Usuario hace clic en "Sincronizar"
  ↓
Mostrar indicador de carga
  ↓
Ejecutar sincronización completa
  ↓
Mostrar resultado (éxito/error)
```

## 🛠️ Implementación Paso a Paso

### Fase 1: Servicios Base
- [ ] Crear `googleSheetsService.ts`
- [ ] Implementar conexión a Google Sheets
- [ ] Implementar lectura de datos
- [ ] Implementar escritura de datos
- [ ] Manejo de errores

### Fase 2: Hooks y Contexto
- [ ] Crear `useSyncData.ts`
- [ ] Crear `SyncContext.tsx`
- [ ] Implementar sincronización periódica
- [ ] Implementar sincronización manual

### Fase 3: UI/UX
- [ ] Actualizar `ConfigScreen.tsx`
- [ ] Agregar indicadores de sincronización
- [ ] Agregar historial de sincronización
- [ ] Agregar notificaciones

### Fase 4: Testing
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Pruebas de sincronización
- [ ] Pruebas de conflictos

### Fase 5: Optimización
- [ ] Caché de datos
- [ ] Compresión de datos
- [ ] Reintentos automáticos
- [ ] Sincronización en background

## 📦 Dependencias Necesarias

```json
{
  "google-spreadsheet": "^5.2.0",
  "google-auth-library": "^10.6.2",
  "@react-native-async-storage/async-storage": "^1.17.0",
  "axios": "^1.4.0"
}
```

## 🔐 Configuración de Seguridad

### Google Sheets ID
- Almacenar en AsyncStorage (encriptado)
- Permitir cambio en ConfigScreen
- Validar antes de usar

### Credenciales
- Usar credenciales embebidas (como en desktop)
- O usar OAuth2 para mayor seguridad
- Nunca guardar credenciales en el código

## 📱 Pantallas Afectadas

### ConfigScreen
```
Agregar secciones:
├─ Google Sheets Configuration
│  ├─ Google Sheets ID (input)
│  ├─ Estado de conexión
│  └─ Botón de probar conexión
├─ Sincronización
│  ├─ Última sincronización
│  ├─ Botón de sincronizar ahora
│  ├─ Sincronización automática (toggle)
│  └─ Intervalo de sincronización
└─ Historial
   ├─ Últimas sincronizaciones
   └─ Errores de sincronización
```

### VentasScreen
```
Cambios:
├─ Cargar servicios desde Google Sheets
├─ Cargar empleados desde Google Sheets
├─ Cargar métodos de pago desde Google Sheets
└─ Sincronizar venta al guardar
```

### CierreScreen
```
Cambios:
├─ Cargar datos de ventas del día
├─ Sincronizar cierre al guardar
└─ Actualizar estado en Google Sheets
```

## 🎯 Indicadores de Éxito

- ✅ App se conecta a Google Sheets
- ✅ Datos se cargan correctamente
- ✅ Ventas se escriben en Google Sheets
- ✅ Sincronización periódica funciona
- ✅ Manejo de errores robusto
- ✅ UI muestra estado de sincronización
- ✅ Funciona offline (caché local)
- ✅ Sincronización manual disponible

## 📝 Notas Importantes

1. **Offline First**: La app debe funcionar sin conexión
2. **Caché Local**: Guardar datos localmente para acceso rápido
3. **Conflictos**: Manejar conflictos de datos (última escritura gana)
4. **Notificaciones**: Informar al usuario sobre estado de sincronización
5. **Performance**: Optimizar para conexiones lentas
6. **Seguridad**: Validar datos antes de escribir

## 🚀 Próximos Pasos

1. Crear estructura de carpetas
2. Implementar servicio de Google Sheets
3. Crear hooks de sincronización
4. Actualizar ConfigScreen
5. Agregar indicadores visuales
6. Testing completo
7. Optimización y refinamiento

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026
