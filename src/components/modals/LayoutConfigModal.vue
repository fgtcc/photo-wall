<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal"
        id="layoutConfigModal"
        @click="handleBackdropClick"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h2><i class="fas fa-cog"></i> 布局配置 - {{ layoutName }}</h2>
            <button class="modal-close" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="currentConfig" class="config-form">
              <!-- Star 布局配置 -->
              <template v-if="layoutType === 'star'">
                <div class="config-group">
                  <label>半径大小：{{ currentConfig.radiusFactor }}</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.radiusFactor"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>起始角度：{{ currentConfig.startAngle }}°</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.startAngle"
                    min="0"
                    max="360"
                    step="15"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>旋转方向</label>
                  <select v-model.number="currentConfig.direction" @change="handleConfigChange">
                    <option :value="1">顺时针</option>
                    <option :value="-1">逆时针</option>
                  </select>
                </div>

                <div class="config-group">
                  <label>图片大小：{{ currentConfig.itemSize }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.itemSize"
                    min="60"
                    max="200"
                    step="10"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>圈数</label>
                  <select v-model.number="currentConfig.circles" @change="handleConfigChange">
                    <option :value="1">单圈</option>
                    <option :value="2">双圈</option>
                    <option :value="3">三圈</option>
                  </select>
                </div>
              </template>

              <!-- Spiral 布局配置 -->
              <template v-else-if="layoutType === 'spiral'">
                <div class="config-group">
                  <label>螺旋紧密度：{{ currentConfig.angleIncrement }}</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.angleIncrement"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>半径增长：{{ currentConfig.radiusGrowth }}</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.radiusGrowth"
                    min="10"
                    max="30"
                    step="1"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>起始半径：{{ currentConfig.startRadius }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.startRadius"
                    min="20"
                    max="100"
                    step="5"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>图片大小：{{ currentConfig.itemSize }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.itemSize"
                    min="40"
                    max="120"
                    step="5"
                    @input="handleConfigChange"
                  />
                </div>
              </template>

              <!-- Wave 布局配置 -->
              <template v-else-if="layoutType === 'wave'">
                <div class="config-group">
                  <label>波浪振幅：{{ currentConfig.amplitude }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.amplitude"
                    min="20"
                    max="100"
                    step="5"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>波浪频率：{{ currentConfig.frequency }}</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.frequency"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>水平间距：{{ currentConfig.spacing }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.spacing"
                    min="80"
                    max="200"
                    step="10"
                    @input="handleConfigChange"
                  />
                </div>

                <div class="config-group">
                  <label>波形类型</label>
                  <select v-model="currentConfig.waveType" @change="handleConfigChange">
                    <option value="sine">正弦波</option>
                    <option value="cosine">余弦波</option>
                  </select>
                </div>

                <div class="config-group">
                  <label>图片大小：{{ currentConfig.itemSize }}px</label>
                  <input
                    type="range"
                    v-model.number="currentConfig.itemSize"
                    min="60"
                    max="150"
                    step="5"
                    @input="handleConfigChange"
                  />
                </div>
              </template>
            </div>

            <div v-else class="empty-state">
              <i class="fas fa-info-circle"></i>
              <p>当前布局不支持配置</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="$emit('reset')">
              <i class="fas fa-undo"></i> 重置
            </button>
            <button class="btn btn-primary" @click="$emit('close')">
              <i class="fas fa-check"></i> 应用
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { LayoutType, LayoutConfig } from '@/types'

const props = defineProps<{
  show: boolean
  layoutType: LayoutType
  config: LayoutConfig | null
}>()

const emit = defineEmits<{
  close: []
  reset: []
  update: [config: LayoutConfig]
}>()

const currentConfig = ref<any>(null)

const layoutName = computed(() => {
  const names: Record<LayoutType, string> = {
    grid: '网格',
    masonry: '瀑布流',
    list: '列表',
    carousel: '轮播',
    star: '星空',
    kaleidoscope: '万花筒',
    spiral: '螺旋',
    wave: '波浪',
    card3d: '3D卡片'
  }
  return names[props.layoutType] || props.layoutType
})

watch(() => props.config, (newConfig) => {
  if (newConfig) {
    currentConfig.value = { ...newConfig }
  }
}, { immediate: true, deep: true })

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function handleConfigChange() {
  if (currentConfig.value) {
    emit('update', currentConfig.value)
  }
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
  max-width: 600px;
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
  font-size: 20px;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.config-form {
  max-width: 500px;
  margin: 0 auto;
}

.config-group {
  margin-bottom: 24px;
}

.config-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.config-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.config-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  transition: background 0.2s;
}

.config-group input[type="range"]::-webkit-slider-thumb:hover {
  background: #5a67d8;
}

.config-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.config-group select:hover {
  border-color: #cbd5e0;
}

.config-group select:focus {
  outline: none;
  border-color: #667eea;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
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

