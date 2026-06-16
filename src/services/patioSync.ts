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

function parseCleanPrice(val: any, defaultVal: number = 0): number {
  if (val === undefined || val === null) return defaultVal;
  let str = val.toString().trim();
  if (!str) return defaultVal;
  
  str = str.replace(/[^\d.,-]/g, '');
  
  const tienePunto = str.includes('.');
  const tieneComma = str.includes(',');
  
  if (tienePunto && tieneComma) {
    const ultimoPunto = str.lastIndexOf('.');
    const ultimoComma = str.lastIndexOf(',');
    if (ultimoPunto > ultimoComma) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (tieneComma) {
    const matchDecimal = str.match(/,(\d{2})$/);
    if (matchDecimal) {
      str = str.replace(/,/g, '.');
    } else {
      if (/,(\d{3})$/.test(str)) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(/,/g, '.');
      }
    }
  } else if (tienePunto) {
    if (/\.(\d{3})$/.test(str)) {
      str = str.replace(/\./g, '');
    }
  }
  
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
}

function parseCleanStock(val: any, defaultVal: number = 10): number {
  if (val === undefined || val === null) return defaultVal;
  let str = val.toString().trim();
  if (!str) return defaultVal;
  str = str.replace(/[^\d-]/g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultVal : num;
}

function isElectron(): boolean {
  return typeof window !== 'undefined' &&
    'electronAPI' in window &&
    'googleSheets' in (window as any).electronAPI;
}

function getActiveSpreadsheetId(): string {
  const isTest = localStorage.getItem('gowash-test-mode') === 'true';
  const prodId = localStorage.getItem('gowash-google-sheet-id') || localStorage.getItem('gowash-spreadsheet-id') || SPREADSHEET_ID;
  const testId = localStorage.getItem('gowash-google-sheet-id-test');
  return isTest ? (testId || prodId) : prodId;
}

function getActiveDriveFolderId(): string {
  return localStorage.getItem('gowash-google-drive-folder-id') || '';
}

/** Inicializa Google Sheets en Electron si no está inicializado */
async function initElectron(): Promise<boolean> {
  try {
    const activeId = getActiveSpreadsheetId();
    const result = await (window as any).electronAPI.googleSheets.init(activeId);
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
      id:          row.id || row.Id || row.ID || '',
      patente:     row.patente || row.Patente || '',
      marcaModelo: row.marcaModelo || row.MarcaModelo || row.marca_modelo || row['Marca/Modelo'] || row.Marca || '',
      color:       row.color || row.Color || '',
      cliente:     row.cliente || row.Cliente || '',
      telefono:    row.telefono || row.Telefono || row.Teléfono || '',
      servicio:    row.servicio || row.Servicio || '',
      precio:      parseFloat(row.precio || row.Precio) || 0,
      metodoPago:  row.metodoPago || row.MetodoPago || row['Método Pago'] || '',
      empleado:    row.empleado || row.Empleado || '',
      observaciones: row.observaciones || row.Observaciones || '',
      fecha:       row.fecha || row.Fecha || '',
      horaIngreso: row.horaIngreso || row.HoraIngreso || row['Hora Ingreso'] || '',
      horaSalida:  row.horaSalida || row.HoraSalida || row['Hora Salida'] || '',
      estado:      row.estado || row.Estado || 'Ingresado',
      productosBar: (typeof (row.productosBar || row.ProductosBar) === 'string' && (row.productosBar || row.ProductosBar) !== '') ? JSON.parse(row.productosBar || row.ProductosBar) : ((row.productosBar || row.ProductosBar) || []),
      productosCosmeticos: (typeof (row.productosCosmeticos || row.ProductosCosmeticos) === 'string' && (row.productosCosmeticos || row.ProductosCosmeticos) !== '') ? JSON.parse(row.productosCosmeticos || row.ProductosCosmeticos) : ((row.productosCosmeticos || row.ProductosCosmeticos) || []),
      descuento: parseFloat(row.descuento || row.Descuento) || 0,
      tiempoEstimado: parseInt(row.tiempoEstimado || row.TiempoEstimado) || 0,
      fotos: (typeof (row.fotos || row.Fotos) === 'string' && (row.fotos || row.Fotos) !== '') ? JSON.parse(row.fotos || row.Fotos) : ((row.fotos || row.Fotos) || []),
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
        .filter((v: any) => v && v.id);
    } else {
      // Web/Vercel: usar API serverless con spreadsheetId dinámico
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/patio?spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return (data.data || []);
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
  productosBar?: any[]; productosCosmeticos?: any[]; descuento?: number; tiempoEstimado?: number;
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
        productosBar: JSON.stringify(vehiculo.productosBar || []),
        productosCosmeticos: JSON.stringify(vehiculo.productosCosmeticos || []),
        descuento: (vehiculo.descuento || 0).toString(),
        fotos: JSON.stringify(vehiculo.fotos || []),
        tiempoEstimado: (vehiculo.tiempoEstimado || 0).toString(),
      };
      const result = await (window as any).electronAPI.googleSheets.addRow(SHEET, data);
      return { success: result?.success === true };
    } else {
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/patio?spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehiculo, spreadsheetId, driveFolderId: getActiveDriveFolderId() }),
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

