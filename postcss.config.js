// Tailwind CSS v4 使用 CSS-first 模式，构建由 @tailwindcss/postcss 驱动
// 相比 v3，不再需要 tailwind.config.js，主题配置直接写在 globals.css 的 @theme 中
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
