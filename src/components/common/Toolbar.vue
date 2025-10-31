<template>
  <div class="floating-toolbar">
    <div class="toolbar-brand">
      <i class="fas fa-images"></i>
      <span>照片墙</span>
    </div>
    <div class="toolbar-actions">
      <button
        class="toolbar-btn"
        title="上传照片"
        @click="$emit('upload')"
      >
        <i class="fas fa-cloud-upload-alt"></i>
      </button>
      <button
        class="toolbar-btn"
        title="布局市场"
        @click="$emit('show-market')"
      >
        <i class="fas fa-store"></i>
      </button>
      <button
        v-if="showConfigBtn"
        class="toolbar-btn"
        title="布局配置"
        @click="$emit('show-config')"
      >
        <i class="fas fa-cog"></i>
      </button>
      <button
        class="toolbar-btn"
        title="清空照片"
        @click="$emit('clear')"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showConfigBtn?: boolean
}>()

defineEmits<{
  upload: []
  showMarket: []
  showConfig: []
  clear: []
}>()
</script>

