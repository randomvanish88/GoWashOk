# VentasScreen - Documentación Técnica

## Arquitectura

### Estructura de Componentes

```
VentasScreen
├── Header
├── Content (ScrollView)
│   ├── Datos de Venta (Section)
│   ├── Lavadero (Section)
│   ├── Bar (Section)
│   ├── Cosmética (Section)
│   ├── Método de Pago (Section)
│   ├── Total (Section)
│   ├── Botón Registrar
│   ├── Vehículos en Lavadero (Section)
│   └── Últimas Ventas (Section)
└── Modales
    ├── Modal Productos Bar
    ├── Modal Productos Cosmética
    ├── Modal Servicios
    ├── Modal Método de Pago
    └── Modal Agregar Vehículo
```

## Estados (Hooks)

### Estados Principales
```typescript
// Datos de venta
const [patente, setPatente] = useState('');
const [cliente, setCliente] = useState('');
const [numeroCliente, setNumeroCliente] = useState('');
const [empleado, setEmpleado] = useState('');
const [empleados, setEmpleados] = useState<string[]>([]);

// Lavadero
const [horaEntrada, setHoraEntrada] = useState('');
const [horaSalida, setHoraSalida] = useState('');
const [servicio, setServicio] = useState('Básico');
const [extras, setExtras] = useState<string[]>([]);
const [descuento, setDescuento] = useState(false);
const [recargo, setRecargo] = useState(false);

// Productos
const [productosBar, setProductosBar] = useState<ProductoCarrito[]>([]);
const [productosCosmética, setProductosCosmética] = useState<ProductoCarrito[]>([]);

// Pago
const [metodoPago, setMetodoPago] = useState('Efectivo');

// Datos globales
const [vehiculosEnLavadero, setVehiculosEnLavadero] = useState<VehículoEnLavadero[]>([]);
const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);

// Modales
const [modalProductosBar, setModalProductosBar] = useState(false);
const [modalProductosCosmética, setModalProductosCosmética] = useState(false);
const [modalVehículos, setModalVehículos] = useState(false);
const [modalServicios, setModalServicios] = useState(false);
const [modalMetodoPago, setModalMetodoPago] = useState(false);
```

## Tipos TypeScript

### Interfaz Venta
```typescript
interface Venta {
  id: string;                          // Timestamp como string
  patente: string;                     // Requerido
  cliente?: string;                    // Opcional
  numeroCliente?: string;              // Opcional
  empleado: string;                    // Requerido
  fecha: string;                       // Formato: DD/MM/YYYY
  horaEntrada: string;                 // Formato: HH:MM
  horaSalida: string;                  // Formato: HH:MM
  servicio: string;                    // Nombre del servicio
  precioServicio: number;              // Precio del servicio
  extras: string[];                    // Array de extras
  descuento: boolean;                  // -10%
  recargo: boolean;                    // +10%
  productosBar: ProductoCarrito[];     // Productos agregados
  productosCosmética: ProductoCarrito[]; // Productos agregados
  metodoPago: string;                  // Método de pago
  total: number;                       // Total calculado
  estado: 'en_proceso' | 'cobrada' | 'retirada';
}
```

### Interfaz Producto
```typescript
interface Producto {
  id: string;           // ID único
  nombre: string;       // Nombre del producto
  precio: number;       // Precio unitario
  categoria: string;    // Categoría
}
```

### Interfaz ProductoCarrito
```typescript
interface ProductoCarrito {
  id: string;           // ID del producto
  nombre: string;       // Nombre del producto
  precio: number;       // Precio unitario
  cantidad: number;     // Cantidad agregada
}
```

### Interfaz VehículoEnLavadero
```typescript
interface VehículoEnLavadero {
  id: string;           // ID único
  patente: string;      // Patente del vehículo
  cliente?: string;     // Nombre del cliente
  servicio: string;     // Tipo de servicio
  horaEntrada: string;  // Hora de entrada
  estado: 'en_proceso' | 'listo';
}
```

## Constantes

### Servicios y Precios
```typescript
const SERVICIOS = {
  'Básico': 500,
  'Premium': 800,
  'Premium+Encerado': 1200,
  'Completo': 1500,
  'Detailing': 2000,
};
```

### Productos Bar
```typescript
const PRODUCTOS_BAR: Producto[] = [
  // Cafés (IDs 1-3)
  // Bebidas (IDs 4-6)
  // Comidas (IDs 7-8)
  // Cervezas (IDs 9-10)
];
```

### Productos Cosmética
```typescript
const PRODUCTOS_COSMÉTICA: Producto[] = [
  // Ceras (ID 1)
  // Limpiadores (IDs 2, 6)
  // Accesorios (IDs 3, 4)
  // Protectores (ID 5)
];
```

