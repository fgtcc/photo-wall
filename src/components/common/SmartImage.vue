<template>
  <div class="smart-image-wrapper" :class="{ error: hasError, loading: isLoading }">
    <!-- 加载中状态 -->
    <div v-if="isLoading && !hasError" class="image-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>加载中...</span>
    </div>

    <!-- 图片 -->
    <img
      v-show="!isLoading && !hasError"
      :src="currentSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      @load="handleLoad"
      @error="handleError"
      class="smart-image"
    />

    <!-- 错误状态 -->
    <div v-if="hasError" class="image-error">
      <div class="error-content">
        <i class="fas fa-image error-icon"></i>
        <p class="error-text">图片加载失败</p>
        <button
          v-if="canRetry"
          class="retry-btn"
          @click="retry"
        >
          <i class="fas fa-redo-alt"></i>
          重试 ({{ retryCount }}/{{ maxRetries }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { getPlaceholderImage } from '@/utils/image'

interface Props {
  src: string
  alt?: string
  lazy?: boolean
  maxRetries?: number
  retryDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  lazy: true,
  maxRetries: 3,
  retryDelay: 2000
})

const emit = defineEmits<{
  load: []
  error: []
}>()

const isLoading = ref(true)
const hasError = ref(false)
const retryCount = ref(0)
const currentSrc = ref(props.src)

const canRetry = computed(() => retryCount.value < props.maxRetries)

// 图片加载成功
function handleLoad() {
  isLoading.value = false
  hasError.value = false
  emit('load')
}

// 图片加载失败
function handleError() {
  console.warn(`Image load failed: ${currentSrc.value}`)
  
  if (canRetry.value) {
    // 自动重试
    retryCount.value++
    console.log(`Retrying (${retryCount.value}/${props.maxRetries})...`)
    
    setTimeout(() => {
      // 添加时间戳避免缓存
      const separator = currentSrc.value.includes('?') ? '&' : '?'
      currentSrc.value = props.src + separator + 't=' + Date.now()
    }, props.retryDelay)
  } else {
    // 达到最大重试次数，显示占位图
    isLoading.value = false
    hasError.value = true
    currentSrc.value = getPlaceholderImage()
    emit('error')
  }
}

// 手动重试
function retry() {
  if (!canRetry.value) return
  
  isLoading.value = true
  hasError.value = false
  retryCount.value++
  
  // 重新加载图片
  const separator = props.src.includes('?') ? '&' : '?'
  currentSrc.value = props.src + separator + 't=' + Date.now()
}

// 监听src变化，重置状态
watch(() => props.src, (newSrc) => {
  isLoading.value = true
  hasError.value = false
  retryCount.value = 0
  currentSrc.value = newSrc
})

onMounted(() => {
  // 如果图片已经在缓存中，可能不会触发load事件
  const img = new Image()
  img.onload = () => {
    if (isLoading.value) {
      handleLoad()
    }
  }
  img.src = props.src
})
</script>

<style scoped>
.smart-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.smart-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* 加载中状态 */
.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #a0aec0;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1;
}

.image-loading i {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  z-index: 1;
}

.error-content {
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  color: #a0aec0;
  margin-bottom: 10px;
}

.error-text {
  color: #718096;
  font-size: 14px;
  margin-bottom: 15px;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.retry-btn:active {
  transform: translateY(0);
}

.retry-btn i {
  font-size: 12px;
}

/* 淡入动画 */
.smart-image-wrapper.loading .smart-image {
  opacity: 0;
}

.smart-image-wrapper:not(.loading) .smart-image {
  opacity: 1;
}
</style>

