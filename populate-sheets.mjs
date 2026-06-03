#!/usr/bin/env node
/**
 * Script para poblar PWA_Vehiculos en Google Sheets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración
const SPREADSHEET_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';
const SHEET_NAME = 'PWA_Vehiculos';
const VEHICULOS_DIR = path.join(__dirname, 'vehiculos lavadero');

// Mapeo de carpetas
const CATEGORIAS = {
  '$25000 3Y5 PUERTAS': {
    precio: 25000,
    tamano: 'Pequeño',
    categoria: '3-5 Puertas'
  },
  '$28.000   5 PUERTAS UTILITARIOS Y DEPORTIVOS': {
    precio: 28000,
    tamano: 'Mediano',
    categoria: '5 Puertas'
  },
  '$30.000 SUV CHI Y MED': {
    precio: 30000,
    tamano: 'Mediano',
    categoria: 'SUV Pequeño-Medio'
  },
  '$35.000 SUV GRANDES Y CAMIONETAS': {
    precio: 35000,
    tamano: 'Grande',
    categoria: 'SUV Grande'
  },
  '$40.000 CAMIONETAS RAM Y MINIBAN': {
    precio: 40000,
    tamano: 'Grande',
    categoria: 'Camioneta Premium'
  }
};

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.jfif'];

function leerVehiculos() {
  const vehiculos = [];

  for (const [carpeta, info] of Object.entries(CATEGORIAS)) {
    const carpetaPath = path.join(VEHICULOS_DIR, carpeta);

    if (!fs.existsSync(carpetaPath)) {
      console.warn(`⚠️  Carpeta no encontrada: ${carpetaPath}`);
      continue;
    }

    const archivos = fs.readdirSync(carpetaPath);
    const imagenes = archivos.filter(archivo => {
      const ext = path.extname(archivo).toLowerCase();
      return EXTENSIONES.includes(ext) && !archivo.includes('$');
    });

    for (const imagen of imagenes.sort()) {
      const nombre = path.parse(imagen).name.toUpperCase();
      vehiculos.push({
        Marca: nombre,
        Modelo: info.categoria,
        Tamaño: info.tamano,
        Precio: info.precio,
        URL_Imagen: `/vehiculos lavadero/${carpeta}/${imagen}`
      });
    }
  }

  return vehiculos;
}

function generarTablaseparadaPorTabs(vehiculos) {
  // Formato para copiar en Google Sheets (tabulaciones para columnas)
  const headers = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'];
  const rows = vehiculos.map(v => [
    v.Marca,
    v.Modelo,
    v.Tamaño,
    v.Precio,
    v.URL_Imagen
  ]);

  return [
    headers.join('\t'),
    ...rows.map(r => r.join('\t'))
  ].join('\n');
}

function generarCSV(vehiculos) {
  const headers = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'];
  const rows = vehiculos.map(v => [
    `"${v.Marca}"`,
    `"${v.Modelo}"`,
    `"${v.Tamaño}"`,
    v.Precio,
    `"${v.URL_Imagen}"`
  ]);

  return [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}

function guardarJSON(vehiculos) {
  const salida = path.join(__dirname, 'vehiculos-data.json');
  fs.writeFileSync(salida, JSON.stringify({
    total: vehiculos.length,
    timestamp: new Date().toISOString(),
    headers: ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen'],
    datos: vehiculos
  }, null, 2));

  console.log(`✅ Guardado: ${salida}`);
  return salida;
}

function guardarTSV(vehiculos) {
  const contenido = generarTablaseparadaPorTabs(vehiculos);
  const salida = path.join(__dirname, 'vehiculos-data.tsv');
  fs.writeFileSync(salida, contenido);
  console.log(`✅ Guardado: ${salida}`);
  return salida;
}

function mostrarResumen(vehiculos) {
  console.log('\n' + '='.repeat(100));
  console.log(`📊 RESUMEN DE VEHÍCULOS`);
  console.log('='.repeat(100));

  // Agrupar por categoría
  const porCategoria = {};
  for (const v of vehiculos) {
    if (!porCategoria[v.Modelo]) porCategoria[v.Modelo] = 0;
    porCategoria[v.Modelo]++;
  }

  console.log('\nPor Categoría:');
  for (const [cat, count] of Object.entries(porCategoria).sort()) {
    console.log(`  ${cat}: ${count} vehículos`);
  }

  console.log(`\n📈 Total: ${vehiculos.length} vehículos\n`);

  console.log('Ejemplo de primeros 5:');
  console.log(JSON.stringify(vehiculos.slice(0, 5), null, 2));
  console.log('='.repeat(100) + '\n');
}

// Main
console.log('🔍 Leyendo vehículos...\n');

const vehiculos = leerVehiculos();

if (vehiculos.length === 0) {
  console.error('❌ No se encontraron vehículos');
  process.exit(1);
}

mostrarResumen(vehiculos);

// Guardar formatos
guardarJSON(vehiculos);
const tsvFile = guardarTSV(vehiculos);

// Guardar CSV
const csv = generarCSV(vehiculos);
const archivoCSV = path.join(__dirname, 'vehiculos-data.csv');
fs.writeFileSync(archivoCSV, csv);
console.log(`✅ Guardado: ${archivoCSV}`);

console.log('\n📝 INSTRUCCIONES PARA GOOGLE SHEETS:');
console.log('=====================================');
console.log('1. Abre: https://docs.google.com/spreadsheets/d/1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8');
console.log('2. Ve a la pestaña "PWA_Vehiculos"');
console.log('3. Selecciona TODO y borra (Ctrl+A, Delete)');
console.log(`4. Opción A - Pegado rápido (RECOMENDADO):`);
console.log(`   - Abre ${tsvFile} con Bloc de Notas`);
console.log('   - Copia TODO (Ctrl+A, Ctrl+C)');
console.log('   - En Google Sheets, haz clic en A1');
console.log('   - Pega con Ctrl+V');
console.log(`\n5. Opción B - Pegado especial:`);
console.log(`   - Haz clic en Datos → Importar`);
console.log(`   - Sube ${archivoCSV}`);
console.log('   - Elige importar en la pestaña actual');

console.log('\n✨ ¡Listo! Las imágenes estarán disponibles en web, desktop y APK\n');
