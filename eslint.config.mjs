import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

// Tailwind 升级等临时说明后，统一走官方 flat config：
// eslint-config-next 从 v16 起提供原生 flat 导出，无需再用 FlatCompat 桥接 eslintrc。
export default defineConfig([
  globalIgnores(["node_modules", ".next", "out", "next-env.d.ts"]),
  // Next.js 官方推荐规则（web vitals 相关指标）
  nextVitals,
  // TypeScript 专用规则
  nextTs,
  // 关闭与 Prettier 冲突的格式类规则，让 ESLint 专注逻辑、Prettier 负责格式
  eslintConfigPrettier,
]);
