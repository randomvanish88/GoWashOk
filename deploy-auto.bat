@echo off
echo ========================================
echo   DESPLEGANDO GOWASH A VERCEL
echo ========================================
echo.
echo Respondiendo automaticamente...
echo.

REM Crear archivo de respuestas
(
echo Y
echo.
echo N
echo gowash
echo.
echo N
echo N
) > respuestas.txt

REM Ejecutar vercel con las respuestas
vercel.cmd --prod < respuestas.txt

REM Limpiar archivo temporal
del respuestas.txt

echo.
echo ========================================
echo   DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo La URL de tu aplicacion aparece arriba
echo Copiala y compartela para instalar en moviles
echo.
pause
