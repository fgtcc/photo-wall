/**
 * 图片处理工具函数
 */

import type { Photo, PhotoUploadOptions } from '@/types'

/**
 * 处理图片文件，生成缩略图
 */
export function processImageFile(
  file: File,
  options: PhotoUploadOptions = {}
): Promise<Photo> {
  const { thumbnailSize = 300, quality = 0.8 } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // 创建缩略图
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            throw new Error('Canvas context not available')
          }

          // 计算缩略图尺寸
          let { width, height } = img
          
          if (width > height) {
            if (width > thumbnailSize) {
              height = (height * thumbnailSize) / width
              width = thumbnailSize
            }
          } else {
            if (height > thumbnailSize) {
              width = (width * thumbnailSize) / height
              height = thumbnailSize
            }
          }

          canvas.width = width
          canvas.height = height

          // 绘制缩略图
          ctx.drawImage(img, 0, 0, width, height)
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality)

          // 创建照片对象
          const photo: Photo = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string,
            thumbnail: thumbnailDataUrl,
            uploadTime: new Date().toISOString()
          }

          resolve(photo)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 批量处理图片文件
 */
export async function processImageFiles(
  files: File[],
  options?: PhotoUploadOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Photo[]> {
  const photos: Photo[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      const photo = await processImageFile(files[i], options)
      photos.push(photo)
      onProgress?.(i + 1, files.length)
    } catch (error) {
      console.error(`Failed to process image ${files[i].name}:`, error)
    }
  }

  return photos
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 获取照片URL（统一处理 url, thumbnail, dataUrl）
 */
export function getPhotoUrl(photo: Photo): string {
  // 如果图片加载失败，返回占位图
  if (photo.loadError) {
    return getPlaceholderImage()
  }
  return photo.url || photo.thumbnail || photo.dataUrl || ''
}

/**
 * 获取占位图（Base64编码的SVG图片）
 */
export function getPlaceholderImage(): string {
  // 创建一个简单的占位图SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad)"/>
      <circle cx="200" cy="180" r="50" fill="#a0aec0" opacity="0.3"/>
      <path d="M 150 220 L 200 170 L 250 220 L 280 190 L 280 280 L 120 280 Z" fill="#a0aec0" opacity="0.3"/>
      <text x="200" y="330" font-family="Arial" font-size="20" fill="#4a5568" text-anchor="middle" opacity="0.6">
        图片加载失败
      </text>
    </svg>
  `
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

/**
 * 验证图片URL是否可用
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      resolve(true)
    }
    
    img.onerror = () => {
      resolve(false)
    }
    
    // 设置超时时间（5秒）
    const timeout = setTimeout(() => {
      resolve(false)
    }, 5000)
    
    img.onload = () => {
      clearTimeout(timeout)
      resolve(true)
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }
    
    img.src = url
  })
}

/**
 * 批量验证图片URL
 */
export async function validatePhotos(photos: Photo[]): Promise<Photo[]> {
  const validatedPhotos = await Promise.all(
    photos.map(async (photo) => {
      // 如果已经有 dataUrl 或 thumbnail（用户上传的），直接标记为有效
      if (photo.dataUrl || photo.thumbnail) {
        return { ...photo, loadError: false }
      }
      
      // 验证 URL 图片
      if (photo.url) {
        const isValid = await validateImageUrl(photo.url)
        return { ...photo, loadError: !isValid, loadRetryCount: 0 }
      }
      
      return { ...photo, loadError: true }
    })
  )
  
  return validatedPhotos
}

/**
 * 生成默认示例图片（只生成实际存在的图片）
 */
export function generateDefaultPhotos(count: number = 30): Photo[] {
  const photos: Photo[] = []
  
  // 实际存在的图片序号（public/images目录下）
  // 注意：缺少5.jpg
  const existingImages = [
    1, 2, 3, 4, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30
  ]
  
  // 只生成实际存在的图片
  const imagesToLoad = existingImages.slice(0, count)
  
  imagesToLoad.forEach((num, index) => {
    photos.push({
      id: Date.now() + index,
      url: `/images/${num}.jpg`,
      name: `风景照片 ${num}`,
      uploadTime: new Date().toISOString()
    })
  })
  
  return photos
}

