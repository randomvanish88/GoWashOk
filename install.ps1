## GoWash Installer Script
# This PowerShell script installs the project dependencies and builds the app while preserving any existing data.
# It creates a timestamped backup of selected data folders before reinstalling.

$ErrorActionPreference = "Stop"

# Resolve the directory where this script resides (project root)
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "🚀 Starting installation in $ProjectRoot"

# -------------------------------
# 1️⃣ Backup existing data
# -------------------------------
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $ProjectRoot "backup_$timestamp"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# Adjust this list to match any folders that hold user data you want to keep.
$foldersToPreserve = @(
    "src/app/data",
    "src/app/storage",
    "public"
)
foreach ($relPath in $foldersToPreserve) {
    $src = Join-Path $ProjectRoot $relPath
    if (Test-Path $src) {
        $dest = Join-Path $BackupDir $relPath
        Write-Host "📦 Backing up $relPath → $dest"
        Copy-Item -Path $src -Destination $dest -Recurse -Force
    }
}

# -------------------------------
# 2️⃣ Install npm dependencies
# -------------------------------
Set-Location $ProjectRoot
if (Test-Path "package-lock.json") {
    Write-Host "🔧 Running 'npm ci' (clean install)"
    npm ci
} else {
    Write-Host "🔧 Running 'npm install'"
    npm install
}

# -------------------------------
# 3️⃣ Build (optional but recommended)
# -------------------------------
Write-Host "⚙️ Building the project (npm run build)"
npm run build

Write-Host "✅ Installation complete! Run 'npm run dev' to start the development server."
