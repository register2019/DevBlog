# DevBlog

前端开发者个人博客模板，采用深色科技风设计，基于 Next.js 构建。

## ✨ 特性

- 🎨 深色科技风 UI：玻璃拟态卡片、青色霓虹光效、网格点阵背景
- ⚡ Canvas 粒子连线背景动画
- 🕐 右上角悬浮时钟：秒针环形进度 + 发光时分数字
- 📱 响应式布局，适配桌面与移动端
- 🚀 App Router 架构，纯静态渲染，加载快

## 🛠 技术栈

Next.js 14 · React 18 · TypeScript · Tailwind CSS v3

## 🚀 开始使用

```bash
# 安装依赖
npm install

# 开发模式（默认 http://localhost:3000）
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm run start
```

## 📁 目录结构

```
.
├── app/              # 应用入口（layout + 首页组装）
├── components/       # 页面组件（导航/首屏/文章/时钟/粒子背景等）
├── tailwind.config.ts # Tailwind 主题配置（tech 主题色）
└── next.config.mjs
```

## 📜 许可证

[MIT](LICENSE)
