<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="photo-modal"
        @click="$emit('close')"
      >
        <div class="modal-content" @click.stop>
          <button
            class="modal-close-btn"
            @click="$emit('close')"
          >
            <i class="fas fa-times"></i>
          </button>

          <img
            v-if="photo"
            :src="getPhotoUrl(photo)"
            :alt="photo.name"
            class="modal-image"
          />

          <div class="modal-actions">
            <button
              class="modal-action-btn"
              title="上一张"
              :disabled="!hasPrevious"
              @click="$emit('previous')"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <button
              class="modal-action-btn"
              title="下载"
              @click="$emit('download')"
            >
              <i class="fas fa-download"></i>
            </button>

            <button
              class="modal-action-btn"
              title="删除"
              @click="$emit('delete')"
            >
              <i class="fas fa-trash"></i>
            </button>

            <button
              class="modal-action-btn"
              title="下一张"
              :disabled="!hasNext"
              @click="$emit('next')"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Photo } from '@/types'
import { getPhotoUrl } from '@/utils/image'

defineProps<{
  show: boolean
  photo: Photo | null
  hasPrevious: boolean
  hasNext: boolean
}>()

defineEmits<{
  close: []
  previous: []
  next: []
  download: []
  delete: []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

