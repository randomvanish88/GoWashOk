/**
 * useGoogleSheets.ts
 * Acceso directo a Google Sheets desde la PWA usando la API REST de Google.
 * Usa las mismas credenciales de Service Account que el GoWash POS.
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SERVICE_ACCOUNT_EMAIL = 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com';

// ─── OBTENER TOKEN DE ACCESO ──────────────────────────────────────────────────
// Usamos la API de Google Identity para obtener un token con la clave privada
// Nota: la clave privada se usa solo para firmar el JWT, nunca se envía a Google

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;

  // JWT Header
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const now = Math.floor(Date.now() / 1000);
  const claim = btoa(JSON.stringify({
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Importar la clave privada para firmar
  const privateKeyPem = import.meta.env.VITE_GOOGLE_PRIVATE_KEY || '';
  if (!privateKeyPem) {
    throw new Error('VITE_GOOGLE_PRIVATE_KEY no configurada en .env');
  }

  const pemBody = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signingInput = `${header}.${claim}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const json = await res.json();
  if (!json.access_token) throw new Error('No se pudo obtener token: ' + JSON.stringify(json));

  cachedToken = json.access_token;
  tokenExpiry = Date.now() + json.expires_in * 1000;
  return cachedToken!;
}

// ─── API DE SHEETS ────────────────────────────────────────────────────────────
const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;

async function sheetsGet(range: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function sheetsAppend(range: string, values: any[][]) {
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    }
  );
  return res.json();
}

// ─── FUNCIONES PÚBLICAS ───────────────────────────────────────────────────────

/** Lee todas las filas de una hoja y las convierte en objetos */
export async function leerHoja(nombreHoja: string): Promise<Record<string, string>[]> {
  try {
    const data = await sheetsGet(`${nombreHoja}!A1:Z1000`);
    if (!data.values || data.values.length < 2) return [];
    const [headers, ...rows] = data.values;
    return rows.map((row: string[]) => {
      const obj: Record<string, string> = {};
      headers.forEach((h: string, i: number) => { obj[h] = row[i] || ''; });
      return obj;
    });
  } catch (e) {
    console.error('[Sheets] Error leyendo hoja:', e);
    return [];
  }
}

/** Agrega una fila al final de una hoja */
export async function agregarFila(nombreHoja: string, datos: Record<string, any>): Promise<boolean> {
  try {
    // Primero leer los headers
    const headerData = await sheetsGet(`${nombreHoja}!1:1`);
    const headers: string[] = headerData.values?.[0] || Object.keys(datos);
    const row = headers.map(h => datos[h] ?? '');
    await sheetsAppend(`${nombreHoja}!A1`, [row]);
    return true;
  } catch (e) {
    console.error('[Sheets] Error agregando fila:', e);
    return false;
  }
}

/** Lee los servicios de lavado desde la hoja "Servicios" */
export async function leerServicios() {
  const rows = await leerHoja('Servicios');
  return rows.map(r => ({ nombre: r['Nombre'] || r['nombre'] || '', precio: parseFloat(r['Precio'] || r['precio'] || '0') }))
    .filter(s => s.nombre);
}

/** Lee los empleados desde la hoja "Empleados" */
export async function leerEmpleados(): Promise<string[]> {
  const rows = await leerHoja('Empleados');
  return rows.map(r => r['Nombre'] || r['nombre']).filter(Boolean);
}

/** Lee los vehículos en lavadero desde la hoja "Lavadero" */
export async function leerVehiculosEnLavadero() {
  const rows = await leerHoja('Lavadero');
  return rows.filter(r => r['Estado'] !== 'Retirado' && r['Estado'] !== 'Entregado');
}

/** Registra el ingreso de un vehículo en la hoja "Lavadero" */
export async function registrarIngreso(datos: {
  id: string; patente: string; cliente: string; servicio: string;
  precio: number; empleado: string; observaciones: string;
  formaPago: string; marcaModelo: string; color: string;
}) {
  return agregarFila('Lavadero', {
    ID: datos.id,
    Patente: datos.patente,
    Cliente: datos.cliente,
    Servicio: datos.servicio,
    Precio: datos.precio,
    Empleado: datos.empleado,
    Observaciones: datos.observaciones,
    Forma_Pago: datos.formaPago,
    Marca_Modelo: datos.marcaModelo,
    Color: datos.color,
    Fecha_Ingreso: new Date().toLocaleDateString('es-AR'),
    Hora_Ingreso: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    Estado: 'En Lavado',
  });
}

/** Marca un vehículo como entregado en la hoja "Lavadero" */
export async function marcarEntregado(id: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    // Buscar la fila con ese ID
    const data = await sheetsGet('Lavadero!A1:Z1000');
    if (!data.values) return false;
    const [headers, ...rows] = data.values;
    const idIdx = headers.indexOf('ID');
    const estadoIdx = headers.indexOf('Estado');
    if (idIdx === -1 || estadoIdx === -1) return false;

    const rowIdx = rows.findIndex((r: string[]) => r[idIdx] === id);
    if (rowIdx === -1) return false;

    // Actualizar la celda Estado (rowIdx + 2 porque sheets es 1-indexed y hay header)
    const cellRange = `Lavadero!${String.fromCharCode(65 + estadoIdx)}${rowIdx + 2}`;
    await fetch(`${BASE}/values/${encodeURIComponent(cellRange)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [['Entregado']] }),
    });
    return true;
  } catch (e) {
    console.error('[Sheets] Error marcando entregado:', e);
    return false;
  }
}
