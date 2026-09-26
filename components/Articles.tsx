import Link from "next/link";
import { getFeaturedPosts } from "@/lib/posts";
import ArticleCard from "./ArticleCard";

export default function Articles() {
  const posts = getFeaturedPosts(4);

  return (
    <section id="articles" className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center">
        <span className="text-tech-glow">{"//"}</span> 技术文章
      </h2>

      {posts.length === 0 ? (
        <p className="text-center text-tech-muted text-sm">
          还没有文章，把 Markdown 文件放进 docs/ 目录即可。
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-10 text-center">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-tech-border text-sm text-tech-glow hover:bg-tech-glow/10 transition-colors"
        >
          查看全部文章
          <i className="fa fa-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
