@echo off
echo Starting Navigation System...
echo Server will run at: http://localhost:8000
echo Press Ctrl+C to stop
echo.
cd /d "%~dp0"
python -m http.server 8000
