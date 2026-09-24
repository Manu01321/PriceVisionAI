@echo off
echo.
echo ========================================
echo  🚀 PRICE VISION AI PRO - FULL SYSTEM
echo ========================================
echo.
echo Starting complete price comparison system with:
echo • Real-time web scraping across multiple sites
echo • AI-powered image search
echo • Price tracking and alerts
echo • React frontend dashboard
echo.

:: Check if Node.js is installed
echo 📋 Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

:: Check if backend dependencies are installed
echo.
echo 🔧 Checking backend dependencies...
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Backend dependencies found
)

:: Check if frontend dependencies are installed
echo.
echo 🔧 Checking frontend dependencies...
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies found
)

:: Start backend in background
echo.
echo 🌐 Starting backend server (Port 5000)...
cd backend
start "Price Vision Backend" cmd /c "echo Backend Server Starting... && node server.js && pause"

:: Wait for backend to initialize
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Test backend connectivity
echo 🔍 Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 10; if($response.StatusCode -eq 200) { Write-Host '✅ Backend is running and healthy' } else { Write-Host '⚠️ Backend response not OK' } } catch { Write-Host '❌ Backend not responding. Check the backend window for errors.' }"

cd ..

:: Start frontend
echo.
echo 🎨 Starting frontend development server (Port 5173)...
echo.
echo 📋 Available endpoints after startup:
echo   • Frontend: http://localhost:5173
echo   • Backend API: http://localhost:5000/api
echo   • Health Check: http://localhost:5000/api/health
echo   • Supported Sites: http://localhost:5000/api/sites
echo.
echo 🎯 Once both servers are running, you can:
echo   1. Search products across multiple e-commerce sites
echo   2. Upload images to find similar products
echo   3. Track price changes and set alerts
echo   4. Compare prices across Amazon, Flipkart, etc.
echo.
echo ⚡ Starting frontend now...

:: Start frontend (this will block and show output)
call npm run dev

:: If we reach here, frontend has stopped
echo.
echo 📊 Frontend development server has stopped.
echo The backend server may still be running in the background.
echo.
pause
