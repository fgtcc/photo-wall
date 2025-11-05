<template>
  <div class="photo-kaleidoscope" :class="{ paused: config.paused }" ref="containerRef">
    <!-- 万花筒场景 -->
    <div 
      class="kaleidoscope-scene" 
      :data-filter="config.colorFilter"
      :style="sceneStyle"
      ref="sceneRef"
    >
      <!-- 万花筒分片 -->
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="kaleidoscope-segment"
        :style="getSegmentStyle(index)"
      >
        <div class="kaleidoscope-mirror" @click="handlePhotoClick(index)">
          <SmartImage
            :src="getPhotoUrl(photo)"
            :alt="photo.name"
            :lazy="true"
            :max-retries="2"
          />
          
          <!-- 删除按钮 -->
          <button
            class="kaleidoscope-delete"
            @click.stop="deletePhoto(index)"
            title="删除照片"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- 中心装饰 -->
      <div class="kaleidoscope-center">
        <i class="fas fa-dharmachakra"></i>
      </div>
    </div>

    <!-- 万花筒控制面板 -->
    <div class="kaleidoscope-controls" :class="{ collapsed: !controlsVisible }">
      <!-- 折叠/展开按钮 -->
      <button
        class="controls-toggle"
        @click="toggleControls"
        :title="controlsVisible ? '隐藏控制面板' : '显示控制面板'"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- 播放/暂停 -->
      <div class="control-group">
        <button
          class="control-btn"
          :class="{ active: !config.paused }"
          @click="togglePause"
          :title="config.paused ? '播放' : '暂停'"
        >
          <i :class="config.paused ? 'fas fa-play' : 'fas fa-pause'"></i>
        </button>
      </div>

      <!-- 速度控制 -->
      <div class="control-group">
        <button
          class="control-btn"
          @click="decreaseSpeed"
          title="减慢速度"
        >
          <i class="fas fa-minus"></i>
        </button>
        <button
          class="control-btn active"
          style="pointer-events: none; min-width: 50px;"
        >
          {{ speedDisplay }}
        </button>
        <button
          class="control-btn"
          @click="increaseSpeed"
          title="加快速度"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>

      <!-- 滤镜控制 -->
      <div class="control-group">
        <button
          class="control-btn"
          :class="{ active: config.colorFilter === 'none' }"
          @click="setFilter('none')"
          title="无滤镜"
        >
          <i class="fas fa-circle"></i>
        </button>
        <button
          class="control-btn"
          :class="{ active: config.colorFilter === 'warm' }"
          @click="setFilter('warm')"
          title="暖色调"
          style="color: #ff6b6b;"
        >
          <i class="fas fa-circle"></i>
        </button>
        <button
          class="control-btn"
          :class="{ active: config.colorFilter === 'cool' }"
          @click="setFilter('cool')"
          title="冷色调"
          style="color: #4ecdc4;"
        >
          <i class="fas fa-circle"></i>
        </button>
        <button
          class="control-btn"
          :class="{ active: config.colorFilter === 'vibrant' }"
          @click="setFilter('vibrant')"
          title="鲜艳"
          style="color: #9b59b6;"
        >
          <i class="fas fa-circle"></i>
        </button>
      </div>

      <!-- 分片数量控制 -->
      <div class="control-group">
        <button
          class="control-btn"
          :class="{ active: config.segments === 4 }"
          @click="setSegments(4)"
          title="4分片"
        >
          4
        </button>
        <button
          class="control-btn"
          :class="{ active: config.segments === 6 }"
          @click="setSegments(6)"
          title="6分片"
        >
          6
        </button>
        <button
          class="control-btn"
          :class="{ active: config.segments === 8 }"
          @click="setSegments(8)"
          title="8分片"
        >
          8
        </button>
      </div>

      <!-- 缩放控制 -->
      <div class="control-group">
        <button
          class="control-btn"
          @click="zoomOut"
          title="缩小 (-)"
        >
          <i class="fas fa-search-minus"></i>
        </button>
        <button
          class="control-btn active"
          style="pointer-events: none; min-width: 60px;"
          title="当前缩放比例"
        >
          {{ zoomPercentage }}%
        </button>
        <button
          class="control-btn"
          @click="zoomIn"
          title="放大 (+)"
        >
          <i class="fas fa-search-plus"></i>
        </button>
        <button
          class="control-btn"
          @click="resetZoom"
          title="重置视图 (0)"
        >
          <i class="fas fa-compress-arrows-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Photo, KaleidoscopeConfig } from '@/types'
import { getPhotoUrl } from '@/utils/image'
import SmartImage from '@/components/common/SmartImage.vue'
import { useLayoutStore } from '@/stores/layoutStore'
import { useInteraction } from '@/composables/useInteraction'

const props = defineProps<{
  photos: Photo[]
  config: KaleidoscopeConfig
}>()

const emit = defineEmits<{
  photoClick: [index: number]
  deletePhoto: [index: number]
  exitLayout: []
}>()

const layoutStore = useLayoutStore()
const containerRef = ref<HTMLElement>()
const sceneRef = ref<HTMLElement>()
const rotation = ref(0)
const controlsVisible = ref(true)
let animationFrameId: number | null = null

