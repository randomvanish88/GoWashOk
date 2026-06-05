import { getAuth, sheetsRequest } from './patio.js';

const SHEET_VEHICULOS = 'PWA_Vehiculos';

export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = await getAuth();

    if (req.method === 'GET') {
      const data = await getCatalog(token);
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await appendToCatalog(token, body);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error en /api/vehiculos:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function getCatalog(token) {
  // The header is at row 1, data starts at row 2
  const data = await sheetsRequest(token, 'GET', `${SHEET_VEHICULOS}!A:E`);
  const rows = data.values || [];
  const headers = rows[0] || [];
  
  const vehiculos = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue; // Skip empty rows
    
    // Create an object dynamically mapping headers to row indices
    const vehiculo = {};
    headers.forEach((header, index) => {
      vehiculo[header] = r[index] || '';
    });
    vehiculos.push(vehiculo);
  }
  
  return vehiculos;
}

async function appendToCatalog(token, vehiculo) {
  // Columns: Marca, Modelo, Tamaño, Precio, URL_Imagen
  const fila = [
    vehiculo.Marca || '',
    vehiculo.Modelo || '',
    vehiculo.Tamaño || 'Mediano',
    vehiculo.Precio || 0,
    vehiculo.URL_Imagen || ''
  ];
  
  await sheetsRequest(token, 'APPEND', `${SHEET_VEHICULOS}!A:E`, [fila]);
}
