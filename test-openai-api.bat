@echo off
echo ========================================
echo   OpenAI Integration Quick Test
echo ========================================
echo.

cd backend

echo [1/3] Checking if backend is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend is not running. Please start it first:
    echo   cd backend
    echo   npm start
    echo.
    pause
    exit /b 1
)
echo ✓ Backend is running
echo.

echo [2/3] Checking OpenAI service status...
curl -s http://localhost:5000/api/ai/status
echo.
echo.

echo [3/3] Testing AI features...
echo.

echo Testing AI Search:
curl -s -X POST http://localhost:5000/api/ai/search ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"wireless headphones under 5000\"}"
echo.
echo.

echo Testing AI Chat:
curl -s -X POST http://localhost:5000/api/ai/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Say hello!\"}]}"
echo.
echo.

echo ========================================
echo   Test Complete!
echo ========================================
echo.
echo To run comprehensive tests, use:
echo   cd backend
echo   node test-openai.js
echo.
pause
