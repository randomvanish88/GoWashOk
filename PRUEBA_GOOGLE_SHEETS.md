# 🧪 Prueba Rápida de Google Sheets

## ✅ Checklist de Prueba

### 1. Preparación (5 minutos)

- [ ] **Crear Hoja de Google Sheets**
  - Ir a https://sheets.google.com
  - Crear nueva hoja en blanco
  - Nombrarla: "GoWash Test"

- [ ] **Compartir con Cuenta de Servicio**
  - Clic en "Compartir"
  - Agregar: `gowash-sync@gowash-db-496413.iam.gserviceaccount.com`
  - Permisos: **Editor**
  - Enviar

- [ ] **Copiar ID del Spreadsheet**
  - De la URL: `docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`
  - Guardarlo en un bloc de notas

### 2. Configuración en GoWash (2 minutos)

- [ ] Abrir GoWash Mobile
- [ ] Login (admin / 123)
- [ ] Clic en "Google Sheets" en pantalla de inicio
- [ ] Pegar el ID del Spreadsheet
- [ ] Clic en "Conectar"
- [ ] Verificar mensaje: ✅ "Conectado exitosamente"
- [ ] Verificar indicador verde en el header (icono de base de datos)

### 3. Prueba de Sincronización (5 minutos)

#### A. Prueba de Ingreso de Vehículo

- [ ] Ir a "Ingreso de Vehículo"
- [ ] Llenar datos de prueba:
  ```
  Patente: TEST01
  Marca/Modelo: Toyota Test
  Cliente: Cliente Prueba
  Teléfono: 1123456789
  Servicio: Premium
  Forma de Pago: Efectivo
  ```
- [ ] Clic en "GENERAR QR E INGRESAR"
- [ ] Verificar mensaje de éxito
- [ ] Cerrar el QR

#### B. Verificar en Google Sheets

- [ ] Abrir tu hoja de Google Sheets
- [ ] **IMPORTANTE:** Debería aparecer una nueva pestaña: "VehiculosPatio"
- [ ] Verificar que aparezca el vehículo TEST01
- [ ] Verificar que los datos coincidan

#### C. Prueba de Entrega

- [ ] Ir a "Retiro de Vehículo"
- [ ] Buscar por patente: TEST01
- [ ] Clic en "Buscar"
- [ ] Clic en "MARCAR COMO ENTREGADO"
- [ ] Verificar mensaje de éxito

#### D. Verificar en Google Sheets

- [ ] Refrescar tu hoja de Google Sheets
- [ ] **IMPORTANTE:** Debería aparecer una nueva pestaña: "VehiculosEntregados"
- [ ] Verificar que TEST01 esté en "VehiculosEntregados"
- [ ] Verificar que TEST01 NO esté en "VehiculosPatio"
- [ ] Verificar que tenga hora de salida

### 4. Prueba de Sincronización Manual (3 minutos)

#### A. Agregar más vehículos localmente

- [ ] Ingresar 2-3 vehículos más (TEST02, TEST03)
- [ ] NO entregarlos, dejarlos en patio

#### B. Subir a Google Sheets

- [ ] Ir a "Google Sheets" desde inicio
- [ ] Clic en "Subir Datos a Google Sheets"
- [ ] Esperar mensaje de éxito
- [ ] Verificar en Google Sheets que aparezcan todos

#### C. Simular otro dispositivo

- [ ] En GoWash, ir a "Google Sheets"
- [ ] Clic en "Descargar Datos desde Google Sheets"
- [ ] Verificar que se descarguen todos los vehículos
- [ ] Ir a "Vehículos en Patio" y verificar

---

## 🎯 Resultados Esperados

### ✅ Todo funciona correctamente si:

1. **Conexión:**
   - ✅ Mensaje "Conectado exitosamente"
   - ✅ Indicador verde en header
   - ✅ No hay errores en consola

2. **Ingreso:**
   - ✅ Vehículo aparece en Google Sheets (VehiculosPatio)
   - ✅ Todos los campos están completos
   - ✅ Sincronización es inmediata (1-2 segundos)

