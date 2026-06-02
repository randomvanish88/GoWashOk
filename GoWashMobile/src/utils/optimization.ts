/**
 * Utilidades para optimización de performance
 */

import { Vehicle } from '../types/vehicle';

/**
 * Memoriza el resultado de una función
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * Debounce para funciones
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle para funciones
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Ordena vehículos por fecha de ingreso (más recientes primero)
 */
export function sortVehiclesByDate(vehicles: Vehicle[]): Vehicle[] {
  return [...vehicles].sort(
    (a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime()
  );
}

/**
 * Filtra vehículos por estado
 */
export function filterVehiclesByStatus(
  vehicles: Vehicle[],
  status: string
): Vehicle[] {
  return vehicles.filter((v) => v.estado === status);
}

/**
 * Agrupa vehículos por estado
 */
export function groupVehiclesByStatus(vehicles: Vehicle[]): Record<string, Vehicle[]> {
  return vehicles.reduce(
    (acc, vehicle) => {
      if (!acc[vehicle.estado]) {
        acc[vehicle.estado] = [];
      }
      acc[vehicle.estado].push(vehicle);
      return acc;
    },
    {} as Record<string, Vehicle[]>
  );
}

/**
 * Busca vehículos por múltiples criterios
 */
export function searchVehicles(
  vehicles: Vehicle[],
  query: string
): Vehicle[] {
  const lowerQuery = query.toLowerCase();

  return vehicles.filter(
    (v) =>
      v.placa.toLowerCase().includes(lowerQuery) ||
      v.cliente.nombre.toLowerCase().includes(lowerQuery) ||
      v.marca.toLowerCase().includes(lowerQuery) ||
      v.modelo.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Calcula estadísticas de vehículos
 */
export function calculateVehicleStats(vehicles: Vehicle[]): {
  total: number;
  ingresados: number;
  enLavado: number;
  listos: number;
  entregados: number;
  promedioPorServicio: Record<string, number>;
} {
  const stats = {
    total: vehicles.length,
    ingresados: 0,
    enLavado: 0,
    listos: 0,
    entregados: 0,
    promedioPorServicio: {} as Record<string, number>,
  };

  const servicioCount = {} as Record<string, number>;

  vehicles.forEach((v) => {
    switch (v.estado) {\n      case 'ingresado':\n        stats.ingresados++;\n        break;\n      case 'en_lavado':\n        stats.enLavado++;\n        break;\n      case 'listo':\n        stats.listos++;\n        break;\n      case 'entregado':\n        stats.entregados++;\n        break;\n    }\n\n    servicioCount[v.servicio] = (servicioCount[v.servicio] || 0) + 1;\n  });\n\n  // Calcular promedio por servicio\n  Object.keys(servicioCount).forEach((servicio) => {\n    stats.promedioPorServicio[servicio] = servicioCount[servicio];\n  });\n\n  return stats;\n}\n\n/**\n * Comprime datos de vehículos para almacenamiento\n */\nexport function compressVehicleData(vehicle: Vehicle): string {\n  return JSON.stringify({\n    id: vehicle.id,\n    p: vehicle.placa,\n    m: vehicle.marca,\n    mo: vehicle.modelo,\n    c: vehicle.color,\n    cl: vehicle.cliente,\n    s: vehicle.servicio,\n    o: vehicle.observaciones,\n    fp: vehicle.formaPago,\n    qr: vehicle.qrCode,\n    e: vehicle.estado,\n    fi: vehicle.fechaIngreso,\n    fe: vehicle.fechaEntrega,\n    em: vehicle.empleado,\n  });\n}\n\n/**\n * Descomprime datos de vehículos\n */\nexport function decompressVehicleData(compressed: string): Vehicle {\n  const data = JSON.parse(compressed);\n  return {\n    id: data.id,\n    placa: data.p,\n    marca: data.m,\n    modelo: data.mo,\n    color: data.c,\n    cliente: data.cl,\n    servicio: data.s,\n    observaciones: data.o,\n    formaPago: data.fp,\n    qrCode: data.qr,\n    estado: data.e,\n    fechaIngreso: new Date(data.fi),\n    fechaEntrega: data.fe ? new Date(data.fe) : undefined,\n    empleado: data.em,\n  };\n}\n\n/**\n * Limpia datos antiguos (más de 30 días)\n */\nexport function cleanOldVehicles(vehicles: Vehicle[], daysOld: number = 30): Vehicle[] {\n  const cutoffDate = new Date();\n  cutoffDate.setDate(cutoffDate.getDate() - daysOld);\n\n  return vehicles.filter((v) => {\n    if (v.estado === 'entregado' && v.fechaEntrega) {\n      return new Date(v.fechaEntrega) > cutoffDate;\n    }\n    return true;\n  });\n}\n