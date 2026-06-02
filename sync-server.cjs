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
