<template>
  <div id="app">
    <!-- 工具栏 -->
    <Toolbar
      :show-config-btn="layoutStore.isZoomableLayout"
      @upload="handleUpload"
      @show-market="showMarket = true"
      @show-config="showConfig = true"
      @clear="handleClear"
    />

    <!-- 缩放控制 -->
    <ZoomControls
      :show="layoutStore.isZoomableLayout"
      :zoom-level="layoutStore.zoomPercentage"
      @zoom-in="layoutStore.zoomIn()"
      @zoom-out="layoutStore.zoomOut()"
      @reset="layoutStore.resetInteraction()"
    />

    <!-- 布局FAB (万花筒布局时隐藏) -->
    <LayoutFAB
      v-if="layoutStore.currentLayout !== 'kaleidoscope'"
      :current-layout="layoutStore.currentLayout"
      @layout-change="handleLayoutChange"
    />

    <!-- 主容器 -->
    <div id="photoContainer" class="photo-container">
      <!-- 网格布局 -->
      <GridLayout
        v-if="layoutStore.currentLayout === 'grid'"
        :photos="photoStore.photos"
        @photo-click="handlePhotoClick"
        @delete-photo="handleDeletePhoto"
        @swap-photos="handleSwapPhotos"
      />

      <!-- 瀑布流布局 -->
      <MasonryLayout
        v-else-if="layoutStore.currentLayout === 'masonry'"
        :photos="photoStore.photos"
        @photo-click="handlePhotoClick"
        @delete-photo="handleDeletePhoto"
        @swap-photos="handleSwapPhotos"
      />

      <!-- 列表布局 -->
      <ListLayout
        v-else-if="layoutStore.currentLayout === 'list'"
        :photos="photoStore.photos"
        @photo-click="handlePhotoClick"
        @delete-photo="handleDeletePhoto"
        @swap-photos="handleSwapPhotos"
      />

      <!-- 轮播布局 -->
      <CarouselLayout
        v-else-if="layoutStore.currentLayout === 'carousel'"
        :photos="photoStore.photos"
        @photo-click="handlePhotoClick"
      />

      <!-- 星空布局 -->
      <StarLayout
        v-else-if="layoutStore.currentLayout === 'star'"
        :photos="photoStore.photos"
        :config="layoutStore.getLayoutConfig('star')"
        @photo-click="handlePhotoClick"
        @delete-photo="handleDeletePhoto"
      />

      <!-- 万花筒布局 -->
      <KaleidoscopeLayout
        v-else-if="layoutStore.currentLayout === 'kaleidoscope'"
        :photos="photoStore.photos"
        :config="layoutStore.getLayoutConfig('kaleidoscope')"
        @photo-click="handlePhotoClick"
        @delete-photo="handleDeletePhoto"
        @exit-layout="handleExitKaleidoscope"
      />

      <!-- 空状态 -->
      <div v-else-if="!photoStore.hasPhotos" class="empty-state">
        <i class="fas fa-images"></i>
        <h3>还没有照片</h3>
        <p>点击上方按钮或拖拽照片到这里开始创建你的照片墙</p>
      </div>

      <!-- 其他布局占位 -->
      <div v-else class="layout-placeholder">
        <i class="fas fa-tools"></i>
        <h3>{{ layoutStore.currentLayout }} 布局</h3>
        <p>此布局组件正在开发中...</p>
        <small>已实现: Grid, Masonry, List, Carousel, Star, Kaleidoscope</small>
        <br>
        <small>待补充: Spiral, Wave, Card3D</small>
      </div>
    </div>

    <!-- 照片模态框 -->
    <PhotoModal
      :show="showModal"
      :photo="photoStore.currentPhoto"
      :has-previous="photoStore.currentPhotoIndex > 0"
      :has-next="photoStore.currentPhotoIndex < photoStore.photoCount - 1"
      @close="showModal = false"
      @previous="navigatePhoto(-1)"
      @next="navigatePhoto(1)"
      @download="handleDownload"
      @delete="handleDeleteCurrent"
    />

    <!-- 文件上传器 -->
    <FileUploader
      ref="fileUploaderRef"
      @files-selected="handleFilesSelected"
    />

    <!-- 加载指示器 -->
    <LoadingSpinner
      :show="photoStore.isLoading"
      :message="'处理中...'"
    />

    <!-- 布局市场模态框 -->
    <LayoutMarketModal
      :show="showMarket"
      @close="showMarket = false"
      @apply-layout="handleApplyLayout"
      @import="handleImportLayout"
      @export="handleExportLayout"
    />

    <!-- 布局配置模态框 -->
    <LayoutConfigModal
      :show="showConfig"
      :layout-type="layoutStore.currentLayout"
      :config="layoutStore.currentLayoutConfig"
      @close="showConfig = false"
      @reset="handleResetConfig"
      @update="handleUpdateConfig"
    />

    <!-- 全局拖拽上传 -->
    <div
      v-if="isDraggingOver"
      class="drag-overlay"
      @drop.prevent="handleGlobalDrop"
      @dragover.prevent
      @dragleave="isDraggingOver = false"
    >
      <div class="drag-overlay-content">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>释放以上传照片</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePhotoStore } from './stores/photoStore'
import { useLayoutStore } from './stores/layoutStore'
import { usePhotoManager } from './composables/usePhotoManager'
import { useInteraction } from './composables/useInteraction'

