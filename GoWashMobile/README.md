# GoWash POS - Aplicación Móvil

Versión móvil de GoWash POS para Android e iOS usando React Native y Expo.

## 📱 Características

- ✅ Registro de ventas (Lavadero, Bar, Cosmética)
- ✅ Métodos de pago múltiples
- ✅ Descuentos y recargos
- ✅ Cierre de caja
- ✅ Reportes y estadísticas
- ✅ Almacenamiento local (AsyncStorage)
- ✅ Sincronización con Google Sheets (próximamente)
- ✅ Tema oscuro optimizado para móvil

## 🚀 Instalación

### Requisitos
- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar el servidor de desarrollo**
```bash
npm start
```

3. **Ejecutar en Android**
```bash
npm run android
```

4. **Ejecutar en iOS**
```bash
npm run ios
```

5. **Ejecutar en Web**
```bash
npm run web
```

## 📁 Estructura del Proyecto

```
GoWashMobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── VentasScreen.tsx
│   │   ├── CierreScreen.tsx
│   │   ├── ReportesScreen.tsx
│   │   ├── ConfigScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── App.tsx
├── app.json
├── package.json
└── README.md
```

## 🔐 Credenciales de Prueba

- **Email**: demo@gowash.com
- **Contraseña**: demo123

## 📊 Pantallas

### 1. Login
- Autenticación de usuario
- Modo demo para pruebas

### 2. Ventas
- Registro de nuevas ventas
- Selección de servicios (Lavadero, Bar, Cosmética)
- Aplicación de descuentos y recargos
- Selección de método de pago
- Historial de últimas ventas

### 3. Cierre de Caja
- Ingreso de monto inicial
- Resumen de ventas del día
- Desglose por método de pago
- Cálculo de total esperado
- Confirmación de cierre

### 4. Reportes
- Estadísticas del día
- Desglose por servicio
- Descuentos y recargos
- Información del último cierre

### 5. Configuración
- Perfil de usuario
- Preferencias (notificaciones, sincronización)
- Información de la app
- Limpiar datos locales
- Cerrar sesión

## 🔄 Flujo de Datos

```
Login → Ventas → Cierre de Caja → Reportes
  ↓
AsyncStorage (Almacenamiento Local)
  ↓
Google Sheets (Sincronización - Próximamente)
```

## 🛠️ Tecnologías

- **React Native**: Framework para desarrollo móvil
- **Expo**: Plataforma para desarrollo rápido
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación entre pantallas
- **AsyncStorage**: Almacenamiento local
- **Ionicons**: Iconos

## 📦 Dependencias Principales

```json
{
  "expo": "^51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.1",
  "@react-navigation/native": "^6.1.17",
  "@react-navigation/bottom-tabs": "^6.5.20",
  "@react-native-async-storage/async-storage": "^1.23.1",
  "google-spreadsheet": "^5.2.0"
}
```

## 🚀 Próximas Características

- [ ] Integración con Google Sheets
- [ ] Cámara para fotos de vehículos
- [ ] Notificaciones push
- [ ] Modo offline mejorado
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Sincronización en tiempo real
- [ ] Múltiples usuarios
- [ ] Roles y permisos avanzados

## 📝 Notas de Desarrollo

### Almacenamiento Local
Los datos se guardan en AsyncStorage:
- `userToken`: Token de autenticación
- `userEmail`: Email del usuario
- `ventas`: Array de ventas del día
- `ultimoCierre`: Información del último cierre

### Sincronización
Próximamente se implementará sincronización con Google Sheets para:
- Backup automático
- Acceso desde múltiples dispositivos
- Reportes en la nube

## 🐛 Troubleshooting

### Error: "Cannot find module 'expo'"
```bash
npm install expo
```

### Error: "Android SDK not found"
Instala Android Studio y configura las variables de entorno.

### Error: "Port 8081 already in use"
```bash
npm start -- --clear
```

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

Comercial - GoWash © 2026

## 👥 Equipo

- Desarrollo: GoWash Team
- Versión: 1.0.0
- Última actualización: Mayo 2026
