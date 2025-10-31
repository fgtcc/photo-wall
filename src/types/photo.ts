/**
 * 照片数据类型定义
 */

export interface Photo {
  id: number | string
  name: string
  size?: number
  type?: string
  dataUrl?: string
  thumbnail?: string
  url?: string
  uploadTime?: string
  loadError?: boolean        // 图片加载失败标记
  loadRetryCount?: number    // 加载重试次数
}

export interface PhotoUploadOptions {
  maxSize?: number
  quality?: number
  thumbnailSize?: number
}

