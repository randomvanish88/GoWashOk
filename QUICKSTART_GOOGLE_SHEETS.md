# ⚡ QUICKSTART - Google Sheets en 3 Minutos

## 🎯 Objetivo
Conectar GoWash con Google Sheets en menos de 3 minutos.

---

## ⏱️ Paso 1: Crear Hoja (30 segundos)

1. Abre → https://sheets.google.com
2. Clic en **"+ Nuevo"** (o presiona Ctrl+N)
3. Nombra tu hoja: **"GoWash Database"**

✅ **Listo!** Ya tienes tu hoja.

---

## ⏱️ Paso 2: Compartir (30 segundos)

1. Clic en botón **"Compartir"** (esquina superior derecha)
2. **Copia y pega este email:**
   ```
   gowash-sync@gowash-db-496413.iam.gserviceaccount.com
   ```
3. Cambia permisos a **"Editor"** (dropdown a la derecha)
4. Clic en **"Enviar"**

✅ **Listo!** La cuenta de servicio tiene acceso.

---

## ⏱️ Paso 3: Copiar ID (30 segundos)

Mira la URL de tu hoja:

```
https://docs.google.com/spreadsheets/d/1Abc123XYZ456def789/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        COPIA ESTO
```

**Tu ID es:** `1Abc123XYZ456def789`

✅ **Copiado!** Este es tu Spreadsheet ID.

---

## ⏱️ Paso 4: Conectar en GoWash (60 segundos)

1. Abre **GoWash Mobile**
2. Login → `admin` / `123`
3. Clic en **"Google Sheets"** (botón morado en inicio)
4. **Pega tu ID** en el campo
5. Clic en **"Conectar"**
6. Espera mensaje: ✅ **"Conectado exitosamente"**
7. Verifica el **punto verde** en el header (junto a tu usuario)

✅ **Conectado!** Ya estás sincronizado.

---

## ⏱️ Paso 5: Probar (30 segundos)

1. Clic en **"Ingreso de Vehículo"**
2. Llena solo:
   - **Patente:** TEST01
   - **Servicio:** Premium
3. Clic en **"GENERAR QR E INGRESAR"**
4. Ve a tu **Google Sheet**
5. ✅ Debería aparecer una pestaña **"VehiculosPatio"** con el vehículo TEST01

---

## 🎉 ¡LISTO EN 3 MINUTOS!

Ahora cada vehículo que ingreses se guardará automáticamente en Google Sheets.

---

## 🔥 Comandos Rápidos

| Acción | Dónde | Para qué |
|--------|-------|----------|
| **Subir Datos** | Google Sheets → Botón verde | Hacer backup completo en la nube |
| **Descargar Datos** | Google Sheets → Botón gris | Restaurar desde la nube |
| **Ver datos** | Abre tu Google Sheet | Ver todos los registros |
| **Indicador verde** | Header (junto a usuario) | Significa "Conectado a Google Sheets" ✅ |

---

## 💡 Tips Rápidos

- **Backup diario:** Haz "Subir Datos" al final del día
- **Múltiples dispositivos:** Usa el mismo ID en todos
- **Reportes:** Crea gráficos directamente en Google Sheets
- **Historial:** Google guarda versiones anteriores (File → Version history)

---

## ⚠️ Si algo falla

### No conecta
→ Verifica que compartiste con el email correcto y diste permisos de **"Editor"**

### ID incorrecto
→ Copia nuevamente desde la URL, sin espacios

### No sincroniza
→ Verifica el punto verde en el header. Si no está, reconecta.

---

## 🎓 Quieres más info?

Lee los documentos completos:
- `INSTRUCCIONES_GOOGLE_SHEETS.md` → Tutorial detallado
- `EJEMPLO_GOOGLE_SHEETS.md` → Ejemplos visuales
- `PRUEBA_GOOGLE_SHEETS.md` → Casos de prueba
- `RESUMEN_INTEGRACION_GOOGLE_SHEETS.md` → Info técnica

---

**¡Empieza a usar GoWash con Google Sheets YA! 🚀**
