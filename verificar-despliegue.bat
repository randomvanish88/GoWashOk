@echo off
chcp 65001 >nul
cls
color 0B
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║         🔍 VERIFICAR DESPLIEGUE - GOWASH 🔍          ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo.

REM Verificar que Vercel está instalado
echo [1/5] Verificando Vercel CLI...
vercel.cmd --version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Vercel CLI instalado
) else (
    echo     ❌ Vercel CLI no encontrado
    goto error
)
echo.

REM Verificar sesión
echo [2/5] Verificando sesión en Vercel...
vercel.cmd whoami >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Sesión activa
    for /f "tokens=*" %%a in ('vercel.cmd whoami 2^>nul') do echo     Usuario: %%a
) else (
    echo     ❌ No hay sesión activa
    echo     Ejecuta: vercel.cmd login
    goto error
)
echo.

REM Verificar build
echo [3/5] Verificando build de la aplicación...
if exist "dist\index.html" (
    echo     ✅ Build existe (dist\)
    for /f %%a in ('dir /s /b "dist\*.*" ^| find /c /v ""') do echo     Archivos: %%a
) else (
    echo     ❌ Build no encontrado
    echo     Ejecuta: npm run build
    goto error
)
echo.

REM Verificar configuración
echo [4/5] Verificando configuración...
if exist "vercel.json" (
    echo     ✅ vercel.json configurado
) else (
    echo     ⚠️  vercel.json no encontrado
)

if exist "public\manifest.json" (
    echo     ✅ manifest.json configurado
) else (
    echo     ⚠️  manifest.json no encontrado
)

if exist "public\sw.js" (
    echo     ✅ Service Worker configurado
) else (
    echo     ⚠️  Service Worker no encontrado
)
echo.

REM Listar proyectos
echo [5/5] Listando proyectos en Vercel...
echo.
vercel.cmd list 2>nul | findstr /v "Age"
echo.

echo ════════════════════════════════════════════════════════
echo.
echo ✅ VERIFICACIÓN COMPLETADA
echo.
echo 📋 ESTADO: Todo listo para desplegar
echo.
echo 🚀 SIGUIENTE PASO:
echo    Ejecuta: OPCION_RAPIDA.bat
echo    O ejecuta: vercel.cmd --prod
echo.
echo ════════════════════════════════════════════════════════
echo.
pause
exit /b 0

:error
echo.
echo ════════════════════════════════════════════════════════
echo.
echo ❌ ERROR: Hay problemas que deben resolverse
echo.
echo 📝 REVISAR:
echo    1. Vercel CLI instalado?
echo    2. Sesión iniciada? (vercel login)
echo    3. Build ejecutado? (npm run build)
echo.
echo ════════════════════════════════════════════════════════
echo.
pause
exit /b 1
