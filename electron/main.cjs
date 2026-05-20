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
    // Intentamos cargar el puerto por defecto de Vite (5173)
    win.loadURL('http://localhost:5173');
    
    // win.webContents.openDevTools(); 
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

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
      // Extraer la ruta
      let filePath = request.url.replace(/^app-image:\/\//, '');
      filePath = decodeURIComponent(filePath);
      
      // Limpiar ruta para Windows
      filePath = filePath.replace(/\\/g, '/'); // Convertir \ a /
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

// Abrir diálogo para seleccionar una imagen
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg', 'webp'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  // Normalizamos la ruta para usar barras diagonales (/) que son más seguras en URLs
  const normalizedPath = result.filePaths[0].replace(/\\/g, '/');
  
  // Retornamos la ruta con el prefijo de nuestro protocolo
  return `app-image://${normalizedPath}`;
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
    return await googleSheets.getRows(sheetTitle);
  } catch (error) {
    console.error('[GoogleSheets] Error al obtener filas:', error.message);
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
