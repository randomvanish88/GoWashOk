const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Crear directorio si no existe
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Crear un SVG simple para el icono
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0f172a"/>
  <circle cx="512" cy="512" r="400" fill="#10b981"/>
  <text x="512" y="600" font-size="300" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">GW</text>
</svg>
`;

// Crear un SVG para el splash
const splashSvg = `
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1920" fill="#0f172a"/>
  <circle cx="540" cy="960" r="300" fill="#10b981"/>
  <text x="540" y="1050" font-size="200" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">GoWash</text>
  <text x="540" y="1150" font-size="80" fill="#d1d5db" text-anchor="middle" font-family="Arial">POS Mobile</text>
</svg>
`;

// Crear un SVG para el favicon
const faviconSvg = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#0f172a"/>
  <circle cx="96" cy="96" r="80" fill="#10b981"/>
  <text x="96" y="120" font-size="60" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">GW</text>
</svg>
`;

async function generateAssets() {
  try {
    console.log('Generando assets...');

    // Generar icon.png (1024x1024)
    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ icon.png generado');

    // Generar splash.png (1080x1920)
    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✓ splash.png generado');

    // Generar adaptive-icon.png (1024x1024)
    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✓ adaptive-icon.png generado');

    // Generar favicon.png (192x192)
    await sharp(Buffer.from(faviconSvg))
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✓ favicon.png generado');

    console.log('\n✅ Todos los assets fueron generados exitosamente');
  } catch (error) {
    console.error('Error generando assets:', error);
    process.exit(1);
  }
}

generateAssets();
