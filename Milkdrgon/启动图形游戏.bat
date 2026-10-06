@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 奶龙大战僵尸 - 启动器
echo ========================================
echo    奶龙大战僵尸 - 图形版游戏启动器
echo ========================================
echo.
echo 当前目录: %CD%
echo.

echo [1/3] 检查Python是否安装...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python！
    echo 请先安装Python 3.6或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo.

echo [2/3] 检查Pygame是否已安装...
python -c "import pygame; print('Pygame版本:', pygame.version.ver)" 2>nul
if errorlevel 1 (
    echo Pygame未安装，正在自动安装...
    echo 这可能需要几分钟，请耐心等待...
    python -m pip install pygame
    if errorlevel 1 (
        echo [错误] Pygame安装失败！
        echo 请手动运行: pip install pygame
        pause
        exit /b 1
    )
    echo Pygame安装成功！
)
echo.

echo [3/3] 启动游戏...
echo 游戏窗口即将打开，请稍候...
echo.
python milkdragon_gui_game.py
if errorlevel 1 (
    echo.
    echo [错误] 游戏运行出错！
    echo 请检查上方的错误信息
)

echo.
echo 游戏已关闭
pause
