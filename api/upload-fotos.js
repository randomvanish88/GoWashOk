import { createSign } from 'crypto';

// ── Credenciales de cuenta de servicio ────────────────────────────────────────
const SA_EMAIL = 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com';
const SA_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
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
TppzR6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq
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

const DEFAULT_FOLDER_ID = '1BEhE_4K-TxpQ5_Rdt9W2cSya7dz5br6U';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

// ── Helpers JWT ───────────────────────────────────────────────────────────────
function base64urlEncode(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64urlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64urlEncode(JSON.stringify({
    iss: SA_EMAIL,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URI,
    iat: now,
    exp: now + 3600,
  }));

  const signingInput = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = base64urlEncode(signer.sign(SA_PRIVATE_KEY));
  const jwt = `${signingInput}.${signature}`;

  const resp = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Token error ${resp.status}: ${txt}`);
  }

  const data = await resp.json();
  return data.access_token;
}

// ── Subir archivo a Google Drive ──────────────────────────────────────────────
async function uploadToDrive(token, base64Data, filename, folderId) {
  // Separar tipo MIME y contenido
  let mimeType = 'image/jpeg';
  let base64Content = base64Data;
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/s);
  if (matches) {
    mimeType = matches[1];
    base64Content = matches[2];
  }

  const boundary = `gowash_${Date.now()}`;
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });

  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Type: application/json; charset=UTF-8\r\n\r\n`,
    `${metadata}\r\n`,
    `--${boundary}\r\n`,
    `Content-Type: ${mimeType}\r\n`,
    `Content-Transfer-Encoding: base64\r\n\r\n`,
    `${base64Content}\r\n`,
    `--${boundary}--`,
  ];

  const bodyStr = bodyParts.join('');

  const uploadResp = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyStr,
    }
  );

  if (!uploadResp.ok) {
    const errTxt = await uploadResp.text();
    throw new Error(`Drive upload ${uploadResp.status}: ${errTxt}`);
  }

  const fileData = await uploadResp.json();
  const fileId = fileData.id;

  // Hacer el archivo público (no bloqueante)
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });
  } catch (_) { /* ignorar errores de permisos */ }

  // Obtener link de visualización
  const infoResp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,webContentLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!infoResp.ok) {
    // Devolver link directo como fallback
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  const info = await infoResp.json();
  return info.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { patente, fecha, fotos, folderId, startIndex = 0 } = body || {};

    if (!patente) return res.status(400).json({ error: 'Falta patente' });
    if (!fotos || !Array.isArray(fotos) || fotos.length === 0)
      return res.status(400).json({ error: 'Falta fotos o no es un array' });

    const activeFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || DEFAULT_FOLDER_ID;
    const token = await getAccessToken();

    const cleanPatente = patente.replace(/\s/g, '').toUpperCase();
    const cleanFecha = (fecha || new Date().toISOString().split('T')[0]).replace(/[-\/]/g, '');

    const urls = [];
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      if (!foto) continue;

      // Si ya es URL, guardar directo
      if (foto.startsWith('http://') || foto.startsWith('https://')) {
        urls.push(foto);
        continue;
      }

      // Determinar extensión
      let ext = 'jpg';
      const extMatch = foto.match(/^data:image\/([A-Za-z-+]+);base64,/);
      if (extMatch) ext = extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1];

      const fileName = `${cleanPatente}_${cleanFecha}_foto${startIndex + i + 1}.${ext}`;
      const url = await uploadToDrive(token, foto, fileName, activeFolderId);
      urls.push(url);
    }

    return res.status(200).json({ ok: true, urls });
  } catch (error) {
    console.error('[upload-fotos] Error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