## Funciones Principales

### `cargarDatos()`
```typescript
const cargarDatos = async () => {
  // Carga empleados desde AsyncStorage
  // Carga últimas 5 ventas
  // Carga vehículos en lavadero
}
```

**Llamada**: En useEffect al montar el componente

### `calcularTotal()`
```typescript
const calcularTotal = () => {
  // 1. Suma precio del servicio
  // 2. Suma productos del bar
  // 3. Suma productos de cosmética
  // 4. Aplica descuento si está marcado (-10%)
  // 5. Aplica recargo si está marcado (+10%)
  // 6. Retorna el total
}
```

**Retorna**: number (total en pesos)

### `agregarProducto(producto, tipo)`
```typescript
const agregarProducto = (producto: Producto, tipo: 'bar' | 'cosmética') => {
  // 1. Obtiene la lista actual
  // 2. Busca si el producto ya existe
  // 3. Si existe: incrementa cantidad
  // 4. Si no existe: agrega con cantidad 1
  // 5. Actualiza el estado
}
```

**Parámetros**:
- `producto`: Objeto Producto
- `tipo`: 'bar' o 'cosmética'

### `eliminarProducto(id, tipo)`
```typescript
const eliminarProducto = (id: string, tipo: 'bar' | 'cosmética') => {
  // 1. Obtiene la lista actual
  // 2. Filtra el producto por ID
  // 3. Actualiza el estado
}
```

**Parámetros**:
- `id`: ID del producto
- `tipo`: 'bar' o 'cosmética'

### `registrarVenta()`
```typescript
const registrarVenta = async () => {
  // 1. Valida patente (requerida)
  // 2. Valida empleado (requerido)
  // 3. Crea objeto Venta
  // 4. Carga ventas existentes
  // 5. Agrega nueva venta
  // 6. Guarda en AsyncStorage
  // 7. Elimina vehículo de lavadero
  // 8. Muestra confirmación
  // 9. Limpia formulario
  // 10. Recarga datos
}
```

**Validaciones**:
- ✅ Patente no vacía
- ✅ Empleado seleccionado

**Efectos secundarios**:
- Guarda en AsyncStorage
- Elimina de vehículos en lavadero
- Limpia formulario
- Recarga datos

### `limpiarFormulario()`
```typescript
const limpiarFormulario = () => {
  // Resetea todos los estados a valores iniciales
}
```

### `agregarVehículoEnLavadero()`
```typescript
const agregarVehículoEnLavadero = async () => {
  // 1. Valida patente
  // 2. Crea objeto VehículoEnLavadero
  // 3. Agrega a lista
  // 4. Guarda en AsyncStorage
  // 5. Actualiza estado
  // 6. Cierra modal
}
```

### `marcarComoRetirado(id)`
```typescript
const marcarComoRetirado = async (id: string) => {
  // 1. Filtra el vehículo por ID
  // 2. Guarda lista actualizada
  // 3. Actualiza estado
}
```

## Flujo de Datos

### Flujo de Venta
```
1. Usuario ingresa datos
   ↓
2. Usuario selecciona servicio
   ↓
3. Usuario agrega productos
   ↓
4. Sistema calcula total automáticamente
   ↓
5. Usuario selecciona método de pago
   ↓
6. Usuario toca "REGISTRAR VENTA"
   ↓
7. Sistema valida datos
   ↓
8. Sistema crea objeto Venta
   ↓
9. Sistema guarda en AsyncStorage
   ↓
10. Sistema elimina de vehículos en lavadero
   ↓
11. Sistema muestra confirmación
   ↓
12. Sistema limpia formulario
   ↓
13. Sistema recarga datos
```

### Flujo de Productos
```
1. Usuario toca "Agregar Productos"
   ↓
2. Modal se abre
   ↓
3. Usuario selecciona producto
   ↓
4. Sistema agrega a carrito
   ↓
5. Modal permanece abierto
   ↓
6. Usuario puede agregar más
   ↓
7. Usuario cierra modal
   ↓
8. Productos aparecen en lista
```

## Cálculo de Total

### Fórmula
```
total = precioServicio + sumProductosBar + sumProductosCosmética

if (descuento) {
  total = total * 0.9  // -10%
}

if (recargo) {
  total = total * 1.1  // +10%
}
```

### Ejemplo
```
Servicio Premium: $800
Café: $150
Cera: $500
Subtotal: $1450

Con descuento (-10%):
$1450 * 0.9 = $1305

Con recargo (+10%):
$1450 * 1.1 = $1595
```

## Persistencia en AsyncStorage

### Claves Utilizadas
```typescript
'ventas'              // Array<Venta>
'vehiculosEnLavadero' // Array<VehículoEnLavadero>
'empleados'           // Array<string>
```

