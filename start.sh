#!/bin/bash
cd "$(dirname "$0")"
echo "当前工作目录: $(pwd)"
echo "检查package.json是否存在..."
if [ -f "package.json" ]; then
    echo "✅ package.json 找到"
    echo "启动Expo开发服务器..."
    npx expo start --clear
else
    echo "❌ package.json 未找到"
    ls -la
fi
