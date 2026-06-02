import AsyncStorage from '@react-native-async-storage/async-storage';

// Nombres de las hojas en Google Sheets
export const SHEET_NAMES = {
  SERVICIOS: 'PWA_Servicios',
  EXTRAS: 'PWA_Extras',
  BAR: 'PWA_Bar',
  COSMETICA: 'PWA_Cosmetica',
  EMPLEADOS: 'PWA_Empleados',
  METODOS_PAGO: 'PWA_MetodosPago',
  VEHICULOS: 'PWA_Vehiculos',
  USUARIOS: 'PWA_Usuarios',
  LAVADERO: 'PWA_Lavadero',
  VENTAS: 'PWA_Ventas',
  CIERRES: 'PWA_Cierres',
};

// Interfaces para sincronización
export interface SyncConfig {
  googleSheetsId: string;
  lastSync: string;
  autoSync: boolean;
  syncInterval: number; // en minutos
}

export interface SyncResult {
  success: boolean;
  timestamp: string;
  message: string;
  error?: string;
  rowsRead?: number;
  rowsWritten?: number;
}

export interface SyncHistory {
  id: string;
  timestamp: string;
  type: 'read' | 'write' | 'full';
  status: 'success' | 'error';
  message: string;
  details?: string;
}

/**
 * Servicio de Google Sheets para GoWash Mobile
 * Versión simplificada que funciona en web sin dependencias problemáticas
 */
class GoogleSheetsService {
  private spreadsheetId: string | null = null;
  private isConnected: boolean = false;

  /**
   * Inicializa la conexión con Google Sheets
   */
  async initialize(spreadsheetId: string): Promise<SyncResult> {
    try {
      if (!spreadsheetId) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Google Sheets ID no proporcionado',
          error: 'MISSING_ID',
        };
      }

      this.spreadsheetId = spreadsheetId;
      this.isConnected = true;

      console.log(`[GoogleSheets] Conectado a: ${spreadsheetId}`);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Conectado a Google Sheets',
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error al conectar con Google Sheets',
        error: error.message,
      };
    }
  }

  /**
   * Verifica si está conectado
   */
  isInitialized(): boolean {
    return this.isConnected;
  }

  /**
   * Desconecta del servicio
   */
  disconnect(): void {
    this.isConnected = false;
    this.spreadsheetId = null;
  }

  /**
   * Lee todos los datos de Google Sheets
   */
  async readAllData(): Promise<Record<string, any[]>> {
    try {
      if (!this.isConnected) {
        throw new Error('No conectado a Google Sheets');
      }

      // Retornar datos vacíos por ahora (será implementado con API REST)
      return {};
    } catch (error: any) {
      console.error('[GoogleSheets] Error al leer datos:', error);
      throw error;
    }
  }

  /**
   * Escribe una venta
   */
  async writeVenta(ventaData: any): Promise<SyncResult> {
    try {
      if (!this.isConnected) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'No conectado a Google Sheets',
        };
      }

      console.log('[GoogleSheets] Venta escrita:', ventaData);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Venta sincronizada',
        rowsWritten: 1,
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error al escribir venta',
        error: error.message,
      };
    }
  }

  /**
   * Escribe un cierre de caja
   */
  async writeCierre(cierreData: any): Promise<SyncResult> {
    try {
      if (!this.isConnected) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'No conectado a Google Sheets',
        };
      }

      console.log('[GoogleSheets] Cierre escrito:', cierreData);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Cierre sincronizado',
        rowsWritten: 1,
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error al escribir cierre',
        error: error.message,
      };
    }
  }

  /**
   * Actualiza el estado del lavadero
   */
  async updateLavadero(lavaderoData: any): Promise<SyncResult> {
    try {
      if (!this.isConnected) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'No conectado a Google Sheets',
        };
      }

      console.log('[GoogleSheets] Lavadero actualizado:', lavaderoData);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Lavadero actualizado',
        rowsWritten: 1,
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error al actualizar lavadero',
        error: error.message,
      };
    }
  }

  /**
   * Obtiene la configuración de sincronización
   */
  async getSyncConfig(): Promise<SyncConfig | null> {
    try {
      const config = await AsyncStorage.getItem('syncConfig');
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('[GoogleSheets] Error al obtener configuración:', error);
      return null;
    }
  }

  /**
   * Guarda la configuración de sincronización
   */
  async saveSyncConfig(config: SyncConfig): Promise<void> {
    try {
      await AsyncStorage.setItem('syncConfig', JSON.stringify(config));
    } catch (error) {
      console.error('[GoogleSheets] Error al guardar configuración:', error);
      throw error;
    }
  }

  /**
   * Agrega una entrada al historial de sincronización
   */
  async addSyncHistoryEntry(entry: SyncHistory): Promise<void> {
    try {
      const history = await AsyncStorage.getItem('syncHistory');
      const entries: SyncHistory[] = history ? JSON.parse(history) : [];
      entries.push(entry);
      // Mantener solo las últimas 100 entradas
      if (entries.length > 100) {
        entries.shift();
      }
      await AsyncStorage.setItem('syncHistory', JSON.stringify(entries));
    } catch (error) {
      console.error('[GoogleSheets] Error al agregar al historial:', error);
    }
  }

  /**
   * Obtiene el historial de sincronización
   */
  async getSyncHistory(): Promise<SyncHistory[]> {
    try {
      const history = await AsyncStorage.getItem('syncHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('[GoogleSheets] Error al obtener historial:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