// 组件
import Toolbar from './components/common/Toolbar.vue'
import ZoomControls from './components/common/ZoomControls.vue'
import LayoutFAB from './components/common/LayoutFAB.vue'
import PhotoModal from './components/common/PhotoModal.vue'
import FileUploader from './components/common/FileUploader.vue'
import LoadingSpinner from './components/common/LoadingSpinner.vue'
import GridLayout from './components/layouts/GridLayout.vue'
import MasonryLayout from './components/layouts/MasonryLayout.vue'
import ListLayout from './components/layouts/ListLayout.vue'
import CarouselLayout from './components/layouts/CarouselLayout.vue'
import StarLayout from './components/layouts/StarLayout.vue'
import KaleidoscopeLayout from './components/layouts/KaleidoscopeLayout.vue'
import LayoutMarketModal from './components/modals/LayoutMarketModal.vue'
import LayoutConfigModal from './components/modals/LayoutConfigModal.vue'

// Stores
const photoStore = usePhotoStore()
const layoutStore = useLayoutStore()

// Composables
const photoManager = usePhotoManager()
const { setupKeyboardEvents } = useInteraction()

// 状态
const showModal = ref(false)
const showMarket = ref(false)
const showConfig = ref(false)
const isDraggingOver = ref(false)
const fileUploaderRef = ref<InstanceType<typeof FileUploader>>()

// 初始化
onMounted(() => {
  photoStore.loadPhotos()
  layoutStore.loadLayoutPreference()
  layoutStore.loadLayoutConfigs()

  // 键盘事件
  const cleanup = setupKeyboardEvents(
    () => navigatePhoto(-1),
    () => navigatePhoto(1),
    () => showModal.value = false
  )

  // 全局拖拽事件
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDraggingOver.value = true
  }

  const handleDragLeave = (e: DragEvent) => {
    if (e.target === document.body) {
      isDraggingOver.value = false
    }
  }

  document.body.addEventListener('dragover', handleDragOver)
  document.body.addEventListener('dragleave', handleDragLeave)

  onUnmounted(() => {
    cleanup()
    document.body.removeEventListener('dragover', handleDragOver)
    document.body.removeEventListener('dragleave', handleDragLeave)
  })
})

// 事件处理
function handleUpload() {
  fileUploaderRef.value?.openFilePicker()
}

function handleFilesSelected(files: FileList) {
  photoManager.handleFiles(files)
}

function handleGlobalDrop(e: DragEvent) {
  isDraggingOver.value = false
  if (e.dataTransfer?.files) {
    photoManager.handleFiles(e.dataTransfer.files)
  }
}

function handleClear() {
  photoManager.clearAllPhotosWithConfirm()
}

function handleLayoutChange(layout: string) {
  layoutStore.switchLayout(layout as any)
}

function handlePhotoClick(index: number) {
  photoStore.setCurrentPhotoIndex(index)
  showModal.value = true
}

function handleDeletePhoto(index: number) {
  photoManager.deletePhotoWithConfirm(index)
}

function handleDeleteCurrent() {
  if (photoStore.currentPhotoIndex >= 0) {
    photoManager.deletePhotoWithConfirm(photoStore.currentPhotoIndex)
    showModal.value = false
  }
}

function handleSwapPhotos(fromIndex: number, toIndex: number) {
  photoStore.swapPhotos(fromIndex, toIndex)
}

function navigatePhoto(delta: number) {
  const newIndex = photoStore.currentPhotoIndex + delta
  if (newIndex >= 0 && newIndex < photoStore.photoCount) {
    photoStore.setCurrentPhotoIndex(newIndex)
  }
}

function handleDownload() {
  if (photoStore.currentPhoto) {
    photoManager.downloadPhoto(photoStore.currentPhoto)
  }
}

function handleApplyLayout(layoutId: string) {
  layoutStore.switchLayout(layoutId as any)
}

function handleImportLayout() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const layoutData = JSON.parse(e.target?.result as string)
          console.log('Imported layout:', layoutData)
          alert('布局导入成功！')
        } catch (error) {
          alert('布局文件格式错误！')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function handleExportLayout() {
  const layoutData = {
    name: layoutStore.currentLayout,
    timestamp: new Date().toISOString(),
    config: layoutStore.currentLayoutConfig
  }
  
  const dataStr = JSON.stringify(layoutData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `layout-${layoutStore.currentLayout}-${Date.now()}.json`
  link.click()
}

function handleResetConfig() {
  const layout = layoutStore.currentLayout
  if (layout === 'star' || layout === 'spiral' || layout === 'wave' || layout === 'kaleidoscope') {
    layoutStore.resetLayoutConfig(layout)
  }
}

function handleUpdateConfig(config: any) {
  const layout = layoutStore.currentLayout
  if (layout === 'star' || layout === 'spiral' || layout === 'wave' || layout === 'kaleidoscope') {
    layoutStore.setLayoutConfig(layout, config)
  }
}

function handleExitKaleidoscope() {
  layoutStore.switchLayout('grid')
}
</script>

<style>
/* 全局样式将由 main.css 提供 */
.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.drag-overlay-content {
  text-align: center;
  color: white;
}

.drag-overlay-content i {
  font-size: 80px;
  margin-bottom: 20px;
}

.drag-overlay-content p {
  font-size: 24px;
  font-weight: 500;
}

.layout-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #718096;
  text-align: center;
  padding: 40px;
}

.layout-placeholder i {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.layout-placeholder h3 {
  font-size: 32px;
  margin-bottom: 10px;
  text-transform: capitalize;
}

.layout-placeholder p {
  font-size: 18px;
  margin-bottom: 10px;
}

.layout-placeholder small {
  font-size: 14px;
  opacity: 0.7;
}
</style>

