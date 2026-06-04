/**
 * Script para crear y poblar las hojas "Bar" y "Cosmetica" en Google Sheets.
 * Ejecutar una sola vez con: node scripts/setup-productos-sheets.cjs
 */

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';

const CREDENTIALS = {
  client_email: 'gowash-sync@gowash-db-496413.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n',
};

const BAR_DATA = [
  ['grupo', 'nombre', 'precio', 'stock'],
  ['Cafetería', 'Café Negro Posillo', 3000, 50],
  ['Cafetería', 'Café Negro Jarrito', 3000, 50],
  ['Cafetería', 'Café Negro Doble (Americano)', 3500, 50],
  ['Cafetería', 'Café Cortado Jarrito', 3500, 50],
  ['Cafetería', 'Café Lagrima Jarrito', 3500, 50],
  ['Cafetería', 'Café con Leche', 4000, 50],
  ['Cafetería', 'Té (en tetera)', 3000, 50],
  ['Cafetería', 'Té con Leche', 3500, 50],
  ['Bebidas', 'CocaCola 500 cc', 2300, 20],
  ['Bebidas', 'CocaCola Light 500 cc', 2300, 20],
  ['Bebidas', 'Sprite 500 cc', 2300, 20],
  ['Bebidas', 'Sprite Zero 500 cc', 2300, 20],
  ['Bebidas', 'Fanta 500 cc', 2300, 20],
  ['Bebidas', 'SmartWater 500 cc', 2000, 20],
  ['Bebidas', 'SmartW C/Gas 500 cc', 2000, 20],
  ['Bebidas', 'Powerade 500 cc', 2000, 20],
  ['Bebidas', 'Levite Manzana 500 cc', 2000, 20],
  ['Bebidas', 'Levite Pomelo 500 cc', 2000, 20],
  ['Bebidas', 'Aquarius Pera 500 cc', 2000, 20],
  ['Comidas', 'Super Pancho Simple', 2000, 30],
  ['Comidas', 'Super Pancho Completo', 2000, 30],
  ['Comidas', 'Tostado doble de JyQ', 6500, 20],
  ['Comidas', 'Tostado Árabe', 6500, 20],
  ['Comidas', 'Medialuna de Manteca', 1200, 40],
  ['Comidas', 'Alfajor Maicena', 2000, 30],
  ['Comidas', 'Alfajor Chocolate', 2000, 30],
  ['Comidas', 'Alfajor RASTA', 2000, 30],
  ['Comidas', 'Donas rellenas', 2500, 20],
  ['Comidas', 'Muffins', 3500, 20],
  ['Comidas', 'Waffle de JyQ', 5500, 20],
  ['Promos', 'Café con leche + 2 medialunas', 7600, 99],
  ['Promos', 'Café con leche + Tostado árabe', 9450, 99],
  ['Promos', 'Café con leche + Waffle JyQ', 8550, 99],
  ['Promos', 'Café con leche + Muffin', 6750, 99],
  ['Promos', 'Café con leche + Donas', 5850, 99],
  ['Cervezas', 'BlueMoon 330 cc', 5500, 24],
  ['Cervezas', 'Heineken 330 cc', 4000, 24],
  ['Cervezas', 'STELLA 330 cc', 3000, 24],
  ['Cervezas', 'SOL 330 cc', 3400, 24],
  ['Cervezas', 'MILLER 330 cc', 3000, 24],
  ['Cervezas', 'BRAHMA 473 cc', 3000, 24],
  ['Cervezas', 'Heineken 473 cc', 3500, 24],
  ['Cervezas', 'Imperial Gold 473 cc', 3200, 24],
  ['Cervezas', 'AMSTEL 473 cc', 3200, 24],
  ['Cervezas', 'Schneider 473 cc', 2600, 24],
  ['Cervezas', 'CORONA 330 cc', 3000, 24],
];

