const { app, BrowserWindow, ipcMain, protocol, dialog, net } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

// ESTA ES TU PALABRA SECRETA - ¡NO LA COMPARTAS!
const MASTER_SECRET = 'GoWash_Secret_2026_Admin'; 

// --- SISTEMA DE BACKUP DE DATOS ---
const BACKUP_FILE = path.join(app.getPath('userData'), 'gowash-backup.json');

function saveBackup(data) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[Backup] Datos guardados correctamente en disco.');
    return { success: true };
  } catch (error) {
    console.error('[Backup] Error al guardar:', error.message);
    return { success: false, error: error.message };
  }
}

function loadBackup() {
  try {
    if (!fs.existsSync(BACKUP_FILE)) {
      console.log('[Backup] No existe archivo de backup previo.');
      return { success: true, data: null };
    }
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    const data = JSON.parse(raw);
    console.log('[Backup] Datos restaurados desde disco.');
    return { success: true, data };
  } catch (error) {
    console.error('[Backup] Error al leer:', error.message);
    return { success: false, error: error.message, data: null };
  }
}

function createWindow() {
  const isDev = !app.isPackaged;
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // DESACTIVADO para permitir carga de imágenes locales en el ejecutable
    },
    icon: path.join(__dirname, '../public/logo.png'), 
    autoHideMenuBar: true,
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Permitir carga de imágenes desde Google Drive / lh3.googleusercontent.com
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://lh3.googleusercontent.com https://drive.google.com https://*.googleapis.com"
        ]
      }
    });
  });

  // Bloquear F12 y otras herramientas de desarrollo en producción
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      event.preventDefault();
    }
  });
}

// --- REGISTRO DE PROTOCOLO PARA IMÁGENES LOCALES ---
// Debe ser lo PRIMERO que ocurra
protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'app-image', 
    privileges: { 
      standard: true, 
      secure: true, 
      supportFetchAPI: true, 
      bypassCSP: true,
      corsEnabled: true,
      stream: true
    } 
  }
]);

app.whenReady().then(() => {
  // Manejador para el protocolo app-image://
  protocol.handle('app-image', (request) => {
    try {
      let filePath = request.url.replace(/^app-image:\/\//, '');
      filePath = decodeURIComponent(filePath);
      filePath = filePath.replace(/\\/g, '/');
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }
      console.log(`[App-Image] Cargando: ${filePath}`);
      return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
      console.error('[App-Image] Error:', error);
      return new Response('Error', { status: 500 });
    }
  });

  createWindow();

  // --- CONFIGURACIÓN DE AUTO-UPDATER ---
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  autoUpdater.on('update-available', () => {
    console.log('[Auto-Update] Nueva versión disponible.');
    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización disponible',
      message: 'Hay una nueva versión de GoWash POS disponible. Se descargará en segundo plano.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('[Auto-Update] Versión descargada, lista para instalar.');
    // Forzar backup antes de instalar la actualización
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.executeJavaScript(`
        (function() {
          try {
            const keys = Object.keys(localStorage);
            const data = {};
            keys.forEach(k => { data[k] = localStorage.getItem(k); });
            return JSON.stringify(data);
          } catch(e) { return null; }
        })()
      `).then((result) => {
        if (result) {
          try {
            const parsed = JSON.parse(result);
            saveBackup(parsed);
            console.log('[Auto-Update] Backup pre-actualización guardado.');
          } catch(e) { /* ignore */ }
        }
      }).catch(() => {});
    }

    dialog.showMessageBox({
      type: 'info',
      title: 'Actualización lista',
      message: '¡La actualización fue descargada! La aplicación se reiniciará para instalarla. Tus datos están respaldados.',
      buttons: ['Reiniciar ahora', 'Más tarde']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[Auto-Update] Error en la actualización:', err);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- LÓGICA DE LICENCIA ---

// Obtener el ID de la máquina
ipcMain.handle('get-machine-id', () => {
  try {
    return machineIdSync();
  } catch (e) {
    return 'UNKNOWN-ID';
  }
});

// Validar una clave
ipcMain.handle('validate-license', (event, licenseKey) => {
  const id = machineIdSync();
  const cleanKey = licenseKey.trim().toUpperCase();
  
  const expectedKey = crypto
    .createHmac('sha256', MASTER_SECRET)
    .update(id)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();
  
  console.log(`[Licencia] ID Máquina: ${id}`);
  console.log(`[Licencia] Clave recibida: "${cleanKey}"`);
  console.log(`[Licencia] Clave esperada: "${expectedKey}"`);
  
  // CLAVE MAESTRA DE EMERGENCIA
  if (cleanKey === 'GOWASH-ADMIN-2026-99') return true;

  return cleanKey === expectedKey;
});

// --- LÓGICA DE IMÁGENES ---

// Abrir diálogo para seleccionar una imagen y subirla a Google Drive
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg', 'webp', 'jfif', 'avif'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const normalizedPath = result.filePaths[0].replace(/\\/g, '/');
  return `app-image://${normalizedPath}`;
});

// Subir imagen a Google Drive y retornar URL pública
ipcMain.handle('upload-image-to-drive', async (event, { filePath, fileName, folderId }) => {
  try {
    const { google } = await import('googleapis');

    const CREDENTIALS = {
      client_email: "gowash-sync@gowash-db-496413.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n",
    };

    const auth = new google.auth.JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Determinar origen de la imagen: archivo local o base64
    let fileContent;
    let mimeType = 'image/jpeg';

    if (filePath.startsWith('data:image')) {
      const matches = filePath.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileContent = Buffer.from(matches[2], 'base64');
      } else {
        throw new Error('Formato base64 inválido');
      }
    } else {
      fileContent = fs.readFileSync(filePath);
      mimeType = filePath.match(/\.(png)$/i) ? 'image/png' :
                 filePath.match(/\.(webp)$/i) ? 'image/webp' : 'image/jpeg';
    }

    // Subir a Drive en la carpeta especificada
    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: require('stream').Readable.from(fileContent),
      },
      fields: 'id, name',
    });

    const fileId = uploadRes.data.id;

    // Hacer el archivo público
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    console.log(`[Drive Upload] Subido: ${fileName} → ${imageUrl}`);
    return { success: true, fileId, imageUrl };

  } catch (error) {
    console.error('[Drive Upload] Error:', error.message);
    return { success: false, error: error.message };
  }
});

