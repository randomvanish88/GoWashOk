/**
 * Vercel Serverless Function - Proxy de Sincronización POS con Google Sheets (Ventas, Gastos, Cierres y Extras)
 * URL: /api/pos-sync
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';

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

const HEADERS_VENTAS = [
  'Fecha', 'Hora_Entrada', 'Hora_Salida', 'Empleado', 'Patente',
  'Cliente', 'Numero_Cliente', 'Vehiculo', 'Servicio', 'Lavado',
  'Bar', 'Cosmeticos', 'Descuento', 'Estadia', 'Total', 'Metodo_Pago', 'ID',
  'productosBar', 'productosCosmeticos'
];

const HEADERS_GASTOS = [
  'Fecha', 'Concepto', 'Monto', 'Categoria', 'ID', 'Sector', 'Proveedor', 'Metodo_Pago', 'Empleado', 'Descripcion'
];

const HEADERS_CIERRES = [
  'Fecha', 'Hora_Cierre', 'Total_Efectivo_Sistema', 'Total_Contado', 'Diferencia',
  'Total_General', 'Cantidad_Ventas', 'Detalle_Metodos', 'Detalle_Billetes',
  'Detalle_Lavadero', 'Detalle_Bar', 'Detalle_Cosmetica', 'Detalle_Gastos',
  'Total_Gastos', 'Empleado', 'ID'
];

const HEADERS_EXTRAS = [
  'nombre', 'precio'
];

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
    url = `${base}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    options = {
      method: 'POST',
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
  const data = await resp.json();
  if (data && data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data;
}

async function ensureSheetExists(token, fullSheetName) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
  const metadataResp = await fetch(base, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metadataResp.ok) {
    throw new Error(`Error al obtener metadatos: ${metadataResp.statusText}`);
  }
  const metadata = await metadataResp.json();
  const sheetTitles = metadata.sheets?.map(s => s.properties?.title) || [];
  
  if (!sheetTitles.includes(fullSheetName)) {
    console.log(`[pos-sync] Creando hoja faltante: ${fullSheetName}`);
    const createResp = await fetch(`${base}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: { title: fullSheetName }
            }
          }
        ]
      })
    });
    if (!createResp.ok) {
      const errJson = await createResp.json().catch(() => ({}));
      throw new Error(`Error al crear hoja "${fullSheetName}": ${errJson.error?.message || createResp.statusText}`);
    }
  }
}

function getSheetName(baseName, isTest) {
  return isTest ? `PRUEBA-${baseName}` : baseName;
}

function parseVentaToRow(v) {
  return [
    v.fecha || '',
    v.horaEntrada || v.hora || '',
    v.horaSalida || '',
    v.empleado || '',
    v.patente || '',
    v.cliente || '',
    v.numeroCliente || '',
    v.vehiculo || (v.marca ? `${v.marca} ${v.modelo}` : ''),
    v.servicio || '',
    (v.lavado || 0).toString(),
    (v.bar || 0).toString(),
    (v.cosmeticos || 0).toString(),
    (v.descuento || 0).toString(),
    v.estadia ? 'Sí' : 'No',
    (v.total || 0).toString(),
    v.metodoPago || '',
    v.id || '',
    JSON.stringify(v.productosBar || []),
    JSON.stringify(v.productosCosmeticos || [])
  ];
}

function parseGastoToRow(g) {
  return [
    g.fecha || '',
    g.descripcion || '',
    (g.monto || 0).toString(),
    g.categoria || '',
    g.id || '',
    g.sector || '',
    g.proveedor || '',
    g.metodoPago || '',
    g.empleado || '',
    g.descripcion || ''
  ];
}

function parseCierreToRow(c) {
  const detalleMetodosTexto = (c.detalleMetodos || [])
    .filter(m => m.cantidad > 0)
    .map(m => `${m.metodo}: ${m.cantidad} venta(s) — $${m.total}`)
    .join(' | ');

  const detalleBilletes = c.detalleBilletes || c.arqueo?.detalleBilletes || [];
  const detalleBilletesTexto = detalleBilletes
    .filter(b => b.cantidad > 0)
    .map(b => `$${b.valor}×${b.cantidad}=${b.subtotal}`)
    .join(' | ');

  const detallesLavaderoTexto = c.detallesPorSector?.lavadero
    ? `Lavadero: ${c.detallesPorSector.lavadero.cantidad} venta(s) — $${c.detallesPorSector.lavadero.total}`
    : 'Lavadero: 0 ventas — $0';

  const detallesBarTexto = c.detallesPorSector?.bar
    ? `Bar: ${c.detallesPorSector.bar.cantidad} venta(s) — $${c.detallesPorSector.bar.total}`
    : 'Bar: 0 ventas — $0';

  const detallesCosmeticaTexto = c.detallesPorSector?.cosmetica
    ? `Cosmética/Accesorios: ${c.detallesPorSector.cosmetica.cantidad} venta(s) — $${c.detallesPorSector.cosmetica.total}`
    : 'Cosmética/Accesorios: 0 ventas — $0';

  const gastosDelDia = c.gastosDelDia || c.gastos?.detalle || [];
  const detallesGastosTexto = gastosDelDia.length > 0
    ? gastosDelDia
        .map(g => `${g.categoria}: $${g.monto} (${g.concepto || g.descripcion || ''})`)
        .join(' | ')
    : 'Sin gastos';

  return [
    c.fecha || '',
    c.horaCierre || '',
    (c.totalEfectivoSistema || 0).toString(),
    (c.totalContado ?? c.arqueo?.totalContado ?? 0).toString(),
    (c.diferencia ?? c.arqueo?.diferencia ?? 0).toString(),
    (c.totalGeneral || 0).toString(),
    (c.cantidadVentas || 0).toString(),
    detalleMetodosTexto,
    detalleBilletesTexto,
    detallesLavaderoTexto,
    detallesBarTexto,
    detallesCosmeticaTexto,
    detallesGastosTexto,
    (c.totalGastos ?? c.gastos?.total ?? 0).toString(),
    c.empleado || '',
    c.id || ''
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = await getAuth();

    if (req.method === 'GET') {
      const sheet = req.query?.sheet;
      const isTest = req.query?.test === 'true';
      if (!sheet) return res.status(400).json({ error: 'Falta parametro sheet' });

      const fullSheetName = getSheetName(sheet, isTest);
      const d = await sheetsRequest(token, 'GET', `${fullSheetName}!A:Z`);
      const rows = d.values || [];
      if (rows.length <= 1) {
        return res.status(200).json({ ok: true, data: [] });
      }

      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((h, idx) => {
          item[h] = row[idx] || '';
        });
        return item;
      });

      return res.status(200).json({ ok: true, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { sheet, action, data: item, test: isTestParam } = body;
      const isTest = isTestParam === true || req.query?.test === 'true';

      if (!sheet || !action) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: sheet, action' });
      }

      const fullSheetName = getSheetName(sheet, isTest);

      // Asegurar que la hoja existe antes de escribir
      await ensureSheetExists(token, fullSheetName);

      if (action === 'upsert') {
        let columns, rowConverter;
        if (sheet === 'Ventas') {
          columns = HEADERS_VENTAS;
          rowConverter = parseVentaToRow;
        } else if (sheet === 'Gastos') {
          columns = HEADERS_GASTOS;
          rowConverter = parseGastoToRow;
        } else if (sheet === 'Cierres Caja') {
          columns = HEADERS_CIERRES;
          rowConverter = parseCierreToRow;
        } else if (sheet === 'PWA_Extras') {
          columns = HEADERS_EXTRAS;
          rowConverter = (ext) => [ext.nombre || '', (ext.precio || 0).toString()];
        } else if (sheet === 'PWA_Vehiculos') {
          columns = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'];
          rowConverter = (v) => [
            v.brand || v.Marca || '',
            v.model || v.Modelo || '',
            v.size || v.Tamaño || 'Mediano',
            (v.price ?? v.Precio ?? 0).toString(),
            v.imageUrl || v.URL_Imagen || ''
          ];
        } else if (sheet === 'Bar') {
          columns = ['grupo', 'nombre', 'precio', 'stock'];
          rowConverter = (item) => [
            item.group || item.grupo || 'General',
            item.name || item.nombre || '',
            (item.value ?? item.precio ?? item.pvp ?? 0).toString(),
            (item.stock ?? 10).toString()
          ];
        } else if (sheet === 'Cosmetica') {
          columns = ['nombre', 'contenido', 'pvp', 'stock'];
          rowConverter = (item) => [
            item.nombre || '',
            item.contenido || '',
            (item.pvp ?? item.precio ?? item.value ?? 0).toString(),
            (item.stock ?? 10).toString()
          ];
        } else if (sheet === 'Servicios') {
          columns = ['nombre', 'precio', 'descripcion', 'tiempoEstimado'];
          rowConverter = (item) => [
            item.nombre || '',
            (item.precio ?? item.value ?? 0).toString(),
            item.descripcion || '',
            (item.tiempoEstimado ?? 30).toString()
          ];
        } else {
          return res.status(400).json({ error: `Sheet no soportado para upsert: ${sheet}` });
        }

        // Asegurar headers
        const dHeader = await sheetsRequest(token, 'GET', `${fullSheetName}!A1:Z1`);
        if (!dHeader.values || dHeader.values[0]?.[0] !== columns[0]) {
          await sheetsRequest(token, 'PUT', `${fullSheetName}!A1`, [columns]);
        }

        // Buscar fila existente por identificador
        const dIds = await sheetsRequest(token, 'GET', `${fullSheetName}!A:Z`);
        const rows = dIds.values || [];
        
        let idx = -1;
        if (sheet === 'PWA_Vehiculos') {
          const brand = item.brand || item.Marca || '';
          const model = item.model || item.Modelo || '';
          idx = rows.findIndex((r, i) => i > 0 && r[0] === brand && r[1] === model);
        } else {
          const idColName = (sheet === 'PWA_Extras' || sheet === 'Bar' || sheet === 'Cosmetica' || sheet === 'Servicios') ? 'nombre' : 'ID';
          const id = item.id || item.ID || item.nombre || item.name;
          if (!id) return res.status(400).json({ error: `Falta identificador (${idColName}) para upsert` });
          const idColIndex = columns.indexOf(idColName);
          idx = rows.findIndex((r, i) => i > 0 && r[idColIndex] === id);
        }

        const rowData = rowConverter(item);

        if (idx >= 0) {
          const n = idx + 1;
          const range = `${fullSheetName}!A${n}:${String.fromCharCode(65 + columns.length - 1)}${n}`;
          await sheetsRequest(token, 'PUT', range, [rowData]);
          return res.status(200).json({ ok: true, status: 'updated' });
        } else {
          await sheetsRequest(token, 'APPEND', fullSheetName, [rowData]);
          return res.status(200).json({ ok: true, status: 'appended' });
        }
      }

      if (action === 'delete') {
        let columns, idColName;
        if (sheet === 'Ventas') {
          columns = HEADERS_VENTAS;
          idColName = 'ID';
        } else if (sheet === 'Gastos') {
          columns = HEADERS_GASTOS;
          idColName = 'ID';
        } else if (sheet === 'PWA_Extras') {
          columns = HEADERS_EXTRAS;
          idColName = 'nombre';
        } else if (sheet === 'PWA_Vehiculos') {
          columns = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'];
        } else if (sheet === 'Bar') {
          columns = ['grupo', 'nombre', 'precio', 'stock'];
          idColName = 'nombre';
        } else if (sheet === 'Cosmetica') {
          columns = ['nombre', 'contenido', 'pvp', 'stock'];
          idColName = 'nombre';
        } else if (sheet === 'Servicios') {
          columns = ['nombre', 'precio', 'descripcion', 'tiempoEstimado'];
          idColName = 'nombre';
        } else {
          return res.status(400).json({ error: `Sheet no soportado para delete: ${sheet}` });
        }

        const dIds = await sheetsRequest(token, 'GET', `${fullSheetName}!A:Z`);
        const rows = dIds.values || [];
        
        let idx = -1;
        if (sheet === 'PWA_Vehiculos') {
          const brand = item?.brand || item?.Marca || body.brand || body.Marca || '';
          const model = item?.model || item?.Modelo || body.model || body.Modelo || '';
          idx = rows.findIndex((r, i) => i > 0 && r[0] === brand && r[1] === model);
        } else {
          const id = body.id || (item && (item.id || item.ID || item.nombre || item.name));
          if (!id) return res.status(400).json({ error: 'Falta ID o nombre para delete' });
          const idColIndex = columns.indexOf(idColName);
          idx = rows.findIndex((r, i) => i > 0 && r[idColIndex] === id);
        }

        if (idx >= 0) {
          const n = idx + 1;
          const range = `${fullSheetName}!A${n}:${String.fromCharCode(65 + rows[0].length - 1)}${n}`;
          await sheetsRequest(token, 'CLEAR', range);
          return res.status(200).json({ ok: true, status: 'deleted' });
        }
        return res.status(200).json({ ok: true, status: 'not_found' });
      }

      if (action === 'batch') {
        const { columns, rows } = body;
        if (!columns || !Array.isArray(rows)) {
          return res.status(400).json({ error: 'Faltan campos obligatorios: columns, rows' });
        }

        const allowedSheets = ['Ventas', 'Gastos', 'Cierres Caja', 'PWA_Extras', 'PWA_Vehiculos', 'Bar', 'Cosmetica', 'Servicios'];
        if (!allowedSheets.includes(sheet)) {
          return res.status(400).json({ error: `Sheet no soportado para batch: ${sheet}` });
        }

        // 1. Limpiar toda la hoja
        const rangeAll = `${fullSheetName}!A:Z`;
        await sheetsRequest(token, 'CLEAR', rangeAll);

        // 2. Escribir headers + filas
        const values = [columns, ...rows];
        await sheetsRequest(token, 'PUT', `${fullSheetName}!A1`, values);

        return res.status(200).json({ ok: true, status: 'batched' });
      }

      return res.status(400).json({ error: `Accion no soportada: ${action}` });
    }

    return res.status(405).json({ error: 'Metodo no permitido' });
  } catch (e) {
    console.error('[api/pos-sync]', e.message, e.stack);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
