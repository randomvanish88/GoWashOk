# Tareas Pendientes para Mañana

## Problema Principal
El flujo de fotos de vehículos desde la app móvil no está funcionando correctamente. 

### Síntomas esperados vs Realidad:
- **Esperado:** 
  1. El usuario toma hasta 4 fotos en la app móvil.
  2. La app comprime las fotos.
  3. Las sube a Google Drive (Carpeta ID: `1BEhE_4K-TxpQ5_Rdt9W2cSya7dz5br6U`) mediante Vercel (`/api/upload-fotos`).
  4. Obtiene los links y los guarda en la hoja "Patio" de Google Sheets.
  5. El POS lee la hoja "Patio" y muestra las imágenes.
- **Realidad:** El usuario reporta que este proceso "no funciona".

### Puntos a investigar mañana:
1. **API de subida:** Probar el endpoint `/api/upload-fotos` para ver si está fallando por credenciales, permisos de la Service Account en la carpeta de Drive, o límites de tamaño de Vercel (limite de body de 4.5MB en Vercel Serverless).
2. **Formato en Sheets:** Verificar cómo se están guardando exactamente los links en la celda "Fotos" de la hoja "Patio" (¿array JSON válido? ¿strings sueltos?).
3. **Lectura en POS:** Asegurarse de que el POS parsea y renderiza correctamente esos links cuando abre los detalles de un vehículo.
4. **Compresión:** Revisar que `comprimirBase64` en `MobileApp.tsx` esté funcionando en todos los navegadores móviles y no devuelva imágenes corruptas o vacías.

¡Listo para empezar a debugear!
