<template>
  <div id="photoStar" class="photo-star starry-night milky-way" ref="containerRef">
    <!-- 星空背景层 -->
    <div class="star-background">
      <!-- 银河带 -->
      <div class="milky-way-band"></div>
      
      <!-- 背景装饰星星 -->
      <div 
        v-for="i in 150" 
        :key="`bg-star-${i}`"
        class="bg-star"
        :style="getBgStarStyle(i)"
      ></div>
      
      <!-- 增强星云效果 -->
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
      <div class="nebula nebula-4"></div>
      <div class="nebula nebula-5"></div>
      
      <!-- 流星层 -->
      <div 
        v-for="i in 6" 
        :key="`meteor-${i}`"
        class="meteor"
        :class="`meteor-${i}`"
      ></div>
    </div>

    <!-- 可交互的星空容器 -->
    <div
      class="star-container"
      :style="transformStyle"
    >
      <!-- 星座连线 -->
      <svg class="constellation-lines" v-if="showConstellations">
        <line
          v-for="(line, idx) in constellationLines"
          :key="`line-${idx}`"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          class="constellation-line"
        />
      </svg>

      <!-- 照片星星 -->
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="star-item celestial-body"
        :class="getStarClass(index)"
        :data-index="index"
        :style="getItemStyle(index)"
        @click="handlePhotoClick(index)"
      >
        <!-- 星光外圈 -->
        <div class="star-glow"></div>
        
        <!-- 照片容器 -->
            <div class="star-photo">
              <SmartImage
                :src="getPhotoUrl(photo)"
                :alt="photo.name"
                :lazy="true"
                :max-retries="2"
              />
            </div>

        <!-- 星星光芒 -->
        <div class="star-rays">
          <span v-for="i in 4" :key="i" class="ray"></span>
        </div>

        <button
          class="delete-btn"
          @click.stop="deletePhoto(index)"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- 星空控制面板 -->
    <div class="starry-controls">
      <button 
        class="starry-btn"
        :class="{ active: showConstellations }"
        @click="toggleConstellations"
        title="显示/隐藏星座连线"
      >
        <i class="fas fa-project-diagram"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Photo, StarLayoutConfig } from '@/types'
import { getPhotoUrl } from '@/utils/image'
import SmartImage from '@/components/common/SmartImage.vue'
import { useInteraction } from '@/composables/useInteraction'

const props = defineProps<{
  photos: Photo[]
  config: StarLayoutConfig
}>()

const emit = defineEmits<{
  photoClick: [index: number]
  deletePhoto: [index: number]
}>()

const containerRef = ref<HTMLElement>()
const showConstellations = ref(true)
const starPositions = ref<Array<{x: number, y: number, size: number, depth: number}>>([])
const { setupDragEvents, setupZoomEvents, setupTouchEvents, transformStyle } = useInteraction()

// 生成星星位置（使用伪随机保证一致性）
function generateStarPositions() {
  if (!containerRef.value) return
  
  const containerWidth = containerRef.value.offsetWidth || 1200
  const containerHeight = containerRef.value.offsetHeight || 800
  const positions: typeof starPositions.value = []
  
  // 使用配置作为随机种子，确保每次渲染位置一致
  const seed = props.config.startAngle || 0
  let random = seed
  
  // 简单的伪随机函数
  const pseudoRandom = () => {
    random = (random * 9301 + 49297) % 233280
    return random / 233280
  }
  
  props.photos.forEach((photo, index) => {
    // 随机位置，但避免太靠边
    const padding = 100
    const x = padding + pseudoRandom() * (containerWidth - padding * 2)
    const y = padding + pseudoRandom() * (containerHeight - padding * 2)
    
    // 随机大小（模拟远近）
    const sizeVariation = 0.6 + pseudoRandom() * 0.8 // 0.6 ~ 1.4
    const size = props.config.itemSize * sizeVariation
    
    // 深度层次（用于3D效果）
    const depth = pseudoRandom()
    
    positions.push({ x, y, size, depth })
  })
  
  starPositions.value = positions
}

// 计算星座连线
const constellationLines = computed(() => {
  if (!showConstellations.value || starPositions.value.length < 2) return []
  
  const lines: Array<{x1: number, y1: number, x2: number, y2: number}> = []
  const positions = starPositions.value
  
  // 连接相近的星星（形成星座）
  positions.forEach((star, i) => {
    // 找到距离最近的2-3颗星星连线
    const distances = positions
      .map((s, idx) => ({
        idx,
        dist: Math.sqrt(Math.pow(s.x - star.x, 2) + Math.pow(s.y - star.y, 2))
      }))
      .filter(d => d.idx !== i && d.dist < 300) // 距离小于300px的才连线
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2) // 最多连2条线
    
    distances.forEach(d => {
      if (d.idx > i) { // 避免重复连线
        lines.push({
          x1: star.x + star.size / 2,
          y1: star.y + star.size / 2,
          x2: positions[d.idx].x + positions[d.idx].size / 2,
          y2: positions[d.idx].y + positions[d.idx].size / 2
        })
      }
    })
  })
  
  return lines
})

// 背景装饰星星样式
function getBgStarStyle(index: number) {
  const random = (index * 9301 + 49297) % 233280 / 233280
  const random2 = ((index + 1) * 9301 + 49297) % 233280 / 233280
  const random3 = ((index + 2) * 9301 + 49297) % 233280 / 233280
  
  return {
    left: `${random * 100}%`,
    top: `${random2 * 100}%`,
    width: `${1 + random3 * 3}px`,
    height: `${1 + random3 * 3}px`,
    animationDelay: `${random * 3}s`,
    animationDuration: `${2 + random2 * 2}s`
  }
}

// 获取星星样式
function getItemStyle(index: number) {
  if (starPositions.value.length === 0) return {}
  
  const pos = starPositions.value[index]
  if (!pos) return {}
  
  return {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${pos.size}px`,
    height: `${pos.size}px`,
    '--depth': pos.depth,
    '--float-delay': `${index * 0.5}s`,
    zIndex: Math.floor(pos.depth * 100)
  }
}

// 获取星星类别（不同的视觉效果）
function getStarClass(index: number) {
  const depth = starPositions.value[index]?.depth || 0
  if (depth < 0.33) return 'star-far' // 远处的星
  if (depth < 0.66) return 'star-mid' // 中等距离
  return 'star-near' // 近处的星
}

function handlePhotoClick(index: number) {
  emit('photoClick', index)
}

function deletePhoto(index: number) {
  emit('deletePhoto', index)
}

function toggleConstellations() {
  showConstellations.value = !showConstellations.value
}

// 监听照片变化，重新生成位置
watch(() => props.photos.length, () => {
  setTimeout(generateStarPositions, 100)
}, { immediate: false })

onMounted(() => {
  generateStarPositions()
  
  if (containerRef.value) {
    const cleanupDrag = setupDragEvents(containerRef.value)
    const cleanupZoom = setupZoomEvents(containerRef.value)
    const cleanupTouch = setupTouchEvents(containerRef.value)
    
    onUnmounted(() => {
      cleanupDrag()
      cleanupZoom()
      cleanupTouch()
    })
  }
})
</script>

<style scoped>
/* 星空主题将在全局CSS中定义 */
</style>

