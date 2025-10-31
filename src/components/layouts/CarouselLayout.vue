<template>
  <div id="photoCarousel" class="photo-carousel">
    <div class="carousel-container">
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * 70}%)` }"
      >
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

      <div class="carousel-indicators">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="carousel-indicator"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        ></div>
      </div>
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
  }
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = undefined
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

