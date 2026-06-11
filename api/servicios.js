/**
 * Vercel Serverless Function - Proxy para Google Sheets (Servicios)
 * URL: /api/servicios
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_SERVICIOS = 'Servicios';

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

function parseCleanPrice(val, defaultVal = 0) {
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

function parseCleanStock(val, defaultVal = 10) {
  if (val === undefined || val === null) return defaultVal;
  let str = val.toString().trim();
  if (!str) return defaultVal;
  str = str.replace(/[^\d-]/g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultVal : num;
}

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

async function sheetsGet(token, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Google Sheets API error: ${resp.status} - ${errText}`);
  }
  const data = await resp.json();
  if (data.error) {
    throw new Error(`Google Sheets API error: ${data.error.message}`);
  }
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = await getAuth();
    const isTest = req.query?.test === 'true';
    const sheetName = isTest ? `PRUEBA-${SHEET_SERVICIOS}` : SHEET_SERVICIOS;
    
    let d;
    try {
      d = await sheetsGet(token, `${sheetName}!A:D`);
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('Unable to parse range') || err.message.includes('400') || err.message.includes('404')) {
        console.log(`[api/servicios] Hoja Servicios no encontrada: ${sheetName}. Retornando lista vacía.`);
        return res.status(200).json({ ok: true, data: [] });
      }
      throw err;
    }

    const rows = d.values || [];
    if (rows.length <= 1) return res.status(200).json({ ok: true, data: [] });
    
    // Saltear encabezado
    const data = rows.slice(1)
      .filter(r => r[0]) // debe tener nombre
      .map(r => ({
        nombre: r[0] || '',
        precio: parseCleanPrice(r[1]),
        descripcion: r[2] || '',
        tiempoEstimado: parseCleanStock(r[3], 30),
      }));

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('[api/servicios]', e.message, e.stack);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
