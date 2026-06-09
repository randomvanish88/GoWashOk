/**
 * Utilidad para sincronizar datos con Google Sheets desde el Renderer
 * Soporta modo Electron (IPC) y modo Web (Vercel Serverless Function)
 */

const SPREADSHEET_ID_KEY = 'gowash-google-sheet-id';
const TEST_SPREADSHEET_ID_KEY = 'gowash-google-sheet-id-test';
const TEST_MODE_KEY = 'gowash-test-mode';

// ID por defecto embebido
const DEFAULT_SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';

export const googleSheetsSync = {
  /**
   * Inicializa la conexión con el ID guardado
   */
  async init() {
    const isTest = this.isTestMode();
    const prodId = localStorage.getItem(SPREADSHEET_ID_KEY) || DEFAULT_SPREADSHEET_ID;
    const testId = localStorage.getItem(TEST_SPREADSHEET_ID_KEY);
    
    const activeId = isTest ? (testId || prodId) : prodId;

    if (!activeId) {
      console.warn('[GoogleSheetsSync] No hay ID de Spreadsheet configurado.');
      return false;
    }

    // Si no estamos en Electron, en la web siempre está "conectado" a través del API Proxy
    if (typeof window === 'undefined' || !(window as any).electronAPI?.googleSheets) {
      console.log(`[GoogleSheetsSync] Modo Web detectado. Conexión simulada con Sheets.`);
      return { success: true };
    }

    try {
      // @ts-ignore
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
   * Obtiene el nombre de la hoja con prefijo si está en modo prueba
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

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets) {
        // En Electron
        const data = {
          Fecha: venta.fecha || '',
          Hora_Entrada: venta.horaEntrada || venta.hora || '',
          Hora_Salida: venta.horaSalida || '',
          Empleado: venta.empleado || '',
          Patente: venta.patente || '',
          Cliente: venta.cliente || '',
          Numero_Cliente: venta.numeroCliente || '',
          Vehiculo: venta.vehiculo || (venta.marca ? `${venta.marca} ${venta.modelo}` : ''),
          Servicio: venta.servicio || '',
          Lavado: venta.lavado || 0,
          Bar: venta.bar || 0,
          Cosmeticos: venta.cosmeticos || 0,
          Descuento: venta.descuento || 0,
          Estadia: venta.estadia ? 'Sí' : 'No',
          Total: venta.total || 0,
          Metodo_Pago: venta.metodoPago || '',
          ID: venta.id || '',
          productosBar: JSON.stringify(venta.productosBar || []),
          productosCosmeticos: JSON.stringify(venta.productosCosmeticos || [])
        };
        // @ts-ignore
        await window.electronAPI.googleSheets.addRow(this.getSheetName('Ventas'), data);
      } else {
        // En Web / Vercel
        await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Ventas',
            action: 'upsert',
            test: this.isTestMode(),
            data: venta
          })
        });
      }
      console.log('[GoogleSheetsSync] Venta sincronizada en Sheets.');
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
      if (typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets) {
        const data = {
          Fecha: venta.fecha || '',
          Hora_Entrada: venta.horaEntrada || venta.hora || '',
          Hora_Salida: venta.horaSalida || '',
          Empleado: venta.empleado || '',
          Patente: venta.patente || '',
          Cliente: venta.cliente || '',
          Numero_Cliente: venta.numeroCliente || '',
          Vehiculo: venta.vehiculo || (venta.marca ? `${venta.marca} ${venta.modelo}` : ''),
          Servicio: venta.servicio || '',
          Lavado: venta.lavado || 0,
          Bar: venta.bar || 0,
          Cosmeticos: venta.cosmeticos || 0,
          Descuento: venta.descuento || 0,
          Estadia: venta.estadia ? 'Sí' : 'No',
          Total: venta.total || 0,
          Metodo_Pago: venta.metodoPago || '',
          ID: venta.id || '',
          productosBar: JSON.stringify(venta.productosBar || []),
          productosCosmeticos: JSON.stringify(venta.productosCosmeticos || [])
        };
        // @ts-ignore
        await window.electronAPI.googleSheets.updateRow(this.getSheetName('Ventas'), 'ID', venta.id, data);
      } else {
        await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Ventas',
            action: 'upsert',
            test: this.isTestMode(),
            data: venta
          })
        });
      }
      console.log('[GoogleSheetsSync] Venta actualizada en Sheets.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error actualizando venta:', error);
    }
  },

  /**
   * Registra el cierre de caja del día en Google Sheets
   */
  async syncCierreCaja(cierre: any) {
    if (!this.getSpreadsheetId()) {
      return { success: false, error: 'No hay hoja de Google configurada.' };
    }

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets) {
        const detalleMetodosTexto = (cierre.detalleMetodos || [])
          .filter((m: any) => m.cantidad > 0)
          .map((m: any) => `${m.metodo}: ${m.cantidad} venta(s) — $${m.total.toLocaleString('es-AR')}`)
          .join(' | ');

        const detalleBilletes = cierre.detalleBilletes || cierre.arqueo?.detalleBilletes || [];
        const detalleBilletesTexto = detalleBilletes
          .filter((b: any) => b.cantidad > 0)
          .map((b: any) => `$${b.valor}×${b.cantidad}=${b.subtotal}`)
          .join(' | ');

        const detallesLavaderoTexto = cierre.detallesPorSector?.lavadero
          ? `Lavadero: ${cierre.detallesPorSector.lavadero.cantidad} venta(s) — $${cierre.detallesPorSector.lavadero.total.toLocaleString('es-AR')}`
          : 'Lavadero: 0 ventas — $0';

        const detallesBarTexto = cierre.detallesPorSector?.bar
          ? `Bar: ${cierre.detallesPorSector.bar.cantidad} venta(s) — $${cierre.detallesPorSector.bar.total.toLocaleString('es-AR')}`
          : 'Bar: 0 ventas — $0';

        const detallesCosmeticaTexto = cierre.detallesPorSector?.cosmetica
          ? `Cosmética/Accesorios: ${cierre.detallesPorSector.cosmetica.cantidad} venta(s) — $${cierre.detallesPorSector.cosmetica.total.toLocaleString('es-AR')}`
          : 'Cosmética/Accesorios: 0 ventas — $0';

        const gastosDelDia = cierre.gastosDelDia || cierre.gastos?.detalle || [];
        const detallesGastosTexto = gastosDelDia.length > 0
          ? gastosDelDia
              .map((g: any) => `${g.categoria}: $${g.monto.toLocaleString('es-AR')} (${g.concepto || g.descripcion || ''})`)
              .join(' | ')
          : 'Sin gastos';

        const data = {
          Fecha: cierre.fecha,
          Hora_Cierre: cierre.horaCierre,
          Total_Efectivo_Sistema: cierre.totalEfectivoSistema,
          Total_Contado: cierre.totalContado ?? cierre.arqueo?.totalContado ?? 0,
          Diferencia: cierre.diferencia ?? cierre.arqueo?.diferencia ?? 0,
          Total_General: cierre.totalGeneral,
          Cantidad_Ventas: cierre.cantidadVentas,
          Detalle_Metodos: detalleMetodosTexto,
          Detalle_Billetes: detalleBilletesTexto,
          Detalle_Lavadero: detallesLavaderoTexto,
          Detalle_Bar: detallesBarTexto,
          Detalle_Cosmetica: detallesCosmeticaTexto,
          Detalle_Gastos: detallesGastosTexto,
          Total_Gastos: cierre.totalGastos ?? cierre.gastos?.total ?? 0,
          Empleado: cierre.empleado || '',
          ID: cierre.id,
        };

        // @ts-ignore
        const result = await window.electronAPI.googleSheets.addRow(
          this.getSheetName('Cierres Caja'),
          data
        );
        return result;
      } else {
        const resp = await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Cierres Caja',
            action: 'upsert',
            test: this.isTestMode(),
            data: cierre
          })
        });
        const data = await resp.json();
        return { success: data.ok };
      }
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

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets) {
        const data = {
          Fecha: gasto.fecha || new Date().toLocaleString(),
          Concepto: gasto.descripcion || '',
          Monto: gasto.monto || 0,
          Categoria: gasto.categoria || 'General',
          ID: gasto.id || Date.now().toString(),
          Sector: gasto.sector || '',
          Proveedor: gasto.proveedor || '',
          Metodo_Pago: gasto.metodoPago || '',
          Empleado: gasto.empleado || '',
          Descripcion: gasto.descripcion || ''
        };
        // @ts-ignore
        await window.electronAPI.googleSheets.addRow(this.getSheetName('Gastos'), data);
      } else {
        await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Gastos',
            action: 'upsert',
            test: this.isTestMode(),
            data: gasto
          })
        });
      }
      console.log('[GoogleSheetsSync] Gasto sincronizado en Sheets.');
    } catch (error) {
      console.error('[GoogleSheetsSync] Error sincronizando gasto:', error);
    }
  },

  /**
   * Sincroniza una anulación
   */
  async syncAnulacion(anulada: any) {
    if (!this.getSpreadsheetId()) return;

    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.googleSheets) {
        // @ts-ignore
        await window.electronAPI.googleSheets.deleteRow(this.getSheetName('Ventas'), 'ID', anulada.id);

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
      } else {
        await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Ventas',
            action: 'delete',
            test: this.isTestMode(),
            id: anulada.id
          })
        });

        await fetch('/api/pos-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Ventas Anuladas',
            action: 'upsert',
            test: this.isTestMode(),
            data: {
              Fecha_Original: anulada.fecha || '',
              Fecha_Anulacion: anulada.fechaAnulacion || new Date().toLocaleString(),
              Patente: anulada.patente || '',
              Cliente: anulada.cliente || '',
              Monto: anulada.total || 0,
              Motivo: anulada.motivoAnulacion || '',
              Empleado: anulada.empleado || '',
              ID: anulada.id || ''
            }
          })
        });
      }
      console.log('[GoogleSheetsSync] Anulación sincronizada en Sheets.');
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
    return localStorage.getItem(SPREADSHEET_ID_KEY) || DEFAULT_SPREADSHEET_ID;
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
