<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="loading">
        <div class="spinner"></div>
        <p>{{ message }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message?: string
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

