@echo off
echo ========================================
echo   奶龙大战僵尸 - 游戏启动器
echo ========================================
echo.
echo 正在启动开发服务器...
echo.

cd /d "%~dp0"
start http://localhost:3000
npm run dev

pause
