@echo off
chcp 65001 >nul
cls
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║          🚀 DESPLIEGUE RÁPIDO - GOWASH 🚀            ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo.
echo 📋 INSTRUCCIONES:
echo.
echo    Este script abrirá el proceso de despliegue.
echo    Vercel te mostrará opciones interactivas.
echo.
echo    TUS PROYECTOS EXISTENTES DETECTADOS:
echo       • go-wash-ok
echo       • go-wash-lavadero  
echo.
echo ════════════════════════════════════════════════════════
echo.
echo ❓ ¿Qué quieres hacer?
echo.
echo    [1] Usar proyecto existente "go-wash-lavadero"
echo    [2] Crear nuevo proyecto "gowash-mobile-2026"
echo    [3] Ver instrucciones detalladas
echo    [4] Cancelar
echo.
set /p opcion="Elige opción (1-4): "
echo.

if "%opcion%"=="1" goto existente
if "%opcion%"=="2" goto nuevo
if "%opcion%"=="3" goto instrucciones
if "%opcion%"=="4" goto fin

:existente
echo.
echo ════════════════════════════════════════════════════════
echo  Desplegando a proyecto existente...
echo ════════════════════════════════════════════════════════
echo.
echo IMPORTANTE: Cuando te pregunte:
echo   "Link to existing project?" → Responde: Y
echo   "Which existing project?" → Selecciona: go-wash-lavadero
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
vercel.cmd --prod
goto resultado

:nuevo
echo.
echo ════════════════════════════════════════════════════════
echo  Creando nuevo proyecto...
echo ════════════════════════════════════════════════════════
echo.
echo IMPORTANTE: Cuando te pregunte:
echo   "Link to existing project?" → Responde: N
echo   "Project name?" → Escribe: gowash-mobile-2026
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
vercel.cmd --prod
goto resultado

:instrucciones
echo.
echo ════════════════════════════════════════════════════════
echo  Abriendo instrucciones...
echo ════════════════════════════════════════════════════════
start DESPLIEGUE_LISTO.md
goto fin

:resultado
echo.
echo.
echo ════════════════════════════════════════════════════════
echo.
echo ✅ Si el despliegue fue exitoso, verás una URL como:
echo    https://go-wash-lavadero.vercel.app
echo.
echo 📱 SIGUIENTE PASO:
echo    1. Copia la URL
echo    2. Ábrela en el navegador del móvil
echo    3. Agrégala a la pantalla de inicio
echo.
echo 🎉 ¡Tu app móvil está en la nube!
echo.
echo ════════════════════════════════════════════════════════
echo.
pause
goto fin

:fin
echo.
echo Saliendo...
timeout /t 2 >nul
exit
