# 🎨 Diseño - GoWash Mobile Maqueta Completa

## 📐 Especificaciones de Diseño

### Colores
```
Primary: #1E40AF (Azul GoWash)
Secondary: #10B981 (Verde éxito)
Danger: #EF4444 (Rojo error)
Warning: #F59E0B (Naranja advertencia)
Background: #F3F4F6 (Gris claro)
Surface: #FFFFFF (Blanco)
Text: #1F2937 (Gris oscuro)
TextSecondary: #6B7280 (Gris medio)
```

### Tipografía
```
Heading 1: 28px, Bold, #1F2937
Heading 2: 24px, SemiBold, #1F2937
Heading 3: 20px, SemiBold, #1F2937
Body: 16px, Regular, #1F2937
Caption: 14px, Regular, #6B7280
Small: 12px, Regular, #6B7280
```

### Espaciado
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
```

### Bordes
```
Radius: 8px (componentes)
Radius: 12px (tarjetas)
Radius: 50% (botones circulares)
```

## 📱 Pantalla 1: Ingreso de Vehículo

### Layout
```
┌─────────────────────────────────┐
│ ☰  GoWash          🔔           │ Header
├─────────────────────────────────┤
│ 📋 Ingreso de Vehículo          │ Título
├─────────────────────────────────┤
│                                 │
│ 1. Datos del Vehículo           │ Sección 1
│ ┌─────────────────────────────┐ │
│ │ Placa: [_____________]  🔍  │ │
│ │ Marca/Modelo: [Toyota Corolla] │
│ │ Color: [Blanco]             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 2. Cliente                      │ Sección 2
│ ┌─────────────────────────────┐ │
│ │ Nombre: [Juan Pérez]        │ │
│ │ Teléfono: [+1 2258-6789] 📱 │ │
│ └─────────────────────────────┘ │
│                                 │
│ 3. Servicio                     │ Sección 3
│ ┌─────────────────────────────┐ │
│ │ [Básico] [Premium]          │ │
│ │ [Completo] [Detailing]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ 4. Observaciones                │ Sección 4
│ ┌─────────────────────────────┐ │
│ │ No reparar interior...       │ │
│ └─────────────────────────────┘ │
│                                 │
│ 5. Forma de Pago                │ Sección 5
│ ┌─────────────────────────────┐ │
│ │ [Efectivo] [Tarjeta]        │ │
│ │ [Transferencia] [Cuenta]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔵 GENERAR QR E INGRESAR    │ │ Botón principal
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ 🏠  🚗  ➕  👤  📊              │ Bottom tabs
└─────────────────────────────────┘
```

### Componentes
- **Header**: Logo GoWash, campana de notificaciones
- **Título**: "Ingreso de Vehículo" con número de paso
- **Secciones**: Agrupadas por categoría
- **Inputs**: Campos de texto con validación
- **Dropdowns**: Marca, modelo, color
- **Botones de selección**: Servicio, forma de pago
- **Botón principal**: Azul, ancho completo, con icono

### Validaciones
- Placa: Obligatoria, formato válido
- Marca/Modelo: Obligatorio
- Color: Obligatorio
- Cliente: Nombre obligatorio, teléfono opcional
- Servicio: Obligatorio
- Forma de Pago: Obligatorio

## 📱 Pantalla 2: Generación de QR

### Layout
```
┌─────────────────────────────────┐
│ ☰  GoWash          🔔           │ Header
├─────────────────────────────────┤
│ ✅ ¡Vehículo Ingresado!         │ Confirmación
│    Código generado correctamente │
├─────────────────────────────────┤
│                                 │
│ Vehículo #1548                  │ Título
│ ┌─────────────────────────────┐ │
│ │ 🚗 Placa: AB123CD           │ │
│ │ 👤 Cliente: Juan Pérez      │ │
│ │ 🔧 Servicio: Completo       │ │
│ │ 📅 Ingreso: 24/05/2024 10:30│ │
│ │ 👨‍💼 Empleado: Martín López   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │      [QR CODE IMAGE]        │ │ QR
│ │                             │ │
│ │   QW1548AB123CD             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📱 ESCANEAR QR              │ │ Botón secundario
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎫 CAMBIAR TICKET           │ │ Botón terciario
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ 🏠  🚗  ➕  👤  📊              │ Bottom tabs
└─────────────────────────────────┘
```

### Componentes
- **Confirmación**: Icono verde, mensaje de éxito
- **Datos del vehículo**: Tarjeta con información
- **QR**: Código QR grande y legible
- **Botones**: Escanear, cambiar ticket
- **Opción WhatsApp**: Compartir por WhatsApp

### Datos Mostrados
- Placa del vehículo
- Cliente
- Servicio
- Fecha y hora de ingreso
- Empleado responsable
- Código QR único

## 📱 Pantalla 3: Retiro de Vehículo

### Layout
```
┌─────────────────────────────────┐
│ ☰  GoWash          🔔           │ Header
├─────────────────────────────────┤
│ 🔍 Retiro de Vehículo           │ Título
│    Escanea el código QR         │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [CAMERA PREVIEW]         │ │ Escaneo
│ │                             │ │
│ │    Escanea el código QR     │ │
│ │    para el retiro            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Vehículo #1548                  │ Datos (después de escanear)
│ ┌─────────────────────────────┐ │
│ │ 🚗 Placa: AB123CD           │ │
│ │ 👤 Cliente: Juan Pérez      │ │
│ │ 🔧 Servicio: Completo       │ │
│ │ 📅 Ingreso: 24/05/2024 10:30│ │
│ │ 👨‍💼 Empleado: Martín López   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Estado del Lavado               │ Estado
│ ┌─────────────────────────────┐ │
│ │ ✅ Ingresado                │ │
│ │ ⏳ En lavado                │ │
│ │ ⏳ Secado                   │ │
│ │ ⏳ Listo                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ❌ CANCELAR                 │ │ Botón peligro
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ MARCAR COMO ENTREGADO    │ │ Botón éxito
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ 🏠  🚗  ➕  👤  📊              │ Bottom tabs
└─────────────────────────────────┘
```

### Componentes
- **Escaneo**: Vista previa de cámara
- **Datos del vehículo**: Tarjeta con información
- **Estado**: Indicador de progreso
- **Botones**: Cancelar, marcar como entregado

### Estados
- ✅ Ingresado (completado)
- ⏳ En lavado (en progreso)
- ⏳ Secado (en progreso)
- ⏳ Listo (en progreso)

## 🎨 Componentes Reutilizables

### VehicleForm
```typescript
<VehicleForm
  onSubmit={(data) => handleSubmit(data)}
  initialData={vehicle}
  isLoading={false}
