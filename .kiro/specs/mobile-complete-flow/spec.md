# 📱 GoWash Mobile - Maqueta Completa

## 🎯 Objetivo

Implementar la maqueta completa de GoWash Mobile con las tres pantallas principales:
1. **Ingreso de Vehículo** - Registro de vehículos con formulario completo
2. **Generación de QR** - Confirmación y generación de código QR único
3. **Retiro de Vehículo** - Escaneo de QR y finalización del servicio

## 📋 Requisitos

### Pantalla 1: Ingreso de Vehículo
- Formulario con campos:
  - Placa del vehículo (obligatorio)
  - Marca/Modelo (dropdown)
  - Color (dropdown)
  - Cliente (nombre, teléfono con WhatsApp)
  - Servicio (Básico, Premium, Completo, Detailing)
  - Observaciones (opcional)
  - Forma de Pago (Efectivo, Tarjeta, Transferencia, Cuenta)
- Botón "GENERAR QR E INGRESAR"
- Validación de campos
- Almacenamiento local en AsyncStorage

### Pantalla 2: Generación de QR
- Mostrar confirmación de ingreso
- Datos del vehículo ingresado
- Código QR único generado
- Botón "ESCANEAR QR" para verificación
- Botón "CAMBIAR TICKET" para editar
- Opción de compartir por WhatsApp

### Pantalla 3: Retiro de Vehículo
- Escaneo de código QR
- Mostrar datos del vehículo
- Estado del lavado (Ingresado, En lavado, Secado, Listo)
- Botón "CANCELAR"
- Botón "MARCAR COMO ENTREGADO"

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/
├── screens/
│   ├── IngresoVehiculoScreen.tsx
│   ├── GeneracionQRScreen.tsx
│   ├── RetiroVehiculoScreen.tsx
│   └── ...
├── components/
│   ├── VehicleForm.tsx
│   ├── QRGenerator.tsx
│   ├── QRScanner.tsx
│   └── ...
├── services/
│   ├── qrService.ts
│   ├── vehicleService.ts
│   └── ...
├── types/
│   ├── vehicle.ts
│   ├── qr.ts
│   └── ...
└── ...
```

### Tipos de Datos
```typescript
interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  cliente: {
    nombre: string;
    telefono: string;
  };
  servicio: 'basico' | 'premium' | 'completo' | 'detailing';
  observaciones?: string;
  formaPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta';
  qrCode: string;
  estado: 'ingresado' | 'en_lavado' | 'secado' | 'listo' | 'entregado';
  fechaIngreso: Date;
  fechaEntrega?: Date;
}

interface QRData {
  vehicleId: string;
  qrCode: string;
  timestamp: Date;
  estado: string;
}
```

## 🔄 Flujo de Datos

```
Ingreso de Vehículo
    ↓
Validar datos
    ↓
Generar QR único
    ↓
Guardar en AsyncStorage
    ↓
Mostrar QR
    ↓
Escanear QR (verificación)
    ↓
Retiro de Vehículo
    ↓
Marcar como entregado
    ↓
Sincronizar con Google Sheets
```

## 🛠️ Tecnologías

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **expo-barcode-scanner** - Escaneo de QR
- **qrcode.react** - Generación de QR
- **AsyncStorage** - Almacenamiento local
- **Google Sheets API** - Sincronización

## 📦 Dependencias Necesarias

```json
{
  "expo-barcode-scanner": "^12.0.0",
  "qrcode.react": "^1.0.1",
  "expo-permissions": "^14.0.0"
}
```

## ✅ Criterios de Aceptación

- [ ] Pantalla de ingreso funciona correctamente
- [ ] Formulario valida todos los campos
- [ ] QR se genera correctamente
- [ ] QR se puede escanear
- [ ] Datos se guardan en AsyncStorage
- [ ] Pantalla de retiro muestra datos correctos
- [ ] Estado se actualiza correctamente
- [ ] Sincronización con Google Sheets funciona
- [ ] UI coincide exactamente con la maqueta
- [ ] Funciona offline

## 📱 Pantallas Afectadas

1. ✅ IngresoVehiculoScreen (Nueva)
2. ✅ GeneracionQRScreen (Nueva)
3. ✅ RetiroVehiculoScreen (Nueva)
4. ✅ App.tsx (Actualizar navegación)

## 🚀 Próximos Pasos

1. Crear estructura de tipos
2. Crear servicios (QR, vehículos)
3. Crear componentes reutilizables
4. Implementar pantallas
5. Integrar con AsyncStorage
6. Integrar con Google Sheets
7. Testing completo
8. Optimización y refinamiento

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026