// --- LÓGICA DE GOOGLE SHEETS ---
const googleSheets = require('./googleSheets.cjs');

ipcMain.handle('google-sheets-init', async (event, spreadsheetId) => {
  try {
    await googleSheets.initialize(spreadsheetId);
    return { success: true };
  } catch (error) {
    console.error('[GoogleSheets] Error de inicialización:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-add-row', async (event, { sheetTitle, data }) => {
  try {
    return await googleSheets.addRow(sheetTitle, data);
  } catch (error) {
    console.error('[GoogleSheets] Error al añadir fila:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-get-rows', async (event, sheetTitle) => {
  try {
    const data = await googleSheets.getRows(sheetTitle);
    return { success: true, data };
  } catch (error) {
    console.error('[GoogleSheets] Error al obtener filas:', error.message);
    return { success: false, error: error.message };
  }
});

// Handler para leer vehiculos-data.json directamente con fs (funciona en Electron producción)
ipcMain.handle('get-vehiculos-data', async () => {
  try {
    // En producción, buscar en la carpeta dist/ (empaquetada con asar)
    const jsonPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar', 'dist', 'vehiculos-data.json')
      : path.join(__dirname, '../public/vehiculos-data.json');
    
    // Intentar también la ruta alternativa sin asar
    const jsonPathAlt = app.isPackaged
      ? path.join(process.resourcesPath, 'dist', 'vehiculos-data.json')
      : path.join(__dirname, '../public/vehiculos-data.json');

    let rawData = null;
    
    if (fs.existsSync(jsonPath)) {
      rawData = fs.readFileSync(jsonPath, 'utf-8');
      console.log('[Vehiculos] Cargado desde:', jsonPath);
    } else if (fs.existsSync(jsonPathAlt)) {
      rawData = fs.readFileSync(jsonPathAlt, 'utf-8');
      console.log('[Vehiculos] Cargado desde (alt):', jsonPathAlt);
    } else {
      console.error('[Vehiculos] No se encontró vehiculos-data.json en:', jsonPath);
      return { success: false, error: 'Archivo no encontrado' };
    }

    const data = JSON.parse(rawData);
    return { success: true, data };
  } catch (error) {
    console.error('[Vehiculos] Error leyendo JSON:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-delete-row', async (event, { sheetTitle, searchColumn, searchValue }) => {
  try {
    return await googleSheets.deleteRow(sheetTitle, searchColumn, searchValue);
  } catch (error) {
    console.error('[GoogleSheets] Error al borrar fila:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-update-row', async (event, { sheetTitle, searchColumn, searchValue, newData }) => {
  try {
    return await googleSheets.updateRow(sheetTitle, searchColumn, searchValue, newData);
  } catch (error) {
    console.error('[GoogleSheets] Error al actualizar fila:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-clear-sheet', async (event, sheetTitle) => {
  try {
    return await googleSheets.clearSheet(sheetTitle);
  } catch (error) {
    console.error('[GoogleSheets] Error al limpiar hoja:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google-sheets-write-sheet', async (event, { sheetTitle, data }) => {
  try {
    return await googleSheets.writeSheet(sheetTitle, data);
  } catch (error) {
    console.error('[GoogleSheets] Error al escribir hoja:', error.message);
    return { success: false, error: error.message };
  }
});

// Nuevo: Seleccionar y guardar archivo de credenciales
ipcMain.handle('google-sheets-upload-creds', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Credentials', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) return { success: false };

  try {
    const sourcePath = result.filePaths[0];
    const destPath = path.join(app.getPath('userData'), 'google-credentials.json');
    
    // Copiamos el archivo a la carpeta de datos de la app
    const fs = require('fs');
    fs.copyFileSync(sourcePath, destPath);
    
    return { success: true };
  } catch (error) {
    console.error('[GoogleSheets] Error al guardar credenciales:', error);
    return { success: false, error: error.message };
  }
});

// --- IPC HANDLERS PARA BACKUP DE DATOS ---
ipcMain.handle('backup-save', async (event, data) => {
  return saveBackup(data);
});

ipcMain.handle('backup-load', async () => {
  return loadBackup();
});
