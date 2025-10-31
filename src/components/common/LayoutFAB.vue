<template>
  <div class="layout-fab">
    <button
      class="fab-main"
      :class="{ active: menuOpen }"
      @click="toggleMenu"
    >
      <i :class="currentLayoutIcon"></i>
    </button>

    <Transition name="fab-menu">
      <div v-if="menuOpen" class="fab-menu" @click.stop>
        <button
          v-for="layout in layouts"
          :key="layout.type"
          class="fab-item"
          :class="{ active: layout.type === currentLayout }"
          :title="layout.label"
          @click="selectLayout(layout.type)"
        >
          <i :class="layout.icon"></i>
          <span>{{ layout.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { LayoutType } from '@/types'

const props = defineProps<{
  currentLayout: LayoutType
}>()

const emit = defineEmits<{
  layoutChange: [layout: LayoutType]
}>()

const menuOpen = ref(false)

const layouts = [
  { type: 'grid' as LayoutType, label: '网格', icon: 'fas fa-th' },
  { type: 'masonry' as LayoutType, label: '瀑布流', icon: 'fas fa-grip-vertical' },
  { type: 'list' as LayoutType, label: '列表', icon: 'fas fa-list' },
  { type: 'carousel' as LayoutType, label: '轮播', icon: 'fas fa-images' },
  { type: 'star' as LayoutType, label: '星空', icon: 'fas fa-star' },
  { type: 'kaleidoscope' as LayoutType, label: '万花筒', icon: 'fas fa-dharmachakra' },
  { type: 'spiral' as LayoutType, label: '螺旋', icon: 'fas fa-sync' },
  { type: 'wave' as LayoutType, label: '波浪', icon: 'fas fa-water' },
  { type: 'card3d' as LayoutType, label: '3D卡片', icon: 'fas fa-layer-group' }
]

const currentLayoutIcon = computed(() => {
  const layout = layouts.find(l => l.type === props.currentLayout)
  return layout?.icon || 'fas fa-th'
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function selectLayout(layout: LayoutType) {
  emit('layoutChange', layout)
  menuOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}

// 点击外部关闭菜单
function handleClickOutside() {
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: all 0.3s ease;
}

.fab-menu-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

