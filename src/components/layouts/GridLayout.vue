<template>
  <div id="photoGrid" class="photo-grid">
    <div
      v-for="(photo, index) in photos"
      :key="photo.id"
      class="photo-item"
      :data-index="index"
      draggable="true"
      @click="handlePhotoClick(index)"
      @dragstart="handleDragStart($event, index)"
      @dragover.prevent
      @drop="handleDrop($event, index)"
    >
      <SmartImage
        :src="getPhotoUrl(photo)"
        :alt="photo.name"
        :lazy="true"
        :max-retries="2"
      />
      <button
        class="delete-btn"
        @click.stop="deletePhoto(index)"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Photo } from '@/types'
import { getPhotoUrl } from '@/utils/image'
import SmartImage from '@/components/common/SmartImage.vue'

defineProps<{
  photos: Photo[]
}>()

const emit = defineEmits<{
  photoClick: [index: number]
  deletePhoto: [index: number]
  swapPhotos: [fromIndex: number, toIndex: number]
}>()

const draggedIndex = ref<number | null>(null)

function handlePhotoClick(index: number) {
  emit('photoClick', index)
}

function deletePhoto(index: number) {
  emit('deletePhoto', index)
}

function handleDragStart(e: DragEvent, index: number) {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function handleDrop(e: DragEvent, toIndex: number) {
  e.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
    emit('swapPhotos', draggedIndex.value, toIndex)
  }
  draggedIndex.value = null
}
</script>

