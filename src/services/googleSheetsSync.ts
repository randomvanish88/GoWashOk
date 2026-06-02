/**
 * Servicio de sincronización con Google Sheets para GoWash Mobile
 */

/**
 * Obtener el ID del spreadsheet desde localStorage
 */
function getSpreadsheetId(): string {
  return localStorage.getItem('gowash-spreadsheet-id') || '';
}

// Nombres de las hojas en Google Sheets
const SHEETS = {
  VEHICULOS_PATIO: 'VehiculosPatio',
  VEHICULOS_ENTREGADOS: 'VehiculosEntregados',
  USUARIOS: 'Usuarios',
  CONFIGURACION: 'Configuracion'
};

interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

class GoogleSheetsSyncService {
  private isInitialized = false;
  private isElectron = false;
  
  constructor() {
    // Detectar si estamos en Electron
    this.isElectron = typeof window !== 'undefined' && 
                      'electronAPI' in window && 
                      'googleSheets' in (window as any).electronAPI;
  }

  /**
   * Inicializar la conexión con Google Sheets
   */
  async initialize(): Promise<SyncResult> {
    if (!this.isElectron) {
      console.warn('[GoogleSheets] No estamos en Electron, sincronización deshabilitada');
      return { success: false, error: 'No disponible en navegador' };
    }

    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      return { success: false, error: 'No se configuró el ID del Spreadsheet' };
    }

