"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
}

interface Palette {
  /** 粒子圆点颜色 */
  dot: string;
  /** 连线颜色，alpha 随距离衰减 */
  line: (alpha: number) => string;
  /** 连线最大透明度：亮色下需要更高一点才看得出来 */
  lineAlpha: number;
}

/** 粒子配色跟随主题：暗色用亮青，亮色换成压深后的青，避免浅底上看不清 */
function readPalette(): Palette {
  if (document.documentElement.dataset.theme === "light") {
    return {
      dot: "rgba(2,132,199,0.55)",
      line: (alpha) => `rgba(2,132,199,${alpha})`,
      lineAlpha: 0.3,
    };
  }
  return {
    dot: "rgba(0,210,255,0.6)",
    line: (alpha) => `rgba(0,210,255,${alpha})`,
    lineAlpha: 0.2,
  };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const particles: P[] = [];
    const particleCount = 80;
    // 系统开启「减少动态效果」时只渲染静态一帧，不进入动画循环
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 配色可变：切换主题时重新读取，动画模式下下一帧自然生效
    let palette = readPalette();

    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resizeCanvas();

    class P implements Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.r = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx!.fillStyle = palette.dot;
        ctx!.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new P());

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = palette.line(palette.lineAlpha * (1 - dist / 120));
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    };

    /** 静态一帧：粒子只画不移动，供「减少动态效果」偏好使用 */
    const drawFrame = () => {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => p.draw());
      drawLines();
    };

    const animate = () => {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      raf = requestAnimationFrame(animate);
    };

    // 窗口尺寸变化后同步画布；静态模式下需要补画一帧，否则内容会残留错位
    const handleResize = () => {
      resizeCanvas();
      if (reduceMotion) drawFrame();
    };
    window.addEventListener("resize", handleResize);

    // 切换主题后换配色。动画模式下下一帧就会用新配色，静态模式需手动补画
    const observer = new MutationObserver(() => {
      palette = readPalette();
      if (reduceMotion) drawFrame();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (reduceMotion) {
      drawFrame();
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return <canvas id="particleCanvas" ref={canvasRef} aria-hidden="true" />;
}
