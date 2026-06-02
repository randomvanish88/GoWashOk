# 📋 Tareas - GoWash Mobile Maqueta Completa

## Fase 1: Estructura Base y Tipos

### Task 1.1: Crear tipos de datos
**Descripción:** Definir interfaces TypeScript para vehículos, QR y estados
**Subtareas:**
- Crear `src/types/vehicle.ts` con interfaz Vehicle
- Crear `src/types/qr.ts` con interfaz QRData
- Crear `src/types/index.ts` exportando todos los tipos
**Criterios de Aceptación:**
- Tipos compilados sin errores
- Interfaces bien documentadas
- Exportaciones correctas

### Task 1.2: Crear servicios base
**Descripción:** Implementar servicios para QR y vehículos
**Subtareas:**
- Crear `src/services/qrService.ts` con generación de QR
- Crear `src/services/vehicleService.ts` con CRUD de vehículos
- Crear `src/services/storageService.ts` para AsyncStorage
**Criterios de Aceptación:**
- Servicios compilados sin errores
- Funciones documentadas
- Manejo de errores implementado

## Fase 2: Componentes Reutilizables

### Task 2.1: Crear componente VehicleForm
**Descripción:** Formulario para ingreso de vehículos
**Subtareas:**
- Crear `src/components/VehicleForm.tsx`
- Implementar campos: placa, marca, modelo, color
- Implementar campos: cliente, teléfono, servicio
- Implementar campos: observaciones, forma de pago
- Agregar validación de campos
- Agregar estilos según maqueta
**Criterios de Aceptación:**
- Formulario renderiza correctamente
- Validación funciona
- Estilos coinciden con maqueta
- Datos se capturan correctamente

### Task 2.2: Crear componente QRGenerator
**Descripción:** Componente para mostrar y generar QR
**Subtareas:**
- Crear `src/components/QRGenerator.tsx`
- Implementar generación de código QR
- Mostrar datos del vehículo
- Agregar botón de escaneo
- Agregar botón de cambiar ticket
- Agregar opción de compartir por WhatsApp
**Criterios de Aceptación:**
- QR se genera correctamente
- QR es legible
- Botones funcionan
- Estilos coinciden con maqueta

### Task 2.3: Crear componente QRScanner
**Descripción:** Componente para escanear códigos QR
**Subtareas:**
- Crear `src/components/QRScanner.tsx`
- Implementar escaneo con expo-barcode-scanner
- Manejar permisos de cámara
- Mostrar resultado del escaneo
- Agregar manejo de errores
**Criterios de Aceptación:**
- Escaneo funciona correctamente
- Permisos se solicitan correctamente
- Errores se manejan correctamente
- Resultado se procesa correctamente

## Fase 3: Pantallas Principales

### Task 3.1: Crear IngresoVehiculoScreen
**Descripción:** Pantalla para ingreso de vehículos
**Subtareas:**
- Crear `src/screens/IngresoVehiculoScreen.tsx`
- Integrar componente VehicleForm
- Implementar validación
- Implementar guardado en AsyncStorage
- Implementar navegación a GeneracionQRScreen
- Agregar estilos según maqueta
**Criterios de Aceptación:**
- Pantalla renderiza correctamente
- Formulario funciona
- Datos se guardan
- Navegación funciona
- Estilos coinciden con maqueta

### Task 3.2: Crear GeneracionQRScreen
**Descripción:** Pantalla para mostrar QR generado
**Subtareas:**
- Crear `src/screens/GeneracionQRScreen.tsx`
- Integrar componente QRGenerator
- Mostrar confirmación de ingreso
- Mostrar datos del vehículo
- Implementar botón "ESCANEAR QR"
- Implementar botón "CAMBIAR TICKET"
- Agregar opción de compartir por WhatsApp
- Agregar estilos según maqueta
**Criterios de Aceptación:**
- Pantalla renderiza correctamente
- QR se muestra correctamente
- Botones funcionan
- Datos se muestran correctamente
- Estilos coinciden con maqueta

### Task 3.3: Crear RetiroVehiculoScreen
**Descripción:** Pantalla para retiro de vehículos
**Subtareas:**
- Crear `src/screens/RetiroVehiculoScreen.tsx`
- Integrar componente QRScanner
- Mostrar datos del vehículo escaneado
- Mostrar estado del lavado
- Implementar botón "CANCELAR"
- Implementar botón "MARCAR COMO ENTREGADO"
- Agregar estilos según maqueta
**Criterios de Aceptación:**
- Pantalla renderiza correctamente
- Escaneo funciona
- Datos se muestran correctamente
- Botones funcionan
- Estilos coinciden con maqueta

## Fase 4: Integración y Navegación

### Task 4.1: Actualizar App.tsx
**Descripción:** Integrar nuevas pantallas en la navegación
**Subtareas:**
- Actualizar `App.tsx` con nuevas rutas
- Configurar navegación entre pantallas
- Agregar iconos en bottom tabs
- Implementar transiciones
**Criterios de Aceptación:**
- Navegación funciona correctamente
- Todas las pantallas son accesibles
- Transiciones son suaves
- Iconos se muestran correctamente

### Task 4.2: Integrar AsyncStorage
**Descripción:** Guardar y recuperar datos de vehículos
**Subtareas:**
- Implementar guardado de vehículos
- Implementar recuperación de vehículos
- Implementar actualización de estado
- Implementar eliminación de vehículos
- Agregar manejo de errores
**Criterios de Aceptación:**
- Datos se guardan correctamente
- Datos se recuperan correctamente
- Estado se actualiza correctamente
- Errores se manejan correctamente

## Fase 5: Sincronización con Google Sheets

### Task 5.1: Integrar Google Sheets
**Descripción:** Sincronizar datos con Google Sheets
**Subtareas:**
- Implementar escritura de vehículos en Google Sheets
- Implementar escritura de QR en Google Sheets
- Implementar actualización de estado
- Agregar manejo de errores
- Agregar reintentos automáticos
**Criterios de Aceptación:**
- Datos se escriben en Google Sheets
- Estado se actualiza en Google Sheets
- Errores se manejan correctamente
- Reintentos funcionan

### Task 5.2: Agregar indicadores de sincronización
**Descripción:** Mostrar estado de sincronización en UI
**Subtareas:**
- Agregar indicador de carga
- Agregar indicador de éxito
- Agregar indicador de error
- Agregar última sincronización
**Criterios de Aceptación:**
- Indicadores se muestran correctamente
- Estados se actualizan correctamente
- Información es clara para el usuario

## Fase 6: Testing y Optimización

### Task 6.1: Testing de funcionalidad
**Descripción:** Pruebas de todas las funcionalidades
**Subtareas:**
- Probar ingreso de vehículos
- Probar generación de QR
- Probar escaneo de QR
- Probar retiro de vehículos
- Probar sincronización
**Criterios de Aceptación:**
- Todas las funcionalidades funcionan
- No hay errores en consola
- Datos se guardan correctamente
- Sincronización funciona

### Task 6.2: Optimización y refinamiento
**Descripción:** Optimizar performance y UX
**Subtareas:**
- Optimizar renderizado
- Optimizar almacenamiento
- Optimizar sincronización
- Mejorar UX basado en feedback
**Criterios de Aceptación:**
- App es rápida
- Almacenamiento es eficiente
- Sincronización es rápida
- UX es intuitiva

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026
