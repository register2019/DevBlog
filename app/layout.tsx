import type { Metadata } from "next";
import ParticleBackground from "@/components/ParticleBackground";
import Clock from "@/components/Clock";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevBlog | 前端开发者博客",
  description:
    "专注前端可视化、工程化、WebGL/Canvas 开发，记录技术踩坑与思考。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"
        />
      </head>
      <body>
        <ParticleBackground />
        <Clock />
        {children}
      </body>
    </html>
  );
}