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
    // Rutas de fallback por si el usuario sube un archivo externo (opcional)
    this.possiblePaths = [
      path.join(app.getPath('userData'), 'google-credentials.json'),
      path.join(process.cwd(), 'google-credentials.json'),
      path.join(path.dirname(process.execPath), 'google-credentials.json'),
      path.join(__dirname, '..', 'google-credentials.json')
    ];
  }

  /**
   * Inicializa la conexión con el spreadsheet
   * @param {string} spreadsheetId ID del documento de Google Sheets
   */
  async initialize(spreadsheetId) {
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

    this.doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await this.doc.loadInfo();
    console.log(`[GoogleSheets] Conectado a: ${this.doc.title}`);
  }

  /**
   * Añade una fila a una hoja específica
   * @param {string} sheetTitle Nombre de la pestaña (Hoja)
   * @param {object} data Objeto con los datos de la fila
   */
  async addRow(sheetTitle, data) {
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    
    let sheet = this.doc.sheetsByTitle[sheetTitle];
    
    // Si la hoja no existe, intentamos crearla o usamos la primera
    if (!sheet) {
      console.log(`[GoogleSheets] La hoja "${sheetTitle}" no existe. Creándola...`);
      sheet = await this.doc.addSheet({ title: sheetTitle, headerValues: Object.keys(data) });
    }

    await sheet.addRow(data);
    return { success: true };
  }

  /**
   * Obtiene todas las filas de una hoja
   * @param {string} sheetTitle Nombre de la pestaña
   */
  async getRows(sheetTitle) {
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) return [];
    
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  }

  /**
   * Borra una fila buscando por una columna y valor específico
   */
  async deleteRow(sheetTitle, searchColumn, searchValue, extraOptions = null) {
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };

    const rows = await sheet.getRows();
    let rowToDelete;
    if (sheetTitle === 'PWA_Vehiculos' && extraOptions && extraOptions.model) {
      rowToDelete = rows.find(row => row.get('Marca') == searchValue && row.get('Modelo') == extraOptions.model);
    } else {
      rowToDelete = rows.find(row => row.get(searchColumn) == searchValue);
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
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };

    const rows = await sheet.getRows();
    let rowToUpdate;
    if (sheetTitle === 'PWA_Vehiculos') {
      const brand = newData.Marca || newData.brand || searchValue;
      const model = newData.Modelo || newData.model;
      rowToUpdate = rows.find(row => row.get('Marca') == brand && row.get('Modelo') == model);
    } else {
      rowToUpdate = rows.find(row => row.get(searchColumn) == searchValue);
    }

    if (rowToUpdate) {
      // Actualizamos los valores usando rowToUpdate.set() para compatibilidad con google-spreadsheet v5
      for (const [key, value] of Object.entries(newData)) {
        rowToUpdate.set(key, value);
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
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    
    let sheet = this.doc.sheetsByTitle[sheetTitle];
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
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    if (!data || data.length === 0) return { success: false, error: 'Sin datos para escribir' };

    let sheet = this.doc.sheetsByTitle[sheetTitle];
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
