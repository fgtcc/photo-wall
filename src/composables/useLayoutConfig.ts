/**
 * 布局配置 Composable
 */

import { computed } from 'vue'
import { useLayoutStore } from '@/stores/layoutStore'
import type { LayoutType } from '@/types'

export function useLayoutConfig() {
  const layoutStore = useLayoutStore()

  /**
   * 切换布局
   */
  function switchLayout(layout: LayoutType) {
    layoutStore.switchLayout(layout)
  }

  /**
   * 获取当前布局配置
   */
  const currentConfig = computed(() => layoutStore.currentLayoutConfig)

  /**
   * 更新布局配置
   */
  function updateConfig<T extends keyof typeof layoutStore.layoutConfigs>(
    layoutName: T,
    config: any
  ) {
    layoutStore.setLayoutConfig(layoutName, config)
  }

  /**
   * 重置布局配置
   */
  function resetConfig(layoutName: keyof typeof layoutStore.layoutConfigs) {
    layoutStore.resetLayoutConfig(layoutName)
  }

  /**
   * 导出当前布局配置
   */
  function exportLayout() {
    const layoutData = {
      name: layoutStore.currentLayout,
      timestamp: new Date().toISOString(),
      settings: {
        layout: layoutStore.currentLayout,
        config: layoutStore.currentLayoutConfig
      }
    }

    const dataStr = JSON.stringify(layoutData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `photo-wall-layout-${layoutStore.currentLayout}-${Date.now()}.json`
    link.click()
  }

  /**
   * 导入布局配置
   */
  function importLayout(file: File) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target?.result as string)
        // 这里可以实现布局数据的应用逻辑
        console.log('Importing layout:', layoutData)
        alert('布局导入成功！')
      } catch (error) {
        alert('布局文件格式错误！')
        console.error('Layout import error:', error)
      }
    }
    reader.readAsText(file)
  }

  return {
    currentConfig,
    switchLayout,
    updateConfig,
    resetConfig,
    exportLayout,
    importLayout
  }
}

