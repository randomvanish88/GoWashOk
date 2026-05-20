## Build‑Installer for GoWash v7 (PowerShell)
# This script prepares the environment and creates a native Windows installer (NSIS) in the
# ``dist_electron`` folder, exactly like the previous v6 installer.
# It does NOT modify any source files; it only runs the build commands.

# ------------------------------------------------------------
# 1️⃣ Ensure we are in the project root (where package.json lives)
# ------------------------------------------------------------
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
Write-Host "🚀 Building GoWash v7 installer in $projectRoot"

# ------------------------------------------------------------
# 2️⃣ Verify Node & npm are available
# ------------------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Install it before running this script."
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed. Install it before running this script."
    exit 1
}

# ------------------------------------------------------------
# 3️⃣ Install npm dependencies
# ------------------------------------------------------------
Write-Host "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed. Aborting."; exit $LASTEXITCODE }


# ------------------------------------------------------------
# 4️⃣ Build the Vite front‑end (production) – required for electron
# ------------------------------------------------------------
Write-Host "Building Vite production bundle…"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Vite build failed. Aborting."; exit $LASTEXITCODE }

# ------------------------------------------------------------
# 5️⃣ Create the Electron installer (NSIS) using electron‑builder
# ------------------------------------------------------------
Write-Host "Running electron:build to generate the Windows installer…"
npm run electron:build
if ($LASTEXITCODE -ne 0) { Write-Error "Electron build failed. Check the console output for details."; exit $LASTEXITCODE }

# ------------------------------------------------------------
# 6️⃣ Final information
# ------------------------------------------------------------
$installerPath = Join-Path $projectRoot "dist_electron"
Write-Host "✅ Installer build complete!\nYou will find the NSIS installer (e.g., GoWash Setup *.exe) inside:"
Write-Host $installerPath

# Optional: Open the folder for convenience
# explorer $installerPath
