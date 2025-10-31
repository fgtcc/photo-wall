/**
 * 布局类型定义
 */

export type LayoutType = 
  | 'grid' 
  | 'masonry' 
  | 'list' 
  | 'carousel' 
  | 'star' 
  | 'kaleidoscope' 
  | 'spiral' 
  | 'wave' 
  | 'card3d'

export interface StarLayoutConfig {
  radiusFactor: number      // 半径比例 0.1-0.5
  startAngle: number         // 起始角度 0-360
  direction: 1 | -1          // 方向 1=顺时针 -1=逆时针
  itemSize: number           // 图片大小 60-200
  circles: 1 | 2 | 3         // 圈数 1-3
}

export interface SpiralLayoutConfig {
  angleIncrement: number     // 角度增量 0.3-1.0
  radiusGrowth: number       // 半径增长 10-30
  startRadius: number        // 起始半径 20-100
  direction: 1 | -1          // 方向 1=顺时针 -1=逆时针
  itemSize: number           // 图片大小 40-120
}

export interface WaveLayoutConfig {
  amplitude: number          // 振幅 20-100
  frequency: number          // 频率 0.2-1.0
  spacing: number            // 间距 80-200
  waveType: 'sine' | 'cosine' // 波形类型
  itemSize: number           // 图片大小 60-150
  verticalOffset: number     // 垂直偏移 -100-100
}

export interface KaleidoscopeConfig {
  segments: 4 | 6 | 8        // 镜像分片数量
  speed: number              // 旋转速度
  paused: boolean            // 是否暂停
  colorFilter: 'none' | 'warm' | 'cool' | 'vibrant' // 颜色滤镜
}

export type LayoutConfig = StarLayoutConfig | SpiralLayoutConfig | WaveLayoutConfig | KaleidoscopeConfig

export interface LayoutConfigs {
  star?: StarLayoutConfig
  spiral?: SpiralLayoutConfig
  wave?: WaveLayoutConfig
  kaleidoscope?: KaleidoscopeConfig
}

export interface InteractionState {
  isDragging: boolean
  dragStart: { x: number; y: number }
  dragOffset: { x: number; y: number }
  zoomLevel: number
  minZoom: number
  maxZoom: number
}

export const ZOOMABLE_LAYOUTS: LayoutType[] = ['star', 'spiral', 'wave']

