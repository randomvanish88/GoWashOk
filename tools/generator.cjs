const crypto = require('crypto');
const readline = require('readline');

// DEBE SER LA MISMA QUE EN main.cjs
const MASTER_SECRET = 'GoWash_Secret_2026_Admin'; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('--- GENERADOR DE LICENCIAS GOWASH ---');

rl.question('Ingrese el ID de Hardware del cliente: ', (rawId) => {
  const machineId = rawId.trim();
  if (!machineId) {
    console.log('Error: El ID no puede estar vacío.');
    rl.close();
    return;
  }

  const activationKey = crypto
    .createHmac('sha256', MASTER_SECRET)
    .update(machineId)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();

  console.log('\n--------------------------------------');
  console.log(`ID DE HARDWARE: ${machineId}`);
  console.log(`CLAVE DE ACTIVACIÓN: ${activationKey}`);
  console.log('--------------------------------------\n');

  rl.close();
});
