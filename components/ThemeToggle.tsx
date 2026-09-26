"use client";

/* 太阳/月亮用内联 SVG，不再借用 Font Awesome 的描边字形：
   线条粗细、端点圆角都能自己控制，和站点的细线科技风更搭 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

/* 主题切换按钮。真值只存在 <html data-theme> 上，组件不持有 React 状态：
   两个图标叠在同一格由 CSS 交叉淡入淡出，切主题时组件不需要重新渲染，
   也不会出现 hydration 前后图标跳变 */
export default function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;

    try {
      // 手动切换后记住选择，刷新时由 layout 里的内联脚本读回
      localStorage.setItem("theme", next);
    } catch {
      // 隐私模式等场景下 localStorage 可能不可写，静默忽略
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-tech-border text-tech-muted transition-all duration-300 hover:border-tech-glow hover:bg-tech-glow/10 hover:text-tech-glow hover:shadow-[0_0_14px_var(--tech-glow-ring)] active:scale-95"
      aria-label="切换亮色/暗色主题"
      title="切换亮色/暗色主题"
    >
      <SunIcon className="theme-icon icon-sun" />
      <MoonIcon className="theme-icon icon-moon" />
    </button>
  );
}
