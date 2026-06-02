# 📱 GoWash Mobile - Maqueta Completa

## 📖 Descripción General

Este spec define la implementación completa de la maqueta de GoWash Mobile con las tres pantallas principales del flujo de lavadero:

1. **Ingreso de Vehículo** - Registro de vehículos con formulario completo
2. **Generación de QR** - Confirmación y generación de código QR único
3. **Retiro de Vehículo** - Escaneo de QR y finalización del servicio

## 🎯 Objetivos

- ✅ Implementar interfaz exactamente como se muestra en la maqueta
- ✅ Crear flujo completo de ingreso y retiro de vehículos
- ✅ Generar códigos QR únicos para cada vehículo
- ✅ Permitir escaneo de QR para retiro
- ✅ Guardar datos en AsyncStorage
- ✅ Sincronizar con Google Sheets
- ✅ Funcionar offline

## 📁 Estructura del Spec

```
mobile-complete-flow/
├── spec.md          # Especificación general
├── design.md        # Diseño detallado y componentes
├── tasks.md         # Lista de tareas
└── README.md        # Este archivo
```

## 🚀 Cómo Usar Este Spec

### 1. Revisar Especificación
Lee `spec.md` para entender los requisitos generales y la arquitectura.

### 2. Revisar Diseño
Lee `design.md` para ver el diseño detallado, colores, tipografía y componentes.

### 3. Ejecutar Tareas
Usa `tasks.md` para ejecutar las tareas en orden. Cada tarea tiene:
- Descripción clara
- Subtareas específicas
- Criterios de aceptación

### 4. Implementar
Implementa cada tarea siguiendo los criterios de aceptación.

## 📋 Fases de Implementación

### Fase 1: Estructura Base y Tipos
- Crear tipos de datos
- Crear servicios base
- Configurar almacenamiento

### Fase 2: Componentes Reutilizables
- VehicleForm
- QRGenerator
- QRScanner
- VehicleCard
- StateIndicator

### Fase 3: Pantallas Principales
- IngresoVehiculoScreen
- GeneracionQRScreen
- RetiroVehiculoScreen

### Fase 4: Integración y Navegación
- Actualizar App.tsx
- Integrar AsyncStorage
- Configurar navegación

### Fase 5: Sincronización
- Integrar Google Sheets
- Agregar indicadores de sincronización
- Manejo de errores

### Fase 6: Testing y Optimización
- Testing de funcionalidad
- Optimización y refinamiento
- Pruebas de usuario

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **AsyncStorage** - Almacenamiento local
- **expo-barcode-scanner** - Escaneo de QR
- **qrcode.react** - Generación de QR
- **Google Sheets API** - Sincronización

## 📦 Dependencias Necesarias

```bash
npm install expo-barcode-scanner qrcode.react expo-permissions
```

## ✅ Criterios de Aceptación General

- [ ] Todas las pantallas se renderizan correctamente
- [ ] Formulario valida todos los campos
- [ ] QR se genera correctamente
- [ ] QR se puede escanear
- [ ] Datos se guardan en AsyncStorage
- [ ] Datos se sincronizan con Google Sheets
- [ ] UI coincide exactamente con la maqueta
- [ ] Funciona offline
- [ ] No hay errores en consola
- [ ] Performance es aceptable

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                  Ingreso de Vehículo                    │
│  Formulario → Validación → Generación de QR → Guardado │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Generación de QR                       │
│  Mostrar QR → Escaneo → Verificación → Compartir       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Retiro de Vehículo                     │
│  Escaneo → Verificación → Actualizar Estado → Sincronizar
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Sincronización Google Sheets               │
│  Lectura ← → Escritura ← → Actualización de Estado     │
└─────────────────────────────────────────────────────────┘
```

## 📱 Pantallas Afectadas

### Nuevas Pantallas
- `src/screens/IngresoVehiculoScreen.tsx`
- `src/screens/GeneracionQRScreen.tsx`
- `src/screens/RetiroVehiculoScreen.tsx`

### Pantallas Modificadas
- `App.tsx` - Agregar nuevas rutas y navegación

### Nuevos Componentes
- `src/components/VehicleForm.tsx`
- `src/components/QRGenerator.tsx`
- `src/components/QRScanner.tsx`
- `src/components/VehicleCard.tsx`
- `src/components/StateIndicator.tsx`

### Nuevos Servicios
- `src/services/qrService.ts`
- `src/services/vehicleService.ts`
- `src/services/storageService.ts`

### Nuevos Tipos
- `src/types/vehicle.ts`
- `src/types/qr.ts`

## 🎨 Diseño

### Colores Principales
- **Azul GoWash**: #1E40AF
- **Verde Éxito**: #10B981
- **Rojo Error**: #EF4444
- **Naranja Advertencia**: #F59E0B

### Tipografía
- **Heading 1**: 28px Bold
- **Heading 2**: 24px SemiBold
- **Body**: 16px Regular
- **Caption**: 14px Regular

### Espaciado
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## 📊 Métricas de Éxito

- ✅ Tiempo de carga < 2 segundos
- ✅ Tasa de error < 1%
- ✅ Sincronización < 5 segundos
- ✅ Satisfacción del usuario > 4.5/5
- ✅ Cobertura de código > 80%

## 🐛 Troubleshooting

### Error: "Cannot find module 'expo-barcode-scanner'"
```bash
npm install expo-barcode-scanner
```

### Error: "Camera permission denied"
Asegúrate de solicitar permisos en `app.json`:
```json
{
  "plugins": [
    ["expo-camera", { "cameraPermission": "Allow GoWash to access your camera" }]
  ]
}
```

### Error: "QR code not scanning"
- Asegúrate de que la cámara está enfocada
- Prueba con un código QR más grande
- Verifica que el código QR sea válido

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## 📝 Notas Importantes

1. **Offline First**: La app debe funcionar sin conexión
2. **Caché Local**: Guardar datos localmente para acceso rápido
3. **Conflictos**: Manejar conflictos de datos (última escritura gana)
4. **Notificaciones**: Informar al usuario sobre estado de sincronización
5. **Performance**: Optimizar para conexiones lentas
6. **Seguridad**: Validar datos antes de escribir

## 🚀 Próximos Pasos

1. Revisar este spec completamente
2. Ejecutar las tareas en orden
3. Implementar cada componente
4. Testing completo
5. Optimización y refinamiento
6. Despliegue a producción

---

**Estado:** 📋 Planificado  
**Versión:** 1.0.0  
**Fecha:** 1 de Junio de 2026  
**Autor:** GoWash Team  
**Última Actualización:** 1 de Junio de 2026
