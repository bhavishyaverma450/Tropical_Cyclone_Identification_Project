@echo off
echo =========================================================================
echo       TROPICAL CYCLONE INTELLIGENCE (TCI) SYSTEM LAUNCHER
echo =========================================================================
echo.
echo Starting FastAPI AI/ML Backend Server on http://127.0.0.1:8000 ...
start "TCI Backend Server" cmd /k "cd /d %~dp0backend && python run_backend.py"

timeout /t 3 >nul

echo Starting React + Vite GIS Dashboard on http://localhost:5173 ...
start "TCI Frontend Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 >nul

echo Launching TCI AI System in Web Browser...
start http://localhost:5173

echo.
echo System started successfully! Keep the backend & frontend command windows open.
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Web Dashboard: http://localhost:5173
echo =========================================================================
pause
