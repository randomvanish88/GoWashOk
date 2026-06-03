/**
 * Servicio para sincronizar el Patio del Lavadero con Google Sheets
 * 
 * Usa /api/patio como endpoint:
 * - En dev (localhost): Vite hace proxy a http://localhost:3001/api/patio
 * - En producción (Vercel): usa la Serverless Function api/patio.js
 * 
 * Funciona en web, PWA móvil y desktop sin problemas de CORS.
 */

const API_URL = '/api/patio';

/** Obtiene todos los vehículos del patio (sin hora de salida) */
export async function obtenerVehiculosDelPatio(): Promise<any[]> {
  try {
    const resp = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    // Filtrar solo los que no tienen hora de salida (siguen en patio)
    return (data.data || []).filter((v: any) => !v.horaSalida);
  } catch (error: any) {
    console.warn('[PatioSync] Error obteniendo patio:', error.message);
    return [];
  }
}

/** Agrega un vehículo al patio */
export async function agregarVehiculoAlPatio(vehiculo: {
  id: string; patente: string; marcaModelo: string; color: string;
  cliente: string; telefono: string; servicio: string; precio: number;
  metodoPago: string; empleado: string; fecha: string; horaIngreso: string;
  estado: string; observaciones: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehiculo),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return { success: data.ok };
  } catch (error: any) {
    console.error('[PatioSync] Error agregando:', error.message);
    return { success: false, error: error.message };
  }
}

/** Actualiza estado o hora de salida de un vehículo */
export async function actualizarVehiculoEnPatio(
  id: string,
  updates: { estado?: string; horaSalida?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const resp = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return { success: data.ok };
  } catch (error: any) {
    console.error('[PatioSync] Error actualizando:', error.message);
    return { success: false, error: error.message };
  }
}
