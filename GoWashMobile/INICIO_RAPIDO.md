# 🚀 Inicio Rápido - VentasScreen

## En 5 Minutos

### 1. Copiar el archivo
El archivo `VentasScreen.tsx` ya está en:
```
src/screens/VentasScreen.tsx
```

### 2. Instalar dependencias (si no están)
```bash
npm install @react-native-async-storage/async-storage @expo/vector-icons
```

### 3. Importar en App.tsx
```typescript
import VentasScreen from './src/screens/VentasScreen';
```

### 4. Agregar a navegación
```typescript
<Stack.Screen name="Ventas" component={VentasScreen} />
```

### 5. ¡Listo!
Ya puedes usar la pantalla de ventas.

---

## 📋 Qué Incluye

✅ **Datos de Venta**: Patente, Cliente, Empleado, Fecha/Hora  
✅ **Lavadero**: Servicio, Precio, Extras, Descuento, Recargo  
✅ **Bar**: Modal con productos (Cafés, Bebidas, Comidas, Cervezas)  
✅ **Cosmética**: Modal con productos (Ceras, Limpiadores, Accesorios)  
✅ **Método de Pago**: Efectivo, Transferencia, Tarjeta, Pago Mixto  
✅ **Total**: Cálculo automático  
✅ **Vehículos en Lavadero**: Tabla con acciones  
✅ **Últimas Ventas**: Historial de 5 últimas ventas  

---

## 🎨 Tema

- Fondo oscuro: `#0f172a`
- Acentos: `#8b5cf6` (púrpura)
- Éxito: `#10b981` (verde)
- Error: `#ef4444` (rojo)

---

## 💾 Persistencia

Todos los datos se guardan automáticamente en AsyncStorage:
- Ventas registradas
- Vehículos en lavadero
- Empleados

---

## 📚 Documentación

- **README_VENTAS_SCREEN.md** - Resumen completo
- **VENTAS_SCREEN_DOCS.md** - Documentación de usuario
- **VENTAS_SCREEN_EJEMPLO.md** - Ejemplos de uso
- **VENTAS_SCREEN_TECNICO.md** - Documentación técnica
- **INTEGRACION_VENTAS_SCREEN.md** - Guía de integración

---

## 🔧 Funciones Principales

```typescript
// Registrar una venta
registrarVenta()

// Agregar producto
agregarProducto(producto, 'bar' | 'cosmética')

// Calcular total
calcularTotal()

// Agregar vehículo en lavadero
agregarVehículoEnLavadero()

// Marcar como retirado
marcarComoRetirado(id)
```

---

## ✨ Características

- ⚡ Rápido y optimizado
- 🎨 Tema oscuro profesional
- 📱 Responsive
- 💾 Persistencia automática
- 🔒 TypeScript completo
- 🎯 Intuitivo
- 🔄 Cálculos automáticos

---

## 🐛 Problemas Comunes

**No aparecen empleados**
→ Agrega empleados en ConfigScreen primero

**Total no se actualiza**
→ Selecciona un servicio válido

**AsyncStorage no funciona**
→ Instala `@react-native-async-storage/async-storage`

**Iconos no aparecen**
→ Instala `@expo/vector-icons`

---

## 📞 Ayuda

Consulta la documentación incluida:
- Documentación de usuario: `VENTAS_SCREEN_DOCS.md`
- Documentación técnica: `VENTAS_SCREEN_TECNICO.md`
- Guía de integración: `INTEGRACION_VENTAS_SCREEN.md`
- Ejemplos: `VENTAS_SCREEN_EJEMPLO.md`

---

## ✅ Checklist

- [ ] Archivo copiado a `src/screens/`
- [ ] Dependencias instaladas
- [ ] Importado en App.tsx
- [ ] Agregado a navegación
- [ ] Probado en dispositivo/emulador
- [ ] Empleados agregados en Config
- [ ] Productos personalizados (opcional)

---

**¡Listo para usar!** 🎉
