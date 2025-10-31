/**
 * 照片管理 Composable
 */

import { ref } from 'vue'
import { usePhotoStore } from '@/stores/photoStore'
import { processImageFiles } from '@/utils/image'
import type { Photo } from '@/types'

export function usePhotoManager() {
  const photoStore = usePhotoStore()
  const uploadProgress = ref(0)

  /**
   * 处理文件上传
   */
  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      alert('请选择图片文件！')
      return
    }

    photoStore.setLoading(true)
    uploadProgress.value = 0

    try {
      const photos = await processImageFiles(
        imageFiles,
        { thumbnailSize: 300, quality: 0.8 },
        (current, total) => {
          uploadProgress.value = (current / total) * 100
        }
      )

      photoStore.addPhotos(photos)
    } catch (error) {
      console.error('Failed to process images:', error)
      alert('上传照片失败！')
    } finally {
      photoStore.setLoading(false)
      uploadProgress.value = 0
    }
  }

  /**
   * 删除照片（带确认）
   */
  function deletePhotoWithConfirm(index: number) {
    if (confirm('确定要删除这张照片吗？')) {
      photoStore.deletePhoto(index)
    }
  }

  /**
   * 清空所有照片（带确认）
   */
  function clearAllPhotosWithConfirm() {
    if (photoStore.photoCount === 0) {
      alert('照片墙已经是空的！')
      return
    }

    if (confirm('确定要清空所有照片吗？此操作不可恢复！')) {
      photoStore.clearAllPhotos()
    }
  }

  /**
   * 下载照片
   */
  function downloadPhoto(photo: Photo) {
    const link = document.createElement('a')
    link.href = photo.dataUrl || photo.url || photo.thumbnail || ''
    link.download = photo.name
    link.click()
  }

  return {
    uploadProgress,
    handleFiles,
    deletePhotoWithConfirm,
    clearAllPhotosWithConfirm,
    downloadPhoto
  }
}

