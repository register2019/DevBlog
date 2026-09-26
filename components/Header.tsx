"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/* 带 / 前缀才能在文章页等非首页路由下跳回首页对应区块 */
const navItems = [
  { href: "/#home", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/#projects", label: "项目" },
  { href: "/#about", label: "关于我" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-4 md:px-6 py-3">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-tech-glow text-glow">
          DevBlog<span className="text-tech-accent">.</span>
        </Link>
        {/* 桌面端导航 + 主题切换 */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-tech-glow transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
        {/* 移动端：主题切换常驻顶栏，汉堡按钮控制菜单 */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            className="text-xl"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
          >
            <i className={`fa ${open ? "fa-times" : "fa-bars"}`} />
          </button>
        </div>
      </nav>
      {/* 移动端下拉菜单 */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-tech-border pt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-2 py-2.5 rounded hover:bg-tech-glow/10 hover:text-tech-glow transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
