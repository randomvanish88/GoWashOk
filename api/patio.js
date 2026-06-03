/**
 * Vercel Serverless Function - Proxy para Google Sheets (Patio Lavadero)
 * URL: /api/patio
 * Usa google-auth-library (ya instalado en el proyecto)
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_PATIO = 'PWA_Lavadero';

const HEADERS_PATIO = [
  'id','patente','marcaModelo','color','cliente','telefono',
  'servicio','precio','metodoPago','empleado','observaciones',
  'fecha','horaIngreso','horaSalida','estado',
  'productosBar','productosCosmeticos','descuento','fotos','tiempoEstimado'
];

const CREDENTIALS = {
  type: 'service_account',
  project_id: 'gowash-db-496413',
  private_key_id: 'f6d0c0f05f12ea9b752d05db3b38ef336a4cc735',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n',
  client_email: 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com',
  client_id: '107095811744069109144',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
};

async function getAuth() {
  const { JWT } = await import('google-auth-library');
  const auth = new JWT({
    email: CREDENTIALS.client_email,
    key: CREDENTIALS.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const token = await auth.getAccessToken();
  return token.token;
}

async function sheetsRequest(token, method, range, body) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
  let url, options;

  if (method === 'GET') {
    url = `${base}/values/${encodeURIComponent(range)}`;
    options = { headers: { Authorization: `Bearer ${token}` } };
  } else if (method === 'PUT') {
    url = `${base}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
    options = {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: body }),
    };
  } else if (method === 'APPEND') {
    url = `${base}/values/${encodeURIComponent(SHEET_PATIO)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: body }),
    };
  }

  const resp = await fetch(url, options);
  return resp.json();
}

async function ensureHeaders(token) {
  const d = await sheetsRequest(token, 'GET', `${SHEET_PATIO}!A1:A1`);
  if (!d.values || d.values[0]?.[0] !== 'id') {
    await sheetsRequest(token, 'PUT', `${SHEET_PATIO}!A1`, [HEADERS_PATIO]);
  }
}

async function getRows(token) {
  const d = await sheetsRequest(token, 'GET', `${SHEET_PATIO}!A:T`);
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

async function appendRow(token, v) {
  await ensureHeaders(token);
  const fila = [
    v.id, v.patente, v.marcaModelo||'', v.color||'',
    v.cliente||'', v.telefono||'', v.servicio||'', v.precio||0,
    v.metodoPago||'', v.empleado||'', v.observaciones||'',
    v.fecha||'', v.horaIngreso||'', '', v.estado||'Ingresado',
    '[]','[]','0','[]','0'
  ];
  await sheetsRequest(token, 'APPEND', null, [fila]);
}

async function updateRow(token, id, updates) {
  const d = await sheetsRequest(token, 'GET', `${SHEET_PATIO}!A:A`);
  const rows = d.values || [];
  const idx = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (idx < 0) return;
  const n = idx + 1;
  if (updates.horaSalida !== undefined)
    await sheetsRequest(token, 'PUT', `${SHEET_PATIO}!N${n}`, [[updates.horaSalida]]);
  if (updates.estado !== undefined)
    await sheetsRequest(token, 'PUT', `${SHEET_PATIO}!O${n}`, [[updates.estado]]);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = await getAuth();

    if (req.method === 'GET') {
      const data = await getRows(token);
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await appendRow(token, body);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      const id = req.query?.id || req.url?.split('id=')[1];
      if (!id) return res.status(400).json({ error: 'Falta id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await updateRow(token, decodeURIComponent(id), body);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('[api/patio]', e.message, e.stack);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
