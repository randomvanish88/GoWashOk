# VentasScreen - Documentación

## Descripción General
Pantalla completa de gestión de ventas para GoWash Mobile con todas las funcionalidades de registro de servicios de lavado, productos adicionales y control de vehículos en proceso.

## Características Principales

### 1. **DATOS DE VENTA** 📋
- **Patente** (requerido): Identificación del vehículo
- **Cliente** (opcional): Nombre del cliente
- **Número de Cliente** (opcional): ID del cliente
- **Empleado** (selector): Selecciona el empleado responsable
- **Fecha y Hora**: Se muestran automáticamente (actuales)

### 2. **LAVADERO** 🚗
- **Hora Entrada**: Editable, se establece automáticamente
- **Hora Salida**: Editable, se establece automáticamente
- **Servicio** (selector):
  - Básico: $500
  - Premium: $800
  - Premium+Encerado: $1200
  - Completo: $1500
  - Detailing: $2000
- **Precio**: Se calcula automáticamente según el servicio
- **Extras**: Checkbox para "Embarrado"
- **Descuento**: Checkbox para aplicar -10%
- **Recargo**: Checkbox para aplicar +10%

### 3. **BAR** ☕
Productos disponibles:
- **Cafés**: Espresso, Café con Leche, Cappuccino
- **Bebidas**: Agua Mineral, Gaseosa, Jugo Natural
- **Comidas**: Sándwich, Medialunas
- **Cervezas**: Artesanal, Premium

Funcionalidad:
- Botón "Agregar Productos Bar" abre modal
- Modal muestra lista de productos con precios
- Productos agregados se muestran con cantidad
- Botón de eliminar para cada producto

### 4. **COSMÉTICA/ACCESORIOS** 💄
Productos disponibles:
- **Ceras**: Cera Protectora
- **Limpiadores**: Limpiador Interior, Pulidor de Vidrios
- **Accesorios**: Desodorizante, Ambientador
- **Protectores**: Protector de Tapicería

Funcionalidad:
- Botón "Agregar Productos Cosmética" abre modal
- Modal muestra lista de productos con precios
- Productos agregados se muestran con cantidad
- Botón de eliminar para cada producto

### 5. **MÉTODO DE PAGO** 💳
Opciones disponibles:
- Efectivo
- Transferencia
- Tarjeta
- Pago Mixto

### 6. **TOTAL A COBRAR** 💰
- Cálculo automático de todos los conceptos
- Incluye: Servicio + Productos Bar + Productos Cosmética
- Aplica descuentos/recargos si están activados
- Mostrado en grande y visible

### 7. **BOTÓN REGISTRAR VENTA** ✅
- Valida que la patente esté ingresada
- Valida que se haya seleccionado un empleado
- Registra la venta en AsyncStorage
- Elimina el vehículo de la lista de lavadero
- Limpia el formulario automáticamente

### 8. **VEHÍCULOS EN LAVADERO** 🚙
Tabla con columnas:
- **Patente**: Identificación del vehículo
- **Cliente**: Nombre del cliente (si existe)
- **Servicio**: Tipo de servicio
- **Entrada**: Hora de entrada
- **Acciones**:
  - ✅ Botón "Cobrar": Marca como cobrada
  - 🗑️ Botón "Retirado": Elimina de la lista

Funcionalidad:
- Botón "+" para agregar vehículo rápidamente
- Modal para ingresar patente y cliente
- Tabla actualiza en tiempo real

### 9. **ÚLTIMAS VENTAS** 📊
- Muestra las últimas 5 ventas registradas
- Columnas: Patente/Cliente, Hora, Método Pago, Total
- Ordenadas de más reciente a más antigua
- Actualiza automáticamente al registrar venta

## Persistencia de Datos

Todos los datos se guardan en AsyncStorage:
- `ventas`: Array de todas las ventas registradas
- `vehiculosEnLavadero`: Array de vehículos en proceso
- `empleados`: Array de empleados disponibles

## Tema y Estilos

### Colores
- **Fondo principal**: #0f172a (azul oscuro)
- **Fondo secundario**: #1e293b (azul más claro)
- **Bordes**: #334155 (gris oscuro)
- **Texto principal**: #e5e7eb (gris claro)
- **Texto secundario**: #9ca3af (gris medio)
- **Acentos**: #8b5cf6 (púrpura)
- **Éxito**: #10b981 (verde)
- **Error**: #ef4444 (rojo)
- **Info**: #3b82f6 (azul)

### Iconos
Utiliza Ionicons de @expo/vector-icons:
- `cart`: Carrito de compras
- `add-circle`: Agregar
- `trash`: Eliminar
- `checkmark-circle`: Confirmar
- `chevron-down`: Selector
- `checkbox`: Checkbox marcado
- `checkbox-outline`: Checkbox sin marcar

## Cálculo del Total

```
Total = Precio Servicio + (Productos Bar) + (Productos Cosmética)

Si Descuento: Total *= 0.9 (-10%)
Si Recargo: Total *= 1.1 (+10%)
```

## Integración

Para integrar en tu aplicación:

1. Asegúrate de tener instaladas las dependencias:
   ```bash
   npm install @react-native-async-storage/async-storage @expo/vector-icons
   ```

2. Importa la pantalla en tu navegador:
   ```typescript
   import VentasScreen from './src/screens/VentasScreen';
   ```

3. Agrega a tu stack de navegación:
   ```typescript
   <Stack.Screen name="Ventas" component={VentasScreen} />
   ```

## Funciones Principales

### `registrarVenta()`
Registra una venta completa con todos los datos y la guarda en AsyncStorage.

### `agregarProducto(producto, tipo)`
Agrega un producto al carrito (bar o cosmética). Si ya existe, incrementa la cantidad.

### `eliminarProducto(id, tipo)`
Elimina un producto del carrito.

### `calcularTotal()`
Calcula el total considerando todos los conceptos y aplicando descuentos/recargos.

### `agregarVehículoEnLavadero()`
Agrega un vehículo a la lista de lavadero en proceso.

### `marcarComoRetirado(id)`
Elimina un vehículo de la lista de lavadero.

### `cargarDatos()`
Carga datos iniciales desde AsyncStorage (empleados, ventas, vehículos).

## Validaciones

- ✅ Patente requerida para registrar venta
- ✅ Empleado requerido para registrar venta
- ✅ Patente requerida para agregar vehículo
- ✅ Cálculo automático de totales
- ✅ Prevención de duplicados en productos

## Mejoras Futuras

- [ ] Integración con cámara para escanear patentes
- [ ] Historial de ventas con filtros
- [ ] Reportes de ventas por período
- [ ] Integración con Google Sheets
- [ ] Notificaciones de vehículos listos
- [ ] Fotos de vehículos antes/después
- [ ] Descuentos por cliente frecuente
- [ ] Impresión de recibos

## Notas Técnicas

- El componente usa hooks (useState, useEffect)
- Manejo de modales con componente Modal de React Native
- FlatList para listas optimizadas
- ScrollView para contenido scrolleable
- Estilos con StyleSheet para mejor rendimiento
- Tipado completo con TypeScript
