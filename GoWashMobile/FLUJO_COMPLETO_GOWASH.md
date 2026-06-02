# 📱 GoWash Mobile - Flujo Completo de Vehículos

## 🎯 Descripción General

Este documento describe la implementación completa del flujo de ingreso, generación de QR y retiro de vehículos en GoWash Mobile.

## 📋 Estructura Implementada

### Tipos de Datos (`src/types/`)

- **vehicle.ts**: Interfaces para vehículos, datos de cliente, tipos de servicio y pago
- **qr.ts**: Interfaces para datos de QR y resultados de escaneo

### Servicios (`src/services/`)

- **qrService.ts**: Generación, validación y decodificación de códigos QR
- **vehicleService.ts**: CRUD de vehículos y validación de datos
- **storageService.ts**: Gestión de almacenamiento local con AsyncStorage
- **vehicleSyncService.ts**: Sincronización con Google Sheets
- **googleSheetsService.ts**: Conexión y operaciones con Google Sheets

### Componentes (`src/components/`)

- **VehicleForm.tsx**: Formulario para ingreso de vehículos
- **QRGenerator.tsx**: Generador y visualizador de códigos QR
- **QRScanner.tsx**: Escáner de códigos QR con expo-barcode-scanner
- **SyncIndicator.tsx**: Indicador de estado de sincronización

### Pantallas (`src/screens/`)

- **IngresoVehiculoScreen.tsx**: Pantalla de ingreso de vehículos
- **GeneracionQRScreen.tsx**: Pantalla de generación de QR
- **RetiroVehiculoScreen.tsx**: Pantalla de retiro de vehículos

### Hooks (`src/hooks/`)

- **useVehicles.ts**: Hook personalizado para gestión de vehículos

## 🔄 Flujo de Datos

### 1. Ingreso de Vehículo

```
Usuario ingresa datos en VehicleForm
    ↓
Validación de campos
    ↓
Creación de vehículo con ID único
    ↓
Generación de código QR
    ↓
Guardado en AsyncStorage
    ↓
Navegación a GeneracionQRScreen
```

### 2. Generación de QR

```
Carga de datos del vehículo
    ↓
Visualización de código QR
    ↓
Opciones:
  - Escanear QR (verificación)
  - Cambiar ticket (editar)
  - Compartir por WhatsApp
```

### 3. Retiro de Vehículo

```
Escaneo de código QR
    ↓
Búsqueda de vehículo en AsyncStorage
    ↓
Visualización de datos del vehículo
    ↓
Actualización de estado a "entregado"
    ↓
Sincronización con Google Sheets
```

## 🚀 Cómo Usar

### Ingreso de Vehículo

1. Navega a la pestaña "Vehículos"
2. Selecciona "Ingreso de Vehículo"
3. Completa el formulario con:
   - Placa del vehículo
   - Marca y modelo
   - Color
   - Datos del cliente
   - Servicio a realizar
   - Forma de pago
4. Presiona "GENERAR QR E INGRESAR"

### Generación de QR

1. Se mostrará el código QR generado
2. Puedes:
   - Escanear el QR para verificar
   - Cambiar el ticket si necesitas editar
   - Compartir por WhatsApp al cliente

### Retiro de Vehículo

1. Navega a "Retiro de Vehículo"
2. Escanea el código QR del vehículo
3. Verifica los datos del vehículo
4. Presiona "MARCAR COMO ENTREGADO"
5. El vehículo se sincronizará con Google Sheets

## 📊 Datos Almacenados

### En AsyncStorage

```
@gowash_vehicles: [id1, id2, id3, ...]
@gowash_vehicle_[id]: {
  id: string
  placa: string
  marca: string
  modelo: string
  color: string
  cliente: { nombre, telefono }
  servicio: 'basico' | 'premium' | 'completo' | 'detailing'
  observaciones?: string
  formaPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta'
  qrCode: string
  estado: 'ingresado' | 'en_lavado' | 'secado' | 'listo' | 'entregado'
  fechaIngreso: Date
  fechaEntrega?: Date
  empleado?: string
}
```

### En Google Sheets

Los datos se sincronizan en las siguientes hojas:
- **PWA_Ventas**: Ingreso de vehículos
- **PWA_Lavadero**: Retiro de vehículos y actualizaciones de estado

## 🔐 Validaciones

### Placa
- Obligatoria
- Formato: 6-8 caracteres alfanuméricos
- Se convierte a mayúsculas automáticamente

### Cliente
- Nombre obligatorio
- Teléfono opcional

### Servicio
- Obligatorio
- Opciones: Básico, Premium, Completo, Detailing

### Forma de Pago
- Obligatoria
- Opciones: Efectivo, Tarjeta, Transferencia, Cuenta

## 🔄 Sincronización

### Automática
- Se sincroniza automáticamente al marcar como entregado
- Se guarda en historial local si falla

### Manual
- Usa el componente SyncIndicator para ver el estado
- Presiona para actualizar manualmente

### Historial
- Se mantiene un historial de últimas 100 sincronizaciones
- Accesible a través de `vehicleSyncService.getSyncHistory()`

## 📈 Estadísticas

Puedes obtener estadísticas de vehículos usando:

```typescript
import { calculateVehicleStats } from './utils/optimization';

const stats = calculateVehicleStats(vehicles);
// {
//   total: 10,
//   ingresados: 2,
//   enLavado: 3,
//   listos: 2,
//   entregados: 3,
//   promedioPorServicio: { basico: 2, premium: 3, ... }
// }
```

## 🔍 Búsqueda

Puedes buscar vehículos de varias formas:

```typescript
import { useVehicles } from './hooks/useVehicles';

const { searchByPlaca, searchByClient, getVehiclesByStatus } = useVehicles();

// Por placa
const byPlaca = await searchByPlaca('AB123');

// Por cliente
const byClient = await searchByClient('Juan');

// Por estado
const byStatus = await getVehiclesByStatus('entregado');
```

## 🛠️ Troubleshooting

### El QR no se escanea
- Asegúrate de que la cámara tiene permisos
- Verifica que el código QR sea legible
- Intenta en mejor iluminación

### Los datos no se sincronizan
- Verifica la conexión a internet
- Comprueba que Google Sheets está configurado
- Revisa el historial de sincronización

### El formulario no valida
- Completa todos los campos obligatorios
- Verifica el formato de la placa
- Asegúrate de seleccionar opciones válidas

## 📱 Dependencias Necesarias

```json
{
  "expo-barcode-scanner": "^12.0.0",
  "qrcode.react": "^1.0.1",
  "expo-permissions": "^14.0.0",
  "@react-native-async-storage/async-storage": "^1.17.0",
  "google-spreadsheet": "^4.0.0",
  "google-auth-library": "^8.0.0"
}
```

## 🎨 Estilos

Los estilos siguen el diseño especificado:
- Color primario: #1E40AF (Azul GoWash)
- Color secundario: #10B981 (Verde éxito)
- Color de error: #EF4444 (Rojo)
- Fondo: #F3F4F6 (Gris claro)

## 📝 Notas

- Los vehículos se almacenan localmente en AsyncStorage
- Se pueden usar offline, sincronizando cuando hay conexión
- Los datos se comprimen para optimizar almacenamiento
- Se limpian automáticamente después de 30 días

## 🚀 Próximas Mejoras

- [ ] Agregar fotos del vehículo
- [ ] Historial de cambios de estado
- [ ] Notificaciones de sincronización
- [ ] Reportes de vehículos
- [ ] Integración con sistema de pagos
- [ ] Estadísticas en tiempo real

---

**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026  
**Estado:** ✅ Completado
