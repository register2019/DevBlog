"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/posts";

const ALL = "全部";

/* 左侧图标按分类取，用页面已引入的 Font Awesome 4.7 */
const CATEGORY_ICONS: Record<string, string> = {
  可视化: "fa-area-chart",
  工程化: "fa-cogs",
  动画: "fa-film",
  组件库: "fa-cubes",
  性能优化: "fa-tachometer",
  React: "fa-code",
};

const DEFAULT_ICON = "fa-file-text-o";

export default function PostArchive({ posts }: { posts: PostMeta[] }) {
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts]
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => map.set(post.category, (map.get(post.category) ?? 0) + 1));
    return map;
  }, [posts]);

  const visible = category === ALL ? posts : posts.filter((post) => post.category === category);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                active
                  ? "border-tech-glow text-tech-glow bg-tech-glow/10"
                  : "border-tech-border text-gray-400 hover:border-tech-glow hover:text-tech-glow"
              }`}
            >
              {item === ALL ? `${ALL} ${posts.length}` : `${item} ${counts.get(item) ?? 0}`}
            </button>
          );
        })}
      </div>

      <ol className="space-y-3">
        {visible.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="glass border-glow-hover block p-4 sm:p-5">
              <div className="flex gap-3 sm:gap-4">
                <i
                  className={`fa ${CATEGORY_ICONS[post.category] ?? DEFAULT_ICON} mt-1 w-4 shrink-0 text-center text-base text-tech-glow/70`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold sm:text-lg">{post.title}</h2>
                    <span className="shrink-0 px-2 py-1 rounded bg-tech-glow/10 text-xs">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
