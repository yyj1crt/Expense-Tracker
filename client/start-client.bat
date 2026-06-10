@echo off
cd /d "%~dp0"
echo Starting Expense Tracker Frontend...
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting development server on http://localhost:5173
call npm run dev
pause
