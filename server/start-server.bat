@echo off
cd /d "%~dp0"
echo Starting Expense Tracker Backend Server...
echo.
echo Installing dependencies...
call npm install
echo.
echo Running database migrations...
call npx prisma migrate dev
echo.
echo Starting development server on http://localhost:4000
call npm run dev
pause
