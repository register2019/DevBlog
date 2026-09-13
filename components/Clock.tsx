"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const secondDecimal = now.getSeconds() / 60;

  // 秒针环形进度（SVG 圆环）
  const r = 82;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - secondDecimal);

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-4 select-none">
        {/* 环形秒针 */}
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="rgba(0,210,255,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="#00d2ff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="drop-shadow-[0_0_6px_rgba(0,210,255,0.8)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-tech-dark/40 rounded-full">
            <span className="text-lg font-bold text-tech-glow text-glow tabular-nums">
              {seconds}
            </span>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest">
              sec
            </span>
          </div>
        </div>

        {/* 时分 */}
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-50 tabular-nums leading-none [text-shadow:0_0_8px_rgba(0,210,255,0.5)]">
            {hours}
            <span className="animate-pulse">:</span>
            {minutes}
          </div>
          <div className="mt-2 text-[11px] tracking-[0.25em] text-tech-glow/80 uppercase">
            {now.getMonth() + 1}月{now.getDate()}日 · {WEEKDAYS[now.getDay()]}
          </div>
        </div>
      </div>
  );
}