/**
 * 交互控制 Composable
 */

import { computed } from 'vue'
import { useLayoutStore } from '@/stores/layoutStore'

export function useInteraction() {
  const layoutStore = useLayoutStore()

  /**
   * 鼠标拖拽
   */
  function setupDragEvents(container: HTMLElement) {
    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.delete-btn')) return
      if ((e.target as HTMLElement).closest('.photo-item, .star-item, .spiral-item, .wave-item')) return

      layoutStore.setDragging(true)
      layoutStore.setDragStart(e.clientX, e.clientY)
      container.classList.add('dragging')
      
      e.preventDefault()
      e.stopPropagation()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!layoutStore.interaction.isDragging) return

      e.preventDefault()
      e.stopPropagation()

      const { dragStart, dragOffset } = layoutStore.interaction
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      layoutStore.setDragOffset(
        dragOffset.x + deltaX,
        dragOffset.y + deltaY
      )

      layoutStore.setDragStart(e.clientX, e.clientY)
    }

    const onMouseUp = () => {
      layoutStore.setDragging(false)
      container.classList.remove('dragging')
    }

    container.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      container.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }

  /**
   * 鼠标滚轮缩放 - 以鼠标位置为中心
   */
  function setupZoomEvents(container: HTMLElement) {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const { zoomLevel, minZoom, maxZoom, dragOffset } = layoutStore.interaction
      
      const oldZoom = zoomLevel
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta))
      
      // 如果缩放级别没有变化，直接返回
      if (oldZoom === newZoom) return
      
      // 计算鼠标在容器中的位置
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // 计算鼠标相对于内容的位置（考虑当前的偏移和缩放）
      const contentX = (mouseX - dragOffset.x) / oldZoom
      const contentY = (mouseY - dragOffset.y) / oldZoom
      
      // 计算新的偏移，使得鼠标指向的内容点保持不变
      const newOffsetX = mouseX - contentX * newZoom
      const newOffsetY = mouseY - contentY * newZoom
      
      // 更新缩放级别和偏移
      layoutStore.setZoomLevel(newZoom)
      layoutStore.setDragOffset(newOffsetX, newOffsetY)
    }

    container.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', onWheel)
    }
  }

  /**
   * 触摸事件
   */
  function setupTouchEvents(container: HTMLElement) {
    let lastTouchDistance = 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        layoutStore.setDragging(true)
        layoutStore.setDragStart(touch.clientX, touch.clientY)
        container.classList.add('dragging')
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        lastTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && layoutStore.interaction.isDragging) {
        const touch = e.touches[0]
        const { dragStart, dragOffset } = layoutStore.interaction
        const deltaX = touch.clientX - dragStart.x
        const deltaY = touch.clientY - dragStart.y

        layoutStore.setDragOffset(
          dragOffset.x + deltaX,
          dragOffset.y + deltaY
        )

        layoutStore.setDragStart(touch.clientX, touch.clientY)
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )

        if (lastTouchDistance > 0) {
          const scale = currentDistance / lastTouchDistance
          const { zoomLevel, minZoom, maxZoom, dragOffset } = layoutStore.interaction
          const oldZoom = zoomLevel
          const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel * scale))
          
          // 如果缩放级别有变化，以两指中心点为缩放中心
          if (oldZoom !== newZoom) {
            // 计算两指中心点
            const rect = container.getBoundingClientRect()
            const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left
            const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top
            
            // 计算中心点相对于内容的位置
            const contentX = (centerX - dragOffset.x) / oldZoom
            const contentY = (centerY - dragOffset.y) / oldZoom
            
            // 计算新的偏移
            const newOffsetX = centerX - contentX * newZoom
            const newOffsetY = centerY - contentY * newZoom
            
            layoutStore.setZoomLevel(newZoom)
            layoutStore.setDragOffset(newOffsetX, newOffsetY)
          }
        }

        lastTouchDistance = currentDistance
      }
    }

    const onTouchEnd = () => {
      layoutStore.setDragging(false)
      container.classList.remove('dragging')
      lastTouchDistance = 0
    }

    container.addEventListener('touchstart', onTouchStart)
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }

  /**
   * 键盘事件
   */
  function setupKeyboardEvents(
    onPrevious?: () => void,
    onNext?: () => void,
    onClose?: () => void
  ) {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      } else if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }

  /**
   * 计算变换样式
   */
  const transformStyle = computed(() => {
    const { dragOffset, zoomLevel } = layoutStore.interaction
    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoomLevel})`,
      transformOrigin: '0 0'
    }
  })

  return {
    setupDragEvents,
    setupZoomEvents,
    setupTouchEvents,
    setupKeyboardEvents,
    transformStyle
  }
}