/>
```

### QRGenerator
```typescript
<QRGenerator
  vehicleId="1548"
  qrCode="QW1548AB123CD"
  vehicleData={vehicle}
  onScan={() => handleScan()}
  onChangeTicket={() => handleChangeTicket()}
/>
```

### QRScanner
```typescript
<QRScanner
  onScanned={(data) => handleScanned(data)}
  onError={(error) => handleError(error)}
/>
```

### VehicleCard
```typescript
<VehicleCard
  vehicle={vehicle}
  showActions={true}
/>
```

### StateIndicator
```typescript
<StateIndicator
  states={['Ingresado', 'En lavado', 'Secado', 'Listo']}
  currentState={1}
/>
```

## 🎯 Estilos Globales

### Botones
```
Primary: Azul, ancho completo, 48px altura
Secondary: Gris, ancho completo, 48px altura
Danger: Rojo, ancho completo, 48px altura
Success: Verde, ancho completo, 48px altura
```

### Inputs
```
Altura: 48px
Padding: 12px
Border: 1px gris claro
Border-radius: 8px
Focus: Borde azul, sombra azul
```

### Tarjetas
```
Padding: 16px
Border-radius: 12px
Sombra: 0 1px 3px rgba(0,0,0,0.1)
Background: Blanco
```

### Espaciado
```
Horizontal: 16px
Vertical: 16px
Entre secciones: 24px
```

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026
