/**
 * Tipos de datos para códigos QR
 */

export interface QRData {
  vehicleId: string;
  qrCode: string;
  timestamp: Date;
  estado: string;
}

export interface QRGenerationResult {
  success: boolean;
  qrCode?: string;
  error?: string;
}

export interface QRScanResult {
  success: boolean;
  data?: QRData;
  error?: string;
}
