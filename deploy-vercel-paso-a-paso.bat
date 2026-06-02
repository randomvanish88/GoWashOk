@echo off
color 0A
echo ========================================
echo    GoWash - Deploy en Vercel
echo ========================================
echo.
echo Este script te guiara paso a paso
echo para desplegar GoWash en la nube
echo.
echo IMPORTANTE: Necesitas una cuenta en Vercel
echo (es GRATIS para siempre)
echo.
pause

echo.
echo ========================================
echo   PASO 1: Crear cuenta en Vercel
echo ========================================
echo.
echo 1. Se abrira tu navegador
echo 2. Click en "Sign Up" (Registrarse)
echo 3. Puedes usar:
echo    - Cuenta de GitHub (recomendado)
echo    - Cuenta de Google
echo    - Email
echo 4. Es 100%% GRATIS
echo.
echo Presiona cualquier tecla cuando tengas tu cuenta lista...
pause > nul

echo.
echo Abriendo Vercel en tu navegador...
start https://vercel.com/signup

echo.
echo ========================================
echo   PASO 2: Login con Vercel CLI
echo ========================================
echo.
echo Una vez que tengas tu cuenta:
echo.
pause

echo.
echo Ejecutando: vercel login
echo.
echo Se abrira tu navegador para confirmar
echo Acepta y vuelve aqui...
echo.
call vercel login

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo hacer login
    echo Asegurate de haber creado tu cuenta
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   PASO 3: Desplegando GoWash
echo ========================================
echo.
echo Ahora vamos a desplegar tu aplicacion
echo.
echo IMPORTANTE: Responde a las preguntas:
echo.
echo "Set up and deploy?" → YES (y)
echo "Which scope?" → Tu cuenta (presiona Enter)
echo "Link to existing project?" → NO (n)
echo "What's your project's name?" → gowash (o el que quieras)
echo "In which directory is your code located?" → ./ (presiona Enter)
echo "Want to override build command?" → NO (n)
echo "Want to override output directory?" → NO (n)
echo.
pause

echo.
echo Desplegando a PRODUCCION...
echo Esto puede tardar 2-3 minutos
echo.
call vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo el despliegue
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   LISTO! GoWash esta en la nube!
echo ========================================
echo.
echo Tu aplicacion esta disponible en la URL que aparece arriba
echo.
echo Ahora puedes:
echo 1. Copiar esa URL
echo 2. Abrirla en cualquier celular
echo 3. Instalarla como PWA (Agregar a pantalla de inicio)
echo 4. Usarla desde cualquier lugar!
echo.
echo IMPORTANTE: Guarda esa URL, es tu app en internet!
echo.
pause