    try {
      const result = await (window as any).electronAPI.googleSheets.init(spreadsheetId);
      if (result.success) {
        this.isInitialized = true;
        console.log('[GoogleSheets] ✅ Conectado exitosamente');
      }
      return result;
    } catch (error: any) {
      console.error('[GoogleSheets] Error de inicialización:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar si el servicio está disponible y conectado
   */
  isAvailable(): boolean {
    return this.isElectron && this.isInitialized;
  }

  /**
   * Guardar un vehículo en Google Sheets (Patio)
   */
  async saveVehiculoPatio(vehiculo: any): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const data = {
        id: vehiculo.id,
        patente: vehiculo.patente,
        marcaModelo: vehiculo.marcaModelo,
        color: vehiculo.color,
        cliente: vehiculo.cliente,
        telefono: vehiculo.telefono || '',
        servicio: vehiculo.servicio,
        precio: vehiculo.precio.toString(),
        metodoPago: vehiculo.metodoPago,
        empleado: vehiculo.empleado,
        observaciones: vehiculo.observaciones || '',
        fecha: vehiculo.fecha,
        horaIngreso: vehiculo.horaIngreso,
        horaSalida: vehiculo.horaSalida || '',
        estado: vehiculo.estado,
        productosBar: JSON.stringify(vehiculo.productosBar || []),
        productosCosmeticos: JSON.stringify(vehiculo.productosCosmeticos || []),
        descuento: vehiculo.descuento?.toString() || '0',
        fotos: JSON.stringify(vehiculo.fotos || []),
        tiempoEstimado: vehiculo.tiempoEstimado?.toString() || '0'
      };

      const result = await (window as any).electronAPI.googleSheets.addRow(
        SHEETS.VEHICULOS_PATIO,
        data
      );

      if (result.success) {
        console.log(`[GoogleSheets] ✅ Vehículo ${vehiculo.patente} guardado en Patio`);
      }

      return result;
    } catch (error: any) {
      console.error('[GoogleSheets] Error al guardar vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mover un vehículo de Patio a Entregados
   */
  async moveVehiculoToEntregados(vehiculo: any): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      // 1. Guardar en hoja de Entregados
      const data = {
        id: vehiculo.id,
        patente: vehiculo.patente,
        marcaModelo: vehiculo.marcaModelo,
        color: vehiculo.color,
        cliente: vehiculo.cliente,
        telefono: vehiculo.telefono || '',
        servicio: vehiculo.servicio,
        precio: vehiculo.precio.toString(),
        metodoPago: vehiculo.metodoPago,
        empleado: vehiculo.empleado,
        observaciones: vehiculo.observaciones || '',
        fecha: vehiculo.fecha,
        horaIngreso: vehiculo.horaIngreso,
        horaSalida: vehiculo.horaSalida || '',
        estado: vehiculo.estado,
        productosBar: JSON.stringify(vehiculo.productosBar || []),
        productosCosmeticos: JSON.stringify(vehiculo.productosCosmeticos || []),
        descuento: vehiculo.descuento?.toString() || '0',
        fotos: JSON.stringify(vehiculo.fotos || []),
        tiempoEstimado: vehiculo.tiempoEstimado?.toString() || '0'
      };

      const addResult = await (window as any).electronAPI.googleSheets.addRow(
        SHEETS.VEHICULOS_ENTREGADOS,
        data
      );

      if (!addResult.success) {
        return addResult;
      }

      // 2. Eliminar de hoja de Patio
      const deleteResult = await (window as any).electronAPI.googleSheets.deleteRow(
        SHEETS.VEHICULOS_PATIO,
        'id',
        vehiculo.id
      );

      if (deleteResult.success) {
        console.log(`[GoogleSheets] ✅ Vehículo ${vehiculo.patente} movido a Entregados`);
      }

      return deleteResult;
    } catch (error: any) {
      console.error('[GoogleSheets] Error al mover vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar estado de un vehículo en Patio
   */
  async updateVehiculoPatio(vehiculo: any): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const newData = {
        estado: vehiculo.estado,
        horaSalida: vehiculo.horaSalida || ''
      };

      const result = await (window as any).electronAPI.googleSheets.updateRow(
        SHEETS.VEHICULOS_PATIO,
        'id',
        vehiculo.id,
        newData
      );

      if (result.success) {
        console.log(`[GoogleSheets] ✅ Estado actualizado para ${vehiculo.patente}`);
      }

      return result;
    } catch (error: any) {
      console.error('[GoogleSheets] Error al actualizar vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un vehículo del Patio
   */
  async deleteVehiculoPatio(vehiculoId: string): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const result = await (window as any).electronAPI.googleSheets.deleteRow(
        SHEETS.VEHICULOS_PATIO,
        'id',
        vehiculoId
      );

      if (result.success) {
        console.log(`[GoogleSheets] ✅ Vehículo eliminado del Patio`);
      }

      return result;
    } catch (error: any) {
      console.error('[GoogleSheets] Error al eliminar vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los vehículos del Patio desde Google Sheets
   */
  async getVehiculosPatio(): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const rows = await (window as any).electronAPI.googleSheets.getRows(SHEETS.VEHICULOS_PATIO);
      
      const vehiculos = rows.map((row: any) => ({
        id: row.id,
        patente: row.patente,
        marcaModelo: row.marcaModelo,
        color: row.color,
        cliente: row.cliente,
        telefono: row.telefono,
        servicio: row.servicio,
        precio: parseFloat(row.precio || '0'),
        metodoPago: row.metodoPago,
        empleado: row.empleado,
        observaciones: row.observaciones,
        fecha: row.fecha,
        horaIngreso: row.horaIngreso,
        horaSalida: row.horaSalida,
        estado: row.estado,
        productosBar: this.safeJsonParse(row.productosBar, []),
        productosCosmeticos: this.safeJsonParse(row.productosCosmeticos, []),
        descuento: parseFloat(row.descuento || '0'),
        fotos: this.safeJsonParse(row.fotos, []),
        tiempoEstimado: parseInt(row.tiempoEstimado || '0')
      }));

      console.log(`[GoogleSheets] ✅ ${vehiculos.length} vehículos cargados del Patio`);
      return { success: true, data: vehiculos };
    } catch (error: any) {
      console.error('[GoogleSheets] Error al obtener vehículos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los vehículos entregados desde Google Sheets
   */
  async getVehiculosEntregados(): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const rows = await (window as any).electronAPI.googleSheets.getRows(SHEETS.VEHICULOS_ENTREGADOS);
      
      const vehiculos = rows.map((row: any) => ({
        id: row.id,
        patente: row.patente,
        marcaModelo: row.marcaModelo,
        color: row.color,
        cliente: row.cliente,
        telefono: row.telefono,
        servicio: row.servicio,
        precio: parseFloat(row.precio || '0'),
        metodoPago: row.metodoPago,
        empleado: row.empleado,
        observaciones: row.observaciones,
        fecha: row.fecha,
        horaIngreso: row.horaIngreso,
        horaSalida: row.horaSalida,
        estado: row.estado,
        productosBar: this.safeJsonParse(row.productosBar, []),
        productosCosmeticos: this.safeJsonParse(row.productosCosmeticos, []),
        descuento: parseFloat(row.descuento || '0'),
        fotos: this.safeJsonParse(row.fotos, []),
        tiempoEstimado: parseInt(row.tiempoEstimado || '0')
      }));

      console.log(`[GoogleSheets] ✅ ${vehiculos.length} vehículos entregados cargados`);
      return { success: true, data: vehiculos };
    } catch (error: any) {
      console.error('[GoogleSheets] Error al obtener vehículos entregados:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronización completa: subir datos locales a Google Sheets
   */
  async syncUploadAll(vehiculosPatio: any[], vehiculosEntregados: any[]): Promise<SyncResult> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      // Preparar datos para Patio
      const dataPatioHeaders = [
        'id', 'patente', 'marcaModelo', 'color', 'cliente', 'telefono', 
        'servicio', 'precio', 'metodoPago', 'empleado', 'observaciones', 
        'fecha', 'horaIngreso', 'horaSalida', 'estado', 'productosBar', 
        'productosCosmeticos', 'descuento', 'fotos', 'tiempoEstimado'
      ];

      const dataPatioRows = vehiculosPatio.map(v => [
        v.id, v.patente, v.marcaModelo, v.color, v.cliente, v.telefono || '',
        v.servicio, v.precio.toString(), v.metodoPago, v.empleado, v.observaciones || '',
        v.fecha, v.horaIngreso, v.horaSalida || '', v.estado,
        JSON.stringify(v.productosBar || []), JSON.stringify(v.productosCosmeticos || []),
        v.descuento?.toString() || '0', JSON.stringify(v.fotos || []), 
        v.tiempoEstimado?.toString() || '0'
      ]);

      const dataPatio = [dataPatioHeaders, ...dataPatioRows];

      // Preparar datos para Entregados
      const dataEntregadosRows = vehiculosEntregados.map(v => [
        v.id, v.patente, v.marcaModelo, v.color, v.cliente, v.telefono || '',
        v.servicio, v.precio.toString(), v.metodoPago, v.empleado, v.observaciones || '',
        v.fecha, v.horaIngreso, v.horaSalida || '', v.estado,
        JSON.stringify(v.productosBar || []), JSON.stringify(v.productosCosmeticos || []),
        v.descuento?.toString() || '0', JSON.stringify(v.fotos || []), 
        v.tiempoEstimado?.toString() || '0'
      ]);

      const dataEntregados = [dataPatioHeaders, ...dataEntregadosRows];

      // Subir a Google Sheets
      const result1 = await (window as any).electronAPI.googleSheets.writeSheet(
        SHEETS.VEHICULOS_PATIO,
        dataPatio
      );

      const result2 = await (window as any).electronAPI.googleSheets.writeSheet(
        SHEETS.VEHICULOS_ENTREGADOS,
        dataEntregados
      );

      if (result1.success && result2.success) {
        console.log('[GoogleSheets] ✅ Sincronización completa exitosa');
        return { success: true };
      }

      return { success: false, error: 'Error en sincronización' };
    } catch (error: any) {
      console.error('[GoogleSheets] Error en sincronización completa:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parsear JSON de forma segura
   */
  private safeJsonParse(jsonString: string, defaultValue: any): any {
    try {
      return jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Obtener el ID del spreadsheet configurado
   */
  getSpreadsheetId(): string {
    return getSpreadsheetId();
  }
}

// Exportar instancia única (singleton)
export const googleSheetsSync = new GoogleSheetsSyncService();
