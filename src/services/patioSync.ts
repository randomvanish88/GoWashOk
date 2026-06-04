/**
 * Servicio para sincronizar el Patio del Lavadero con Google Sheets
 *
 * - En Electron (desktop instalado): usa IPC directo via googleSheets handler
 * - En Web/PWA (Vercel):             usa /api/patio serverless function
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET = 'PWA_Lavadero';
const HEADERS = [
  'id','patente','marcaModelo','color','cliente','telefono',
  'servicio','precio','metodoPago','empleado','observaciones',
  'fecha','horaIngreso','horaSalida','estado',
  'productosBar','productosCosmeticos','descuento','fotos','tiempoEstimado'
];

function isElectron(): boolean {
  return typeof window !== 'undefined' &&
    'electronAPI' in window &&
    'googleSheets' in (window as any).electronAPI;
}

/** Inicializa Google Sheets en Electron si no está inicializado */
async function initElectron(): Promise<boolean> {
  try {
    const result = await (window as any).electronAPI.googleSheets.init(SPREADSHEET_ID);
    return result?.success === true;
  } catch {
    return false;
  }
}

/** Convierte fila de Sheets en objeto vehículo */
function rowToVehiculo(row: any): any {
  // Si viene de Electron (objeto con keys), usarlo directamente
  if (typeof row === 'object' && !Array.isArray(row)) {
    return {
      id:          row.id || '',
      patente:     row.patente || '',
      marcaModelo: row.marcaModelo || '',
      color:       row.color || '',
      cliente:     row.cliente || '',
      telefono:    row.telefono || '',
      servicio:    row.servicio || '',
      precio:      parseFloat(row.precio) || 0,
      metodoPago:  row.metodoPago || '',
      empleado:    row.empleado || '',
      observaciones: row.observaciones || '',
      fecha:       row.fecha || '',
      horaIngreso: row.horaIngreso || '',
      horaSalida:  row.horaSalida || '',
      estado:      row.estado || 'Ingresado',
    };
  }
  return null;
}

// ─── OBTENER VEHÍCULOS ────────────────────────────────────────────────────────

export async function obtenerVehiculosDelPatio(): Promise<any[]> {
  try {
    if (isElectron()) {
      // Electron: leer via IPC
      await initElectron();
      const result = await (window as any).electronAPI.googleSheets.getRows(SHEET);
      if (!result?.success || !Array.isArray(result.data)) return [];
      return result.data
        .map(rowToVehiculo)
        .filter((v: any) => v && v.id && !v.horaSalida);
    } else {
      // Web/Vercel: usar API serverless
      const resp = await fetch('/api/patio', { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return (data.data || []).filter((v: any) => !v.horaSalida);
    }
  } catch (error: any) {
    console.warn('[PatioSync] Error obteniendo patio:', error.message);
    return [];
  }
}

// ─── AGREGAR VEHÍCULO ─────────────────────────────────────────────────────────

export async function agregarVehiculoAlPatio(vehiculo: {
  id: string; patente: string; marcaModelo: string; color: string;
  cliente: string; telefono: string; servicio: string; precio: number;
  metodoPago: string; empleado: string; fecha: string; horaIngreso: string;
  estado: string; observaciones: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      await initElectron();
      const data = {
        id: vehiculo.id,
        patente: vehiculo.patente,
        marcaModelo: vehiculo.marcaModelo,
        color: vehiculo.color,
        cliente: vehiculo.cliente,
        telefono: vehiculo.telefono || '',
        servicio: vehiculo.servicio,
        precio: vehiculo.precio.toString(),
        metodoPago: vehiculo.metodoPago,
        empleado: vehiculo.empleado,
        observaciones: vehiculo.observaciones || '',
        fecha: vehiculo.fecha,
        horaIngreso: vehiculo.horaIngreso,
        horaSalida: '',
        estado: vehiculo.estado,
        productosBar: '[]',
        productosCosmeticos: '[]',
        descuento: '0',
        fotos: '[]',
        tiempoEstimado: '0',
      };
      const result = await (window as any).electronAPI.googleSheets.addRow(SHEET, data);
      return { success: result?.success === true };
    } else {
      const resp = await fetch('/api/patio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo),
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return { success: data.ok };
    }
  } catch (error: any) {
    console.error('[PatioSync] Error agregando:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── PRODUCTOS BAR / COSMÉTICOS ──────────────────────────────────────────────

export interface ProductoBar {
  group: string;
  name: string;
  value: number;
  stock?: number;
}

export interface ProductoCosmetica {
  nombre: string;
  contenido: string;
  pvp: number;
  stock?: number;
}

export async function obtenerProductosDelSheets(): Promise<{ bar: ProductoBar[]; cosmetica: ProductoCosmetica[] }> {
  try {
    if (isElectron()) {
      await initElectron();
      // Leer hoja Bar
      const resBar = await (window as any).electronAPI.googleSheets.getRows('Bar');
      const bar: ProductoBar[] = (resBar?.success && Array.isArray(resBar.data))
        ? resBar.data
            .filter((r: any) => r.nombre || r.name)
            .map((r: any) => ({
              group: r.grupo || r.group || 'General',
              name: r.nombre || r.name || '',
              value: parseFloat(r.precio || r.value) || 0,
              stock: parseInt(r.stock) || 10,
            }))
        : [];

      // Leer hoja Cosmetica
      const resCos = await (window as any).electronAPI.googleSheets.getRows('Cosmetica');
      const cosmetica: ProductoCosmetica[] = (resCos?.success && Array.isArray(resCos.data))
        ? resCos.data
            .filter((r: any) => r.nombre)
            .map((r: any) => ({
              nombre: r.nombre || '',
              contenido: r.contenido || '',
              pvp: parseFloat(r.pvp) || 0,
              stock: parseInt(r.stock) || 10,
            }))
        : [];

      return { bar, cosmetica };
    } else {
      // Web/Vercel: usar API serverless
      const resp = await fetch('/api/productos', { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return {
        bar: data.bar || [],
        cosmetica: data.cosmetica || [],
      };
    }
  } catch (error: any) {
    console.warn('[PatioSync] Error obteniendo productos:', error.message);
    return { bar: [], cosmetica: [] };
  }
}

// ─── ACTUALIZAR VEHÍCULO ──────────────────────────────────────────────────────

export async function actualizarVehiculoEnPatio(
  id: string,
  updates: { estado?: string; horaSalida?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      await initElectron();
      const result = await (window as any).electronAPI.googleSheets.updateRow(
        SHEET, 'id', id, updates
      );
      return { success: result?.success === true };
    } else {
      const resp = await fetch(`/api/patio?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return { success: data.ok };
    }
  } catch (error: any) {
    console.error('[PatioSync] Error actualizando:', error.message);
    return { success: false, error: error.message };
  }
}
