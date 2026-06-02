# VentasScreen - Ejemplo de Uso

## Flujo de Uso Típico

### Escenario 1: Registrar una venta completa

1. **Ingresa datos del vehículo**
   - Patente: ABC123
   - Cliente: Juan Pérez
   - Número de Cliente: 001

2. **Selecciona empleado**
   - Toca el selector "Seleccionar Empleado"
   - Elige "Lavador 1"

3. **Configura el servicio de lavado**
   - Las horas se establecen automáticamente
   - Selecciona servicio: "Premium+Encerado" ($1200)
   - Marca "Embarrado" si aplica
   - Marca "Descuento" si corresponde (-10%)

4. **Agrega productos del bar**
   - Toca "Agregar Productos Bar"
   - Selecciona "Café Espresso" ($150)
   - Selecciona "Cerveza Artesanal" ($200)
   - Cierra el modal

5. **Agrega productos de cosmética**
   - Toca "Agregar Productos Cosmética"
   - Selecciona "Cera Protectora" ($500)
   - Cierra el modal

6. **Selecciona método de pago**
   - Toca el selector de método de pago
   - Elige "Transferencia"

7. **Revisa el total**
   - Total mostrado: $2050 (1200 + 150 + 200 + 500)

8. **Registra la venta**
   - Toca "REGISTRAR VENTA"
   - Se muestra confirmación: "Venta registrada: $2050.00"
   - El formulario se limpia automáticamente

### Escenario 2: Gestionar vehículos en lavadero

1. **Agregar vehículo en proceso**
   - Toca el botón "+" en "VEHÍCULOS EN LAVADERO"
   - Ingresa patente: XYZ789
   - Ingresa cliente: María García
   - Toca "Agregar Vehículo"
   - El vehículo aparece en la tabla

2. **Marcar como cobrado**
   - Cuando el vehículo está listo
   - Toca el botón ✅ (checkmark)
   - El vehículo se elimina de la lista

3. **Marcar como retirado**
   - Si el cliente retira sin cobrar
   - Toca el botón 🗑️ (trash)
   - El vehículo se elimina de la lista

### Escenario 3: Consultar últimas ventas

1. **Ver historial**
   - Desplázate hasta "ÚLTIMAS VENTAS"
   - Se muestran las últimas 5 ventas
   - Cada venta muestra:
     - Patente/Cliente
     - Fecha y hora
     - Método de pago
     - Total

## Ejemplos de Cálculos

### Ejemplo 1: Venta simple
```
Servicio Básico: $500
Método: Efectivo
Total: $500
```

### Ejemplo 2: Venta con productos
```
Servicio Premium: $800
Café Espresso: $150
Cera Protectora: $500
Total: $1450
```

### Ejemplo 3: Venta con descuento
```
Servicio Completo: $1500
Agua Mineral: $100
Descuento (-10%): -$160
Total: $1440
```

### Ejemplo 4: Venta con recargo
```
Servicio Detailing: $2000
Cerveza Premium: $250
Recargo (+10%): +$225
Total: $2475
```

### Ejemplo 5: Venta mixta
```
Servicio Premium+Encerado: $1200
Café con Leche: $180
Sándwich: $250
Protector de Tapicería: $400
Descuento (-10%): -$203
Total: $1827
```

## Datos Guardados en AsyncStorage

### Estructura de Venta
```json
{
  "id": "1234567890",
  "patente": "ABC123",
  "cliente": "Juan Pérez",
  "numeroCliente": "001",
  "empleado": "Lavador 1",
  "fecha": "15/01/2024",
  "horaEntrada": "10:30",
  "horaSalida": "11:15",
  "servicio": "Premium+Encerado",
  "precioServicio": 1200,
  "extras": ["Embarrado"],
  "descuento": true,
  "recargo": false,
  "productosBar": [
    {
      "id": "1",
      "nombre": "Café Espresso",
      "precio": 150,
      "cantidad": 1
    }
  ],
  "productosCosmética": [
    {
      "id": "1",
      "nombre": "Cera Protectora",
      "precio": 500,
      "cantidad": 1
    }
  ],
  "metodoPago": "Transferencia",
  "total": 2050,
  "estado": "cobrada"
}
```

### Estructura de Vehículo en Lavadero
```json
{
  "id": "1234567890",
  "patente": "XYZ789",
  "cliente": "María García",
  "servicio": "Básico",
  "horaEntrada": "14:00",
  "estado": "en_proceso"
}
```

## Validaciones y Mensajes

### Validación: Patente requerida
```
Alert: "Error"
Mensaje: "Ingresa la patente del vehículo"
```

### Validación: Empleado requerido
```
Alert: "Error"
Mensaje: "Selecciona un empleado"
```

### Éxito: Venta registrada
```
Alert: "Éxito"
Mensaje: "Venta registrada: $2050.00"
```

### Éxito: Vehículo agregado
```
Alert: "Éxito"
Mensaje: "Vehículo agregado al lavadero"
```

## Atajos y Tips

1. **Editar horas rápidamente**
   - Toca el campo de hora y modifica manualmente
   - Formato: HH:MM

2. **Cambiar servicio rápidamente**
   - Toca el selector de servicio
   - El precio se actualiza automáticamente

3. **Agregar múltiples productos**
   - Abre el modal de productos
   - Selecciona varios productos
   - El modal permanece abierto para agregar más

4. **Eliminar producto**
   - Toca el icono de basura junto al producto
   - Se elimina inmediatamente

5. **Ver total actualizado**
   - El total se recalcula automáticamente
   - Se actualiza al cambiar servicio, productos o descuentos

## Casos de Uso Comunes

### Caso 1: Cliente frecuente con descuento
1. Ingresa patente
2. Selecciona cliente (se autocompleta si existe)
3. Selecciona servicio
4. Marca descuento
5. Registra venta

### Caso 2: Venta con múltiples productos
1. Ingresa datos básicos
2. Agrega productos del bar
3. Agrega productos de cosmética
4. Revisa total
5. Registra venta

### Caso 3: Vehículo en espera
1. Toca "+" en vehículos en lavadero
2. Ingresa patente y cliente
3. Agrega vehículo
4. Cuando está listo, marca como cobrado
5. O marca como retirado si se va sin cobrar

### Caso 4: Cambio de método de pago
1. Completa el formulario
2. Antes de registrar, cambia método de pago
3. El total no cambia (es informativo)
4. Registra venta

## Troubleshooting

### Problema: No aparecen empleados
**Solución**: Ve a Configuración y agrega empleados primero

### Problema: Total no se actualiza
**Solución**: Verifica que hayas seleccionado un servicio válido

### Problema: Vehículo no se elimina
**Solución**: Intenta nuevamente o recarga la pantalla

### Problema: Datos no se guardan
**Solución**: Verifica que AsyncStorage esté disponible en el dispositivo

## Integración con Otras Pantallas

### Desde ConfigScreen
- Los empleados agregados en Config aparecen en el selector

### Hacia ReportesScreen
- Las ventas registradas se pueden consultar en Reportes

### Hacia CierreScreen
- El total de ventas se usa para el cierre de caja
