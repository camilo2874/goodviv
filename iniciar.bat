@echo off
echo 🚀 Iniciando aplicación de ubicaciones...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado.
    echo 📥 Descarga Node.js desde: https://nodejs.org/
    echo.
    echo 💡 Alternativa: Abre index.html directamente en tu navegador
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo 🌐 Iniciando servidor local...
echo.

REM Iniciar el servidor
node server.js

pause