const COSMETICA_DATA = [
  ['nombre', 'contenido', 'pvp', 'stock'],
  ['Aromatizante Walker', '10 g', 2164, 20],
  ['Estrellas', '7g', 1623, 20],
  ['Bolitas', '', 1623, 20],
  ['Atomizadores', '60 cm3', 7303, 10],
  ['Atomizadores Linea Gold', '60 cm³', 7303, 10],
  ['Atomizadores', '120 cm3', 11360, 10],
  ['Fragancia Uso Profesional', '250 cm3', 13524, 5],
  ['Fragancia Uso Profesional', '500 cm3', 24344, 5],
  ['Fragancia Uso Profesional', '5L', 240463, 2],
  ['Perfumina para Ropa', '200 cm3', 5031, 10],
  ['Mini Latita Walker (Frag. Sólida Gel)', '40 g', 8652, 10],
  ['Latita Walker (Frag. Sólida Gel)', '80 g', 12977, 10],
  ['Latita Walker Camión (Frag. Sólida Gel)', '200 g', 30280, 5],
  ['Walker Electric', '3,2 cm3', 16229, 10],
  ['Walker Electric Repuesto', '3,2 cm3', 5151, 10],
  ['Fragancia Climatizador', '120 cm3', 5139, 10],
  ['Walker Cubo', '8 cm3', 7574, 10],
  ['Walker Cubo Repuesto', '8 cm3', 4598, 10],
  ['Walker Mini Cubo', '4 cm3', 4057, 10],
  ['Yony Walker', '10 g', 2543, 20],
  ['Walker Sport', '7 cm3', 8061, 10],
  ['Walker Sport Repuesto', '7 cm3', 4923, 10],
  ['Magic Walker', '5 cm3', 7574, 10],
  ['Aromatizante Rejilla Minigitorio', '', 3787, 10],
  ['Silicona Perfumada', '120 cm³', 6537, 10],
  ['Silicona Perfumada', '250 cm³', 11992, 10],
  ['Silicona Perfumada', '500 cm³', 20286, 5],
  ['Revividor de Negro', '250 cm3', 5840, 10],
  ['Revividor de Negro Brillante en Gel', '250 cm3', 6455, 10],
  ['Revividor de Negro', '500 cm3', 7254, 10],
  ['Desengrasante en Spray', '500 cm3', 9738, 10],
  ['Shampoo Siliconado', '250 cm3', 5193, 10],
  ['Shampoo Siliconado', '500 cm3', 6600, 10],
  ['Antiempañante', '60 cm3', 10116, 10],
  ['Lavaparabrisas', '250 cm3', 6492, 10],
  ['Lavaparabrisas', '500 cm3', 8926, 10],
  ['Cera', '250 cm3', 5410, 10],
  ['Cera', '500 cm3', 6492, 10],
  ['Cera Polish Clásica Protectora (Etiqueta Roja)', '450 cm3', 7303, 10],
  ['Cera Polish Lustre Intenso (Etiqueta Azul)', '450 cm3', 7303, 10],
  ['Limpiacristales en Spray', '500 cm3', 12442, 10],
];

async function getToken() {
  const { createSign } = require('crypto');
  
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(JSON.stringify({
    iss: CREDENTIALS.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${claims}`);
  const sig = sign.sign(CREDENTIALS.private_key, 'base64url');
  const jwt = `${header}.${claims}.${sig}`;
  
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await resp.json();
  return data.access_token;
}

async function createSheet(token, title) {
  // Verificar si ya existe
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const info = await resp.json();
  const exists = info.sheets?.some(s => s.properties?.title === title);
  
  if (exists) {
    console.log(`✓ Hoja "${title}" ya existe, omitiendo creación`);
    return;
  }
  
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title } } }],
    }),
  });
  const res = await r.json();
  if (res.error) {
    console.error(`Error creando hoja ${title}:`, res.error.message);
  } else {
    console.log(`✅ Hoja "${title}" creada`);
  }
}

async function writeData(token, sheet, data) {
  const range = `${sheet}!A1`;
  const resp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: data }),
    }
  );
  const res = await resp.json();
  if (res.error) {
    console.error(`Error escribiendo en ${sheet}:`, res.error.message);
  } else {
    console.log(`✅ Datos escritos en "${sheet}": ${data.length - 1} filas`);
  }
}

async function main() {
  console.log('🚀 Configurando hojas de productos en Google Sheets...\n');
  
  const token = await getToken();
  console.log('✅ Token obtenido\n');
  
  await createSheet(token, 'Bar');
  await createSheet(token, 'Cosmetica');
  
  await writeData(token, 'Bar', BAR_DATA);
  await writeData(token, 'Cosmetica', COSMETICA_DATA);
  
  console.log('\n✅ Configuración completa!');
  console.log('Las hojas "Bar" y "Cosmetica" están listas en el Spreadsheet.');
  console.log('Podés editarlas directamente en Google Sheets para actualizar precios.');
}

main().catch(console.error);
