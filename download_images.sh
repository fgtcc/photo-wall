#!/bin/bash

# 下载30张示例风景图片到images目录
# 使用Lorem Picsum图片服务

echo "开始下载示例图片..."

cd "$(dirname "$0")/images"

for i in {1..30}
do
    # 计算图片ID
    image_id=$((100 + i))
    
    echo "下载图片 $i/$30 (ID: $image_id)..."
    
    # 下载图片
    curl -L -s "https://picsum.photos/id/${image_id}/800/600" -o "${i}.jpg"
    
    # 检查下载是否成功
    if [ $? -eq 0 ]; then
        echo "  ✓ 图片 $i 下载成功"
    else
        echo "  ✗ 图片 $i 下载失败"
    fi
    
    # 避免请求过快
    sleep 0.5
done

echo ""
echo "下载完成！共下载 30 张图片"
echo "图片已保存在 images/ 目录"

