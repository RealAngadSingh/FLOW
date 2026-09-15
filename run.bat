@echo off
setlocal
title SmartFlow AI

cd /d "%~dp0"

echo ==========================================
echo        SMARTFLOW AI
echo        Starting Backend...
echo ==========================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo Python was not found.
    echo Please install Python 3.10+ and try again.
    pause
    exit /b 1
)

if not exist "backend\.venv" (
    echo Creating Python virtual environment...
    python -m venv backend\.venv
)

echo Installing/checking backend dependencies...
call backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

echo.
echo Starting FastAPI backend...
start "SmartFlow AI Backend" cmd /k "cd /d ""%~dp0backend"" && ..\backend\.venv\Scripts\python.exe -m uvicorn main:app --reload"

echo Waiting for backend...
timeout /t 3 /nobreak >nul

echo Opening SmartFlow AI frontend...
start "" "index.html"

echo.
echo SmartFlow AI is running.
echo Backend: http://127.0.0.1:8000
echo API docs: http://127.0.0.1:8000/docs
echo.
pause
