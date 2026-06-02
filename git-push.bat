@echo off
cd /d "C:\Users\Usuario\OneDrive\Escritorio\GoWash"
git add -A
git commit -m "PWA movil completa + Google Sheets + despliegue Vercel v17.0.0"
git push origin main
echo.
echo ======================================
echo  Push completado. Abre Vercel web:
echo  https://vercel.com/new
echo ======================================
pause
