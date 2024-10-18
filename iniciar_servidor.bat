@echo off
echo Iniciando el servidor...
start /b node server.js

timeout /t 5 /nobreak >nul

echo Abriendo el navegador en http://localhost:3000
start http://localhost:3000

exit
