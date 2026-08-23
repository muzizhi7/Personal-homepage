#!/usr/bin/env bash
# 个人主页一键启动脚本
set -e
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "首次运行：安装依赖中..."
  npm install
fi

if [ ! -d client/dist ]; then
  echo "首次运行：构建前端..."
  npm run build
fi

echo ""
echo "=============================================="
echo "  个人主页已启动"
echo "  主页    : http://localhost:8787"
echo "  管理后台: http://localhost:8787/admin"
echo "  按 Ctrl+C 停止"
echo "=============================================="
echo ""

npm start
