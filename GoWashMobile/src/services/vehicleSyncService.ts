/**
 * Servicio de sincronización de vehículos con Google Sheets
 */

import { Vehicle } from '../types/vehicle';
import googleSheetsService, { SyncResult } from './googleSheetsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VEHICLES_SHEET_NAME = 'PWA_Vehiculos';
const SYNC_HISTORY_KEY = '@gowash_vehicle_sync_history';

interface VehicleSyncEntry {
  id: string;
  timestamp: string;
  type: 'ingreso' | 'retiro' | 'update';
  status: 'success' | 'error';
  message: string;
  vehicleId?: string;
  error?: string;
}

class VehicleSyncService {
  /**
   * Sincroniza un vehículo ingresado a Google Sheets
   */
  async syncVehicleIngreso(vehicle: Vehicle): Promise<SyncResult> {
    try {
      if (!googleSheetsService.isInitialized()) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Google Sheets no inicializado',
          error: 'NOT_INITIALIZED',
        };
      }

      const vehicleData = {
        ID: vehicle.id,
        Placa: vehicle.placa,
        Marca: vehicle.marca,
        Modelo: vehicle.modelo,
        Color: vehicle.color,
        Cliente: vehicle.cliente.nombre,
        Telefono: vehicle.cliente.telefono,
        Servicio: vehicle.servicio,
        Observaciones: vehicle.observaciones || '',
        FormaPago: vehicle.formaPago,
        QRCode: vehicle.qrCode,
        Estado: vehicle.estado,
        FechaIngreso: vehicle.fechaIngreso.toISOString(),
        Empleado: vehicle.empleado || '',
      };

      const result = await googleSheetsService.writeVenta(vehicleData);

      // Guardar en historial local
      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'ingreso',
        status: result.success ? 'success' : 'error',
        message: result.message,
        vehicleId: vehicle.id,
        error: result.error,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'ingreso',
        status: 'error',
        message: 'Error sincronizando ingreso',
        vehicleId: vehicle.id,
        error: errorMessage,
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error sincronizando ingreso',
        error: errorMessage,
      };
    }
  }

  /**
   * Sincroniza un vehículo entregado a Google Sheets
   */
  async syncVehicleRetiro(vehicle: Vehicle): Promise<SyncResult> {
    try {
      if (!googleSheetsService.isInitialized()) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Google Sheets no inicializado',
          error: 'NOT_INITIALIZED',
        };
      }

      const vehicleData = {
        ID: vehicle.id,
        Placa: vehicle.placa,
        Cliente: vehicle.cliente.nombre,
        Estado: vehicle.estado,
        FechaEntrega: vehicle.fechaEntrega?.toISOString() || '',
        QRCode: vehicle.qrCode,
      };

      const result = await googleSheetsService.updateLavadero(vehicleData);

      // Guardar en historial local
      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'retiro',
        status: result.success ? 'success' : 'error',
        message: result.message,
        vehicleId: vehicle.id,
        error: result.error,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'retiro',
        status: 'error',
        message: 'Error sincronizando retiro',
        vehicleId: vehicle.id,
        error: errorMessage,
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error sincronizando retiro',
        error: errorMessage,
      };
    }
  }

  /**
   * Sincroniza una actualización de vehículo a Google Sheets
   */
  async syncVehicleUpdate(vehicle: Vehicle): Promise<SyncResult> {
    try {
      if (!googleSheetsService.isInitialized()) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Google Sheets no inicializado',
          error: 'NOT_INITIALIZED',
        };
      }

      const vehicleData = {
        ID: vehicle.id,
        Placa: vehicle.placa,
        Estado: vehicle.estado,
        FechaActualizacion: new Date().toISOString(),
      };

      const result = await googleSheetsService.updateLavadero(vehicleData);

      // Guardar en historial local
      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'update',
        status: result.success ? 'success' : 'error',
        message: result.message,
        vehicleId: vehicle.id,
        error: result.error,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.addSyncHistoryEntry({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'update',
        status: 'error',
        message: 'Error sincronizando actualización',
        vehicleId: vehicle.id,
        error: errorMessage,
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Error sincronizando actualización',
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene el historial de sincronización
   */
  async getSyncHistory(): Promise<VehicleSyncEntry[]> {
    try {
      const history = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting sync history:', error);
      return [];
    }
  }

  /**
   * Agrega una entrada al historial de sincronización
   */
  private async addSyncHistoryEntry(entry: VehicleSyncEntry): Promise<void> {
    try {
      const history = await this.getSyncHistory();
      history.push(entry);

      // Mantener solo los últimos 100 eventos
      if (history.length > 100) {
        history.shift();
      }

      await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding sync history entry:', error);
    }
  }

  /**
   * Limpia el historial de sincronización
   */
  async clearSyncHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing sync history:', error);
      throw error;
    }
  }

  /**
   * Obtiene el último evento de sincronización
   */
  async getLastSyncEvent(): Promise<VehicleSyncEntry | null> {
    try {
      const history = await this.getSyncHistory();
      return history.length > 0 ? history[history.length - 1] : null;
    } catch (error) {
      console.error('Error getting last sync event:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado de sincronización
   */
  async getSyncStatus(): Promise<{
    lastSync: string | null;
    successCount: number;
    errorCount: number;
    isOnline: boolean;
  }> {
    try {
      const history = await this.getSyncHistory();
      const lastEvent = history.length > 0 ? history[history.length - 1] : null;

      const successCount = history.filter((e) => e.status === 'success').length;
      const errorCount = history.filter((e) => e.status === 'error').length;

      return {
        lastSync: lastEvent?.timestamp || null,
        successCount,
        errorCount,
        isOnline: googleSheetsService.isInitialized(),
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: null,
        successCount: 0,
        errorCount: 0,
        isOnline: false,
      };
    }
  }
}

export default new VehicleSyncService();
