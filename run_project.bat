@echo off
title RentGuard AI - Rental Scam Detection System
echo =======================================================
echo    RentGuard AI - Rental Scam Detection System
echo =======================================================
echo.
echo Checking dependencies...
if not exist "backend\node_modules\" (
    echo Installing dependencies in backend...
    cd backend
    call npm install
    cd ..
)
echo Starting Node.js Express server and Web Application...
echo.
echo Application will be available at: http://localhost:5000
echo.
node backend/server.js
pause
