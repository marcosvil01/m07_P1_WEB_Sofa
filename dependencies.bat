@echo off
echo Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo Error al instalar dependencias.
    pause
    exit /b %errorlevel%
)

echo Dependencias instaladas correctamente.
pause
