/**
 * Tipos de datos para vehículos
 */

export type ServiceType = 'basico' | 'premium' | 'completo' | 'detailing';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta';
export type VehicleStatus = 'ingresado' | 'en_lavado' | 'secado' | 'listo' | 'entregado';

export interface ClientInfo {
  nombre: string;
  telefono: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  cliente: ClientInfo;
  servicio: ServiceType;
  observaciones?: string;
  formaPago: PaymentMethod;
  qrCode: string;
  estado: VehicleStatus;
  fechaIngreso: Date;
  fechaEntrega?: Date;
  empleado?: string;
}

export interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  cliente: ClientInfo;
  servicio: ServiceType;
  observaciones?: string;
  formaPago: PaymentMethod;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
