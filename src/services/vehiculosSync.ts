/**
 * Servicio para sincronizar vehículos desde Google Sheets
 * Lee la pestaña PWA_Vehiculos y actualiza los precios con imágenes
 */

import { Price } from '../app/App';

/**
 * Transforma datos de Google Sheets en objetos Price
 */
export function transformarDatosDeSheets(datosSheet: any[]): Price[] {
  const vehiculos: Price[] = [];
  
  for (let i = 0; i < datosSheet.length; i++) {
    const row = datosSheet[i];
    
    // Validar que la fila tiene datos
    if (!row || (typeof row === 'object' && Object.keys(row).length === 0)) {
      continue;
    }

    const marca = row.Marca?.trim() || row['Marca']?.trim();
    const modelo = row.Modelo?.trim() || row['Modelo']?.trim();
    
    if (!marca || !modelo) {
      continue;
    }

    const urlImagen = row.URL_Imagen?.trim() || row['URL_Imagen']?.trim();
    
    vehiculos.push({
      id: `gw-${marca.toLowerCase().replace(/\s+/g, '-')}-${modelo.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      brand: marca,
      model: modelo,
      size: (row.Tamaño?.trim() || row['Tamaño']?.trim() || 'Mediano'),
      service: 'Lavado Artesanal',
      price: parseInt(row.Precio || row['Precio'] || '0') || 0,
      imageUrl: urlImagen || undefined
    });
  }
  
  console.log(`[VehiculosSync] ✅ Transformados ${vehiculos.length} vehículos de Google Sheets`);
  return vehiculos;
}

/**
 * Obtiene vehículos desde localStorage (sincronizados previamente desde Sheets)
 */
export function obtenerVehiculos(): Price[] {
  const cached = localStorage.getItem('gowash-vehiculos-cache');
  if (cached) {
    try {
      const datos = JSON.parse(cached);
      console.log(`[VehiculosSync] Cargados ${datos.length} vehículos del cache`);
      return datos;
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Guarda vehículos en localStorage
 */
export function guardarVehiculos(vehiculos: Price[]): void {
  localStorage.setItem('gowash-vehiculos-cache', JSON.stringify(vehiculos));
  localStorage.setItem('gowash-vehiculos-timestamp', Date.now().toString());
}

/**
 * Obtiene timestamp de última sincronización
 */
export function obtenerTimestamp(): number {
  const ts = localStorage.getItem('gowash-vehiculos-timestamp');
  return ts ? parseInt(ts) : 0;
}

/**
 * Verifica si el cache necesita actualización (más de 24 horas)
 */
export function needsUpdate(): boolean {
  const lastUpdate = obtenerTimestamp();
  const ahora = Date.now();
  const unDia = 24 * 60 * 60 * 1000;
  return (ahora - lastUpdate) > unDia;
}

/**
 * Sincroniza vehículos desde Google Sheets o JSON local (compatible con Electron y Web)
 */
export async function sincronizarDesdeGoogleSheets(): Promise<Price[]> {
  try {
    // Solo en Electron podemos acceder a Google Sheets API
    if (typeof window !== 'undefined' && 'electronAPI' in window && 'googleSheets' in (window as any).electronAPI) {
      console.log('[VehiculosSync] 📱 Electron detectado, intentando sincronizar desde Google Sheets...');
      
      const result = await (window as any).electronAPI.googleSheets.getRows('PWA_Vehiculos');
      
      if (result.success && result.data && Array.isArray(result.data)) {
        const vehiculos = transformarDatosDeSheets(result.data);
        guardarVehiculos(vehiculos);
        console.log(`[VehiculosSync] ✅ ${vehiculos.length} vehículos sincronizados desde Google Sheets`);
        return vehiculos;
      } else {
        throw new Error('No data from Google Sheets');
      }
    } else {
      // En web, intentar cargar desde el archivo JSON
      console.log('[VehiculosSync] 🌐 Web detectado, intentando cargar desde JSON...');
      
      try {
        const response = await fetch('/vehiculos-data.json');
        if (response.ok) {
          const data = await response.json();
          if (data.rows && Array.isArray(data.rows)) {
            const vehiculos = transformarDatosDeSheets(data.rows);
            guardarVehiculos(vehiculos);
            console.log(`[VehiculosSync] ✅ ${vehiculos.length} vehículos cargados desde JSON`);
            return vehiculos;
          }
        }
      } catch (jsonError) {
        console.log('[VehiculosSync] ℹ️  No se pudo cargar JSON:', jsonError);
      }

      // Fallback: usar cache
      console.log('[VehiculosSync] ℹ️  Usando cache local');
      return obtenerVehiculos();
    }
  } catch (error) {
    console.error('[VehiculosSync] ❌ Error:', error);
    return obtenerVehiculos();
  }
}

/**
 * Obtiene un vehículo por marca y modelo
 */
export function buscarVehiculo(marca: string, modelo: string, vehiculos: Price[]): Price | undefined {
  return vehiculos.find(
    v => v.brand.toLowerCase() === marca.toLowerCase() && 
         v.model.toLowerCase() === modelo.toLowerCase()
  );
}

/**
 * Busca vehículos por término de búsqueda
 */
export function buscarVehiculosPor(termino: string, vehiculos: Price[]): Price[] {
  const t = termino.toLowerCase();
  return vehiculos.filter(
    v => v.brand.toLowerCase().includes(t) || v.model.toLowerCase().includes(t)
  ).slice(0, 10);
}

/**
 * Obtiene lista de marcas únicas
 */
export function obtenerMarcas(vehiculos: Price[]): string[] {
  return Array.from(new Set(vehiculos.map(v => v.brand))).sort();
}

/**
 * Obtiene lista de modelos para una marca
 */
export function obtenerModelos(marca: string, vehiculos: Price[]): string[] {
  return Array.from(new Set(
    vehiculos
      .filter(v => v.brand.toLowerCase() === marca.toLowerCase())
      .map(v => v.model)
  )).sort();
}
