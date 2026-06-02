# 🏗️ Arquitectura Técnica - GoWash Mobile

## 📐 Estructura de Carpetas

```
GoWashMobile/
├── src/
│   ├── screens/
│   │   ├── IngresoVehiculoScreen.tsx      (Nueva)
│   │   ├── GeneracionQRScreen.tsx         (Nueva)
│   │   ├── RetiroVehiculoScreen.tsx       (Nueva)
│   │   ├── LoginScreen.tsx
│   │   ├── VentasScreen.tsx
│   │   ├── CierreScreen.tsx
│   │   ├── ReportesScreen.tsx
│   │   ├── ConfigScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── components/
│   │   ├── VehicleForm.tsx                (Nueva)
│   │   ├── QRGenerator.tsx                (Nueva)
│   │   ├── QRScanner.tsx                  (Nueva)
│   │   ├── VehicleCard.tsx                (Nueva)
│   │   ├── StateIndicator.tsx             (Nueva)
│   │   └── ...
│   ├── services/
│   │   ├── qrService.ts                   (Nueva)
│   │   ├── vehicleService.ts              (Nueva)
│   │   ├── storageService.ts              (Nueva)
│   │   ├── googleSheetsService.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useVehicles.ts                 (Nueva)
│   │   ├── useQR.ts                       (Nueva)
│   │   ├── useSyncData.ts
│   │   └── ...
│   ├── context/
│   │   ├── VehicleContext.tsx             (Nueva)
│   │   ├── SyncContext.tsx
│   │   └── ...
│   ├── types/
│   │   ├── vehicle.ts                     (Nueva)
│   │   ├── qr.ts                          (Nueva)
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts                  (Nueva)
│   │   ├── formatting.ts                  (Nueva)
│   │   └── ...
│   ├── constants/
│   │   ├── colors.ts                      (Nueva)
│   │   ├── spacing.ts                     (Nueva)
│   │   └── ...
│   └── App.tsx                            (Modificado)
├── app.json
├── package.json
└── ...
```

## 🔄 Flujo de Datos

### 1. Ingreso de Vehículo

```
┌─────────────────────────────────────────────────────────┐
│                  IngresoVehiculoScreen                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    VehicleForm                          │
│  - Captura datos del formulario                         │
│  - Valida campos                                        │
│  - Emite evento onSubmit                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  useVehicles Hook                       │
│  - Valida datos completos                               │
│  - Genera QR único                                      │
│  - Guarda en AsyncStorage                               │
│  - Retorna vehículo creado                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  vehicleService                         │
│  - Crea objeto Vehicle                                  │
│  - Asigna ID único                                      │
│  - Retorna vehículo                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  qrService                              │
│  - Genera código QR único                               │
│  - Codifica datos del vehículo                          │
│  - Retorna string QR                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  storageService                         │
│  - Guarda vehículo en AsyncStorage                      │
│  - Actualiza lista de vehículos                         │
│  - Retorna resultado                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              VehicleContext (Global State)              │
│  - Actualiza lista de vehículos                         │
│  - Notifica a componentes suscritos                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Navegación a GeneracionQRScreen            │
│  - Pasa vehículo como parámetro                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Generación de QR

```
┌─────────────────────────────────────────────────────────┐
│                GeneracionQRScreen                       │
│  - Recibe vehículo como parámetro                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   QRGenerator                           │
│  - Muestra datos del vehículo                           │
│  - Renderiza código QR                                  │
│  - Proporciona botones de acción                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Usuario escanea QR (opcional)              │
│  - Navega a RetiroVehiculoScreen                        │
└─────────────────────────────────────────────────────────┘
```

### 3. Retiro de Vehículo

```
┌─────────────────────────────────────────────────────────┐
│               RetiroVehiculoScreen                      │
│  - Muestra vista previa de cámara                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   QRScanner                             │
│  - Escanea código QR                                    │
│  - Decodifica datos                                     │
│  - Emite evento onScanned                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  useVehicles Hook                       │
│  - Busca vehículo por ID                                │
│  - Actualiza estado a "entregado"                       │
│  - Guarda en AsyncStorage                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              VehicleContext (Global State)              │
│  - Actualiza vehículo                                   │
│  - Notifica a componentes suscritos                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Sincronización con Google Sheets             │
│  - Escribe datos en Google Sheets                       │
│  - Actualiza estado remoto                              │
└─────────────────────────────────────────────────────────┘
```

## 📦 Tipos de Datos

### Vehicle
```typescript
interface Vehicle {
  id: string;                    // ID único (ej: "1548")
  placa: string;                 // Placa del vehículo
  marca: string;                 // Marca (ej: "Toyota")
  modelo: string;                // Modelo (ej: "Corolla")
  color: string;                 // Color (ej: "Blanco")
  cliente: {
    nombre: string;              // Nombre del cliente
    telefono: string;             // Teléfono del cliente
  };
  servicio: 'basico' | 'premium' | 'completo' | 'detailing';
  observaciones?: string;        // Observaciones opcionales
  formaPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta';
  qrCode: string;                // Código QR único
  estado: 'ingresado' | 'en_lavado' | 'secado' | 'listo' | 'entregado';
  fechaIngreso: Date;            // Fecha de ingreso
  fechaEntrega?: Date;           // Fecha de entrega
  empleado?: string;             // Empleado responsable
}
```

### QRData
```typescript
interface QRData {
  vehicleId: string;             // ID del vehículo
  qrCode: string;                // Código QR
  timestamp: Date;               // Timestamp de generación
  estado: string;                // Estado actual
}
```

### VehicleContextType
```typescript
interface VehicleContextType {
  vehicles: Vehicle[];           // Lista de vehículos
  currentVehicle: Vehicle | null; // Vehículo actual
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehicleByQR: (qrCode: string) => Vehicle | undefined;
  loading: boolean;
  error: string | null;
}
```

## 🔧 Servicios

### qrService.ts
```typescript
class QRService {
  // Generar código QR único
  generateQRCode(vehicleId: string): string
  
