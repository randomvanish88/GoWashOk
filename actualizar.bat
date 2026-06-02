@echo off
cd /d "C:\Users\Usuario\OneDrive\Escritorio\GoWash"
echo Construyendo app...
call npm run build
echo.
echo Subiendo a GitHub (Vercel se actualiza solo)...
git add -A
git commit -m "Fix manifest PWA + vercel.json simplificado"
git push origin main
echo.
echo ========================================
echo  Listo! Vercel se actualizara en ~1 min
echo  URL: https://go-wash-ok.vercel.app
echo ========================================
pause
