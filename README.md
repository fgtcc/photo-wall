# Photo Wall Vue 📸

一个基于 Vue 3 + TypeScript + Pinia 的现代化照片墙应用。

## ✨ 特性

- 🎨 9种精美布局模式：网格、瀑布流、列表、轮播、星空、万花筒、螺旋、波浪、3D卡片
- 🖼️ 完整照片管理：上传、删除、拖拽排序、预览
- ⚙️ 灵活配置系统：每个布局支持参数调整
- 🎯 交互体验：缩放、拖拽、触摸支持、键盘导航
- 💾 本地存储：数据持久化保存
- 📱 响应式设计：完美适配各种设备
- 🔧 TypeScript：完整的类型支持
- 🚀 现代化技术栈：Vue 3 Composition API + Pinia

## 🛠️ 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式**: CSS3

## 📦 安装

```bash
# 安装依赖
npm install

# 或使用 pnpm
pnpm install

# 或使用 yarn
yarn install
```

## 🚀 开发

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 🏗️ 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
photo-wall-vue/
├── public/              # 静态资源
│   └── images/          # 示例图片
├── src/
│   ├── assets/          # 资源文件
│   │   └── styles/      # 全局样式
│   ├── components/      # 组件
│   │   ├── common/      # 通用组件
│   │   ├── layouts/     # 布局组件
│   │   └── modals/      # 模态框组件
│   ├── composables/     # 组合式函数
│   ├── stores/          # Pinia 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
└── ...
```

## 🎯 核心功能模块

### 状态管理 (Stores)
- `photoStore`: 照片数据管理
- `layoutStore`: 布局配置管理

### 组合式函数 (Composables)
- `usePhotoManager`: 照片操作逻辑
- `useLayoutConfig`: 布局配置逻辑
- `useInteraction`: 交互控制逻辑

### 组件 (Components)
- **通用组件**: 工具栏、文件上传、照片模态框、缩放控制
- **布局组件**: 9种不同的照片展示布局
- **模态框组件**: 布局市场、布局配置

## 🤝 协作开发

项目采用模块化架构，便于多人协作：

1. **组件独立**: 每个布局组件独立开发和测试
2. **类型安全**: TypeScript 提供完整类型检查
3. **状态集中**: Pinia 统一管理应用状态
4. **代码复用**: Composables 提取通用逻辑
5. **清晰结构**: 目录结构清晰，职责分明

## 📝 开发指南

### 添加新布局

1. 在 `src/types/layout.ts` 添加布局类型
2. 在 `src/components/layouts/` 创建布局组件
3. 在 `layoutStore` 注册布局配置
4. 在 `App.vue` 中引入并注册组件

### 添加新功能

1. 在对应的 store 中添加状态和方法
2. 创建或修改 composable 封装逻辑
3. 在组件中使用 composable

## 📄 License

MIT License

## 🙏 致谢

原始版本使用原生 JavaScript 开发，本版本重构为 Vue 3 架构。

