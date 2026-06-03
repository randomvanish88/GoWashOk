/**
 * Script para listar imágenes de Google Drive y actualizar Google Sheets
 * Usa las mismas credenciales del service account de GoWash
 */

const { google } = require('googleapis');

const CREDENTIALS = {
  type: "service_account",
  project_id: "gowash-db-496413",
  private_key_id: "f6d0c0f05f12ea9b752d05db3b38ef336a4cc735",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYIZzszgpI0VdS\nxWfVoybofOEZ1IwB1GCZozfqp5V6l6Cx2S3//GsjbTtKRGx1jXMaBtodoD3tHu/n\n0nffKS0BgzxoWNa4jMl12I78B8a4cDS0L5dW3W9EgR8d1V0owvyLbsxRpH/6y+vq\nhS4Kk7A1lsMhZn2IcBRtJYZeZhHhJEQfhjAPfdfHRQd1t+rjBfVjbyVkZ7QYebad\ntY0pE95A3uG87SL0k48obdja+cL/TCvSUPSgKl5fZRWTfMDtMPZo+Y1wzOR93Uvo\njDcszV/bCiZDolYHd5XvJ+XR7gtdqEH+ApE0/G9sq6pKS3KVGxkqhLSrCGhagCvE\nAj5YIf/ZAgMBAAECggEASBbiFDxfQs2Mjl+o1CHgsvAgVvDFqECR3f0KhBrUqXjU\n0S1rAfTMOZtQCOQMtyLwjvBVJUeTEDne9FiHwigmSlhfOEDVkeXntoZ+nsLrPg6z\nDZzIImGmoNderSFDOvraqJlSzjKLu3f0Hxu/8Sg0wJMiT8wzN+SGc6duC6OI+Cp3\nEW4vgOJkMqPSbHUSC5Di8c0xRiAXVi2Ny9RcjcmAsrtvlxN5SXnfuEBr6TUt8lKR\nZV/jLoxzm6wkLX/WhrZJsAkmrbYR7L137kUshJOTfaBuS3xakce8dqX9ux6SqN35\nCGVwHurpvrY3Is7IMRI2oCbvH/eqDH1EbRXVLpXNPwKBgQDyCUog/MDxjtPIdcnj\nTppzr6e0GO0kGyqPTEgEJk/viW70GCa1Xgu3m08O/P28vCWeOyIq+y01iaPoz5Lq\nzsLQof/UzX2NCNwP1eByrKeVjF7n/oJt4RXVwo4zDaZIe8ZXrxqfl3Fd89sKAfG9\nrB1ukXG+/vAFSOQnWpd6HzkUiwKBgQDkmbl3853hn5yPHkqBuDvEGLFHP4F0dZKE\nNlsObauD0HreXEbFsQ30sueXivOJtVKOIUQDc5V2FI8AC2prMgfzi1ga02wbxfuc\nfnKPoixcA97lbh+nhrVXkNAylLq+dMwgucPKkPWOTjdRMOlYENhVtJI3NwJ1KSUp\nZbgalNG1qwKBgQDZb7cEw4yidemU4Ryp9GeVHmzOwsXn9e/aJHFeKP0O+KyQ5VGB\nBigInqH7mRRqhaxV5lHfwx7uReTWtgQKpg0mWSL4DlOIbDkmkMG+w5UaKKzqRh7u\nj5OKIeqVuuFzpJ6fD1Qfo3HZMcXJy81c1E7skgVZzLXcSYuOPzhuIbap2QKBgQCM\nQc1LzYsm7ZlPLlSkdnck/8l1X398Bs8Yk4kWty8utvFMEO3TSai4ZDQ4BKcb7MZ0\nMfDa9UXUpxR+AIMQtieuw+YQv3trJvQTtnlvqx7wbeeKeSCu1rXYvh8fiaVySZMc\n2R1J4drnrxG9nPbuc5doLlwvyG6Xl+EXHzPwCzMH9QKBgBsSLvMCldu3x4EuiX4H\nbIK2e6gijQC/juXhiUeNMHdkx89HN2RrRSGaV15Eys2iMMUSvKynuMeI1bur2YbY\n+ETkKUx/Z/vaYZlyogx3X7J0hejjedQsWM9XgtY/G0NXxxRgjECmhyeL3bBAmd4P\nJ1Rmx+e/HDerkKUnWFTDj6IR\n-----END PRIVATE KEY-----\n",
  client_email: "gowash-sync@gowash-db-496413.iam.gserviceaccount.com",
  client_id: "107095811744069109144",
};

const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const DRIVE_FOLDER_ID = '18kTs94XXcfyY67indJu_dAkQxQM2HTEd';
const SHEET_NAME = 'PWA_Vehiculos';

