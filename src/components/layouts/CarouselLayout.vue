<template>
  <div id="photoCarousel" class="photo-carousel">
    <div 
      class="carousel-container"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <div class="carousel-track">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          class="carousel-item"
          :class="{
            active: index === currentIndex,
            prev: index === prevIndex,
            next: index === nextIndex
          }"
          :data-index="index"
          @click="handleItemClick(index)"
        >
          <SmartImage
            :src="getPhotoUrl(photo)"
            :alt="photo.name"
            :lazy="false"
            :max-retries="2"
          />
        </div>
      </div>

      <!-- 控制按钮组 - 自动隐藏 -->
      <transition name="fade">
        <div v-show="showControls" class="carousel-controls">
          <button
            class="carousel-btn prev"
            @click.stop="previous"
            :disabled="photos.length === 0"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
            class="carousel-btn next"
            @click.stop="next"
            :disabled="photos.length === 0"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- 自动播放控制按钮 -->
          <button
            class="carousel-btn autoplay"
            @click.stop="toggleAutoPlay"
            :disabled="photos.length === 0"
            :title="isAutoPlaying ? '暂停自动播放' : '开始自动播放'"
          >
            <i :class="isAutoPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>
      </transition>

      <!-- 指示器 - 自动隐藏 -->
      <transition name="fade">
        <div v-show="showControls" class="carousel-indicators">
          <div
            v-for="(photo, index) in photos"
            :key="index"
            class="carousel-indicator"
            :class="{ active: index === currentIndex }"
            @click="goTo(index)"
          ></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Photo } from '@/types'
import { getPhotoUrl } from '@/utils/image'
import SmartImage from '@/components/common/SmartImage.vue'

const props = defineProps<{
  photos: Photo[]
  autoPlayInterval?: number
}>()

const emit = defineEmits<{
  photoClick: [index: number]
}>()

const currentIndex = ref(0)
const autoPlayTimer = ref<number>()
const isAutoPlaying = ref(true)  // 自动播放状态
const showControls = ref(true)  // 控制按钮显示状态
const hideControlsTimer = ref<number>()  // 自动隐藏定时器

const prevIndex = computed(() => {
  if (props.photos.length === 0) return -1
  return (currentIndex.value - 1 + props.photos.length) % props.photos.length
})

const nextIndex = computed(() => {
  if (props.photos.length === 0) return -1
  return (currentIndex.value + 1) % props.photos.length
})

function previous() {
  if (props.photos.length === 0) return
  currentIndex.value = prevIndex.value
}

function next() {
  if (props.photos.length === 0) return
  currentIndex.value = nextIndex.value
}

function goTo(index: number) {
  currentIndex.value = index
}

function handleItemClick(index: number) {
  if (index === currentIndex.value) {
    emit('photoClick', index)
  } else if (index === prevIndex.value) {
    previous()
  } else if (index === nextIndex.value) {
    next()
  }
}

function startAutoPlay() {
  stopAutoPlay()
  if (props.photos.length > 1) {
    autoPlayTimer.value = window.setInterval(() => {
      next()
    }, props.autoPlayInterval || 5000)
    isAutoPlaying.value = true
  }
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = undefined
  }
  isAutoPlaying.value = false
}

function toggleAutoPlay() {
  if (isAutoPlaying.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
    isAutoPlaying.value = true
  }
}

// 显示控制按钮
function showControlsTemporarily() {
  showControls.value = true
  // 清除之前的定时器
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
  // 3秒后自动隐藏
  hideControlsTimer.value = window.setTimeout(() => {
    showControls.value = false
  }, 3000)
}

// 鼠标移动时显示控制按钮
function handleMouseMove() {
  showControlsTemporarily()
}

// 鼠标离开时立即开始隐藏倒计时
function handleMouseLeave() {
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
  hideControlsTimer.value = window.setTimeout(() => {
    showControls.value = false
  }, 1000)
}

onMounted(() => {
  startAutoPlay()
  // 初始显示控制按钮
  showControlsTemporarily()
})

onUnmounted(() => {
  stopAutoPlay()
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
})
</script>

