/**
 * Servicio para sincronizar el Patio del Lavadero con Google Sheets
 * Funciona en web (PWA móvil) y desktop (Electron)
 * 
 * Pestaña usada: "Patio_Lavadero" 
 * Columnas: ID | Patente | MarcaModelo | Color | Cliente | Telefono | Servicio | Precio | MetodoPago | Empleado | FechaIngreso | HoraIngreso | HoraSalida | Estado | Observaciones
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_NAME = 'Patio_Lavadero';

// Credenciales del service account (solo lectura/escritura a Sheets — no datos sensibles del negocio)
const SERVICE_ACCOUNT_EMAIL = 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS
xWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n
0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq
hS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad
tY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo
jDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE
Aj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU
0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z
DZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3
EW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR
ZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35
CGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj
Tppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq
zsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9
rB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE
NlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc
fnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp
ZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB
BigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u
j5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM
Qc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0
MfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc
2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H
bIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY
+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P
J1Rmx+e/HDerkKUnWFTDj6IR
-----END PRIVATE KEY-----`;

let cachedToken: { token: string; expires: number } | null = null;

/**
 * Genera un JWT y obtiene un access token de Google OAuth2
 * Funciona en browser moderno usando WebCrypto API
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Usar token en caché si no expiró
  if (cachedToken && cachedToken.expires > now + 60) {
    return cachedToken.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Importar la clave privada
  const pemKey = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const keyData = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${signatureB64}`;

  // Intercambiar JWT por access token
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const data = await resp.json();
  if (!data.access_token) throw new Error('No se pudo obtener token: ' + JSON.stringify(data));

  cachedToken = { token: data.access_token, expires: now + data.expires_in };
  return cachedToken.token;
}

/**
 * Agrega una fila al sheet de Patio_Lavadero
 */
export async function agregarVehiculoAlPatio(vehiculo: {
  id: string;
  patente: string;
  marcaModelo: string;
  color: string;
  cliente: string;
  telefono: string;
  servicio: string;
  precio: number;
  metodoPago: string;
  empleado: string;
  fecha: string;
  horaIngreso: string;
  estado: string;
  observaciones: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAccessToken();
    const fila = [
      vehiculo.id,
      vehiculo.patente,
      vehiculo.marcaModelo,
      vehiculo.color,
      vehiculo.cliente,
      vehiculo.telefono,
      vehiculo.servicio,
      vehiculo.precio,
      vehiculo.metodoPago,
      vehiculo.empleado,
      vehiculo.fecha,
      vehiculo.horaIngreso,
      '',  // HoraSalida vacía al ingresar
      vehiculo.estado,
      vehiculo.observaciones,
    ];

    const resp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [fila] }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(err);
    }
    return { success: true };
  } catch (error: any) {
    console.error('[PatioSync] Error agregando vehículo:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el estado o la hora de salida de un vehículo buscando por ID
 */
export async function actualizarVehiculoEnPatio(
  id: string,
  updates: { estado?: string; horaSalida?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAccessToken();

    // Primero buscar la fila por ID
    const getResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await getResp.json();
    const rows: string[][] = data.values || [];

    // Fila 0 = headers, buscar fila donde columna A (ID) coincide
    const filaIndex = rows.findIndex((row, i) => i > 0 && row[0] === id);
    if (filaIndex < 0) return { success: false, error: 'Vehículo no encontrado en Sheets' };

    const rowNumber = filaIndex + 1; // 1-indexed en Sheets

    if (updates.horaSalida !== undefined) {
      // Col M = columna 13 = HoraSalida
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!M${rowNumber}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[updates.horaSalida]] }),
        }
      );
    }

    if (updates.estado !== undefined) {
      // Col N = columna 14 = Estado
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!N${rowNumber}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[updates.estado]] }),
        }
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('[PatioSync] Error actualizando:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todos los vehículos en patio desde Google Sheets
 */
export async function obtenerVehiculosDelPatio(): Promise<any[]> {
  try {
    const token = await getAccessToken();
    const resp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await resp.json();
    const rows: string[][] = data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      id: row[0] || '',
      patente: row[1] || '',
      marcaModelo: row[2] || '',
      color: row[3] || '',
      cliente: row[4] || '',
      telefono: row[5] || '',
      servicio: row[6] || '',
      precio: parseFloat(row[7]) || 0,
      metodoPago: row[8] || '',
      empleado: row[9] || '',
      fecha: row[10] || '',
      horaIngreso: row[11] || '',
      horaSalida: row[12] || '',
      estado: row[13] || 'Ingresado',
      observaciones: row[14] || '',
    })).filter(v => v.id && v.patente);
  } catch (error: any) {
    console.error('[PatioSync] Error obteniendo vehículos:', error.message);
    return [];
  }
}
