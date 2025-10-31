/**
 * 布局管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  LayoutType, 
  LayoutConfigs, 
  StarLayoutConfig, 
  SpiralLayoutConfig, 
  WaveLayoutConfig,
  KaleidoscopeConfig,
  InteractionState,
  ZOOMABLE_LAYOUTS as ZoomableLayouts
} from '@/types'
import { storage } from '@/utils/storage'

const LAYOUT_STORAGE_KEY = 'photoWallLayout'
const CONFIG_STORAGE_KEY = 'photoWallLayoutConfigs'

// 默认布局配置
const defaultLayoutConfigs: LayoutConfigs = {
  star: {
    radiusFactor: 0.3,
    startAngle: 0,
    direction: 1,
    itemSize: 120,
    circles: 1
  },
  spiral: {
    angleIncrement: 0.5,
    radiusGrowth: 15,
    startRadius: 50,
    direction: 1,
    itemSize: 80
  },
  wave: {
    amplitude: 50,
    frequency: 0.5,
    spacing: 120,
    waveType: 'sine',
    itemSize: 100,
    verticalOffset: 0
  },
  kaleidoscope: {
    segments: 6,
    speed: 0.2,
    paused: false,
    colorFilter: 'none'
  }
}

export const useLayoutStore = defineStore('layout', () => {
  // 状态
  const currentLayout = ref<LayoutType>('grid')
  const layoutConfigs = ref<LayoutConfigs>({ ...defaultLayoutConfigs })
  const carouselIndex = ref(0)
  const card3dIndex = ref(0)
  
  // 交互状态
  const interaction = ref<InteractionState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    zoomLevel: 1,
    minZoom: 0.3,
    maxZoom: 5
  })

  // 计算属性
  const isZoomableLayout = computed(() => {
    const zoomable: LayoutType[] = ['star', 'spiral', 'wave']
    return zoomable.includes(currentLayout.value)
  })

  const currentLayoutConfig = computed(() => {
    const layout = currentLayout.value
    if (layout === 'star' || layout === 'spiral' || layout === 'wave' || layout === 'kaleidoscope') {
      return layoutConfigs.value[layout]
    }
    return null
  })

  const zoomPercentage = computed(() => 
    Math.round(interaction.value.zoomLevel * 100)
  )

  // 方法
  /**
   * 加载布局偏好设置
   */
  function loadLayoutPreference() {
    const saved = storage.get<LayoutType>(LAYOUT_STORAGE_KEY)
    if (saved) {
      currentLayout.value = saved
    }
  }

  /**
   * 保存布局偏好设置
   */
  function saveLayoutPreference() {
    storage.set(LAYOUT_STORAGE_KEY, currentLayout.value)
  }

  /**
   * 加载布局配置
   */
  function loadLayoutConfigs() {
    const saved = storage.get<LayoutConfigs>(CONFIG_STORAGE_KEY)
    if (saved) {
      layoutConfigs.value = { ...defaultLayoutConfigs, ...saved }
    }
  }

  /**
   * 保存布局配置
   */
  function saveLayoutConfigs() {
    storage.set(CONFIG_STORAGE_KEY, layoutConfigs.value)
  }

  /**
   * 切换布局
   */
  function switchLayout(layout: LayoutType) {
    if (currentLayout.value === layout) return
    
    currentLayout.value = layout
    saveLayoutPreference()
    
    // 重置交互状态
    resetInteraction()
  }

  /**
   * 获取指定布局的配置
   */
  function getLayoutConfig<T extends keyof LayoutConfigs>(layoutName: T): LayoutConfigs[T] {
    if (!layoutConfigs.value[layoutName]) {
      layoutConfigs.value[layoutName] = { ...defaultLayoutConfigs[layoutName] } as LayoutConfigs[T]
    }
    return layoutConfigs.value[layoutName]!
  }

  /**
   * 设置布局配置
   */
  function setLayoutConfig<T extends keyof LayoutConfigs>(
    layoutName: T, 
    config: LayoutConfigs[T]
  ) {
    layoutConfigs.value[layoutName] = config
    saveLayoutConfigs()
  }

  /**
   * 重置布局配置
   */
  function resetLayoutConfig<T extends keyof LayoutConfigs>(layoutName: T) {
    layoutConfigs.value[layoutName] = { ...defaultLayoutConfigs[layoutName] } as LayoutConfigs[T]
    saveLayoutConfigs()
  }

  /**
   * 设置轮播索引
   */
  function setCarouselIndex(index: number) {
    carouselIndex.value = index
  }

  /**
   * 设置3D卡片索引
   */
  function setCard3dIndex(index: number) {
    card3dIndex.value = index
  }

  /**
   * 缩放控制
   */
  function zoomIn() {
    const { zoomLevel, maxZoom } = interaction.value
    interaction.value.zoomLevel = Math.min(zoomLevel + 0.2, maxZoom)
  }

  function zoomOut() {
    const { zoomLevel, minZoom } = interaction.value
    interaction.value.zoomLevel = Math.max(zoomLevel - 0.2, minZoom)
  }

  function setZoomLevel(level: number) {
    const { minZoom, maxZoom } = interaction.value
    interaction.value.zoomLevel = Math.max(minZoom, Math.min(level, maxZoom))
  }

  /**
   * 拖拽控制
   */
  function setDragOffset(x: number, y: number) {
    interaction.value.dragOffset = { x, y }
  }

  function setDragging(dragging: boolean) {
    interaction.value.isDragging = dragging
  }

  function setDragStart(x: number, y: number) {
    interaction.value.dragStart = { x, y }
  }

  /**
   * 重置交互状态
   */
  function resetInteraction() {
    interaction.value = {
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      minZoom: 0.3,
      maxZoom: 5
    }
  }

  return {
    // 状态
    currentLayout,
    layoutConfigs,
    carouselIndex,
    card3dIndex,
    interaction,
    
    // 计算属性
    isZoomableLayout,
    currentLayoutConfig,
    zoomPercentage,
    
    // 方法
    loadLayoutPreference,
    saveLayoutPreference,
    loadLayoutConfigs,
    saveLayoutConfigs,
    switchLayout,
    getLayoutConfig,
    setLayoutConfig,
    resetLayoutConfig,
    setCarouselIndex,
    setCard3dIndex,
    zoomIn,
    zoomOut,
    setZoomLevel,
    setDragOffset,
    setDragging,
    setDragStart,
    resetInteraction
  }
})

