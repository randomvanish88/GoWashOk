// Interfaces principales
export interface ProductoVenta {
  nombre: string;
  precio: number;
}

export interface PagoParcial {
  metodo: string;
  monto: number;
}

export interface Venta {
  id: string;
  fecha: string;
  hora: string;
  horaEntrada: string;
  horaSalida: string;
  empleado: string;
  patente: string;
  cliente: string;
  lavado: number;
  bar: number;
  cosmeticos: number;
  total: number;
  metodoPago: string;
  pagosMixtos?: PagoParcial[];
  numeroCliente?: string;
  estadia?: boolean;
  horasEstadia?: number;
  precioEstadia?: number;
  descuento: number;
  recargo: number;
  productosBar: ProductoVenta[];
  productosCosmeticos: ProductoVenta[];
  servicio?: string;
  extrasLavado?: ProductoVenta[];
  descLavadero?: boolean;
  descBar?: boolean;
  descCosmetica?: boolean;
  recargoLavadero?: boolean;
  recargoBar?: boolean;
  recargoCosmetica?: boolean;
  marca?: string;
  modelo?: string;
  tamano?: string;
  imageUrl?: string;
}

export interface OrdenEnProgreso {
  id: string;
  fecha: string;
  horaEntrada: string;
  patente: string;
  cliente: string;
  empleado: string;
  datos: Partial<Venta>;
}

export interface VentaEmpleado {
  id: string;
  fecha: string;
  hora: string;
  empleado: string;
  productos: ProductoVenta[];
  subtotal: number;
  descuentoPorcentaje: number;
  total: number;
}

export interface AuditLog {
  id: string;
  fecha: string;
  accion: 'EDICION' | 'ELIMINACION';
  tipo: 'VENTA_LAVADO' | 'CONSUMO_EMPLEADO';
  detalles: string;
  registroId: string;
}

export interface VentaAnulada extends Venta {
  motivoAnulacion: string;
  fechaAnulacion: string;
}

export interface ServicioLavado {
  nombre: string;
  precio: number;
}

export interface ProductoBar {
  group: string;
  name: string;
  value: number;
  stock?: number;
}

export interface Cosmetico {
  nombre: string;
  contenido: string;
  pvp: number;
  stock?: number;
}

export interface CierreCaja {
  fecha: string;
  ventasDelDia: Venta[];
  totalVentas: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalOtros: number;
  conteoBilletes: Record<number, number>;
  diferencia: number;
  gastos: number;
  totalEsperado: number;
}

// Interfaces para sincronización con Google Sheets
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

export interface Empleado {
  id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

export interface MetodoPago {
  id?: string;
  nombre: string;
  activo?: boolean;
}

export interface Vehiculo {
  id?: string;
  marca: string;
  modelo: string;
  tamano: string;
  precio: number;
}

export interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado' | 'cliente';
  activo?: boolean;
}

// Tipos para GoWash Mobile - Flujo Completo
export * from './vehicle';
export * from './qr';