### Estructura de Datos
```
AsyncStorage
├── ventas: [
│   {
│     id: "1234567890",
│     patente: "ABC123",
│     ...
│   },
│   ...
│ ]
├── vehiculosEnLavadero: [
│   {
│     id: "1234567890",
│     patente: "XYZ789",
│     ...
│   },
│   ...
│ ]
└── empleados: ["Lavador 1", "Lavador 2", ...]
```

## Estilos

### Paleta de Colores
```typescript
const colors = {
  background: '#0f172a',      // Fondo principal
  card: '#1e293b',            // Fondo de tarjetas
  border: '#334155',          // Bordes
  textPrimary: '#e5e7eb',     // Texto principal
  textSecondary: '#9ca3af',   // Texto secundario
  primary: '#8b5cf6',         // Púrpura (acentos)
  success: '#10b981',         // Verde (éxito)
  error: '#ef4444',           // Rojo (error)
  info: '#3b82f6',            // Azul (info)
  warning: '#f59e0b',         // Naranja (advertencia)
};
```

### Componentes Estilizados
- **Input**: Fondo oscuro, borde gris, texto blanco
- **Selector**: Fondo oscuro, borde gris, icono púrpura
- **Botón**: Fondo azul, texto blanco, redondeado
- **Card**: Fondo gris oscuro, borde gris, redondeado
- **Modal**: Fondo oscuro, contenido gris, redondeado

## Performance

### Optimizaciones
1. **FlatList**: Usado para listas largas (productos, ventas)
2. **ScrollView**: Usado para contenido scrolleable
3. **StyleSheet**: Compilado una sola vez
4. **Memoización**: Funciones no se recrean innecesariamente
5. **AsyncStorage**: Operaciones asincrónicas

### Consideraciones
- El componente se recarga al cambiar estados
- Los cálculos se hacen en tiempo real
- Las listas se actualizan automáticamente
- No hay queries a base de datos (solo AsyncStorage)

## Seguridad

### Validaciones
- ✅ Patente requerida
- ✅ Empleado requerido
- ✅ Tipos TypeScript
- ✅ Manejo de errores

### Datos Sensibles
- No se almacenan datos sensibles
- AsyncStorage es local (no sincronizado)
- No hay encriptación (considerar agregar)

## Testing

### Casos de Prueba
```typescript
// Validación de patente
test('debe mostrar error si patente está vacía')

// Validación de empleado
test('debe mostrar error si empleado no está seleccionado')

// Cálculo de total
test('debe calcular total correctamente')
test('debe aplicar descuento correctamente')
test('debe aplicar recargo correctamente')

// Agregar productos
test('debe agregar producto al carrito')
test('debe incrementar cantidad si producto existe')
test('debe eliminar producto del carrito')

// Registrar venta
test('debe registrar venta correctamente')
test('debe guardar en AsyncStorage')
test('debe limpiar formulario después de registrar')

// Vehículos en lavadero
test('debe agregar vehículo a lavadero')
test('debe eliminar vehículo de lavadero')
```

## Debugging

### Logs Útiles
```typescript
console.log('Patente:', patente);
console.log('Servicio:', servicio);
console.log('Productos Bar:', productosBar);
console.log('Productos Cosmética:', productosCosmética);
console.log('Total:', calcularTotal());
console.log('Vehículos:', vehiculosEnLavadero);
console.log('Últimas Ventas:', ultimasVentas);
```

### React DevTools
- Inspeccionar estados
- Ver cambios en tiempo real
- Debuggear props

### AsyncStorage DevTools
- Ver contenido de AsyncStorage
- Editar valores
- Limpiar datos

## Mejoras Futuras

### Funcionalidades
- [ ] Búsqueda de clientes
- [ ] Historial de clientes
- [ ] Descuentos por cliente
- [ ] Promociones
- [ ] Cupones
- [ ] Facturación
- [ ] Impresión de recibos
- [ ] Fotos de vehículos
- [ ] Notas/comentarios
- [ ] Historial de servicios por vehículo

### Técnicas
- [ ] Sincronización con backend
- [ ] Sincronización con Google Sheets
- [ ] Notificaciones push
- [ ] Caché mejorado
- [ ] Encriptación de datos
- [ ] Autenticación
- [ ] Autorización
- [ ] Auditoría
- [ ] Analytics
- [ ] Crash reporting

### UI/UX
- [ ] Animaciones
- [ ] Transiciones
- [ ] Gestos
- [ ] Temas personalizables
- [ ] Modo oscuro/claro
- [ ] Accesibilidad mejorada
- [ ] Internacionalización
- [ ] Responsive design
