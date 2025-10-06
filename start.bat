@echo off
echo Starting FixItNow Application...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install
echo.

echo Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo FixItNow is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause