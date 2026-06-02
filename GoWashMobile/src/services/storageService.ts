/**
 * Servicio para gestión de almacenamiento local con AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/vehicle';

const VEHICLES_KEY = '@gowash_vehicles';
const VEHICLE_PREFIX = '@gowash_vehicle_';

class StorageService {
  /**
   * Guarda un vehículo en AsyncStorage
   * @param vehicle - Vehículo a guardar
   */
  async saveVehicle(vehicle: Vehicle): Promise<void> {
    try {
      if (!vehicle.id) {
        throw new Error('Vehicle ID is required');
      }

      // Guardar vehículo individual
      await AsyncStorage.setItem(
        `${VEHICLE_PREFIX}${vehicle.id}`,
        JSON.stringify(vehicle)
      );

      // Actualizar lista de IDs
      await this.addVehicleToList(vehicle.id);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      throw error;
    }
  }

  /**
   * Obtiene un vehículo por ID
   * @param id - ID del vehículo
   * @returns Vehículo encontrado o null
   */
  async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required');
      }

      const vehicleJson = await AsyncStorage.getItem(`${VEHICLE_PREFIX}${id}`);

      if (!vehicleJson) {
        return null;
      }

      const vehicle = JSON.parse(vehicleJson) as Vehicle;
      // Convertir fechas de string a Date
      vehicle.fechaIngreso = new Date(vehicle.fechaIngreso);
      if (vehicle.fechaEntrega) {
        vehicle.fechaEntrega = new Date(vehicle.fechaEntrega);
      }

      return vehicle;
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los vehículos
   * @returns Lista de vehículos
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const vehicleIdsJson = await AsyncStorage.getItem(VEHICLES_KEY);

      if (!vehicleIdsJson) {
        return [];
      }

      const vehicleIds = JSON.parse(vehicleIdsJson) as string[];
      const vehicles: Vehicle[] = [];

      for (const id of vehicleIds) {
        const vehicle = await this.getVehicle(id);
        if (vehicle) {
          vehicles.push(vehicle);
        }
      }

      return vehicles;
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      return [];
    }
  }

  /**
   * Actualiza un vehículo
   * @param id - ID del vehículo
   * @param updates - Actualizaciones a aplicar
   */
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required');
      }

      const vehicle = await this.getVehicle(id);

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const updatedVehicle: Vehicle = {
        ...vehicle,
        ...updates,
        id: vehicle.id, // Asegurar que el ID no cambie
      };

      await this.saveVehicle(updatedVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Elimina un vehículo
   * @param id - ID del vehículo
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required');
      }

      // Eliminar vehículo individual
      await AsyncStorage.removeItem(`${VEHICLE_PREFIX}${id}`);

      // Actualizar lista de IDs
      await this.removeVehicleFromList(id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  /**
   * Limpia todo el almacenamiento
   */
  async clearStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const gowashKeys = keys.filter(
        (key) => key.startsWith('@gowash_')
      );

      await AsyncStorage.multiRemove(gowashKeys);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Obtiene el número de vehículos almacenados
   * @returns Número de vehículos
   */
  async getVehicleCount(): Promise<number> {
    try {
      const vehicles = await this.getAllVehicles();
      return vehicles.length;
    } catch (error) {
      console.error('Error getting vehicle count:', error);
      return 0;
    }
  }

  /**
   * Busca vehículos por placa
   * @param placa - Placa a buscar
   * @returns Vehículos encontrados
   */
  async searchByPlaca(placa: string): Promise<Vehicle[]> {
    try {
      if (!placa) {
        return [];
      }

      const vehicles = await this.getAllVehicles();
      const searchTerm = placa.toUpperCase();

      return vehicles.filter((v) => v.placa.includes(searchTerm));
    } catch (error) {
      console.error('Error searching by placa:', error);
      return [];
    }
  }

  /**
   * Busca vehículos por cliente
   * @param clienteName - Nombre del cliente
   * @returns Vehículos encontrados
   */
  async searchByClient(clienteName: string): Promise<Vehicle[]> {
    try {
      if (!clienteName) {
        return [];
      }

      const vehicles = await this.getAllVehicles();
      const searchTerm = clienteName.toLowerCase();

      return vehicles.filter((v) =>
        v.cliente.nombre.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching by client:', error);
      return [];
    }
  }

  /**
   * Obtiene vehículos por estado
   * @param estado - Estado a filtrar
   * @returns Vehículos encontrados
   */
  async getVehiclesByStatus(estado: string): Promise<Vehicle[]> {
    try {
      const vehicles = await this.getAllVehicles();
      return vehicles.filter((v) => v.estado === estado);
    } catch (error) {
      console.error('Error getting vehicles by status:', error);
      return [];
    }
  }

  /**
   * Agrega un vehículo a la lista de IDs
   * @param vehicleId - ID del vehículo
   */
  private async addVehicleToList(vehicleId: string): Promise<void> {
    try {
      const vehicleIdsJson = await AsyncStorage.getItem(VEHICLES_KEY);
      let vehicleIds: string[] = [];

      if (vehicleIdsJson) {
        vehicleIds = JSON.parse(vehicleIdsJson);
      }

      if (!vehicleIds.includes(vehicleId)) {
        vehicleIds.push(vehicleId);
        await AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicleIds));
      }
    } catch (error) {
      console.error('Error adding vehicle to list:', error);
      throw error;
    }
  }

  /**
   * Elimina un vehículo de la lista de IDs
   * @param vehicleId - ID del vehículo
   */
  private async removeVehicleFromList(vehicleId: string): Promise<void> {
    try {
      const vehicleIdsJson = await AsyncStorage.getItem(VEHICLES_KEY);

      if (!vehicleIdsJson) {
        return;
      }

      let vehicleIds = JSON.parse(vehicleIdsJson) as string[];
      vehicleIds = vehicleIds.filter((id) => id !== vehicleId);

      await AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicleIds));
    } catch (error) {
      console.error('Error removing vehicle from list:', error);
      throw error;
    }
  }
}

export default new StorageService();
