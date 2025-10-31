<template>
  <Transition name="fade">
    <div v-if="show" class="zoom-controls">
      <button
        class="zoom-btn"
        title="放大"
        @click="$emit('zoom-in')"
      >
        <i class="fas fa-search-plus"></i>
      </button>

      <button
        class="zoom-btn"
        title="缩小"
        @click="$emit('zoom-out')"
      >
        <i class="fas fa-search-minus"></i>
      </button>

      <button
        class="zoom-btn"
        title="重置视图"
        @click="$emit('reset')"
      >
        <i class="fas fa-expand-arrows-alt"></i>
      </button>

      <div class="zoom-level-display">
        {{ zoomLevel }}%
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  zoomLevel: number
}>()

defineEmits<{
  zoomIn: []
  zoomOut: []
  reset: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

