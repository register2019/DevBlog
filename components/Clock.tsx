"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Clock() {
  // 惰性初始化当前时间，避免在 effect 内同步触发 setState
  //（react-hooks/set-state-in-effect 规则要求）
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const secondDecimal = now.getSeconds() / 60;

  // 秒针环形进度（SVG 圆环）
  const r = 82;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - secondDecimal);

  return (
    // 移动端整体隐藏，md 以上才显示
    <div
      suppressHydrationWarning
      className="fixed top-16 right-3 z-40 hidden items-center gap-3 select-none md:flex md:top-5 md:right-5 md:gap-4"
    >
      {/* 环形秒针（移动端隐藏，仅保留紧凑时分） */}
      <div className="hidden md:block relative w-24 h-24">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--color-tech-border)"
            strokeWidth="6"
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--color-tech-glow)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="drop-shadow-[0_0_6px_var(--tech-glow-strong)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-tech-dark/40 rounded-full">
          <span className="text-lg font-bold text-tech-glow text-glow tabular-nums">{seconds}</span>
          <span className="text-[8px] text-tech-muted uppercase tracking-widest">sec</span>
        </div>
      </div>

      {/* 时分 */}
      <div className="text-right">
        <div className="text-2xl md:text-4xl font-bold text-tech-bright tabular-nums leading-none [text-shadow:0_0_8px_var(--tech-glow-strong)]">
          {hours}
          <span className="animate-pulse">:</span>
          {minutes}
        </div>
        <div className="mt-1 md:mt-2 text-[10px] md:text-[11px] tracking-[0.25em] text-tech-glow/80 uppercase">
          {now.getMonth() + 1}月{now.getDate()}日 · {WEEKDAYS[now.getDay()]}
        </div>
      </div>
    </div>
  );
}
