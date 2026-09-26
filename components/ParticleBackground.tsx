"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
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
        ctx!.fillStyle = "rgba(0,210,255,0.6)";
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
            ctx!.strokeStyle = `rgba(0,210,255,${0.2 - dist / 600})`;
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

    if (reduceMotion) {
      drawFrame();
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas id="particleCanvas" ref={canvasRef} aria-hidden="true" />;
}
