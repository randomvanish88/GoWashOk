/**
 * Servicio para gestión de vehículos (CRUD)
 */

import { Vehicle, VehicleFormData, ValidationResult } from '../types/vehicle';
import qrService from './qrService';

class VehicleService {
  /**
   * Crea un nuevo vehículo
   * @param data - Datos del vehículo
   * @returns Vehículo creado
   */
  createVehicle(data: VehicleFormData): Vehicle {
    try {
      // Validar datos
      const validation = this.validateVehicleData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
      }

      // Generar ID único
      const id = this.generateVehicleId();

      // Generar código QR
      const qrCode = qrService.generateQRCode(id);

      // Crear vehículo
      const vehicle: Vehicle = {
        id,
        placa: data.placa.toUpperCase(),
        marca: data.marca,
        modelo: data.modelo,
        color: data.color,
        cliente: data.cliente,
        servicio: data.servicio,
        observaciones: data.observaciones,
        formaPago: data.formaPago,
        qrCode,
        estado: 'ingresado',
        fechaIngreso: new Date(),
      };

      return vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Actualiza un vehículo existente
   * @param id - ID del vehículo
   * @param updates - Actualizaciones a aplicar
   * @returns Vehículo actualizado
   */
  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required');
      }

      // Aquí se implementaría la lógica de actualización
      // Por ahora retornamos un objeto actualizado
      const updatedVehicle: Vehicle = {
        id,
        placa: updates.placa || '',
        marca: updates.marca || '',
        modelo: updates.modelo || '',
        color: updates.color || '',
        cliente: updates.cliente || { nombre: '', telefono: '' },
        servicio: updates.servicio || 'basico',
        observaciones: updates.observaciones,
        formaPago: updates.formaPago || 'efectivo',
        qrCode: updates.qrCode || '',
        estado: updates.estado || 'ingresado',
        fechaIngreso: updates.fechaIngreso || new Date(),
        fechaEntrega: updates.fechaEntrega,
        empleado: updates.empleado,
      };

      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Obtiene un vehículo por ID
   * @param id - ID del vehículo
   * @returns Vehículo encontrado o null
   */
  getVehicleById(id: string): Vehicle | null {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required');
      }

      // Esta función será implementada con AsyncStorage
      // Por ahora retorna null
      return null;
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      return null;
    }
  }

  /**
   * Obtiene un vehículo por código QR
   * @param qrCode - Código QR del vehículo
   * @returns Vehículo encontrado o null
   */
  getVehicleByQR(qrCode: string): Vehicle | null {
    try {
      if (!qrCode) {
        throw new Error('QR code is required');
      }

      // Validar código QR
      if (!qrService.validateQRCode(qrCode)) {
        throw new Error('Invalid QR code format');
      }

      // Esta función será implementada con AsyncStorage
      // Por ahora retorna null
      return null;
    } catch (error) {
      console.error('Error getting vehicle by QR:', error);
      return null;
    }
  }

  /**
   * Valida los datos de un vehículo
   * @param data - Datos a validar
   * @returns Resultado de validación
   */
  validateVehicleData(data: Partial<VehicleFormData>): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar placa
    if (!data.placa) {
      errors.placa = 'Placa is required';
    } else if (!/^[A-Z0-9]{6,8}$/.test(data.placa.toUpperCase())) {
      errors.placa = 'Invalid plate format';
    }

    // Validar marca
    if (!data.marca) {
      errors.marca = 'Brand is required';
    }

    // Validar modelo
    if (!data.modelo) {
      errors.modelo = 'Model is required';
    }

    // Validar color
    if (!data.color) {
      errors.color = 'Color is required';
    }

    // Validar cliente
    if (!data.cliente?.nombre) {
      errors.cliente = 'Client name is required';
    }

    // Validar servicio
    if (!data.servicio) {
      errors.servicio = 'Service is required';
    } else if (!['basico', 'premium', 'completo', 'detailing'].includes(data.servicio)) {
      errors.servicio = 'Invalid service type';
    }

    // Validar forma de pago
    if (!data.formaPago) {
      errors.formaPago = 'Payment method is required';
    } else if (!['efectivo', 'tarjeta', 'transferencia', 'cuenta'].includes(data.formaPago)) {
      errors.formaPago = 'Invalid payment method';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Genera un ID único para un vehículo
   * @returns ID único
   */
  private generateVehicleId(): string {
    // Generar ID basado en timestamp y número aleatorio
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${timestamp}${random}`;
  }
}

export default new VehicleService();
