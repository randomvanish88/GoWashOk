/**
 * Hook personalizado para gestión de vehículos
 */

import { useState, useCallback } from 'react';
import { Vehicle, VehicleFormData } from '../types/vehicle';
import vehicleService from '../services/vehicleService';
import storageService from '../services/storageService';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  addVehicle: (data: VehicleFormData) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicleById: (id: string) => Promise<Vehicle | null>;
  getVehicleByQR: (qrCode: string) => Promise<Vehicle | null>;
  searchByPlaca: (placa: string) => Promise<Vehicle[]>;
  searchByClient: (clientName: string) => Promise<Vehicle[]>;
  getVehiclesByStatus: (status: string) => Promise<Vehicle[]>;
  loadAllVehicles: () => Promise<void>;
}

export const useVehicles = (): UseVehiclesReturn => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedVehicles = await storageService.getAllVehicles();
      setVehicles(loadedVehicles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading vehicles';
      setError(errorMessage);
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addVehicle = useCallback(
    async (data: VehicleFormData): Promise<Vehicle> => {
      try {
        setLoading(true);
        setError(null);

        // Crear vehículo
        const vehicle = vehicleService.createVehicle(data);

        // Guardar en AsyncStorage
        await storageService.saveVehicle(vehicle);

        // Actualizar lista local
        setVehicles((prev) => [...prev, vehicle]);

        return vehicle;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error adding vehicle';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateVehicle = useCallback(
    async (id: string, updates: Partial<Vehicle>): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Actualizar en AsyncStorage
        await storageService.updateVehicle(id, updates);

        // Actualizar lista local
        setVehicles((prev) =>
          prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error updating vehicle';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteVehicle = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Eliminar de AsyncStorage
        await storageService.deleteVehicle(id);

        // Actualizar lista local
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error deleting vehicle';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getVehicleById = useCallback(
    async (id: string): Promise<Vehicle | null> => {
      try {
        setError(null);
        return await storageService.getVehicle(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error getting vehicle';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const getVehicleByQR = useCallback(
    async (qrCode: string): Promise<Vehicle | null> => {
      try {
        setError(null);
        const allVehicles = await storageService.getAllVehicles();
        return allVehicles.find((v) => v.qrCode === qrCode) || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error getting vehicle by QR';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const searchByPlaca = useCallback(
    async (placa: string): Promise<Vehicle[]> => {
      try {
        setError(null);
        return await storageService.searchByPlaca(placa);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error searching by placa';
        setError(errorMessage);
        return [];
      }
    },
    []
  );

  const searchByClient = useCallback(
    async (clientName: string): Promise<Vehicle[]> => {
      try {
        setError(null);
        return await storageService.searchByClient(clientName);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error searching by client';
        setError(errorMessage);
        return [];
      }
    },
    []
  );

  const getVehiclesByStatus = useCallback(
    async (status: string): Promise<Vehicle[]> => {
      try {
        setError(null);
        return await storageService.getVehiclesByStatus(status);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error getting vehicles by status';
        setError(errorMessage);
        return [];
      }
    },
    []
  );

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
    getVehicleByQR,
    searchByPlaca,
    searchByClient,
    getVehiclesByStatus,
    loadAllVehicles,
  };
};
