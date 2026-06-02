@echo off
echo ========================================
echo    GoWash - Inicio para Moviles
echo ========================================
echo.
echo Obteniendo direccion IP de la red...
echo.

REM Obtener la IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo Tu IP local es: %IP%
echo.
echo ========================================
echo   INSTRUCCIONES PARA EL CELULAR:
echo ========================================
echo.
echo 1. Conecta tu celular a la MISMA red WiFi
echo 2. Abre Chrome o Safari en el celular
echo 3. Escribe esta URL:
echo.
echo    http://%IP%:5173
echo.
echo 4. Para instalar como app:
echo    - Android: Menu (tres puntos) ^> Agregar a pantalla de inicio
echo    - iOS: Boton compartir ^> Agregar a pantalla de inicio
echo.
echo ========================================
echo   Iniciando servidor...
echo ========================================
echo.

npm run dev -- --host

pause
