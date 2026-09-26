import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const tagStyles = ["bg-tech-glow/10", "bg-tech-accent/10"];

export default function ArticleCard({ post }: { post: PostMeta }) {
  return (
    <article className="glass p-6 border-glow-hover">
      <div className="text-xs text-tech-glow mb-2">
        {post.date} · {post.category}
      </div>
      <h3 className="text-xl font-semibold mb-3">
        <Link href={`/posts/${post.slug}`} className="hover:text-tech-glow transition-colors">
          {post.title}
        </Link>
      </h3>
      <p className="text-gray-400 text-sm">{post.excerpt}</p>
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
