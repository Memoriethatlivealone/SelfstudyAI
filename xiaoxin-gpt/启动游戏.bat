@echo off
cd /d "%~dp0"
python -m game.main --play
if errorlevel 1 (
  echo.
  echo Game failed to start.
  echo Make sure Python 3.11+ and pygame are installed.
  pause
)
