# ✅ CHECKLIST DE DESPLIEGUE - GOWASH

## 📋 ANTES DE DESPLEGAR

- [x] Vercel CLI instalado (`vercel --version`)
- [x] Sesión iniciada (`vercel whoami`)
- [x] Aplicación construida (`dist/` existe con archivos)
- [x] Service Worker configurado (`public/sw.js`)
- [x] Manifest configurado (`public/manifest.json`)
- [x] Vercel config optimizado (`vercel.json`)

## 🚀 DURANTE EL DESPLIEGUE

### Opción A: Usar Proyecto Existente
- [ ] Ejecutar `vercel.cmd --prod`
- [ ] Seleccionar team (ENTER)
- [ ] Link to existing? → **Y**
- [ ] Seleccionar **go-wash-lavadero**
- [ ] Esperar 2-3 minutos
- [ ] Copiar URL resultante

### Opción B: Crear Proyecto Nuevo
- [ ] Ejecutar `vercel.cmd --prod`
- [ ] Seleccionar team (ENTER)
- [ ] Link to existing? → **N**
- [ ] Nombre: **gowash-mobile-2026**
- [ ] Directory: **./** (ENTER)
- [ ] Override settings: **N** (ENTER)
- [ ] Esperar 2-3 minutos
- [ ] Copiar URL resultante

## ✅ VERIFICACIÓN INMEDIATA

### En el navegador de la PC:
- [ ] Abrir la URL de Vercel
- [ ] Verificar que carga la pantalla de login
- [ ] Verificar que NO hay errores en consola (F12)
- [ ] Probar login con credenciales de prueba
- [ ] Verificar que navega correctamente

### En el navegador del móvil:
- [ ] Abrir la URL en el móvil
- [ ] Verificar que carga correctamente
- [ ] Verificar que el diseño es responsive
- [ ] Probar scroll y navegación táctil

## 📱 INSTALACIÓN EN MÓVILES

### Android (Chrome):
- [ ] Abrir URL en Chrome del móvil
- [ ] Menú (⋮) → "Agregar a pantalla de inicio"
- [ ] Confirmar instalación
- [ ] Verificar ícono en pantalla de inicio
- [ ] Abrir desde el ícono
- [ ] Verificar que abre como app (sin barra de navegador)

### iOS (Safari):
- [ ] Abrir URL en Safari del iPhone
- [ ] Botón Compartir (□↑) → "Agregar a inicio"
- [ ] Confirmar
- [ ] Verificar ícono en pantalla de inicio
- [ ] Abrir desde el ícono
- [ ] Verificar que abre como app

## 🧪 PRUEBAS FUNCIONALES

### Login y Navegación:
- [ ] Login con usuario válido funciona
- [ ] Navegación entre secciones fluida
- [ ] Botones responden correctamente

### Registro de Vehículo:
- [ ] Formulario de ingreso carga
- [ ] Captura de fotos funciona
- [ ] Selección de servicio funciona
- [ ] Productos (bar/cosméticos) se pueden seleccionar
- [ ] Forma de pago funciona
- [ ] Descuento se aplica correctamente
- [ ] Botón "Registrar Ingreso" guarda datos

### QR y Lista:
- [ ] QR se genera correctamente
- [ ] Lista de vehículos muestra datos
- [ ] Búsqueda funciona
- [ ] Filtros funcionan

### Retirada:
- [ ] Modal de retirada abre
- [ ] Campos se rellenan correctamente
- [ ] Hora de salida se actualiza
- [ ] Botón "Marcar como Retirado" funciona

### Reportes:
- [ ] Sección de reportes carga
- [ ] Filtros por fecha funcionan
- [ ] Estadísticas se calculan correctamente
- [ ] Exportación (si aplica) funciona

### Google Sheets (Desktop):
- [ ] Indicador de conexión aparece
- [ ] Sincronización manual funciona
- [ ] Datos se suben correctamente

### Modo Offline:
- [ ] Desconectar internet
- [ ] App sigue funcionando
- [ ] Datos en localStorage persisten
- [ ] Reconectar internet
- [ ] Verificar sincronización

## 🔧 POST-DESPLIEGUE

### Configuración:
- [ ] Compartir URL con el equipo
- [ ] Documentar URL en lugar seguro
- [ ] Configurar Google Sheet (si no está hecho)
- [ ] Dar permisos a `gowash-sync@gowash-db-496413.iam.gserviceaccount.com`

### Comunicación:
- [ ] Enviar URL a usuarios
- [ ] Enviar instrucciones de instalación
- [ ] Explicar cómo usar la app
- [ ] Explicar modo offline

### Monitoreo:
- [ ] Verificar Vercel Dashboard
- [ ] Revisar analytics (si están habilitados)
- [ ] Monitorear errores
- [ ] Recopilar feedback inicial

## 🎯 CRITERIOS DE ÉXITO

Una instalación exitosa debe cumplir:

✅ URL accesible desde cualquier dispositivo  
✅ App se instala en pantalla de inicio  
✅ Login funciona correctamente  
✅ Registro de vehículos completo funciona  
✅ Fotos se capturan y guardan  
✅ QR se genera correctamente  
✅ Lista y búsqueda funcionan  
✅ Retirada de vehículos funciona  
✅ Reportes muestran datos correctos  
✅ Funciona offline después de primera carga  
✅ Diseño responsive en móviles  

## 📊 MÉTRICAS A MONITOREAR

Primeras 24 horas:
- Número de instalaciones
- Número de registros de vehículos
- Errores reportados
- Feedback de usuarios
- Velocidad de carga

Primera semana:
- Uso diario activo
- Vehículos procesados
- Sincronizaciones exitosas
- Problemas recurrentes

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### "La app no carga"
- Verificar conexión a internet (primera vez)
- Limpiar caché del navegador
- Reinstalar (eliminar y agregar de nuevo)

### "Las fotos no se guardan"
- Verificar permisos de cámara
- Probar en navegador primero
- Verificar espacio en localStorage

### "No sincroniza con Google Sheets"
- Solo funciona en versión desktop/Electron
- Verificar permisos de la hoja
- Verificar configuración en modal

### "El QR no se genera"
- Verificar que el vehículo tiene ID
- Verificar localStorage
- Refrescar la página

## ✨ MEJORAS FUTURAS

Considerar para próximas versiones:
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Múltiples idiomas
- [ ] Exportar reportes a PDF
- [ ] Firma digital del cliente
- [ ] Geolocalización
- [ ] Chat interno
- [ ] Recordatorios automáticos

---

## 🎉 ¡LISTO PARA DESPLEGAR!

**Ejecuta:** `OPCION_RAPIDA.bat`

**Marca cada checkbox a medida que completes los pasos.**

---

_Checklist v1.0 - GoWash POS_
