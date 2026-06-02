/**
 * Servicio para generación y decodificación de códigos QR
 */

import { QRData, QRGenerationResult, QRScanResult } from '../types/qr';

class QRService {
  /**
   * Genera un código QR único basado en el ID del vehículo
   * @param vehicleId - ID del vehículo
   * @returns Código QR generado
   */
  generateQRCode(vehicleId: string): string {
    try {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }

      // Generar código QR con formato: QW + vehicleId + timestamp
      const timestamp = Date.now().toString().slice(-6);
      const qrCode = `QW${vehicleId}${timestamp}`;

      return qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Decodifica un código QR y extrae los datos
   * @param qrCode - Código QR a decodificar
   * @returns Datos decodificados del QR
   */
  decodeQRCode(qrCode: string): QRData {
    try {
      if (!qrCode) {
        throw new Error('QR code is required');
      }

      // Extraer vehicleId del código QR
      // Formato: QW + vehicleId + timestamp
      const vehicleId = qrCode.substring(2, qrCode.length - 6);

      const qrData: QRData = {
        vehicleId,
        qrCode,
        timestamp: new Date(),
        estado: 'ingresado',
      };

      return qrData;
    } catch (error) {
      console.error('Error decoding QR code:', error);
      throw error;
    }
  }

  /**
   * Valida si un código QR es válido
   * @param qrCode - Código QR a validar
   * @returns true si es válido, false en caso contrario
   */
  validateQRCode(qrCode: string): boolean {
    try {
      if (!qrCode) {
        return false;
      }

      // Validar formato: debe empezar con QW y tener al menos 8 caracteres
      const isValid = /^QW\d+\d{6}$/.test(qrCode);

      return isValid;
    } catch (error) {
      console.error('Error validating QR code:', error);
      return false;
    }
  }

  /**
   * Genera un resultado de generación de QR
   * @param qrCode - Código QR generado
   * @returns Resultado de la generación
   */
  generateQRResult(qrCode: string): QRGenerationResult {
    try {
      if (!this.validateQRCode(qrCode)) {
        return {
          success: false,
          error: 'Invalid QR code format',
        };
      }

      return {
        success: true,
        qrCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera un resultado de escaneo de QR
   * @param qrCode - Código QR escaneado
   * @returns Resultado del escaneo
   */
  generateScanResult(qrCode: string): QRScanResult {
    try {
      if (!this.validateQRCode(qrCode)) {
        return {
          success: false,
          error: 'Invalid QR code format',
        };
      }

      const qrData = this.decodeQRCode(qrCode);

      return {
        success: true,
        data: qrData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new QRService();
