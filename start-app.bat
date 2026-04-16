@echo off
REM Startup script for Toa Mairie Application (Windows)
REM Usage: start-app.bat

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         🚀 Démarrage de Toa Mairie Application 🚀              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé!
    echo    Téléchargez-le sur https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Check directories
if not exist "backend" (
    echo ❌ Erreur: Répertoire 'backend' non trouvé
    echo    Exécutez ce script depuis le répertoire racine du projet
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Erreur: Répertoire 'frontend' non trouvé
    echo    Exécutez ce script depuis le répertoire racine du projet
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Vérification des dépendances...

if not exist "backend\node_modules" (
    echo    → Installation dépendances backend...
    cd backend
    call npm install > nul 2>&1
    cd ..
)

if not exist "frontend\node_modules" (
    echo    → Installation dépendances frontend...
    cd frontend
    call npm install > nul 2>&1
    cd ..
)

echo ✅ Dépendances prêtes
echo.

echo 🎯 Démarrage des serveurs...
echo.
echo 📝 Deux nouveaux terminaux vont s'ouvrir
echo    1. Terminal Backend  (Port 5000)
echo    2. Terminal Frontend (Port 3000)
echo.
echo ⏳ Veuillez patienter...
timeout /t 2 >nul

REM Start Backend
echo Démarrage du Backend...
start "Backend Toa Mairie" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 >nul

REM Start Frontend
echo Démarrage du Frontend...
start "Frontend Toa Mairie" cmd /k "cd frontend && npm start"

REM Show instructions
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ Serveurs en cours de démarrage!                           ║
echo ║                                                                 ║
echo ║  Application:   http://localhost:3000                          ║
echo ║  Backend API:   http://localhost:5000                          ║
echo ║                                                                 ║
echo ║  Identifiants de démo:                                         ║
echo ║  • Email: admin@mairie.mg                                      ║
echo ║  • Mot de passe: Admin@123                                     ║
echo ║                                                                 ║
echo ║  Les deux nouveaux terminaux resteront ouverts.               ║
echo ║  Fermez-les pour arrêter l'application.                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