// 引入交互功能
const { setupDragEvents, setupZoomEvents, setupTouchEvents, transformStyle } = useInteraction()

// 从 layoutStore 获取 interaction 状态
const interaction = computed(() => layoutStore.interaction)

// 从localStorage加载控制面板状态
const loadControlsState = () => {
  const saved = localStorage.getItem('kaleidoscope-controls-visible')
  if (saved !== null) {
    controlsVisible.value = saved === 'true'
  }
}

// 保存控制面板状态
const saveControlsState = () => {
  localStorage.setItem('kaleidoscope-controls-visible', String(controlsVisible.value))
}

// 切换控制面板显示/隐藏
const toggleControls = () => {
  controlsVisible.value = !controlsVisible.value
  saveControlsState()
}

// 速度显示
const speedDisplay = computed(() => {
  const speed = props.config.speed
  if (speed < 0.1) return '极慢'
  if (speed < 0.3) return '慢'
  if (speed < 0.6) return '中'
  if (speed < 1.0) return '快'
  return '极快'
})

// 场景样式（旋转效果 + 缩放平移）
const sceneStyle = computed(() => {
  const baseTransform = transformStyle.value.transform || ''
  // 暂停时保持当前旋转角度，不更新但继续显示
  const rotateTransform = `rotate(${rotation.value}deg)`
  
  // 合并变换
  const transforms = [baseTransform, rotateTransform].filter(t => t).join(' ')
  
  return {
    transform: transforms || undefined,
    transformOrigin: 'center center'
  }
})

// 缩放比例显示
const zoomPercentage = computed(() => 
  Math.round(interaction.value.zoomLevel * 100)
)

// 计算每个分片的位置和样式
function getSegmentStyle(index: number) {
  const totalSegments = Math.min(props.photos.length, props.config.segments * 4)
  const anglePerSegment = 360 / totalSegments
  const angle = index * anglePerSegment
  
  // 根据索引计算半径（形成多圈分布）
  const circle = Math.floor(index / props.config.segments)
  const radius = 150 + circle * 80
  
  // 随机偏移（基于索引的伪随机）
  const seed = index * 9301 + 49297
  const randomOffset = ((seed % 233280) / 233280 - 0.5) * 30
  
  return {
    '--rotation': `${angle}deg`,
    '--radius': `${radius}px`,
    '--random-offset': `${randomOffset}px`,
    '--delay': `${index * 0.1}s`,
    transform: `rotate(${angle}deg) translateX(${radius}px)`,
    zIndex: Math.floor(100 - circle * 10)
  }
}

// 动画循环
function animate() {
  if (!props.config.paused) {
    rotation.value += props.config.speed * 0.5
    if (rotation.value >= 360) {
      rotation.value -= 360
    }
  }
  animationFrameId = requestAnimationFrame(animate)
}

// 事件处理
function handlePhotoClick(index: number) {
  emit('photoClick', index)
}

function deletePhoto(index: number) {
  emit('deletePhoto', index)
}

function togglePause() {
  const newConfig = { ...props.config, paused: !props.config.paused }
  layoutStore.setLayoutConfig('kaleidoscope', newConfig)
}

function decreaseSpeed() {
  const newSpeed = Math.max(0.05, props.config.speed - 0.1)
  const newConfig = { ...props.config, speed: parseFloat(newSpeed.toFixed(2)) }
  layoutStore.setLayoutConfig('kaleidoscope', newConfig)
}

function increaseSpeed() {
  const newSpeed = Math.min(1.5, props.config.speed + 0.1)
  const newConfig = { ...props.config, speed: parseFloat(newSpeed.toFixed(2)) }
  layoutStore.setLayoutConfig('kaleidoscope', newConfig)
}

function setFilter(filter: 'none' | 'warm' | 'cool' | 'vibrant') {
  const newConfig = { ...props.config, colorFilter: filter }
  layoutStore.setLayoutConfig('kaleidoscope', newConfig)
}

function setSegments(segments: 4 | 6 | 8) {
  const newConfig = { ...props.config, segments }
  layoutStore.setLayoutConfig('kaleidoscope', newConfig)
}

function exitLayout() {
  emit('exitLayout')
}

// 缩放控制函数
const zoomIn = () => {
  const currentZoom = interaction.value.zoomLevel
  const newZoom = Math.min(currentZoom + 0.2, interaction.value.maxZoom)
  layoutStore.setZoomLevel(newZoom)
}

const zoomOut = () => {
  const currentZoom = interaction.value.zoomLevel
  const newZoom = Math.max(currentZoom - 0.2, interaction.value.minZoom)
  layoutStore.setZoomLevel(newZoom)
}

const resetZoom = () => {
  layoutStore.resetInteraction()
}

onMounted(() => {
  loadControlsState()
  animate()
  
  // 设置交互事件
  if (sceneRef.value) {
    const cleanupDrag = setupDragEvents(sceneRef.value)
    const cleanupZoom = setupZoomEvents(sceneRef.value)
    const cleanupTouch = setupTouchEvents(sceneRef.value)
    
    onUnmounted(() => {
      cleanupDrag()
      cleanupZoom()
      cleanupTouch()
    })
  }
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
/* 万花筒样式已在全局 main.css 中定义 */
</style>

