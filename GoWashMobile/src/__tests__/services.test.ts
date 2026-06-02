/**
 * Pruebas unitarias para servicios
 */

import qrService from '../services/qrService';
import vehicleService from '../services/vehicleService';
import { VehicleFormData } from '../types/vehicle';

describe('QRService', () => {
  describe('generateQRCode', () => {
    it('debe generar un código QR válido', () => {
      const vehicleId = '1234';
      const qrCode = qrService.generateQRCode(vehicleId);

      expect(qrCode).toBeDefined();
      expect(qrCode).toMatch(/^QW\d+\d{6}$/);
      expect(qrCode).toContain('1234');
    });

    it('debe lanzar error si vehicleId está vacío', () => {
      expect(() => qrService.generateQRCode('')).toThrow();
    });
  });

  describe('validateQRCode', () => {
    it('debe validar un código QR válido', () => {
      const qrCode = 'QW1234567890';
      const isValid = qrService.validateQRCode(qrCode);

      expect(isValid).toBe(true);
    });

    it('debe rechazar un código QR inválido', () => {
      const invalidQRCodes = ['', 'INVALID', '123456', 'QW123'];

      invalidQRCodes.forEach((qrCode) => {
        expect(qrService.validateQRCode(qrCode)).toBe(false);
      });
    });
  });

  describe('decodeQRCode', () => {
    it('debe decodificar un código QR válido', () => {
      const qrCode = 'QW1234567890';
      const qrData = qrService.decodeQRCode(qrCode);

      expect(qrData).toBeDefined();
      expect(qrData.vehicleId).toBe('1234');
      expect(qrData.qrCode).toBe(qrCode);
      expect(qrData.estado).toBe('ingresado');
    });

    it('debe lanzar error si el código QR es inválido', () => {
      expect(() => qrService.decodeQRCode('INVALID')).toThrow();
    });
  });
});

describe('VehicleService', () => {
  const validFormData: VehicleFormData = {
    placa: 'AB123CD',
    marca: 'Toyota',
    modelo: 'Corolla',
    color: 'Blanco',
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '+1 2258-6789',
    },
    servicio: 'completo',
    formaPago: 'efectivo',
  };

  describe('createVehicle', () => {
    it('debe crear un vehículo válido', () => {
      const vehicle = vehicleService.createVehicle(validFormData);

      expect(vehicle).toBeDefined();
      expect(vehicle.id).toBeDefined();
      expect(vehicle.placa).toBe('AB123CD');
      expect(vehicle.marca).toBe('Toyota');
      expect(vehicle.qrCode).toBeDefined();
      expect(vehicle.estado).toBe('ingresado');
    });

    it('debe generar un ID único para cada vehículo', () => {
      const vehicle1 = vehicleService.createVehicle(validFormData);
      const vehicle2 = vehicleService.createVehicle(validFormData);

      expect(vehicle1.id).not.toBe(vehicle2.id);
    });

    it('debe convertir la placa a mayúsculas', () => {
      const formData = { ...validFormData, placa: 'ab123cd' };
      const vehicle = vehicleService.createVehicle(formData);

      expect(vehicle.placa).toBe('AB123CD');
    });
  });

  describe('validateVehicleData', () => {\n    it('debe validar datos correctos', () => {\n      const result = vehicleService.validateVehicleData(validFormData);\n\n      expect(result.isValid).toBe(true);\n      expect(Object.keys(result.errors).length).toBe(0);\n    });\n\n    it('debe rechazar placa inválida', () => {\n      const formData = { ...validFormData, placa: 'INVALID' };\n      const result = vehicleService.validateVehicleData(formData);\n\n      expect(result.isValid).toBe(false);\n      expect(result.errors.placa).toBeDefined();\n    });\n\n    it('debe rechazar datos incompletos', () => {\n      const formData = { ...validFormData, marca: '' };\n      const result = vehicleService.validateVehicleData(formData);\n\n      expect(result.isValid).toBe(false);\n      expect(result.errors.marca).toBeDefined();\n    });\n\n    it('debe rechazar servicio inválido', () => {\n      const formData = { ...validFormData, servicio: 'invalido' as any };\n      const result = vehicleService.validateVehicleData(formData);\n\n      expect(result.isValid).toBe(false);\n      expect(result.errors.servicio).toBeDefined();\n    });\n  });\n});\n