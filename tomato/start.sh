#!/bin/bash

echo "正在启动智能导航系统..."
echo ""
echo "本地服务器将在 http://localhost:8000 运行"
echo "按 Ctrl+C 停止服务器"
echo ""

# 尝试使用 Python 3
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "错误: 未找到 Python，请先安装 Python 3"
    exit 1
fi
