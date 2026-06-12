/**
 * Vercel Serverless Function - Proxy para Google Sheets (Bar y Cosméticos)
 * URL: /api/productos
 * Métodos:
 *   GET /api/productos?sheet=bar        → lista de productos de Bar
 *   GET /api/productos?sheet=cosmetica  → lista de productos de Cosméticos
 *   GET /api/productos                  → ambas listas combinadas { bar: [], cosmetica: [] }
 */

import { getAccessToken, SCOPE_SHEETS } from './_lib/auth.js';

const SPREADSHEET_ID_DEFAULT = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_BAR = 'Bar';
const SHEET_COSMETICA = 'Cosmetica';

async function getAuth() {
  return getAccessToken(SCOPE_SHEETS);
}

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

async function sheetsGet(token, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
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

/**
 * Lee la hoja Bar.
 * Formato esperado de la hoja:
 *   A: grupo | B: nombre | C: precio | D: stock (opcional)
 */
async function getBarProducts(token, spreadsheetId, sheetName = SHEET_BAR) {
  let d;
  try {
    d = await sheetsGet(token, spreadsheetId, `${sheetName}!A:D`);
  } catch (err) {
    if (sheetName.startsWith('PRUEBA-') && (err.message.includes('not found') || err.message.includes('Unable to parse range') || err.message.includes('400') || err.message.includes('404'))) {
      try {
        const fallbackName = sheetName.substring(7);
        d = await sheetsGet(token, spreadsheetId, `${fallbackName}!A:D`);
      } catch (_) {
        return [];
      }
    } else if (err.message.includes('not found') || err.message.includes('Unable to parse range') || err.message.includes('400') || err.message.includes('404')) {
      return [];
    } else {
      throw err;
    }
  }

  const rows = d.values || [];
  if (rows.length <= 1) return [];

  const headers = (rows[0] || []).map(h => h.toString().toLowerCase().trim());
  const groupIdx = headers.indexOf('grupo');
  const nameIdx = headers.indexOf('nombre') !== -1 ? headers.indexOf('nombre') : headers.indexOf('name');
  const valueIdx = headers.indexOf('precio') !== -1 ? headers.indexOf('precio') : (headers.indexOf('value') !== -1 ? headers.indexOf('value') : headers.indexOf('pvp'));
  const stockIdx = headers.indexOf('stock');

  return rows.slice(1)
    .filter(r => nameIdx !== -1 && r[nameIdx])
    .map(r => ({
      group: (groupIdx !== -1 && r[groupIdx]) || 'General',
      name: (nameIdx !== -1 && r[nameIdx]) || '',
      value: parseCleanPrice(valueIdx !== -1 && r[valueIdx]),
      stock: parseCleanStock(stockIdx !== -1 && r[stockIdx], 10),
    }));
}

/**
 * Lee la hoja Cosmetica.
 * Formato esperado de la hoja:
 *   A: nombre | B: contenido | C: pvp | D: stock (opcional)
 */
async function getCosmeticaProducts(token, spreadsheetId, sheetName = SHEET_COSMETICA) {
  let d;
  try {
    d = await sheetsGet(token, spreadsheetId, `${sheetName}!A:D`);
  } catch (err) {
    if (sheetName.startsWith('PRUEBA-') && (err.message.includes('not found') || err.message.includes('Unable to parse range') || err.message.includes('400') || err.message.includes('404'))) {
      try {
        const fallbackName = sheetName.substring(7);
        d = await sheetsGet(token, spreadsheetId, `${fallbackName}!A:D`);
      } catch (_) {
        return [];
      }
    } else if (err.message.includes('not found') || err.message.includes('Unable to parse range') || err.message.includes('400') || err.message.includes('404')) {
      return [];
    } else {
      throw err;
    }
  }

  const rows = d.values || [];
  if (rows.length <= 1) return [];

  const headers = (rows[0] || []).map(h => h.toString().toLowerCase().trim());
  const nombreIdx = headers.indexOf('nombre') !== -1 ? headers.indexOf('nombre') : headers.indexOf('name');
  const contenidoIdx = headers.indexOf('contenido');
  const pvpIdx = headers.indexOf('pvp') !== -1 ? headers.indexOf('pvp') : (headers.indexOf('precio') !== -1 ? headers.indexOf('precio') : headers.indexOf('value'));
  const stockIdx = headers.indexOf('stock');

  return rows.slice(1)
    .filter(r => nombreIdx !== -1 && r[nombreIdx])
    .map(r => ({
      nombre: (nombreIdx !== -1 && r[nombreIdx]) || '',
      contenido: (contenidoIdx !== -1 && r[contenidoIdx]) || '',
      pvp: parseCleanPrice(pvpIdx !== -1 && r[pvpIdx]),
      stock: parseCleanStock(stockIdx !== -1 && r[stockIdx], 10),
    }));
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
    const sheet = req.query?.sheet || '';
    const isTest = req.query?.test === 'true';
    const spreadsheetId = req.query?.spreadsheetId || req.query?.spreadsheetID || SPREADSHEET_ID_DEFAULT;

    const sheetBarName = isTest ? `PRUEBA-${SHEET_BAR}` : SHEET_BAR;
    const sheetCosmeticaName = isTest ? `PRUEBA-${SHEET_COSMETICA}` : SHEET_COSMETICA;

    if (sheet === 'bar') {
      const bar = await getBarProducts(token, spreadsheetId, sheetBarName);
      return res.status(200).json({ ok: true, data: bar });
    }

    if (sheet === 'cosmetica') {
      const cosmetica = await getCosmeticaProducts(token, spreadsheetId, sheetCosmeticaName);
      return res.status(200).json({ ok: true, data: cosmetica });
    }

    // Sin filtro: retornar ambas
    const [bar, cosmetica] = await Promise.all([
      getBarProducts(token, spreadsheetId, sheetBarName),
      getCosmeticaProducts(token, spreadsheetId, sheetCosmeticaName),
    ]);

    return res.status(200).json({ ok: true, bar, cosmetica });
  } catch (e) {
    console.error('[api/productos]', e.message, e.stack);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
