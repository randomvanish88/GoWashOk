/**
 * Vercel Serverless Function - Proxy para Google Sheets (Patio Lavadero)
 * URL: /api/patio
 * 
 * GET  /api/patio         → obtener vehículos del patio
 * POST /api/patio         → agregar vehículo
 * PUT  /api/patio?id=xxx  → actualizar estado/horaSalida
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_PATIO = 'PWA_Lavadero';
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

const HEADERS_PATIO = [
  'id','patente','marcaModelo','color','cliente','telefono',
  'servicio','precio','metodoPago','empleado','observaciones',
  'fecha','horaIngreso','horaSalida','estado',
  'productosBar','productosCosmeticos','descuento','fotos','tiempoEstimado'
];

// Genera JWT y obtiene access token de Google
async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const payload = btoa(JSON.stringify({
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

  const sigInput = `${header}.${payload}`;

  // Importar clave privada
  const pemKey = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const keyData = Buffer.from(pemKey, 'base64');
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyData.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, Buffer.from(sigInput));
  const sigB64 = Buffer.from(sig).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const jwt = `${sigInput}.${sigB64}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('No token: ' + JSON.stringify(d));
  return d.access_token;
}

async function getRows(token) {
  const r = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A:T')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const d = await r.json();
  const rows = d.values || [];
  if (rows.length <= 1) return [];
  return rows.slice(1).filter(r => r[0]).map(row => ({
    id: row[0]||'', patente: row[1]||'', marcaModelo: row[2]||'',
    color: row[3]||'', cliente: row[4]||'', telefono: row[5]||'',
    servicio: row[6]||'', precio: parseFloat(row[7])||0,
    metodoPago: row[8]||'', empleado: row[9]||'', observaciones: row[10]||'',
    fecha: row[11]||'', horaIngreso: row[12]||'', horaSalida: row[13]||'',
    estado: row[14]||'Ingresado',
  }));
}

async function appendRow(token, vehiculo) {
  // Asegurar headers
  const check = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A1:A1')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const cd = await check.json();
  if (!cd.values || cd.values[0]?.[0] !== 'id') {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A1')}?valueInputOption=RAW`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [HEADERS_PATIO] }) }
    );
  }
  const fila = [
    vehiculo.id, vehiculo.patente, vehiculo.marcaModelo, vehiculo.color,
    vehiculo.cliente, vehiculo.telefono||'', vehiculo.servicio, vehiculo.precio,
    vehiculo.metodoPago, vehiculo.empleado, vehiculo.observaciones||'',
    vehiculo.fecha, vehiculo.horaIngreso, '', vehiculo.estado,
    '[]','[]','0','[]','0'
  ];
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [fila] }) }
  );
}

async function updateRow(token, id, updates) {
  const r = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A:A')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const d = await r.json();
  const rows = d.values || [];
  const idx = rows.findIndex((row, i) => i > 0 && row[0] === id);
  if (idx < 0) return;
  const n = idx + 1;
  if (updates.horaSalida !== undefined) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!N' + n)}?valueInputOption=RAW`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[updates.horaSalida]] }) });
  }
  if (updates.estado !== undefined) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!O' + n)}?valueInputOption=RAW`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[updates.estado]] }) });
  }
}

// Handler principal
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = await getToken();

    if (req.method === 'GET') {
      const data = await getRows(token);
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      await appendRow(token, req.body);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Falta id' });
      await updateRow(token, id, req.body);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('[api/patio]', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
