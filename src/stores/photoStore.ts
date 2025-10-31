/**
 * 照片管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Photo } from '@/types'
import { storage } from '@/utils/storage'
import { generateDefaultPhotos, validatePhotos } from '@/utils/image'

const STORAGE_KEY = 'photoWall'

export const usePhotoStore = defineStore('photo', () => {
  // 状态
  const photos = ref<Photo[]>([])
  const currentPhotoIndex = ref(-1)
  const isLoading = ref(false)

  // 计算属性
  const photoCount = computed(() => photos.value.length)
  const currentPhoto = computed(() => 
    currentPhotoIndex.value >= 0 ? photos.value[currentPhotoIndex.value] : null
  )
  const hasPhotos = computed(() => photos.value.length > 0)

  // 方法
  /**
   * 加载照片
   */
  async function loadPhotos() {
    const saved = storage.get<Photo[]>(STORAGE_KEY)
    if (saved && saved.length > 0) {
      // 验证已保存的照片
      isLoading.value = true
      photos.value = await validatePhotos(saved)
      isLoading.value = false
      savePhotos(true) // 静默保存验证结果
    } else {
      // 加载默认示例图片
      isLoading.value = true
      const defaultPhotos = await generateDefaultPhotos()
      photos.value = await validatePhotos(defaultPhotos)
      isLoading.value = false
      savePhotos(true)
    }
  }

  /**
   * 保存照片
   */
  function savePhotos(silent = false): boolean {
    const success = storage.set(STORAGE_KEY, photos.value)
    if (!success && !silent) {
      console.error('Failed to save photos to storage')
    }
    return success
  }

  /**
   * 添加照片
   */
  function addPhotos(newPhotos: Photo[]) {
    photos.value.push(...newPhotos)
    savePhotos()
  }

  /**
   * 删除照片
   */
  function deletePhoto(index: number) {
    if (index >= 0 && index < photos.value.length) {
      photos.value.splice(index, 1)
      savePhotos()
    }
  }

  /**
   * 清空所有照片
   */
  function clearAllPhotos() {
    photos.value = []
    savePhotos()
  }

  /**
   * 交换照片位置
   */
  function swapPhotos(fromIndex: number, toIndex: number) {
    if (
      fromIndex >= 0 && fromIndex < photos.value.length &&
      toIndex >= 0 && toIndex < photos.value.length &&
      fromIndex !== toIndex
    ) {
      const temp = photos.value[fromIndex]
      photos.value[fromIndex] = photos.value[toIndex]
      photos.value[toIndex] = temp
      savePhotos(true) // 静默保存，避免频繁提示
    }
  }

  /**
   * 设置当前照片索引
   */
  function setCurrentPhotoIndex(index: number) {
    currentPhotoIndex.value = index
  }

  /**
   * 设置加载状态
   */
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  /**
   * 获取存储使用情况
   */
  function getStorageInfo() {
    return storage.getStorageInfo()
  }

  return {
    // 状态
    photos,
    currentPhotoIndex,
    isLoading,
    
    // 计算属性
    photoCount,
    currentPhoto,
    hasPhotos,
    
    // 方法
    loadPhotos,
    savePhotos,
    addPhotos,
    deletePhoto,
    clearAllPhotos,
    swapPhotos,
    setCurrentPhotoIndex,
    setLoading,
    getStorageInfo
  }
})

