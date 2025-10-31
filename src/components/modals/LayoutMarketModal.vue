<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal"
        id="layoutMarketModal"
        @click="handleBackdropClick"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h2><i class="fas fa-store"></i> 布局市场</h2>
            <button class="modal-close" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="modal-body">
            <!-- 在线布局 -->
            <div v-if="activeTab === 'online'" class="tab-content active">
              <div class="layout-grid">
                <div
                  v-for="layout in onlineLayouts"
                  :key="layout.id"
                  class="layout-card"
                  @click="previewLayout(layout)"
                >
                  <div class="layout-preview">
                    <i :class="layout.icon"></i>
                  </div>
                  <div class="layout-info">
                    <h3>{{ layout.name }}</h3>
                    <p>{{ layout.description }}</p>
                    <button
                      class="btn-apply"
                      @click.stop="applyLayout(layout)"
                    >
                      应用布局
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 我的布局 -->
            <div v-if="activeTab === 'mine'" class="tab-content active">
              <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>暂无保存的布局</p>
                <small>您可以在布局配置中保存当前布局</small>
              </div>
            </div>

            <!-- 导入导出 -->
            <div v-if="activeTab === 'import'" class="tab-content active">
              <div class="import-export-section">
                <div class="section">
                  <h3><i class="fas fa-file-import"></i> 导入布局</h3>
                  <div
                    class="import-zone"
                    @click="$emit('import')"
                  >
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>点击选择布局文件</p>
                    <small>支持 .json 格式</small>
                  </div>
                </div>

                <div class="section">
                  <h3><i class="fas fa-file-export"></i> 导出当前布局</h3>
                  <button
                    class="btn-export"
                    @click="$emit('export')"
                  >
                    <i class="fas fa-download"></i>
                    导出为JSON文件
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LayoutType } from '@/types'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  import: []
  export: []
  applyLayout: [layoutId: string]
}>()

const activeTab = ref('online')

const tabs = [
  { id: 'online', label: '在线布局' },
  { id: 'mine', label: '我的布局' },
  { id: 'import', label: '导入导出' }
]

const onlineLayouts = [
  { id: 'grid', name: '网格布局', icon: 'fas fa-th', description: '经典网格排列' },
  { id: 'masonry', name: '瀑布流', icon: 'fas fa-grip-vertical', description: 'Pinterest风格' },
  { id: 'list', name: '列表布局', icon: 'fas fa-list', description: '详细信息展示' },
  { id: 'carousel', name: '轮播布局', icon: 'fas fa-images', description: '自动轮播展示' },
  { id: 'star', name: '星空布局', icon: 'fas fa-star', description: '环形星空效果' },
  { id: 'kaleidoscope', name: '万花筒', icon: 'fas fa-dharmachakra', description: '动态镜像效果' },
  { id: 'spiral', name: '螺旋布局', icon: 'fas fa-sync', description: '螺旋展开效果' },
  { id: 'wave', name: '波浪布局', icon: 'fas fa-water', description: '波浪起伏效果' },
  { id: 'card3d', name: '3D卡片', icon: 'fas fa-layer-group', description: 'Cover Flow效果' }
]

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function previewLayout(layout: any) {
  console.log('Preview layout:', layout)
}

function applyLayout(layout: any) {
  emit('applyLayout', layout.id)
  emit('close')
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #2d3748;
}

.modal-header h2 i {
  margin-right: 10px;
  color: #667eea;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
  padding: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #2d3748;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  background: #f7fafc;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #718096;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.layout-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.layout-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.layout-preview {
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
}

.layout-info {
  padding: 16px;
}

.layout-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #2d3748;
}

.layout-info p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #718096;
}

.btn-apply {
  width: 100%;
  padding: 8px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-apply:hover {
  background: #5a67d8;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 18px;
}

.empty-state small {
  font-size: 14px;
}

.import-export-section {
  max-width: 600px;
  margin: 0 auto;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #2d3748;
}

.section h3 i {
  margin-right: 8px;
  color: #667eea;
}

.import-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.import-zone:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.import-zone i {
  font-size: 48px;
  color: #a0aec0;
  margin-bottom: 16px;
}

.import-zone p {
  margin: 8px 0;
  font-size: 16px;
  color: #2d3748;
}

.import-zone small {
  color: #a0aec0;
  font-size: 14px;
}

.btn-export {
  width: 100%;
  padding: 16px;
  border: none;
  background: #48bb78;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-export:hover {
  background: #38a169;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

