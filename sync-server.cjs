/**
 * GoWash Sync Server
 * Servidor de sincronización entre la App Web (GoWash POS) y la PWA (GoWash Patio)
 * Puerto: 3001
 * 
 * Funciona como puente compartido de datos usando un archivo JSON local.
 * La app web escribe → el servidor guarda → la PWA lee (y viceversa).
 * WebSockets para notificaciones en tiempo real.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'sync-data.json');
const PWA_DIR = path.join(__dirname, 'GoWashPWA', 'dist');
const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_PATIO = 'PWA_Lavadero';

// ─── GOOGLE SHEETS PROXY (sin CORS) ──────────────────────────────────────────
const HEADERS_PATIO = [
  'id','patente','marcaModelo','color','cliente','telefono',
  'servicio','precio','metodoPago','empleado','observaciones',
  'fecha','horaIngreso','horaSalida','estado',
  'productosBar','productosCosmeticos','descuento','fotos','tiempoEstimado'
];

let sheetsToken = null;
let sheetsTokenExpires = 0;

async function getSheetsToken() {
  const now = Math.floor(Date.now() / 1000);
  if (sheetsToken && sheetsTokenExpires > now + 60) return sheetsToken;

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.JWT({
      email: 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com',
      key: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n`,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const tokenData = await auth.getAccessToken();
    sheetsToken = tokenData.token;
    sheetsTokenExpires = now + 3500;
    return sheetsToken;
  } catch (e) {
    console.error('[Patio] Error obteniendo token:', e.message);
    return null;
  }
}

async function sheetsGetRows() {
  const token = await getSheetsToken();
  if (!token) return [];
  const fetch = (await import('node-fetch')).default;
  const r = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A:T')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const d = await r.json();
  const rows = d.values || [];
  if (rows.length <= 1) return [];
  return rows.slice(1).filter(row => row[0]).map(row => ({
    id: row[0] || '', patente: row[1] || '', marcaModelo: row[2] || '',
    color: row[3] || '', cliente: row[4] || '', telefono: row[5] || '',
    servicio: row[6] || '', precio: parseFloat(row[7]) || 0,
    metodoPago: row[8] || '', empleado: row[9] || '', observaciones: row[10] || '',
    fecha: row[11] || '', horaIngreso: row[12] || '', horaSalida: row[13] || '',
    estado: row[14] || 'Ingresado',
  }));
}

async function sheetsAppendRow(vehiculo) {
  const token = await getSheetsToken();
  if (!token) throw new Error('Sin token');
  // Asegurar headers
  const fetch = (await import('node-fetch')).default;
  const check = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A1:A1')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const checkData = await check.json();
  if (!checkData.values || checkData.values[0]?.[0] !== 'id') {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A1')}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [HEADERS_PATIO] }),
      }
    );
  }
  const fila = [
    vehiculo.id, vehiculo.patente, vehiculo.marcaModelo, vehiculo.color,
    vehiculo.cliente, vehiculo.telefono || '', vehiculo.servicio, vehiculo.precio,
    vehiculo.metodoPago, vehiculo.empleado, vehiculo.observaciones || '',
    vehiculo.fecha, vehiculo.horaIngreso, '', vehiculo.estado,
    '[]', '[]', '0', '[]', '0'
  ];
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [fila] }),
    }
  );
}

async function sheetsUpdateRow(id, updates) {
  const token = await getSheetsToken();
  if (!token) throw new Error('Sin token');
  const fetch = (await import('node-fetch')).default;
  const r = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!A:A')}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const d = await r.json();
  const rows = d.values || [];
  const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] === id);
  if (rowIndex < 0) return;
  const rowNum = rowIndex + 1;
  if (updates.horaSalida !== undefined) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!N' + rowNum)}?valueInputOption=RAW`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[updates.horaSalida]] }) }
    );
  }
  if (updates.estado !== undefined) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_PATIO + '!O' + rowNum)}?valueInputOption=RAW`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[updates.estado]] }) }
    );
  }
}

// ─── MIME TYPES ───────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

// ─── SERVIR ARCHIVOS ESTÁTICOS DE LA PWA ─────────────────────────────────────
function servirPWA(req, res) {
  let filePath = path.join(PWA_DIR, req.url === '/' ? 'index.html' : req.url);
  // Si no existe el archivo, servir index.html (SPA routing)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PWA_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache para assets, no cache para HTML
  if (ext !== '.html') res.setHeader('Cache-Control', 'public, max-age=31536000');
  fs.createReadStream(filePath).pipe(res);
}

// ─── DATOS INICIALES CON VALORES REALES DE GOWASH ───────────────────────────
const DEFAULT_DATA = {
  'gowash-ordenes-abiertas': [],
  'gowash-ordenes-cobradas': [],
  'gowash-ventas': [],
  'gowash-washCounts': {},
  'carwash-sizes': [],
  'carwash-brands': [],
  'carwash-prices': [],
  'gowash-extras-lavado': [
    { nombre: 'Embarrado', precio: 5000 }
  ],
  'gowash-lista-empleados': ['Recepción', 'Lavador 1', 'Lavador 2'],
  'gowash-lavado-precios': [
    { nombre: 'Lavado Básico', precio: 15000 },
    { nombre: 'Lavado Premium', precio: 25000 },
    { nombre: 'Lavado Premium + Encerado', precio: 35000 },
    { nombre: 'Lavado Completo', precio: 45000 },
    { nombre: 'Detailing Completo', precio: 80000 }
  ],
  'gowash-bar-precios': [
    { group: 'Cafetería', name: 'Café Negro', value: 3000 },
    { group: 'Cafetería', name: 'Café con Leche', value: 4000 },
    { group: 'Cafetería', name: 'Té', value: 3000 },
    { group: 'Bebidas', name: 'CocaCola 500cc', value: 2300 },
    { group: 'Bebidas', name: 'Agua Mineral', value: 2000 },
    { group: 'Comidas', name: 'Medialuna', value: 1200 },
    { group: 'Comidas', name: 'Tostado JyQ', value: 6500 },
    { group: 'Cervezas', name: 'Heineken 330cc', value: 4000 },
    { group: 'Promos', name: 'Café + 2 Medialunas', value: 7600 }
  ],
  'gowash-cosmeticos-precios': [
    { nombre: 'Aromatizante Walker', contenido: '10g', pvp: 2164 },
    { nombre: 'Silicona Perfumada 120cc', contenido: '120cm³', pvp: 6537 },
    { nombre: 'Cera 250cc', contenido: '250cm³', pvp: 5410 },
    { nombre: 'Revividor de Negro 250cc', contenido: '250cm³', pvp: 5840 },
    { nombre: 'Desengrasante Spray 500cc', contenido: '500cm³', pvp: 9738 },
    { nombre: 'Shampoo Siliconado 250cc', contenido: '250cm³', pvp: 5193 }
  ],
  '_lastUpdate': null,
  '_version': '1.0.0'
};

// ─── CARGAR / GUARDAR DATOS ───────────────────────────────────────────────────
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const saved = JSON.parse(raw);
      // Merge: mantener datos guardados pero completar con defaults si faltan claves
      const merged = { ...DEFAULT_DATA, ...saved };
      return merged;
    }
  } catch (e) {
    console.error('[Sync] Error leyendo datos:', e.message);
  }
  // Primera vez: guardar los datos por defecto inmediatamente
  const initial = { ...DEFAULT_DATA };
  initial._lastUpdate = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  console.log('[Sync] sync-data.json creado con datos por defecto');
  return initial;
}

function saveData(data) {
  try {
    data._lastUpdate = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Sync] Error guardando datos:', e.message);
  }
}

let store = loadData();

// ─── CLIENTES WEBSOCKET ───────────────────────────────────────────────────────
const clients = new Set();

function broadcast(message, excludeSocket = null) {
  const msg = JSON.stringify(message);
  clients.forEach(client => {
    if (client !== excludeSocket && client.readyState === 1) {
      client.send(msg);
    }
  });
}

// ─── SERVIDOR HTTP ────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS para permitir acceso desde cualquier origen (app web + PWA)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // GET /sync - obtener todos los datos
  if (req.method === 'GET' && pathname === '/sync') {
    res.writeHead(200);
    res.end(JSON.stringify(store));
    return;
  }

  // GET /sync/:key - obtener una clave específica
  if (req.method === 'GET' && pathname.startsWith('/sync/')) {
    const key = decodeURIComponent(pathname.replace('/sync/', ''));
    res.writeHead(200);
    res.end(JSON.stringify({ key, value: store[key] ?? null }));
    return;
  }

  // POST /sync - guardar múltiples claves a la vez
  if (req.method === 'POST' && pathname === '/sync') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        Object.assign(store, updates);
        saveData(store);
        broadcast({ type: 'sync', keys: Object.keys(updates), data: updates });
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, updated: Object.keys(updates) }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // PUT /sync/:key - actualizar una clave específica
  if (req.method === 'PUT' && pathname.startsWith('/sync/')) {
    const key = decodeURIComponent(pathname.replace('/sync/', ''));
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { value } = JSON.parse(body);
        store[key] = value;
        saveData(store);
        broadcast({ type: 'update', key, value });
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, key }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // ─── ENDPOINTS DEL PATIO (proxy hacia Google Sheets) ─────────────────────

  // GET /patio - obtener vehículos del patio
  if (req.method === 'GET' && pathname === '/patio') {
    sheetsGetRows().then(vehiculos => {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: vehiculos }));
    }).catch(e => {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: e.message }));
    });
    return;
  }

  // POST /patio - agregar vehículo al patio
  if (req.method === 'POST' && pathname === '/patio') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const vehiculo = JSON.parse(body);
        sheetsAppendRow(vehiculo).then(() => {
          // Notificar por WebSocket a todos los clientes conectados
          broadcast({ type: 'patio_nuevo', vehiculo });
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        }).catch(e => {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // PUT /patio/:id - actualizar estado/horaSalida
  if (req.method === 'PUT' && pathname.startsWith('/patio/')) {
    const id = decodeURIComponent(pathname.replace('/patio/', ''));
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        sheetsUpdateRow(id, updates).then(() => {
          broadcast({ type: 'patio_update', id, updates });
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        }).catch(e => {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // GET /health - estado del servidor
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      version: '1.0.0',
      lastUpdate: store._lastUpdate,
      clients: clients.size
    }));
    return;
  }

  // Cualquier otra ruta → servir la PWA (archivos estáticos)
  servirPWA(req, res);
});

// ─── WEBSOCKET MANUAL (sin dependencias externas) ────────────────────────────
server.on('upgrade', (req, socket) => {
  // Handshake WebSocket
  const key = req.headers['sec-websocket-key'];
  const acceptKey = require('crypto')
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
  );

  socket.readyState = 1;
  clients.add(socket);
  console.log(`[Sync] Cliente conectado. Total: ${clients.size}`);

  // Enviar estado actual al conectarse
  const initMsg = JSON.stringify({ type: 'init', data: store });
  const initFrame = encodeFrame(initMsg);
  socket.write(initFrame);

  socket.on('data', (buffer) => {
    try {
      const msg = decodeFrame(buffer);
      if (!msg) return;
      const parsed = JSON.parse(msg);

      if (parsed.type === 'update' && parsed.key) {
        store[parsed.key] = parsed.value;
        saveData(store);
        broadcast({ type: 'update', key: parsed.key, value: parsed.value }, socket);
      }
    } catch (e) {
      // ignorar frames inválidos
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log(`[Sync] Cliente desconectado. Total: ${clients.size}`);
  });

  socket.on('error', () => {
    clients.delete(socket);
  });
});

// ─── HELPERS WEBSOCKET ────────────────────────────────────────────────────────
function encodeFrame(data) {
  const payload = Buffer.from(data, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text frame
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  try {
    const masked = (buffer[1] & 0x80) !== 0;
    let payloadLen = buffer[1] & 0x7f;
    let offset = 2;
    if (payloadLen === 126) { payloadLen = buffer.readUInt16BE(2); offset = 4; }
    else if (payloadLen === 127) { payloadLen = Number(buffer.readBigUInt64BE(2)); offset = 10; }
    if (masked) {
      const mask = buffer.slice(offset, offset + 4);
      offset += 4;
      const payload = buffer.slice(offset, offset + payloadLen);
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
      return payload.toString('utf8');
    }
    return buffer.slice(offset, offset + payloadLen).toString('utf8');
  } catch { return null; }
}

// ─── INICIAR ──────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n✅ GoWash Sync Server corriendo en http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Datos: ${DATA_FILE}\n`);
});
