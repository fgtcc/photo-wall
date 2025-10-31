/**
 * LocalStorage 工具函数
 */

export const storage = {
  /**
   * 获取存储的数据
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return null
    }
  },

  /**
   * 保存数据到存储
   */
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      
      // 检查是否是存储空间不足错误
      if (error instanceof Error) {
        const isQuotaError = 
          error.name === 'QuotaExceededError' || 
          (error as any).code === 22 || 
          (error as any).code === 1014
        
        if (isQuotaError) {
          console.warn('LocalStorage quota exceeded')
        }
      }
      return false
    }
  },

  /**
   * 删除存储的数据
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
    }
  },

  /**
   * 清空所有存储
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  /**
   * 获取存储使用情况
   */
  getStorageInfo() {
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length
        }
      }
      
      const maxSize = 5 * 1024 * 1024 // 5MB 限制
      return {
        used: totalSize,
        total: maxSize,
        percentage: (totalSize / maxSize) * 100
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }
}