export async function obtenerProductosDelSheets(isTest: boolean = false): Promise<{ bar: ProductoBar[]; cosmetica: ProductoCosmetica[] }> {
  try {
    if (isElectron()) {
      await initElectron();
      const testModePrefix = isTest ? 'PRUEBA-' : '';
      // Leer hoja Bar
      const resBar = await (window as any).electronAPI.googleSheets.getRows(`${testModePrefix}Bar`);
      if (resBar && resBar.success === false) {
        throw new Error(resBar.error || 'Error leyendo hoja Bar');
      }
      const bar: ProductoBar[] = (resBar?.success && Array.isArray(resBar.data))
        ? resBar.data
            .filter((r: any) => {
              const name = r.nombre ?? r.Nombre ?? r.name ?? r.Name;
              return name && name.toString().trim() !== '';
            })
            .map((r: any) => ({
              group: r.grupo ?? r.Grupo ?? r.group ?? r.Group ?? 'General',
              name: r.nombre ?? r.Nombre ?? r.name ?? r.Name ?? '',
              value: parseCleanPrice(r.precio ?? r.Precio ?? r.value ?? r.Value ?? r.pvp ?? r.Pvp ?? r.PVP),
              stock: parseCleanStock(r.stock ?? r.Stock, 10),
            }))
        : [];

      // Leer hoja Cosmetica
      const resCos = await (window as any).electronAPI.googleSheets.getRows(`${testModePrefix}Cosmetica`);
      if (resCos && resCos.success === false) {
        throw new Error(resCos.error || 'Error leyendo hoja Cosmetica');
      }
      const cosmetica: ProductoCosmetica[] = (resCos?.success && Array.isArray(resCos.data))
        ? resCos.data
            .filter((r: any) => {
              const name = r.nombre ?? r.Nombre ?? r.name ?? r.Name;
              return name && name.toString().trim() !== '';
            })
            .map((r: any) => ({
              nombre: r.nombre ?? r.Nombre ?? r.name ?? r.Name ?? '',
              contenido: r.contenido ?? r.Contenido ?? '',
              pvp: parseCleanPrice(r.pvp ?? r.Pvp ?? r.PVP ?? r.precio ?? r.Precio ?? r.value ?? r.Value),
              stock: parseCleanStock(r.stock ?? r.Stock, 10),
            }))
        : [];

      return { bar, cosmetica };
    } else {
      // Web/Vercel: usar API serverless
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/productos?test=${isTest}&spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) {
        let errMsg = `HTTP ${resp.status}`;
        try {
          const errData = await resp.json();
          if (errData?.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await resp.json();
      return {
        bar: data.bar || [],
        cosmetica: data.cosmetica || [],
      };
    }
  } catch (error: any) {
    console.warn('[PatioSync] Error obteniendo productos:', error.message);
    throw error;
  }
}

// ─── ACTUALIZAR VEHÍCULO ──────────────────────────────────────────────────────

export async function actualizarVehiculoEnPatio(
  id: string,
  updates: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      await initElectron();
      const result = await (window as any).electronAPI.googleSheets.updateRow(
        SHEET, 'id', id, updates
      );
      return { success: result?.success === true };
    } else {
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/patio?id=${encodeURIComponent(id)}&spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, spreadsheetId, driveFolderId: getActiveDriveFolderId() }),
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

// ─── ELIMINAR VEHÍCULO ────────────────────────────────────────────────────────

export async function eliminarVehiculoDelPatio(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      await initElectron();
      const result = await (window as any).electronAPI.googleSheets.deleteRow(
        SHEET, 'id', id
      );
      return { success: result?.success === true };
    } else {
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/patio?id=${encodeURIComponent(id)}&action=delete&spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return { success: true };
    }
  } catch (error: any) {
    console.error('[PatioSync] Error eliminando vehículo:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── VACIAR PATIO ─────────────────────────────────────────────────────────────

export async function vaciarPatio(): Promise<{ success: boolean; error?: string }> {
  try {
    if (isElectron()) {
      await initElectron();
      const result = await (window as any).electronAPI.googleSheets.clearSheet(SHEET);
      return { success: result?.success === true };
    } else {
      const spreadsheetId = getActiveSpreadsheetId();
      const resp = await fetch(`/api/patio?spreadsheetId=${spreadsheetId}&driveFolderId=${getActiveDriveFolderId()}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return { success: true };
    }
  } catch (error: any) {
    console.error('[PatioSync] Error vaciando patio:', error.message);
    return { success: false, error: error.message };
  }
}
