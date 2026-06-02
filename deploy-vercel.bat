@echo off
echo ========================================
echo    GoWash - Deploy a Vercel
echo ========================================
echo.
echo Este script desplegara GoWash en la nube
echo para que puedas acceder desde cualquier lugar
echo.
echo Requisitos:
echo - Cuenta en Vercel (gratis)
echo - Node.js instalado
echo.
pause
echo.
echo ========================================
echo   Paso 1: Instalando Vercel CLI
echo ========================================
echo.
call npm install -g vercel
echo.
echo ========================================
echo   Paso 2: Login en Vercel
echo ========================================
echo.
echo Se abrira tu navegador para iniciar sesion
echo.
pause
call vercel login
echo.
echo ========================================
echo   Paso 3: Desplegando a Vercel
echo ========================================
echo.
call vercel
echo.
echo ========================================
echo   Paso 4: Desplegar a Produccion
echo ========================================
echo.
echo Ahora vamos a desplegar la version final
echo.
pause
call vercel --prod
echo.
echo ========================================
echo   LISTO!
echo ========================================
echo.
echo Tu app esta en linea!
echo Vercel te ha dado una URL como:
echo https://gowash-xxxxx.vercel.app
echo.
echo Ahora puedes:
echo 1. Abrir esa URL en tu celular
echo 2. Instalarla como PWA
echo 3. Usarla desde cualquier lugar!
echo.
echo ========================================
pause
