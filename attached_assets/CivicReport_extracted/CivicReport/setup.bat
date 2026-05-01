@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Civic Report Setup Script (Windows)
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [OK] Node.js %NODE_VERSION% found
echo [OK] npm %NPM_VERSION% found
echo.

REM Create .env files if they don't exist
echo Setting up environment files...

if not exist "server\.env" (
    copy server\.env.example server\.env
    echo [WARN] Created server\.env
    echo [WARN] TODO: Update with your MongoDB URI, JWT_SECRET, and Cloudinary credentials
    echo.
)

if not exist "client\.env.local" (
    copy client\.env.example client\.env.local
    echo [OK] Created client\.env.local
    echo.
)

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
echo [OK] Server dependencies installed
cd ..
echo.

REM Install client dependencies
echo Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)
echo [OK] Client dependencies installed
cd ..
echo.

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Configure environment variables:
echo    - server\.env - Add MongoDB URI, JWT_SECRET, Cloudinary credentials
echo.
echo 2. Start the backend server:
echo    Open PowerShell/CMD in server folder and run:
echo    npm run dev
echo.
echo 3. Start the frontend (in another terminal):
echo    Open PowerShell/CMD in client folder and run:
echo    npm run dev
echo.
echo 4. Open in your browser:
echo    http://localhost:5173
echo.
echo See SETUP_AND_DEPLOYMENT.md for detailed instructions
echo.
pause
