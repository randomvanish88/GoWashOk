/**
 * Vercel Serverless Function - Proxy para Google Sheets (Métodos de Pago)
 * URL: /api/metodospago
 */

import { getAccessToken, SCOPE_SHEETS } from './_lib/auth.js';

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_METODOS = 'PWA_MetodosPago';

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
  return getAccessToken(SCOPE_SHEETS);
}

async function sheetsRequest(token, method, range, body, spreadsheetId) {
  const activeId = spreadsheetId || SPREADSHEET_ID;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${activeId}`;
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
  } else if (method === 'CLEAR') {
    url = `${base}/values/${encodeURIComponent(range)}:clear`;
    options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  const resp = await fetch(url, options);
  return resp.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = await getAuth();
    const spreadsheetId = req.query?.spreadsheetId || req.query?.spreadsheetID || req.body?.spreadsheetId || SPREADSHEET_ID;

    if (req.method === 'GET') {
      const d = await sheetsRequest(token, 'GET', `${SHEET_METODOS}!A:A`, null, spreadsheetId);
      const rows = d.values || [];
      if (rows.length <= 1) return res.status(200).json({ ok: true, data: [] });
      // Saltear header
      const data = rows.slice(1).map(r => r[0]).filter(Boolean);
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const methods = Array.isArray(body.methods) ? body.methods : [];
      
      // Limpiar primero
      await sheetsRequest(token, 'CLEAR', `${SHEET_METODOS}!A1:A200`, null, spreadsheetId);
      
      // Escribir nuevos
      const rows = [['Metodo'], ...methods.map(m => [m])];
      await sheetsRequest(token, 'PUT', `${SHEET_METODOS}!A1:A${rows.length}`, rows, spreadsheetId);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('[api/metodospago]', e.message, e.stack);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
