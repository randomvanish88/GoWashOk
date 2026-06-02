# 📊 Instrucciones de Configuración de Google Sheets

## 🎯 Configuración Rápida

### 1. Crear tu Hoja de Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo en blanco
3. Dale un nombre, por ejemplo: **"GoWash Database"**

### 2. Compartir con la Cuenta de Servicio

**IMPORTANTE:** Debes compartir tu hoja con esta cuenta de servicio:

```
gowash-sync@gowash-db-496413.iam.gserviceaccount.com
```

**Pasos para compartir:**

1. Haz clic en el botón **"Compartir"** (arriba a la derecha)
2. En el campo "Agregar personas y grupos", pega el email de arriba
3. Asegúrate de dar permisos de **"Editor"** (no solo lector)
4. Haz clic en **"Enviar"**

### 3. Obtener el ID de tu Spreadsheet

El ID es la parte larga de la URL de tu hoja:

```
https://docs.google.com/spreadsheets/d/ESTE_ES_TU_ID/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑
```

**Ejemplo:**
```
URL completa:
https://docs.google.com/spreadsheets/d/1Abc123XYZ456def789GHI012/edit

ID del Spreadsheet:
1Abc123XYZ456def789GHI012
```

### 4. Configurar en la Aplicación

1. Abre GoWash Mobile
2. En la pantalla de inicio, haz clic en **"Google Sheets"**
3. Pega el ID de tu Spreadsheet
4. Haz clic en **"Conectar"**
5. Si todo está bien, verás un mensaje: ✅ **"Conectado exitosamente"**

---

## 📋 Estructura de las Hojas

La aplicación creará automáticamente estas pestañas:

### 📌 VehiculosPatio
Contiene todos los vehículos actualmente en el lavadero.

**Columnas:**
- id, patente, marcaModelo, color, cliente, telefono
- servicio, precio, metodoPago, empleado, observaciones
- fecha, horaIngreso, horaSalida, estado
- productosBar, productosCosmeticos, descuento, fotos, tiempoEstimado

### 📌 VehiculosEntregados
Contiene todos los vehículos que ya fueron entregados.

**Columnas:** (las mismas que VehiculosPatio)

### 📌 Usuarios (opcional, para futuras funcionalidades)
### 📌 Configuracion (opcional, para futuras funcionalidades)

---

## 🔄 Sincronización

### Sincronización Automática
Cada vez que:
- ✅ Registras un nuevo vehículo → Se guarda en Google Sheets
- ✅ Entregas un vehículo → Se mueve a la hoja "Entregados"
- ✅ Actualizas el estado → Se actualiza en Google Sheets

### Sincronización Manual

**📤 Subir Datos (Upload)**
- Sube TODOS tus vehículos locales a Google Sheets
- Útil para hacer backup completo
- Sobrescribe lo que esté en Google Sheets

**📥 Descargar Datos (Download)**
- Descarga TODOS los vehículos desde Google Sheets
- Útil para restaurar datos o sincronizar en otro dispositivo
- Sobrescribe tus datos locales

---

## ⚠️ Solución de Problemas

### Error: "No se pudo conectar"
**Causa:** La cuenta de servicio no tiene acceso a tu hoja.
**Solución:** Verifica que hayas compartido la hoja con el email correcto y con permisos de **Editor**.

### Error: "Hoja no encontrada"
**Causa:** El ID del Spreadsheet es incorrecto.
**Solución:** Copia nuevamente el ID desde la URL de tu hoja.

### Error: "Credenciales inválidas"
**Causa:** Problema con las credenciales embebidas.
**Solución:** Las credenciales están embebidas en la aplicación. Si persiste el error, contacta soporte.

### Los datos no se sincronizan automáticamente
**Causa:** La conexión no se estableció correctamente.
**Solución:** 
1. Abre Google Sheets desde la pantalla de inicio
2. Verifica que diga "Conectado" en verde
3. Si no, haz clic en "Conectar" nuevamente

---

## 🎓 Consejos y Buenas Prácticas

### 1. Haz Backup Regular
- Usa "Subir Datos" al final del día para guardar todo en la nube
- Google Sheets mantiene historial de cambios por 30 días

### 2. Sincroniza entre Dispositivos
- Configura la misma hoja en múltiples dispositivos
- Todos compartirán los mismos datos en tiempo real

### 3. No edites manualmente en Google Sheets
- La aplicación espera un formato específico
- Si editas manualmente, podrías causar errores al sincronizar

### 4. Verifica la conexión
- El icono en la pantalla de Google Sheets muestra el estado
- Verde = Conectado ✅
- Rojo/No visible = Desconectado ❌

### 5. Usa filtros en Google Sheets
- Puedes crear vistas personalizadas
- Filtrar por fecha, empleado, método de pago, etc.
- Crear gráficos y reportes avanzados

---

## 📞 Soporte

Si tienes problemas con la sincronización, verifica:

1. ✅ La hoja está compartida con la cuenta de servicio
2. ✅ El ID del Spreadsheet es correcto
3. ✅ Tienes conexión a Internet
4. ✅ La cuenta de servicio tiene permisos de "Editor"

---

## 🔐 Seguridad

- Las credenciales están embebidas de forma segura en la aplicación
- Solo la cuenta de servicio `gowash-sync@...` puede acceder a tu hoja
- Tú controlas el acceso compartiendo o no compartiendo la hoja
- Los datos se transmiten de forma encriptada (HTTPS)

---

**¡Listo!** Ahora tu GoWash está conectado a la nube ☁️✨
