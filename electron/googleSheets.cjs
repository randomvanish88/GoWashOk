const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// Credenciales embebidas — no requiere archivo externo en la PC de producción
const EMBEDDED_CREDENTIALS = {
  type: "service_account",
  project_id: "gowash-db-496413",
  private_key_id: "f6d0c0f05f12ea9b752d05db3b38ef336a4cc735",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n",
  client_email: "gowash-sync@gowash-db-496413.iam.gserviceaccount.com",
  client_id: "107095811744069109144",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/gowash-sync%40gowash-db-496413.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

/**
 * Manejador de Google Sheets para GoWash
 */
class GoogleSheetsHandler {
  constructor() {
    this.doc = null;
    this.initPromise = null;
    this.currentSpreadsheetId = null;
    // Rutas de fallback por si el usuario sube un archivo externo (opcional)
    this.possiblePaths = [
      path.join(app.getPath('userData'), 'google-credentials.json'),
      path.join(process.cwd(), 'google-credentials.json'),
      path.join(path.dirname(process.execPath), 'google-credentials.json'),
      path.join(__dirname, '..', 'google-credentials.json')
    ];
  }

  /**
   * Obtiene una hoja por su título de forma insensible a mayúsculas/minúsculas
   * @param {string} sheetTitle Nombre de la pestaña
   */
  getSheet(sheetTitle) {
    if (!sheetTitle || !this.doc) return null;
    // 1. Intentar coincidencia exacta
    let sheet = this.doc.sheetsByTitle[sheetTitle];
    if (sheet) return sheet;
    // 2. Intentar coincidencia case-insensitive
    const lowerTitle = sheetTitle.toLowerCase();
    sheet = this.doc.sheetsByIndex.find(s => s.title.toLowerCase() === lowerTitle);
    return sheet || null;
  }

  async ensureDoc() {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    if (this.doc) return;

    console.log('[GoogleSheets] Documento no inicializado. Inicializando automáticamente desde config...');
    let spreadsheetId = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
    try {
      const configPath = path.join(app.getPath('userData'), 'gowash-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config && config.spreadsheetId) {
          spreadsheetId = config.spreadsheetId;
          console.log(`[GoogleSheets] ID de spreadsheet recuperado de config: ${spreadsheetId}`);
        }
      }
    } catch (e) {
      console.warn('[GoogleSheets] No se pudo leer gowash-config.json:', e.message);
    }
    await this.initialize(spreadsheetId);
  }

  /**
   * Inicializa la conexión con el spreadsheet
   * @param {string} spreadsheetId ID del documento de Google Sheets
   */
  async initialize(spreadsheetId) {
    if (this.doc && this.currentSpreadsheetId === spreadsheetId) {
      return;
    }

    if (this.currentSpreadsheetId === spreadsheetId && this.initPromise) {
      await this.initPromise;
      return;
    }

    this.currentSpreadsheetId = spreadsheetId;
    this.doc = null; // Resetear doc anterior

    this.initPromise = this._doInitialize(spreadsheetId);
    try {
      await this.initPromise;
    } catch (e) {
      this.initPromise = null;
      this.currentSpreadsheetId = null;
      throw e;
    }
  }

  async _doInitialize(spreadsheetId) {
    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const { JWT } = await import('google-auth-library');

    // Primero intentamos usar las credenciales embebidas
    let creds = EMBEDDED_CREDENTIALS;

    // Si existe un archivo externo, lo usamos en su lugar (permite sobreescribir)
    for (const p of this.possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          creds = JSON.parse(fs.readFileSync(p));
          console.log(`[GoogleSheets] Usando credenciales externas: ${p}`);
        } catch (e) {
          console.warn(`[GoogleSheets] No se pudo leer ${p}, usando credenciales embebidas.`);
        }
        break;
      }
    }

    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`[GoogleSheets] Conectado a: ${doc.title}`);

    this.doc = doc;

    // Guardar ID en la configuración para auto-inicializaciones futuras
    try {
      const configPath = path.join(app.getPath('userData'), 'gowash-config.json');
      fs.writeFileSync(configPath, JSON.stringify({ spreadsheetId }), 'utf8');
      console.log('[GoogleSheets] ID de spreadsheet guardado en gowash-config.json');
    } catch (e) {
      console.warn('[GoogleSheets] Error al guardar config:', e.message);
    }
  }

  /**
   * Añade una fila a una hoja específica
   * @param {string} sheetTitle Nombre de la pestaña (Hoja)
   * @param {object} data Objeto con los datos de la fila
   */
  async addRow(sheetTitle, data) {
    await this.ensureDoc();
    
    let sheet = this.getSheet(sheetTitle);
    
    // Si la hoja no existe, intentamos crearla o usamos la primera
    if (!sheet) {
      console.log(`[GoogleSheets] La hoja "${sheetTitle}" no existe. Creándola...`);
      sheet = await this.doc.addSheet({ title: sheetTitle, headerValues: Object.keys(data) });
    } else {
      // Validar si los encabezados en Google Sheets son correctos o si la hoja está corrupta
      try {
        const expectedHeaders = Object.keys(data);
        
        // Cargar los encabezados reales de la hoja antes de acceder a sheet.headerValues
        await sheet.loadHeaderRow();
        
        const currentHeaders = sheet.headerValues || [];
        const firstKey = expectedHeaders[0];
        const firstHeader = currentHeaders[0] || '';
        
        if (currentHeaders.length === 0 || firstHeader.trim().toLowerCase() !== firstKey.trim().toLowerCase()) {
          console.log(`[GoogleSheets] Encabezados de "${sheetTitle}" corruptos o ausentes. Restableciendo...`);
          await sheet.setHeaderRow(expectedHeaders);
        }
      } catch (err) {
        console.warn(`[GoogleSheets] Advertencia al verificar/corregir encabezados de "${sheetTitle}":`, err.message);
        // Si no se pudieron cargar los encabezados o están corruptos, forzamos la configuración
        try {
          const expectedHeaders = Object.keys(data);
          await sheet.setHeaderRow(expectedHeaders);
        } catch (setErr) {
          console.error(`[GoogleSheets] Error crítico al intentar forzar encabezados de "${sheetTitle}":`, setErr.message);
        }
      }
    }

    await sheet.addRow(data);
    return { success: true };
  }

  /**
   * Obtiene todas las filas de una hoja
   * @param {string} sheetTitle Nombre de la pestaña
   */
  async getRows(sheetTitle) {
    await this.ensureDoc();
    let sheet = this.getSheet(sheetTitle);
    if (!sheet && sheetTitle.startsWith('PRUEBA-')) {
      const fallbackTitle = sheetTitle.substring(7); // remove 'PRUEBA-'
      console.log(`[GoogleSheets] Hoja "${sheetTitle}" no encontrada, intentando fallback a "${fallbackTitle}"...`);
      sheet = this.getSheet(fallbackTitle);
    }
    if (!sheet) {
      console.warn(`[GoogleSheets] Hoja "${sheetTitle}" no encontrada en el spreadsheet.`);
      return [];
    }
    
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  }

  /**
   * Borra una fila buscando por una columna y valor específico
   */
  async deleteRow(sheetTitle, searchColumn, searchValue, extraOptions = null) {
    await this.ensureDoc();
    const sheet = this.getSheet(sheetTitle);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };

    const rows = await sheet.getRows();
    let rowToDelete;
    if (sheet.title.toLowerCase() === 'pwa_vehiculos' && extraOptions && extraOptions.model) {
      rowToDelete = rows.find(row => {
        const keys = Object.keys(row.toObject());
        const brandKey = keys.find(k => k.toLowerCase() === 'marca') || 'Marca';
        const modelKey = keys.find(k => k.toLowerCase() === 'modelo') || 'Modelo';
        return row.get(brandKey) == searchValue && row.get(modelKey) == extraOptions.model;
      });
    } else {
      rowToDelete = rows.find(row => {
        const keys = Object.keys(row.toObject());
        const colKey = keys.find(k => k.toLowerCase() === searchColumn.toLowerCase()) || searchColumn;
        return row.get(colKey) == searchValue;
      });
    }

    if (rowToDelete) {
      await rowToDelete.delete();
      return { success: true };
    }
    return { success: false, error: 'Fila no encontrada' };
  }

  /**
   * Actualiza una fila buscando por una columna y valor específico
   */
  async updateRow(sheetTitle, searchColumn, searchValue, newData) {
    await this.ensureDoc();
    const sheet = this.getSheet(sheetTitle);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };

    const rows = await sheet.getRows();
    let rowToUpdate;
    if (sheet.title.toLowerCase() === 'pwa_vehiculos') {
      const keys = Object.keys(newData);
      const brandKey = keys.find(k => k.toLowerCase() === 'marca') || 'Marca';
      const modelKey = keys.find(k => k.toLowerCase() === 'modelo') || 'Modelo';
      const brand = newData[brandKey] || newData.brand || searchValue;
      const model = newData[modelKey] || newData.model;
      
      rowToUpdate = rows.find(row => {
        const rKeys = Object.keys(row.toObject());
        const rBrandKey = rKeys.find(k => k.toLowerCase() === 'marca') || 'Marca';
        const rModelKey = rKeys.find(k => k.toLowerCase() === 'modelo') || 'Modelo';
        return row.get(rBrandKey) == brand && row.get(rModelKey) == model;
      });
    } else {
      rowToUpdate = rows.find(row => {
        const rKeys = Object.keys(row.toObject());
        const rColKey = rKeys.find(k => k.toLowerCase() === searchColumn.toLowerCase()) || searchColumn;
        return row.get(rColKey) == searchValue;
      });
    }

    if (rowToUpdate) {
      const existingKeys = Object.keys(rowToUpdate.toObject());
      for (const [key, value] of Object.entries(newData)) {
        const matchingKey = existingKeys.find(k => k.toLowerCase() === key.toLowerCase()) || key;
        rowToUpdate.set(matchingKey, value);
      }
      await rowToUpdate.save();
      return { success: true };
    }
    return { success: false, error: 'Fila no encontrada' };
  }

  /**
   * Limpia todas las filas de una hoja (mantiene los headers)
   * @param {string} sheetTitle Nombre de la pestaña
   */
  async clearSheet(sheetTitle) {
    await this.ensureDoc();
    
    let sheet = this.getSheet(sheetTitle);
    if (!sheet) {
      console.log(`[GoogleSheets] La hoja "${sheetTitle}" no existe. Creándola...`);
      sheet = await this.doc.addSheet({ title: sheetTitle });
      return { success: true };
    }

    await sheet.clearRows();
    return { success: true };
  }

  /**
   * Escribe datos en una hoja (headers + filas)
   * @param {string} sheetTitle Nombre de la pestaña
   * @param {array} data Array de arrays: primera fila son headers, resto son datos
   */
  async writeSheet(sheetTitle, data) {
    await this.ensureDoc();
    if (!data || data.length === 0) return { success: false, error: 'Sin datos para escribir' };

    let sheet = this.getSheet(sheetTitle);
    const headers = data[0];
    
    // Si la hoja no existe, la creamos con los headers
    if (!sheet) {
      console.log(`[GoogleSheets] La hoja "${sheetTitle}" no existe. Creándola...`);
      sheet = await this.doc.addSheet({ title: sheetTitle, headerValues: headers });
    } else {
      // Si existe, limpiamos primero todas las filas
      console.log(`[GoogleSheets] Limpiando filas en hoja: ${sheetTitle}`);
      await sheet.clearRows();
      // Actualizamos los headers si es necesario
      await sheet.setHeaderRow(headers);
    }

    // Preparamos los objetos de fila
    const rowObjs = [];
    for (let i = 1; i < data.length; i++) {
      const rowData = data[i];
      const rowObj = {};
      
      headers.forEach((header, idx) => {
        rowObj[header] = rowData[idx] || '';
      });
      rowObjs.push(rowObj);
    }

    if (rowObjs.length > 0) {
      console.log(`[GoogleSheets] Escribiendo ${rowObjs.length} filas en hoja: ${sheetTitle}`);
      await sheet.addRows(rowObjs);
    }

    return { success: true, rowsWritten: data.length - 1 };
  }
}

module.exports = new GoogleSheetsHandler();
