import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const tagStyles = ["bg-tech-glow/10", "bg-tech-accent/10"];

export default function ArticleCard({ post }: { post: PostMeta }) {
  return (
    <article className="glass p-6 border-glow-hover relative">
      <div className="text-xs text-tech-glow mb-2">
        {post.date} · {post.category}
      </div>
      <h3 className="text-xl font-semibold mb-3">
        {/* after 伪元素铺满整张卡片，让点击卡片的任意位置都能跳转，同时只保留一个链接 */}
        <Link
          href={`/posts/${post.slug}`}
          className="hover:text-tech-glow transition-colors after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h3>
      <p className="text-tech-muted text-sm">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag, index) => (
          <span
            key={tag}
            className={`px-2 py-1 rounded text-xs ${tagStyles[index % tagStyles.length]}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
