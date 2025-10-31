#!/bin/bash

# 下载示例风景图片到public/images目录
# 使用Lorem Picsum图片服务
# 用法: ./download_images.sh [数量]
# 示例: ./download_images.sh 50  (下载50张图片)
#       ./download_images.sh     (默认下载30张图片)

# 显示使用帮助
show_usage() {
    echo "用法: $0 [图片数量]"
    echo ""
    echo "参数："
    echo "  图片数量    要下载的图片数量 (1-200), 默认: 30"
    echo ""
    echo "示例："
    echo "  $0          # 下载30张图片(默认)"
    echo "  $0 50       # 下载50张图片"
    echo "  $0 100      # 下载100张图片"
    echo ""
}

# 生成未使用的随机图片ID
generate_random_id() {
    local random_id
    while true; do
        # 生成1-1000之间的随机数
        random_id=$((RANDOM % 1000 + 1))
        
        # 检查是否已使用
        local used=false
        for used_id in "${USED_IDS[@]}"; do
            if [ "$used_id" -eq "$random_id" ]; then
                used=true
                break
            fi
        done
        
        # 如果未使用，返回该ID
        if [ "$used" = false ]; then
            echo "$random_id"
            return 0
        fi
    done
}

# 验证文件是否为有效的JPEG图片
is_valid_image() {
    local file_path="$1"
    
    # 检查文件是否存在
    if [ ! -f "$file_path" ]; then
        return 1
    fi
    
    # 检查文件大小（至少1KB）
    local file_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
    if [ -z "$file_size" ] || [ "$file_size" -lt "$MIN_FILE_SIZE" ]; then
        return 1
    fi
    
    # 使用file命令检查文件类型
    local file_type=$(file -b "$file_path")
    if [[ "$file_type" =~ "JPEG image data" ]]; then
        return 0
    else
        return 1
    fi
}

# 获取图片数量参数，默认为30
IMAGE_COUNT=${1:-30}

# 参数验证
if ! [[ "$IMAGE_COUNT" =~ ^[0-9]+$ ]]; then
    echo "错误: 参数必须是数字"
    echo ""
    show_usage
    exit 1
fi

if [ "$IMAGE_COUNT" -lt 1 ]; then
    echo "错误: 图片数量必须大于等于1"
    echo ""
    show_usage
    exit 1
fi

if [ "$IMAGE_COUNT" -gt 200 ]; then
    echo "错误: 图片数量不能超过200"
    echo ""
    show_usage
    exit 1
fi

# 初始化变量
USED_IDS=()
SUCCESS_COUNT=0
FAILED_LIST=()
MAX_RETRIES=3
MIN_FILE_SIZE=1024

echo "开始下载示例图片..."
echo "目标数量: $IMAGE_COUNT 张"
echo "使用智能重试机制，确保下载质量"
echo ""

# 切换到目标目录，如果不存在则创建
TARGET_DIR="$(dirname "$0")/public/images"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# 主下载循环
for i in $(seq 1 $IMAGE_COUNT)
do
    retry_count=0
    success=false
    
    # 每个序号最多重试MAX_RETRIES次
    while [ $retry_count -lt $MAX_RETRIES ] && [ "$success" = false ]; do
        # 生成随机ID
        image_id=$(generate_random_id)
        USED_IDS+=("$image_id")
        
        # 显示下载信息
        if [ $retry_count -eq 0 ]; then
            echo "[$i/$IMAGE_COUNT] 下载图片 (ID: $image_id)... [成功:$SUCCESS_COUNT 失败:${#FAILED_LIST[@]}]"
        else
            echo "  → 重试 $retry_count/$MAX_RETRIES (ID: $image_id)..."
        fi
        
        # 下载到临时文件
        temp_file="${i}.tmp.jpg"
        curl -L -s "https://picsum.photos/id/${image_id}/800/600" -o "$temp_file"
        
        # 验证下载的图片
        if is_valid_image "$temp_file"; then
            # 验证成功，重命名为正式文件
            mv "$temp_file" "${i}.jpg"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            success=true
            echo "  ✓ 图片 $i 下载成功并验证通过"
        else
            # 验证失败，删除临时文件
            rm -f "$temp_file"
            retry_count=$((retry_count + 1))
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                echo "  ✗ 验证失败，准备重试..."
            fi
        fi
        
        # 避免请求过快
        sleep 0.3
    done
    
    # 如果所有重试都失败
    if [ "$success" = false ]; then
        FAILED_LIST+=("$i")
        echo "  ✗ 图片 $i 下载失败（已重试${MAX_RETRIES}次）"
    fi
    
    echo ""
done

# 完成报告
echo "========================================"
echo "下载任务完成！"
echo "========================================"
echo "总请求数量: $IMAGE_COUNT 张"
echo "成功下载: $SUCCESS_COUNT 张"
echo "失败数量: ${#FAILED_LIST[@]} 张"

if [ ${#FAILED_LIST[@]} -gt 0 ]; then
    echo ""
    echo "失败的序号: ${FAILED_LIST[*]}"
    echo ""
    echo "提示: 可以重新运行脚本来补充失败的图片"
fi

echo ""
echo "图片已保存在 public/images/ 目录"

# 生成图片索引
echo ""
echo "正在生成图片索引..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "package.json" ]; then
    npm run generate-images
else
    echo "警告: 未找到 package.json，跳过索引生成"
fi