// Mapeo de nombre de carpeta Drive → categoría/modelo GoWash
// El precio y tamaño se infieren del nombre de la carpeta
function parsearCategoria(nombreCarpeta) {
  const n = nombreCarpeta.toLowerCase();
  if (n.includes('25000') || n.includes('25.000') || n.includes('3y5') || n.includes('3 y 5')) {
    return { modelo: '3-5 Puertas', tamaño: 'Pequeño', precio: 25000 };
  }
  if (n.includes('28000') || n.includes('28.000') || n.includes('5 puertas')) {
    return { modelo: '5 Puertas', tamaño: 'Mediano', precio: 28000 };
  }
  if (n.includes('30000') || n.includes('30.000') || n.includes('suv chi') || n.includes('suv med')) {
    return { modelo: 'SUV Pequeño-Medio', tamaño: 'Mediano', precio: 30000 };
  }
  if (n.includes('35000') || n.includes('35.000') || n.includes('suv grande') || n.includes('camioneta')) {
    return { modelo: 'SUV Grande', tamaño: 'Grande', precio: 35000 };
  }
  if (n.includes('40000') || n.includes('40.000') || n.includes('ram') || n.includes('miniban')) {
    return { modelo: 'Camioneta/Minivan', tamaño: 'Grande', precio: 40000 };
  }
  return { modelo: 'General', tamaño: 'Mediano', precio: 28000 };
}

// Extraer nombre del vehículo del nombre del archivo (sin extensión)
function nombreVehiculo(nombreArchivo) {
  return nombreArchivo.replace(/\.[^/.]+$/, '').trim();
}

async function main() {
  console.log('🔌 Conectando con Google APIs...');

  const auth = new google.auth.JWT({
    email: CREDENTIALS.client_email,
    key: CREDENTIALS.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Listar subcarpetas de la carpeta principal
  console.log('\n📁 Listando subcarpetas en Drive...');
  const foldersRes = await drive.files.list({
    q: `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  let subcarpetas = foldersRes.data.files || [];
  console.log(`   Encontradas: ${subcarpetas.length} carpetas`);
  subcarpetas.forEach(f => console.log(`   - ${f.name} (${f.id})`));

  // Si solo hay una carpeta "vehiculos lavadero", entrar en ella y buscar las subcarpetas reales
  if (subcarpetas.length === 1) {
    console.log(`\n   Entrando en subcarpeta: ${subcarpetas[0].name}...`);
    const subRes = await drive.files.list({
      q: `'${subcarpetas[0].id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });
    const subSub = subRes.data.files || [];
    if (subSub.length > 0) {
      console.log(`   Encontradas ${subSub.length} subcarpetas de categoría:`);
      subSub.forEach(f => console.log(`   - ${f.name}`));
      subcarpetas = subSub;
    }
  }

  if (subcarpetas.length === 0) {
    console.error('❌ No se encontraron subcarpetas de categorías.');
    process.exit(1);
  }

  // 2. Para cada subcarpeta, listar las imágenes
  const vehiculos = [];

  for (const carpeta of subcarpetas) {
    const categoria = parsearCategoria(carpeta.name);
    console.log(`\n📂 ${carpeta.name} → ${categoria.modelo} ($${categoria.precio})`);

    const archivosRes = await drive.files.list({
      q: `'${carpeta.id}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 200,
    });

    const archivos = archivosRes.data.files || [];
    console.log(`   ${archivos.length} imágenes encontradas`);

    for (const archivo of archivos) {
      const marca = nombreVehiculo(archivo.name);
      // URL directa de imagen via lh3.googleusercontent.com (funciona en web y desktop sin redirecciones)
      const urlImagen = `https://lh3.googleusercontent.com/d/${archivo.id}`;

      vehiculos.push({
        Marca: marca,
        Modelo: categoria.modelo,
        Tamaño: categoria.tamaño,
        Precio: categoria.precio,
        URL_Imagen: urlImagen,
        Drive_ID: archivo.id,
      });

      console.log(`   ✓ ${marca} → ${archivo.id}`);
    }
  }

  console.log(`\n📊 Total vehículos encontrados: ${vehiculos.length}`);

  // 3. Actualizar Google Sheets con los datos
  console.log('\n📝 Actualizando Google Sheets...');

  // Limpiar hoja existente
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:F`,
  });

  // Escribir headers
  const headers = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen', 'Drive_ID'];
  const rows = vehiculos.map(v => [
    v.Marca, v.Modelo, v.Tamaño, v.Precio, v.URL_Imagen, v.Drive_ID
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers, ...rows],
    },
  });

  console.log(`✅ Google Sheets actualizado con ${vehiculos.length} vehículos`);

  // 4. Exportar también el JSON para Vercel (web)
  const fs = require('fs');
  const path = require('path');
  const jsonData = {
    total: vehiculos.length,
    timestamp: new Date().toISOString(),
    headers: ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'],
    rows: vehiculos.map(v => ({
      Marca: v.Marca,
      Modelo: v.Modelo,
      Tamaño: v.Tamaño,
      Precio: v.Precio,
      URL_Imagen: v.URL_Imagen,
    }))
  };

  const jsonPath = path.join(__dirname, '../public/vehiculos-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`✅ public/vehiculos-data.json actualizado con ${vehiculos.length} vehículos`);

  console.log('\n🎉 Listo.');
  console.log('   ✓ Google Sheets actualizado (Desktop)');
  console.log('   ✓ vehiculos-data.json actualizado (Web/Vercel)');
  console.log('   ✓ URLs lh3.googleusercontent.com funcionan en todos los entornos');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  if (err.message.includes('insufficientPermissions') || err.message.includes('notFound')) {
    console.error('\n💡 Asegurate de compartir la carpeta con: gowash-sync@gowash-db-496413.iam.gserviceaccount.com');
  }
  process.exit(1);
});
