import fs from 'fs';

// SVG icon GoWash - fondo oscuro, círculo verde, letras GW
const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size*0.15}" fill="#0f172a"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.38}" fill="#10b981"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial,sans-serif" font-size="${size*0.32}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">GW</text>
</svg>`;

// Guardar como SVG (los navegadores los aceptan como íconos PWA)
fs.writeFileSync('public/icon-192.svg', svgIcon(192));
fs.writeFileSync('public/icon-512.svg', svgIcon(512));
fs.writeFileSync('public/apple-touch-icon.svg', svgIcon(180));

console.log('Iconos SVG generados correctamente');
