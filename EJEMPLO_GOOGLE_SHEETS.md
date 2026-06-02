# 📊 Ejemplo de Google Sheets para GoWash

## 🎯 Cómo debe verse tu hoja

### Pestaña: VehiculosPatio

| id | patente | marcaModelo | color | cliente | telefono | servicio | precio | metodoPago | empleado | observaciones | fecha | horaIngreso | horaSalida | estado | productosBar | productosCosmeticos | descuento | fotos | tiempoEstimado |
|----|---------|-------------|-------|---------|----------|----------|--------|------------|----------|---------------|-------|-------------|------------|--------|--------------|---------------------|-----------|-------|----------------|
| GW1704721234ABC123 | ABC123 | Toyota Corolla | Blanco | Juan Pérez | 1123456789 | Premium | 6000 | Efectivo | admin | | 2026-06-02 | 10:30 | | Ingresado | [] | [] | 0 | [] | 45 |
| GW1704721235DEF456 | DEF456 | Ford Focus | Negro | María García | 1198765432 | Completo | 8000 | Tarjeta | empleado | Cliente VIP | 2026-06-02 | 11:15 | | En Lavado | [{"nombre":"Café","precio":500}] | [{"nombre":"Aromatizante","precio":1500}] | 500 | [] | 60 |

### Pestaña: VehiculosEntregados

| id | patente | marcaModelo | color | cliente | telefono | servicio | precio | metodoPago | empleado | observaciones | fecha | horaIngreso | horaSalida | estado | productosBar | productosCosmeticos | descuento | fotos | tiempoEstimado |
|----|---------|-------------|-------|---------|----------|----------|--------|------------|----------|---------------|-------|-------------|------------|--------|--------------|---------------------|-----------|-------|----------------|
| GW1704721230XYZ789 | XYZ789 | Honda Civic | Gris | Pedro López | 1145678901 | Básico | 4000 | Transferencia | admin | | 2026-06-02 | 09:00 | 09:45 | Listo | [] | [] | 0 | [] | 30 |

---

## 🔧 Configuración Paso a Paso

### 1. Crear Nueva Hoja de Google Sheets

```
1. Ir a: https://sheets.google.com
2. Clic en "+ Nuevo" o "Crear"
3. Nombrar: "GoWash Database" (o el nombre que prefieras)
```

### 2. Compartir con la Cuenta de Servicio

**Email de la cuenta de servicio:**
```
gowash-sync@gowash-db-496413.iam.gserviceaccount.com
```

**Pasos:**
1. Clic en botón "Compartir" (esquina superior derecha)
2. Pegar el email de arriba
3. Cambiar permisos a **"Editor"**
4. Desmarcar "Notificar a las personas" (opcional)
5. Clic en "Enviar"

### 3. Obtener el ID

**URL de ejemplo:**
```
https://docs.google.com/spreadsheets/d/1ABC123def456GHI789jkl012MNO345pqr678/edit#gid=0
```

**Tu ID sería:**
```
1ABC123def456GHI789jkl012MNO345pqr678
```

### 4. Configurar en GoWash

1. Abrir GoWash Mobile
2. Pantalla de inicio → "Google Sheets"
3. Pegar el ID
4. Clic en "Conectar"
5. Esperar mensaje de éxito ✅

---

## 📝 Notas Importantes

### ✅ Las hojas se crean automáticamente
- **VehiculosPatio**: Se crea al guardar el primer vehículo
- **VehiculosEntregados**: Se crea al entregar el primer vehículo
- No necesitas crear las pestañas manualmente

### ✅ Los headers se configuran automáticamente
- La aplicación define las columnas
- No modifiques los nombres de las columnas
- Puedes agregar columnas adicionales al final (no se usarán)

### ✅ Formato de datos especiales

**Productos (JSON):**
```json
[{"nombre":"Café","precio":500},{"nombre":"Agua","precio":300}]
```

**Fotos (JSON - URLs o Base64):**
```json
["data:image/jpeg;base64,/9j/4AAQ...", "data:image/jpeg;base64,/9j/4BBR..."]
```

**Pago Mixto:**
```
Efectivo $3000 + Tarjeta $3000
```

### ⚠️ No edites manualmente
- La sincronización espera un formato específico
- Si editas manualmente, podrías causar errores
- Mejor usa la aplicación para todos los cambios

---

## 🔄 Flujo de Sincronización

### Registro de Vehículo
```
Usuario registra vehículo
    ↓
Se guarda en localStorage
    ↓
Se envía a Google Sheets (VehiculosPatio)
    ↓
✅ Confirmación
```

### Entrega de Vehículo
```
Usuario entrega vehículo
    ↓
Se mueve en localStorage (Patio → Entregados)
    ↓
Se copia a VehiculosEntregados en Google Sheets
    ↓
Se elimina de VehiculosPatio en Google Sheets
    ↓
✅ Confirmación
```

### Sincronización Manual (Upload)
```
Usuario hace clic en "Subir Datos"
    ↓
Lee TODOS los vehículos del localStorage
    ↓
Limpia las hojas en Google Sheets
    ↓
Escribe todos los datos nuevamente
    ↓
✅ Backup completo realizado
```

### Sincronización Manual (Download)
```
Usuario hace clic en "Descargar Datos"
    ↓
Lee TODOS los vehículos de Google Sheets
    ↓
Sobrescribe localStorage
    ↓
Recarga la interfaz
    ↓
✅ Datos restaurados
```

---

## 📊 Ventajas de Google Sheets

### 1. Reportes Avanzados
Puedes crear:
- Gráficos de ventas diarias
- Análisis por empleado
- Métricas de servicios más vendidos
- Reportes de productos adicionales

### 2. Backup Automático
- Google guarda versión history
- Puedes restaurar versiones anteriores
- Ver quién cambió qué y cuándo

### 3. Acceso Multi-dispositivo
- Configura el mismo Spreadsheet en varios dispositivos
- Todos ven los mismos datos
- Sincronización en tiempo real

### 4. Exportación Fácil
- Descarga como Excel (.xlsx)
- Exporta a PDF para reportes
- Importa a otras herramientas

### 5. Integraciones
- Conecta con Google Data Studio
- Automatiza con Google Apps Script
- Integra con otras herramientas

---

## 🎨 Tips de Visualización

### Colores Condicionales
Aplica formato condicional en la columna "estado":
- **Ingresado**: Amarillo
- **En Lavado**: Azul
- **Secado**: Naranja
- **Listo**: Verde

### Filtros
Crea vistas filtradas:
- Solo vehículos del día
- Por empleado
- Por método de pago
- Por rango de precios

### Fórmulas Útiles
```
Total del día:
=SUM(H:H)

Cantidad de vehículos:
=COUNTA(A:A)-1

Promedio de ticket:
=AVERAGE(H:H)

Vehículos por empleado:
=COUNTIF(J:J,"admin")
```

---

## 🚀 Próximos Pasos

Una vez conectado, puedes:

1. ✅ Registrar vehículos normalmente
2. ✅ Ver los datos aparecer en Google Sheets
3. ✅ Crear reportes personalizados
4. ✅ Hacer backup al final del día
5. ✅ Sincronizar entre dispositivos

---

**¡Todo listo para trabajar con Google Sheets! 🎉**
