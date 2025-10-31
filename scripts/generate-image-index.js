#!/usr/bin/env node

/**
 * 生成图片索引文件
 * 扫描 public/images 目录下的所有 jpg 图片，生成索引 JSON 文件
 */

const fs = require('fs')
const path = require('path')

// 目录路径
const imagesDir = path.join(__dirname, '../public/images')
const outputFile = path.join(imagesDir, 'index.json')

try {
  // 检查目录是否存在
  if (!fs.existsSync(imagesDir)) {
    console.error(`错误: 图片目录不存在: ${imagesDir}`)
    process.exit(1)
  }

  // 读取目录
  const files = fs.readdirSync(imagesDir)

  // 筛选 jpg 文件并提取序号
  const imageFiles = files
    .filter(file => file.endsWith('.jpg') && file !== 'index.json')
    .map(file => {
      // 匹配纯数字文件名，如 1.jpg, 25.jpg
      const match = file.match(/^(\d+)\.jpg$/)
      return match ? parseInt(match[1], 10) : null
    })
    .filter(num => num !== null)
    .sort((a, b) => a - b)

  // 生成索引对象
  const index = {
    count: imageFiles.length,
    images: imageFiles,
    generatedAt: new Date().toISOString()
  }

  // 写入文件
  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2), 'utf-8')

  console.log(`✓ 图片索引已生成: ${imageFiles.length} 张图片`)
  console.log(`  保存位置: ${outputFile}`)
  
  if (imageFiles.length > 0) {
    console.log(`  图片序号范围: ${imageFiles[0]} - ${imageFiles[imageFiles.length - 1]}`)
  }
} catch (error) {
  console.error('生成图片索引失败:', error.message)
  process.exit(1)
}

