const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_ID = '1V6EmrQQIExA3UtAUeJsdAZESa1S5WiGQRAOsfHsQ6E8';

async function run() {
  const rootDir = path.join(__dirname, '..');
  const credsPath = path.join(rootDir, 'google-credentials.json');
  console.log("Reading credentials from:", credsPath);
  if (!fs.existsSync(credsPath)) {
    throw new Error("google-credentials.json not found in project root");
  }
  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const configPath = path.join(appData, 'GoWash POS', 'gowash-config.json');
  console.log("Checking config file at:", configPath);
  let spreadsheetId = DEFAULT_ID;
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log("Config file content:", config);
      if (config.spreadsheetId) {
        spreadsheetId = config.spreadsheetId;
      }
    } catch (e) {
      console.error("Error reading config file:", e);
    }
  }

  console.log("Connecting to spreadsheet:", spreadsheetId);

  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const tokenObj = await auth.getAccessToken();
  const token = tokenObj.token;
  
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  
  const metadataResp = await fetch(base, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metadataResp.ok) {
    console.error("Error fetching metadata:", metadataResp.status, await metadataResp.text());
    return;
  }
  const metadata = await metadataResp.json();
  const sheetTitles = metadata.sheets?.map(s => s.properties?.title) || [];
  console.log("Available sheets in document:", sheetTitles);

  for (const sheetName of sheetTitles) {
    if (sheetName.toLowerCase().includes('cierre')) {
      console.log(`\n--- Inspecting sheet: "${sheetName}" ---`);
      const url = `${base}/values/${encodeURIComponent(sheetName)}!A:Z`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        const data = await resp.json();
        const rows = data.values || [];
        console.log(`Total rows in "${sheetName}": ${rows.length}`);
        if (rows.length > 0) {
          console.log("Headers:", rows[0]);
          const lastRows = rows.slice(-5);
          console.log(`Last ${lastRows.length} rows:`);
          lastRows.forEach((row, i) => {
            console.log(` Row ${rows.length - lastRows.length + i + 1}:`, row);
          });
        }
      } else {
        console.log(`Error reading sheet "${sheetName}":`, resp.status);
      }
    }
  }
}

run().catch(console.error);
