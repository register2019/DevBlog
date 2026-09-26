import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostArchive from "@/components/PostArchive";

export const metadata: Metadata = {
  title: "全部文章 | DevBlog",
  description: "按时间归档的全部技术文章。",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
        <span className="text-tech-glow">{"//"}</span> 全部文章
      </h1>
      <p className="text-center text-gray-400 text-sm mb-8 sm:mb-10">
        共 {posts.length} 篇 · 构建期从 docs/ 目录自动生成
      </p>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm">
          还没有文章，把 Markdown 文件放进 docs/ 目录即可。
        </p>
      ) : (
        <PostArchive posts={posts} />
      )}
    </section>
  );
}
