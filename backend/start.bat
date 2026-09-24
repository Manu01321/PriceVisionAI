@echo off
echo 🚀 Starting Price Vision Backend...

echo 📦 Checking dependencies...
call npm list > nul 2>&1
if errorlevel 1 (
    echo ❌ Dependencies not installed. Run: node install.js
    pause
    exit /b 1
)

echo 🌐 Starting server...
node server.js

pause
