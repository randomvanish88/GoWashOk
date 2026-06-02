# 📱 GoWash - Aplicación Móvil Completa

## ✨ Características Implementadas

### 🏠 **Pantalla de Inicio (Dashboard)**
- Bienvenida personalizada con usuario
- Estadísticas en tiempo real:
  - Vehículos en patio
  - Vehículos entregados hoy
- Acciones rápidas:
  - Ingreso de vehículo
  - Retiro de vehículo (QR)
  - Lista de vehículos en patio

### 🚗 **Ingreso de Vehículo (Formulario Completo)**

#### 1. Datos del Vehículo
- **Patente** (obligatorio) - formato automático en mayúsculas
- **Marca/Modelo** - texto libre
- **Color** - selector con colores predefinidos

#### 2. Datos del Cliente
- **Nombre** - opcional (por defecto "Particular")
- **Teléfono** - opcional (para envío por WhatsApp)

#### 3. Servicio
Selector visual con 4 opciones:
- **Básico** - $4,000 (Lavado exterior)
- **Premium** - $6,000 (Exterior + Interior)
- **Completo** - $8,000 (Premium + Encerado)
- **Detailing** - $12,000 (Servicio completo profesional)

#### 4. Forma de Pago
- Efectivo
- Tarjeta
- Transferencia
- Cuenta

#### 5. Observaciones
- Campo de texto libre para notas especiales

### ✅ **Modal de Confirmación con QR**
Al registrar un vehículo:
- ✅ Generación automática de código QR único
- 📋 Resumen completo del ingreso:
  - Patente
  - Cliente
  - Servicio
  - Precio
  - Hora de ingreso
  - Empleado
- 📤 Botón para enviar por WhatsApp
- 💾 Guarda automáticamente en localStorage

### 📋 **Lista de Vehículos en Patio**
- Vista de todos los vehículos activos
- Información detallada de cada uno:
  - Patente destacada
  - Estado visual con colores
  - Marca, modelo y color
  - Cliente
  - Precio
  - Hora de ingreso
- **Control de Estados** (4 etapas):
  - 🔵 Ingresado
  - 💧 En Lavado
  - 💨 Secado
  - ✅ Listo
- Acciones rápidas:
  - 📱 Enviar por WhatsApp
  - 📷 Ver código QR

### 🎯 **Retiro de Vehículo**

#### Método 1: Escaneo de QR
- 📷 Activación de cámara
- Escaneo automático del código QR
- Detección y carga instantánea del vehículo

#### Método 2: Búsqueda Manual
- 🔍 Búsqueda por patente
- Formato automático en mayúsculas

#### Pantalla de Entrega
- Resumen completo del vehículo
- Total a cobrar destacado
- Método de pago
- Hora de ingreso
- Botón de confirmación de entrega

### 📊 **Reportes del Día**
- 📈 Resumen de ventas:
  - Total de vehículos entregados
  - Total recaudado
- 📄 Lista detallada de entregas:
  - Patente
  - Cliente
  - Hora entrada → Hora salida
  - Precio
  - Método de pago

### 🔐 **Sistema de Login**
- Autenticación de usuarios
- Usuarios predefinidos:
  - admin / 123
  - empleado / 123
- Gestión de sesión
- Indicador de usuario activo
- Botón de logout

### 🎨 **Diseño UI/UX**
- ✨ Diseño moderno y profesional
- 🌈 Gradientes y efectos visuales
- 📱 Totalmente responsive
- 🎯 Navegación intuitiva
- 🔄 Animaciones fluidas
- 🎨 Colores diferenciados por sección:
  - Azul: Acciones principales
  - Verde: Entregas/Confirmaciones
  - Púrpura: Reportes
  - Ámbar: Pagos

### 🧭 **Navegación Inferior Fija**
5 botones siempre visibles:
- 🏠 Inicio
- ➕ Ingreso
- 🚗 Patio
- 📷 Retiro
- 📊 Reportes

### 💾 **Almacenamiento Local**
- Persistencia automática en localStorage
- Dos categorías:
  - `gowash-mobile-patio` - Vehículos activos
  - `gowash-mobile-entregados` - Vehículos entregados
- Sincronización en tiempo real

### 📱 **Funciones de WhatsApp**
- Envío automático de ticket al cliente
- Mensaje formateado profesional con:
  - Logo y nombre del negocio
  - Datos del vehículo
  - Código de retiro
  - Información del servicio
- Detección automática de dispositivo móvil/web

## 🚀 Cómo Usar

### Ver en Navegador (Modo Móvil)
1. Abre: `http://localhost:5173/`
2. Presiona `F12` para abrir DevTools
3. Presiona `Ctrl + Shift + M` para modo responsive
4. Selecciona un dispositivo móvil

### Ver en Teléfono Real
1. Asegúrate de estar en la misma red WiFi
2. El servidor debe estar expuesto con `--host`
3. Accede desde el navegador móvil

## 📋 Credenciales de Prueba
- **Usuario:** admin
- **Contraseña:** 123

O:
- **Usuario:** empleado
- **Contraseña:** 123

## 🎯 Flujo de Trabajo Completo

### 1. Ingreso del Vehículo
1. Login en la app
2. Click en "Ingreso de Vehículo"
3. Completar formulario
4. Click en "GENERAR QR E INGRESAR"
5. Se muestra QR con opción de enviar por WhatsApp

### 2. Durante el Lavado
1. Ir a "Patio"
2. Ver todos los vehículos activos
3. Actualizar estados según progreso:
   - Ingresado → En Lavado → Secado → Listo

### 3. Retiro del Vehículo
1. Ir a "Retiro"
2. Escanear QR o buscar por patente
3. Verificar datos del vehículo
4. Click en "MARCAR COMO ENTREGADO"
5. Vehículo pasa a reportes

### 4. Ver Reportes
1. Ir a "Reportes"
2. Ver resumen del día:
   - Total entregados
   - Total recaudado
3. Lista detallada de todas las entregas

## 🎨 Características de Diseño

### Colores por Estado
- **Ingresado**: Gris
- **En Lavado**: Azul
- **Secado**: Ámbar
- **Listo**: Verde

### Efectos Visuales
- Glassmorphism (efecto vidrio)
- Gradientes dinámicos
- Sombras suaves
- Bordes luminosos
- Animaciones de entrada/salida
- Efectos hover y active

### Tipografía
- Títulos: Black (900)
- Subtítulos: Bold (700)
- Texto: Medium (500)
- Monospace para patentes

## 📊 Próximos Pasos (Sincronización)
- [ ] Integración con Google Sheets
- [ ] Sincronización automática de ventas
- [ ] Respaldo en la nube
- [ ] Sincronización entre dispositivos
- [ ] Reportes históricos

## 💡 Tecnologías Usadas
- **React** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **react-qr-code** - Generación de códigos QR
- **html5-qrcode** - Escaneo de códigos QR
- **Sonner** - Notificaciones toast
- **LocalStorage** - Persistencia de datos

---

✨ **¡Aplicación móvil completa y lista para usar!** ✨

Diseñado y desarrollado para GoWash - Sistema de Lavadero