3. **Entrega:**
   - ✅ Vehículo se mueve a VehiculosEntregados
   - ✅ Se elimina de VehiculosPatio
   - ✅ Tiene hora de salida

4. **Sincronización Manual:**
   - ✅ Upload sube todos los vehículos
   - ✅ Download descarga todos los vehículos
   - ✅ Los contadores coinciden

---

## ❌ Solución de Problemas

### Error: "No se pudo conectar"

**Síntomas:**
- Mensaje de error al conectar
- No aparece indicador verde

**Soluciones:**
1. Verificar que compartiste la hoja con el email correcto
2. Verificar que los permisos sean "Editor"
3. Verificar que el ID del spreadsheet sea correcto
4. Recargar la aplicación

### Error: "Hoja no encontrada"

**Síntomas:**
- Conecta pero falla al guardar

**Soluciones:**
1. Copiar nuevamente el ID desde la URL
2. Verificar que no haya espacios al inicio/final
3. Verificar que la hoja exista

### No aparece en Google Sheets

**Síntomas:**
- Conecta correctamente
- No hay errores
- Pero los datos no aparecen

**Soluciones:**
1. Refrescar la hoja de Google Sheets (F5)
2. Verificar en la consola del navegador (F12)
3. Verificar que estés viendo la hoja correcta
4. Intentar sincronización manual (Upload)

### Datos desactualizados

**Síntomas:**
- Los datos en Google Sheets no coinciden con la app

**Soluciones:**
1. Hacer "Descargar Datos" para traer de Google Sheets
2. Hacer "Subir Datos" para enviar a Google Sheets
3. Decidir cuál es la fuente de verdad

---

## 📊 Datos de Prueba Completos

Usa estos datos para probar todas las funcionalidades:

### Vehículo 1 (Básico)
```
Patente: TEST01
Marca/Modelo: Toyota Corolla
Cliente: Juan Pérez
Teléfono: 1123456789
Servicio: Básico ($4000)
Pago: Efectivo
```

### Vehículo 2 (Con productos)
```
Patente: TEST02
Marca/Modelo: Ford Focus
Cliente: María García
Teléfono: 1198765432
Servicio: Premium ($6000)
Pago: Tarjeta
Productos Bar: Café ($500)
Productos Cosméticos: Aromatizante ($1500)
Total: $8000
```

### Vehículo 3 (Con descuento y pago mixto)
```
Patente: TEST03
Marca/Modelo: Honda Civic
Cliente: Pedro López
Teléfono: 1145678901
Servicio: Completo ($8000)
Pago: Mixto (Efectivo $4000 + Tarjeta $4000)
Descuento: $1000
Total: $7000
```

---

## 🎓 Tips para la Prueba

1. **Abre la consola del navegador (F12)**
   - Ve a la pestaña "Console"
   - Busca mensajes que empiecen con `[GoogleSheets]`
   - Verás logs de cada operación

2. **Usa el Network tab**
   - Ve a la pestaña "Network"
   - Filtra por "googleapis"
   - Verás las peticiones a Google Sheets

3. **Ten ambas ventanas abiertas**
   - GoWash en una ventana
   - Google Sheets en otra
   - Así puedes ver los cambios en tiempo real

4. **Espera unos segundos**
   - A veces Google Sheets tarda en actualizar
   - Dale unos segundos y refresca (F5)

---

## ✨ Próximos Pasos

Una vez que todo funcione:

1. ✅ Usa la app normalmente
2. ✅ Los datos se sincronizan automáticamente
3. ✅ Haz backup manual al final del día
4. ✅ Configura otros dispositivos con el mismo Spreadsheet ID
5. ✅ Crea reportes y gráficos en Google Sheets

---

## 📞 Registro de Prueba

Fecha: _______________
Hora inicio: _______________
Hora fin: _______________

**Checklist:**
- [ ] Conexión exitosa
- [ ] Ingreso de vehículo sincronizado
- [ ] Entrega de vehículo sincronizada
- [ ] Sincronización manual funciona
- [ ] Indicador verde visible
- [ ] Sin errores en consola

**Observaciones:**
_________________________________
_________________________________
_________________________________

**Resultado:** ⭐⭐⭐⭐⭐

---

**¡Listo para producción! 🚀**
