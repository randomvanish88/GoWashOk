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
  
  console.log('[VehiculosSync] 🔍 Analizando estructura de datos...', datosSheet[0]);
  
  for (let i = 0; i < datosSheet.length; i++) {
    const row = datosSheet[i];
    
    if (!row || (typeof row === 'object' && Object.keys(row).length === 0)) {
      continue;
    }

    const marca = 
      row.Marca?.trim() || row['Marca']?.trim() || row.marca?.trim() || '';
      
    const modelo = 
      row.Modelo?.trim() || row['Modelo']?.trim() || row.modelo?.trim() || '';
    
    const tamaño = 
      row.Tamaño?.trim() || row['Tamaño']?.trim() || row.tamaño?.trim() || 'Mediano';
      
    const precio = 
      parseInt(row.Precio || row['Precio'] || row.precio || '0') || 0;
      
    let urlImagen = 
      row.URL_Imagen?.trim() || row['URL_Imagen']?.trim() || row.url_imagen?.trim() || '';
    
    if (!marca || !modelo) {
      continue;
    }

    vehiculos.push({
      id: `gw-${marca.toLowerCase().replace(/\s+/g, '-')}-${modelo.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      brand: marca,
      model: modelo,
      size: tamaño,
      service: 'Lavado Artesanal',
      price: precio,
      imageUrl: urlImagen || undefined
    });
  }
  
  console.log(`[VehiculosSync] ✅ Transformados ${vehiculos.length} vehículos`);
  if (vehiculos.length > 0) {
    console.log('[VehiculosSync] 📸 Ejemplo URL imagen:', vehiculos[0].imageUrl);
  }
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
 * Sincroniza vehículos desde Google Sheets (Electron) o JSON local (Web)
 */
export async function sincronizarDesdeGoogleSheets(): Promise<Price[]> {
  const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
  
  const isElectron = typeof window !== 'undefined' 
    && 'electronAPI' in window 
    && 'googleSheets' in (window as any).electronAPI;
  
  try {
    if (isElectron) {
      console.log('[VehiculosSync] 🔌 Electron: inicializando Google Sheets...');
      
      // Paso 1: inicializar conexión con el spreadsheet ID
      const initResult = await (window as any).electronAPI.googleSheets.init(SPREADSHEET_ID);
      if (!initResult?.success) {
        console.error('[VehiculosSync] ❌ No se pudo inicializar Google Sheets:', initResult?.error);
        return obtenerVehiculos();
      }
      console.log('[VehiculosSync] ✅ Google Sheets inicializado');

      // Paso 2: leer filas de PWA_Vehiculos
      const result = await (window as any).electronAPI.googleSheets.getRows('PWA_Vehiculos');
      console.log('[VehiculosSync] 📊 getRows respuesta - success:', result?.success, '| filas:', result?.data?.length);

      if (result?.success && Array.isArray(result.data)) {
        const vehiculos = transformarDatosDeSheets(result.data);
        guardarVehiculos(vehiculos);
        console.log(`[VehiculosSync] ✅ ${vehiculos.length} vehículos sincronizados desde Google Sheets`);
        return vehiculos;
      } else {
        console.warn('[VehiculosSync] ⚠️ Google Sheets no devolvió datos exitosamente:', result);
        return obtenerVehiculos();
      }

    } else {
      // Web/PWA: fetch normal funciona bien
      console.log('[VehiculosSync] 🌐 Web: cargando catálogo desde API...');
      const response = await fetch('/api/vehiculos');
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const vehiculos = transformarDatosDeSheets(data.data);
          guardarVehiculos(vehiculos);
          console.log(`[VehiculosSync] ✅ ${vehiculos.length} vehículos cargados desde API`);
          return vehiculos;
        }
      }
      console.warn('[VehiculosSync] ⚠️ No se pudo cargar el JSON o la respuesta fue incorrecta, usando cache');
      return obtenerVehiculos();
    }

  } catch (error) {
    console.error('[VehiculosSync] ❌ Error general:', error);
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

/**
 * Agrega un vehículo al catálogo dinámicamente
 */
export async function agregarAlCatalogo(vehiculo: { Marca: string, Modelo: string, Tamaño: string, Precio: number, URL_Imagen?: string }): Promise<boolean> {
  const isElectron = typeof window !== 'undefined' 
    && 'electronAPI' in window 
    && 'googleSheets' in (window as any).electronAPI;

  try {
    let success = false;
    if (isElectron) {
      const result = await (window as any).electronAPI.googleSheets.addRow('PWA_Vehiculos', {
        Marca: vehiculo.Marca,
        Modelo: vehiculo.Modelo,
        Tamaño: vehiculo.Tamaño,
        Precio: vehiculo.Precio,
        URL_Imagen: vehiculo.URL_Imagen || ''
      });
      success = result?.success === true;
    } else {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo)
      });
      success = response.ok;
    }
    
    if (success) {
      // Actualizar el cache local automáticamente
      const vehiculosLocales = obtenerVehiculos();
      vehiculosLocales.push({
        id: `gw-${vehiculo.Marca.toLowerCase().replace(/\s+/g, '-')}-${vehiculo.Modelo.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        brand: vehiculo.Marca,
        model: vehiculo.Modelo,
        size: vehiculo.Tamaño,
        service: 'Lavado Artesanal',
        price: vehiculo.Precio,
        imageUrl: vehiculo.URL_Imagen
      });
      guardarVehiculos(vehiculosLocales);
      
      // Emitir evento para que las interfaces se actualicen si están escuchando
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('gowash-catalog-updated'));
      }
    }
    
    return success;
  } catch (err) {
    console.error('Error agregando al catálogo:', err);
    return false;
  }
}
