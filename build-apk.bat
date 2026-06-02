@echo off
echo ========================================
echo    GoWash - Construir APK Android
echo ========================================
echo.
echo Este proceso puede tardar varios minutos
echo.
pause

echo.
echo ========================================
echo   Paso 1: Construyendo aplicacion web
echo ========================================
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo el build de la aplicacion web
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Paso 2: Agregando plataforma Android
echo ========================================
echo.
call npx cap add android --no-interactive

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al agregar plataforma Android
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Paso 3: Sincronizando archivos
echo ========================================
echo.
call npx cap sync android

echo.
echo ========================================
echo   Paso 4: Abriendo Android Studio
echo ========================================
echo.
echo IMPORTANTE:
echo 1. Android Studio se abrira automaticamente
echo 2. Espera a que termine de sincronizar Gradle
echo 3. Conecta tu celular por USB o usa un emulador
echo 4. Habilita "Depuracion USB" en el celular
echo 5. Click en el boton ▶️ (Run) para instalar
echo.
echo Para generar APK:
echo - Build → Generate Signed Bundle / APK
echo - Selecciona APK
echo - Crea/usa un keystore
echo - El APK estara en: android/app/release/
echo.
pause

call npx cap open android

echo.
echo ========================================
echo   LISTO!
echo ========================================
echo.
echo Android Studio deberia estar abierto
echo Sigue las instrucciones para compilar
echo.
pause
