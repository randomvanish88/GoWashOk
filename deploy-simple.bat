@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    🚀 DESPLEGAR GOWASH A VERCEL
echo ========================================
echo.
echo ✅ Sesión iniciada correctamente
echo ✅ Aplicación construida (dist/)
echo.
echo 📋 INSTRUCCIONES:
echo.
echo 1. El despliegue se iniciará ahora
echo 2. Usa las FLECHAS ↑↓ para seleccionar
echo 3. Presiona ENTER para confirmar
echo.
echo RECOMENDACIÓN: Selecciona "go-wash-lavadero"
echo O crea uno nuevo respondiendo "N" a "Link to existing"
echo.
echo ========================================
echo Iniciando en 3 segundos...
timeout /t 3 /nobreak >nul
echo.

vercel.cmd --prod

echo.
echo ========================================
echo Si obtuviste una URL, ¡el despliegue fue exitoso!
echo Copia la URL y úsala en los teléfonos móviles
echo ========================================
echo.
pause
