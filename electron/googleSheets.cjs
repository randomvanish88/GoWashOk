const { app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Manejador de Google Sheets para GoWash
 */
class GoogleSheetsHandler {
  constructor() {
    this.doc = null;
    // Buscamos en varios lugares, incluyendo la carpeta de datos de la aplicación
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
    // IMPORTANTE: Carga dinámica para evitar error ERR_REQUIRE_ESM
    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const { JWT } = await import('google-auth-library');

    let finalPath = '';
    for (const p of this.possiblePaths) {
      if (fs.existsSync(p)) {
        finalPath = p;
        break;
      }
    }

    if (!finalPath) {
      throw new Error('Archivo google-credentials.json no encontrado. Asegúrate de ponerlo en la carpeta del programa.');
    }

    const creds = JSON.parse(fs.readFileSync(finalPath));
    
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
  async deleteRow(sheetTitle, searchColumn, searchValue) {
    if (!this.doc) throw new Error('Google Sheets no inicializado.');
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.get(searchColumn) == searchValue);

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
    const rowToUpdate = rows.find(row => row.get(searchColumn) == searchValue);

    if (rowToUpdate) {
      // Actualizamos los valores
      Object.assign(rowToUpdate, newData);
      await rowToUpdate.save();
      return { success: true };
    }
    return { success: false, error: 'Fila no encontrada' };
  }
}

module.exports = new GoogleSheetsHandler();
