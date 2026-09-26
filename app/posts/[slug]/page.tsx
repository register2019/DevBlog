import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/posts";

type PageProps = { params: Promise<{ slug: string }> };

/** 静态导出必须在构建期把所有文章路径列出来 */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: "文章不存在 | DevBlog" };

  return {
    title: `${post.title} | DevBlog`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      <Link href="/posts" className="text-sm text-gray-400 hover:text-tech-glow transition-colors">
        <i className="fa fa-arrow-left mr-2" aria-hidden="true" />
        返回文章列表
      </Link>

      <header className="mt-6 mb-8">
        <div className="text-xs text-tech-glow mb-3">
          {post.date} · {post.category}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded bg-tech-glow/10 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="glass p-6 sm:p-8">
        <article
          className="prose post-content max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
