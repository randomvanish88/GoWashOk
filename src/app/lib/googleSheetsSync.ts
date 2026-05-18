/**
 * Utilidad para sincronizar datos con Google Sheets desde el Renderer
 */

const SPREADSHEET_ID_KEY = 'gowash-google-sheet-id';
const TEST_SPREADSHEET_ID_KEY = 'gowash-google-sheet-id-test';
const TEST_MODE_KEY = 'gowash-test-mode';

export const googleSheetsSync = {
  /**
   * Inicializa la conexión con el ID guardado (y el de prueba si aplica)
   */
  async init() {
    const isTest = this.isTestMode();
    const prodId = localStorage.getItem(SPREADSHEET_ID_KEY);
    const testId = localStorage.getItem(TEST_SPREADSHEET_ID_KEY);
    
    const activeId = isTest ? (testId || prodId) : prodId;

    if (!activeId) {
      console.warn('[GoogleSheetsSync] No hay ID de Spreadsheet configurado.');
      return false;
    }

    try {
      // @ts-ignore (electronAPI is injected via preload)
      const result = await window.electronAPI.googleSheets.init(activeId);
      if (result.success) {
        console.log(`[GoogleSheetsSync] Conexión establecida (${isTest ? 'MODO PRUEBA' : 'MODO PROD'}).`);
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
   * Obtiene el nombre de la hoja (pestaña) con prefijo si está en modo prueba
   */
  getSheetName(baseName: string) {
    if (this.isTestMode()) {
      return `PRUEBA-${baseName}`;
    }
    return baseName;
  },

  /**
   * Sincroniza una venta
   */
  async syncVenta(venta: any) {
    if (!this.getSpreadsheetId()) return;

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
      await window.electronAPI.googleSheets.addRow(this.getSheetName('Ventas'), data);
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando venta:', error);
    }
  },

  /**
   * Sincroniza la actualización de una venta
   */
  async syncUpdateVenta(venta: any) {
    if (!this.getSpreadsheetId()) return;

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
      await window.electronAPI.googleSheets.updateRow(this.getSheetName('Ventas'), 'ID', venta.id, data);
      console.log('[GoogleSheetsSync] Venta actualizada en Sheets.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error actualizando venta:', error);
    }
  },

  /**
   * Registra el cierre de caja del día en Google Sheets
   */
  async syncCierreCaja(cierre: {
    id: string;
    fecha: string;
    horaCierre: string;
    totalEfectivoSistema: number;
    totalContado: number;
    diferencia: number;
    totalGeneral: number;
    cantidadVentas: number;
    detalleMetodos: { metodo: string; total: number; cantidad: number }[];
    detalleBilletes: { valor: number; cantidad: number; subtotal: number }[];
    empleado?: string;
  }) {
    if (!this.getSpreadsheetId()) {
      return { success: false, error: 'No hay hoja de Google configurada.' };
    }

    const detalleMetodosTexto = cierre.detalleMetodos
      .filter((m) => m.cantidad > 0)
      .map((m) => `${m.metodo}: ${m.cantidad} venta(s) — $${m.total.toLocaleString('es-AR')}`)
      .join(' | ');

    const detalleBilletesTexto = cierre.detalleBilletes
      .filter((b) => b.cantidad > 0)
      .map((b) => `$${b.valor}×${b.cantidad}=${b.subtotal}`)
      .join(' | ');

    const data = {
      Fecha: cierre.fecha,
      Hora_Cierre: cierre.horaCierre,
      Total_Efectivo_Sistema: cierre.totalEfectivoSistema,
      Total_Contado: cierre.totalContado,
      Diferencia: cierre.diferencia,
      Total_General: cierre.totalGeneral,
      Cantidad_Ventas: cierre.cantidadVentas,
      Detalle_Metodos: detalleMetodosTexto,
      Detalle_Billetes: detalleBilletesTexto,
      Empleado: cierre.empleado || '',
      ID: cierre.id,
    };

    try {
      // @ts-ignore
      const result = await window.electronAPI.googleSheets.addRow(
        this.getSheetName('Cierres Caja'),
        data
      );
      if (result?.success === false) {
        return { success: false, error: result.error || 'Error al guardar en Sheets' };
      }
      console.log('[GoogleSheetsSync] Cierre de caja sincronizado.');
      return { success: true };
    } catch (error: any) {
      console.error('[GoogleSheetsSync] Error sincronizando cierre:', error);
      return { success: false, error: error?.message || 'Error de conexión' };
    }
  },

  /**
   * Sincroniza un gasto
   */
  async syncGasto(gasto: any) {
    if (!this.getSpreadsheetId()) return;

    const data = {
      Fecha: gasto.fecha || new Date().toLocaleString(),
      Concepto: gasto.concepto || '',
      Monto: gasto.monto || 0,
      Categoria: gasto.categoria || 'General',
      ID: gasto.id || Date.now().toString()
    };

    try {
      // @ts-ignore
      await window.electronAPI.googleSheets.addRow(this.getSheetName('Gastos'), data);
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando gasto:', error);
    }
  },

  /**
   * Sincroniza una anulación (Borra de Ventas y mueve a Ventas Anuladas)
   */
  async syncAnulacion(anulada: any) {
    if (!this.getSpreadsheetId()) return;

    try {
      // 1. Borrar de la pestaña "Ventas" buscando por el ID
      // @ts-ignore
      await window.electronAPI.googleSheets.deleteRow(this.getSheetName('Ventas'), 'ID', anulada.id);

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
      await window.electronAPI.googleSheets.addRow(this.getSheetName('Ventas Anuladas'), data);
      console.log('[GoogleSheetsSync] Anulación sincronizada.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando anulación:', error);
    }
  },

  /**
   * Manejo de IDs
   */
  setSpreadsheetId(id: string) {
    const cleanId = this.cleanId(id);
    localStorage.setItem(SPREADSHEET_ID_KEY, cleanId);
    return this.init();
  },

  getSpreadsheetId() {
    return localStorage.getItem(SPREADSHEET_ID_KEY);
  },

  setTestSpreadsheetId(id: string) {
    const cleanId = this.cleanId(id);
    localStorage.setItem(TEST_SPREADSHEET_ID_KEY, cleanId);
    if (this.isTestMode()) return this.init();
    return Promise.resolve({ success: true });
  },

  getTestSpreadsheetId() {
    return localStorage.getItem(TEST_SPREADSHEET_ID_KEY) || '';
  },

  isTestMode() {
    return localStorage.getItem(TEST_MODE_KEY) === 'true';
  },

  setTestMode(active: boolean) {
    localStorage.setItem(TEST_MODE_KEY, active ? 'true' : 'false');
    return this.init();
  },

  cleanId(id: string) {
    let clean = id.trim();
    if (clean.includes('/d/')) {
      const match = clean.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) clean = match[1];
    }
    return clean;
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

