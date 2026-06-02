@echo off
title GoWash - Iniciando sistema...
color 0A

echo.
echo  ==========================================
echo   GoWash POS v15 - Iniciando sistema...
echo  ==========================================
echo.

:: Iniciar App Web con acceso desde red local (telefono)
echo  Iniciando GoWash POS...
start "GoWash POS" /min cmd /c "cd /d %~dp0 && npm run dev -- --host"

:: Esperar que Vite arranque
timeout /t 5 /nobreak >nul

:: Abrir App Web en el navegador de la PC
start http://localhost:5173

echo.
echo  ==========================================
echo   Sistema GoWash listo!
echo.
echo   App Web (PC):      http://localhost:5173
echo   PWA (telefono):    http://192.168.0.86:5173
echo.
echo   El telefono debe estar en el mismo WiFi.
echo   Abri esa URL en Chrome del telefono.
echo  ==========================================
echo.
pause
