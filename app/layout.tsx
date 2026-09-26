import type { Metadata } from "next";
import ParticleBackground from "@/components/ParticleBackground";
import Clock from "@/components/Clock";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevBlog | 前端开发者博客",
  description: "专注前端可视化、工程化、WebGL/Canvas 开发，记录技术踩坑与思考。",
};

/* 首帧之前就把主题写到 <html data-theme> 上，避免加载出暗色再闪成亮色。
   优先级：手动选择 > 系统偏好 > 站点默认暗色 */
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ParticleBackground />
        <Clock />
        {children}
      </body>
    </html>
  );
}
