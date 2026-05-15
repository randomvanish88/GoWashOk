/**
 * Utilidad para sincronizar datos con Google Sheets desde el Renderer
 */

const SPREADSHEET_ID_KEY = 'gowash-google-sheet-id';

export const googleSheetsSync = {
  /**
   * Inicializa la conexión con el ID guardado
   */
  async init() {
    const sheetId = localStorage.getItem(SPREADSHEET_ID_KEY);
    if (!sheetId) {
      console.warn('[GoogleSheetsSync] No hay ID de Spreadsheet configurado.');
      return false;
    }

    try {
      // @ts-ignore (electronAPI is injected via preload)
      const result = await window.electronAPI.googleSheets.init(sheetId);
      if (result.success) {
        console.log('[GoogleSheetsSync] Conexión establecida correctamente.');
        return { success: true };
      } else {
        console.error('[GoogleSheetsSync] Error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('[GoogleSheetsSync] Error de inicialización:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  /**
   * Sincroniza una venta
   */
  async syncVenta(venta: any) {
    if (!localStorage.getItem(SPREADSHEET_ID_KEY)) return;

    const data = {
      Fecha: venta.fecha || new Date().toLocaleString(),
      Cliente: venta.cliente || 'Consumidor Final',
      Vehiculo: venta.vehiculo || '',
      Tipo: venta.tipo || '',
      Total: venta.total || 0,
      Metodo: venta.metodo || 'Efectivo',
      Vendedor: venta.vendedor || 'Admin',
      ID: venta.id || Date.now().toString()
    };

    try {
      // @ts-ignore
      await window.electronAPI.googleSheets.addRow('Ventas', data);
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando venta:', error);
    }
  },

  /**
   * Sincroniza la actualización de una venta
   */
  async syncUpdateVenta(venta: any) {
    if (!localStorage.getItem(SPREADSHEET_ID_KEY)) return;

    try {
      const data = {
        Fecha: venta.fecha || '',
        Hora_Entrada: venta.horaEntrada || '',
        Hora_Salida: venta.horaSalida || '',
        Empleado: venta.empleado || '',
        Patente: venta.patente || '',
        Cliente: venta.cliente || '',
        Numero_Cliente: venta.numeroCliente || '',
        Vehiculo: venta.marca ? `${venta.marca} ${venta.modelo}` : '',
        Servicio: venta.servicio || '',
        Lavado: venta.lavado || 0,
        Bar: venta.bar || 0,
        Cosmeticos: venta.cosmeticos || 0,
        Descuento: venta.descuento || 0,
        Estadia: venta.estadia ? 'Sí' : 'No',
        Total: venta.total || 0,
        Metodo_Pago: venta.metodoPago || '',
        ID: venta.id || ''
      };

      // @ts-ignore
      await window.electronAPI.googleSheets.updateRow('Ventas', 'ID', venta.id, data);
      console.log('[GoogleSheetsSync] Venta actualizada en Sheets.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error actualizando venta:', error);
    }
  },

  /**
   * Sincroniza un gasto
   */
  async syncGasto(gasto: any) {
    if (!localStorage.getItem(SPREADSHEET_ID_KEY)) return;

    const data = {
      Fecha: gasto.fecha || new Date().toLocaleString(),
      Concepto: gasto.concepto || '',
      Monto: gasto.monto || 0,
      Categoria: gasto.categoria || 'General',
      ID: gasto.id || Date.now().toString()
    };

    try {
      // @ts-ignore
      await window.electronAPI.googleSheets.addRow('Gastos', data);
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando gasto:', error);
    }
  },

  /**
   * Sincroniza una anulación (Borra de Ventas y mueve a Ventas Anuladas)
   */
  async syncAnulacion(anulada: any) {
    if (!localStorage.getItem(SPREADSHEET_ID_KEY)) return;

    try {
      // 1. Borrar de la pestaña "Ventas" buscando por el ID
      // @ts-ignore
      await window.electronAPI.googleSheets.deleteRow('Ventas', 'ID', anulada.id);

      // 2. Añadir a la pestaña "Ventas Anuladas"
      const data = {
        Fecha_Original: anulada.fecha || '',
        Fecha_Anulacion: anulada.fechaAnulacion || new Date().toLocaleString(),
        Patente: anulada.patente || '',
        Cliente: anulada.cliente || '',
        Monto: anulada.total || 0,
        Motivo: anulada.motivoAnulacion || '',
        Empleado: anulada.empleado || '',
        ID: anulada.id || ''
      };
      
      // @ts-ignore
      await window.electronAPI.googleSheets.addRow('Ventas Anuladas', data);
      console.log('[GoogleSheetsSync] Anulación sincronizada.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando anulación:', error);
    }
  },

  /**
   * Guarda el ID del Spreadsheet (limpia la URL si el usuario pega todo)
   */
  setSpreadsheetId(id: string) {
    let cleanId = id.trim();
    
    // Si el usuario pegó la URL completa, extraemos solo el ID
    if (cleanId.includes('/d/')) {
      const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }
    
    localStorage.setItem(SPREADSHEET_ID_KEY, cleanId);
    return this.init();
  },

  /**
   * Obtiene el ID actual
   */
  getSpreadsheetId() {
    return localStorage.getItem(SPREADSHEET_ID_KEY);
  },

  /**
   * Sube el archivo de credenciales
   */
  async uploadCredentials() {
    try {
      // @ts-ignore
      const result = await window.electronAPI.googleSheets.uploadCredentials();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
