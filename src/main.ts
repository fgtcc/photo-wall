import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入全局样式
import './assets/styles/main.css'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 挂载应用
app.mount('#app')

// 开发环境日志
if (import.meta.env.DEV) {
  console.log('📸 Photo Wall Vue is running in development mode')
}