  // Decodificar código QR
  decodeQRCode(qrCode: string): QRData
  
  // Validar código QR
  validateQRCode(qrCode: string): boolean
}
```

### vehicleService.ts
```typescript
class VehicleService {
  // Crear vehículo
  createVehicle(data: Partial<Vehicle>): Vehicle
  
  // Actualizar vehículo
  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle
  
  // Obtener vehículo por ID
  getVehicleById(id: string): Vehicle | null
  
  // Obtener vehículo por QR
  getVehicleByQR(qrCode: string): Vehicle | null
  
  // Validar datos de vehículo
  validateVehicleData(data: Partial<Vehicle>): ValidationResult
}
```

### storageService.ts
```typescript
class StorageService {
  // Guardar vehículo
  async saveVehicle(vehicle: Vehicle): Promise<void>
  
  // Obtener vehículo
  async getVehicle(id: string): Promise<Vehicle | null>
  
  // Obtener todos los vehículos
  async getAllVehicles(): Promise<Vehicle[]>
  
  // Actualizar vehículo
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void>
  
  // Eliminar vehículo
  async deleteVehicle(id: string): Promise<void>
  
  // Limpiar almacenamiento
  async clearStorage(): Promise<void>
}
```

## 🪝 Hooks

### useVehicles.ts
```typescript
function useVehicles() {
  // Obtener lista de vehículos
  const vehicles = useContext(VehicleContext).vehicles
  
  // Agregar vehículo
  const addVehicle = async (data: Partial<Vehicle>) => {
    // Validar datos
    // Generar QR
    // Guardar en AsyncStorage
    // Actualizar contexto
  }
  
  // Actualizar vehículo
  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    // Validar datos
    // Guardar en AsyncStorage
    // Actualizar contexto
  }
  
  // Obtener vehículo por QR
  const getVehicleByQR = (qrCode: string) => {
    // Buscar en lista
    // Retornar vehículo
  }
  
  return { vehicles, addVehicle, updateVehicle, getVehicleByQR }
}
```

### useQR.ts
```typescript
function useQR() {
  // Generar QR
  const generateQR = (vehicleId: string) => {
    // Generar código único
    // Retornar código
  }
  
  // Escanear QR
  const scanQR = async () => {
    // Solicitar permisos de cámara
    // Abrir escáner
    // Retornar datos escaneados
  }
  
  return { generateQR, scanQR }
}
```

## 🎨 Componentes

### VehicleForm.tsx
```typescript
interface VehicleFormProps {
  onSubmit: (data: Partial<Vehicle>) => void
  initialData?: Partial<Vehicle>
  isLoading?: boolean
}

function VehicleForm({ onSubmit, initialData, isLoading }: VehicleFormProps) {
  // Renderizar formulario
  // Capturar datos
  // Validar
  // Emitir onSubmit
}
```

### QRGenerator.tsx
```typescript
interface QRGeneratorProps {
  vehicleId: string
  qrCode: string
  vehicleData: Vehicle
  onScan: () => void
  onChangeTicket: () => void
}

function QRGenerator({ vehicleId, qrCode, vehicleData, onScan, onChangeTicket }: QRGeneratorProps) {
  // Renderizar QR
  // Mostrar datos
  // Botones de acción
}
```

### QRScanner.tsx
```typescript
interface QRScannerProps {
  onScanned: (data: QRData) => void
  onError: (error: Error) => void
}

function QRScanner({ onScanned, onError }: QRScannerProps) {
  // Renderizar cámara
  // Escanear QR
  // Emitir eventos
}
```

## 🔄 Contexto Global

### VehicleContext.tsx
```typescript
interface VehicleContextType {
  vehicles: Vehicle[]
  currentVehicle: Vehicle | null
  addVehicle: (vehicle: Vehicle) => Promise<void>
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>
  deleteVehicle: (id: string) => Promise<void>
  getVehicleById: (id: string) => Vehicle | undefined
  getVehicleByQR: (qrCode: string) => Vehicle | undefined
  loading: boolean
  error: string | null
}

function VehicleProvider({ children }: { children: ReactNode }) {
  // Inicializar estado
  // Cargar vehículos de AsyncStorage
  // Proporcionar contexto
}
```

## 🧪 Testing

### Pruebas Unitarias
- `qrService.test.ts` - Pruebas de generación y decodificación de QR
- `vehicleService.test.ts` - Pruebas de CRUD de vehículos
- `storageService.test.ts` - Pruebas de almacenamiento

### Pruebas de Integración
- `IngresoVehiculoScreen.test.tsx` - Pruebas de ingreso
- `GeneracionQRScreen.test.tsx` - Pruebas de generación de QR
- `RetiroVehiculoScreen.test.tsx` - Pruebas de retiro

### Pruebas E2E
- Flujo completo de ingreso a retiro
- Sincronización con Google Sheets
- Manejo de errores

## 🚀 Optimizaciones

### Performance
- Memoización de componentes
- Lazy loading de pantallas
- Caché de datos
- Compresión de QR

### Almacenamiento
- Índices en AsyncStorage
- Paginación de datos
- Limpieza de datos antiguos

### Sincronización
- Batch de escrituras
- Reintentos automáticos
- Caché de cambios

## 🔐 Seguridad

- Validación de entrada
- Sanitización de datos
- Encriptación de datos sensibles
- Manejo seguro de permisos

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026
