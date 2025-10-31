<template>
  <input
    ref="fileInputRef"
    type="file"
    multiple
    accept="image/*"
    style="display: none"
    @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  filesSelected: [files: FileList]
}>()

const fileInputRef = ref<HTMLInputElement>()

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('filesSelected', target.files)
    // 清空input，允许重复选择同一文件
    target.value = ''
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

defineExpose({
  openFilePicker
})
</script>

