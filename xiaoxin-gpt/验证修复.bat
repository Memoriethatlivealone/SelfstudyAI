@echo off
REM 小新大冒险 - 完整验证脚本
REM 验证移动修复和渲染优化

echo ========================================
echo 小新大冒险 - 修复验证脚本
echo ========================================
echo.

echo [1/4] 检查 Python 版本...
python --version
if errorlevel 1 (
    echo ERROR: Python 未安装或未添加到 PATH
    pause
    exit /b 1
)
echo.

echo [2/4] 编译检查所有 Python 文件...
python -m compileall game tests
if errorlevel 1 (
    echo ERROR: 代码编译失败
    pause
    exit /b 1
)
echo OK: 代码编译通过
echo.

echo [3/4] 运行所有单元测试...
python -m unittest discover -s tests -v
if errorlevel 1 (
    echo ERROR: 测试失败
    pause
    exit /b 1
)
echo OK: 所有测试通过
echo.

echo [4/4] 无头模式测试游戏逻辑...
python -m game.main --headless --play --frames 60
if errorlevel 1 (
    echo ERROR: 游戏逻辑测试失败
    pause
    exit /b 1
)
echo OK: 游戏逻辑正常
echo.

echo ========================================
echo 验证完成！所有测试通过！
echo ========================================
echo.
echo 修复内容：
echo   [√] A/D 键移动
echo   [√] 左右方向键移动
echo   [√] 按住连续移动
echo   [√] 松开后减速停止
echo   [√] 窗口失焦处理
echo   [√] 独立渲染系统
echo   [√] 23 项单元测试
echo.
echo 启动游戏：双击 "启动小新大冒险.bat"
echo.
pause
