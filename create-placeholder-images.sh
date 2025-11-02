#!/bin/bash

# 创建占位图片的脚本
# 需要安装 ImageMagick: brew install imagemagick

echo "🎨 创建应用占位图片..."

# 确保目录存在
mkdir -p assets/images

# 创建应用图标 (1024x1024) - 蓝色
convert -size 1024x1024 xc:"#3498db" \
  -gravity center \
  -fill white \
  -pointsize 200 \
  -annotate +0+0 "📷" \
  assets/images/icon.png

echo "✅ icon.png 已创建"

# 创建启动屏幕 (1242x2436) - 深色背景
convert -size 1242x2436 xc:"#1a1a2e" \
  -gravity center \
  -fill "#3498db" \
  -pointsize 300 \
  -annotate +0-200 "BlueHour" \
  -fill "#f39c12" \
  -pointsize 100 \
  -annotate +0+100 "摄影助手" \
  assets/images/splash.png

echo "✅ splash.png 已创建"

# 创建自适应图标 (1024x1024)
cp assets/images/icon.png assets/images/adaptive-icon.png

echo "✅ adaptive-icon.png 已创建"

# 创建 favicon (48x48)
convert assets/images/icon.png -resize 48x48 assets/images/favicon.png

echo "✅ favicon.png 已创建"

echo ""
echo "🎉 所有占位图片已创建完成！"
echo ""
echo "⚠️  这些是临时占位图片，建议使用专业设计工具创建正式图标："
echo "   - Figma: https://figma.com"
echo "   - Icon Kitchen: https://icon.kitchen"
echo "   - App Icon Generator: https://appicon.co"
