import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

/** 所有技术博客的 Markdown 源文件都放在项目根目录的 docs/ 下 */
const POSTS_DIR = path.join(process.cwd(), "docs");

/** 列表页只需要元数据，正文不进客户端产物 */
export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

interface Frontmatter {
  title?: string;
  slug?: string;
  date?: Date | string;
  category?: string;
  excerpt?: string;
  tags?: string[] | string;
  featured?: boolean;
}

function formatDate(date: Date, utc = false) {
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const day = utc ? date.getUTCDate() : date.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toDateString(value: Frontmatter["date"], fallback: Date) {
  // gray-matter 会把 YAML 里的日期解析成 Date（UTC 零点），用 UTC 取值避免差一天
  if (value instanceof Date) return formatDate(value, true);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatDate(parsed, true);
  }
  return formatDate(fallback);
}

/** 文件名转 slug。output: export 下 URL 段必须与静态参数完全一致，
    中文名会被浏览器编码后匹配不上，所以非 ASCII 名一律兜底成 ASCII slug */
function toSlug(baseName: string) {
  const cleaned = baseName.trim().replace(/[\s\u00a0]+/g, "-");

  if (/^[\x20-\x7e]+$/.test(cleaned)) {
    return cleaned.toLowerCase();
  }

  return `post-${createHash("sha1").update(cleaned).digest("hex").slice(0, 8)}`;
}

/** 没写 frontmatter 时，从正文第一个标题里推断标题 */
function pickTitle(body: string, fallback: string) {
  const heading = body.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

/** 没写 frontmatter 时，从正文首段里截一段摘要 */
function pickExcerpt(body: string) {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}.*$/gm, " ")
    .replace(/[\s\u00a0]+/g, " ")
    .trim();

  return plain.length > 88 ? `${plain.slice(0, 88)}…` : plain;
}

function pickTags(tags: Frontmatter["tags"]) {
  if (Array.isArray(tags)) return tags.filter(Boolean).map(String);
  if (typeof tags === "string") {
    return tags
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function readPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return (
    fs
      .readdirSync(POSTS_DIR)
      // 兼容 .md / .MD 两种后缀
      .filter((file) => /\.md$/i.test(file))
      .map((file) => {
        const fullPath = path.join(POSTS_DIR, file);
        const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
        const frontmatter = data as Frontmatter;
        const baseName = file.replace(/\.md$/i, "");

        return {
          slug: frontmatter.slug?.trim() || toSlug(baseName),
          title: frontmatter.title?.trim() || pickTitle(content, baseName.trim()),
          date: toDateString(frontmatter.date, fs.statSync(fullPath).mtime),
          category: frontmatter.category?.trim() || "未分类",
          excerpt: frontmatter.excerpt?.trim() || pickExcerpt(content),
          tags: pickTags(frontmatter.tags),
          featured: frontmatter.featured === true,
          content,
        };
      })
  );
}

function toMeta(post: Post): PostMeta {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category,
    excerpt: post.excerpt,
    tags: post.tags,
    featured: post.featured,
  };
}

/** 全部文章，按日期倒序 */
export function getAllPosts(): PostMeta[] {
  return readPosts()
    .map(toMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return readPosts().find((post) => post.slug === slug) ?? null;
}

/** 首页精选：优先 featured，不足 limit 篇时用最新文章补齐 */
export function getFeaturedPosts(limit = 4): PostMeta[] {
  const posts = getAllPosts();
  const featured = posts.filter((post) => post.featured);
  const rest = posts.filter((post) => !post.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map((post) => post.category))];
}

/** Markdown → HTML。rehype-raw 让正文里的内联 HTML（如 <br>）能正常渲染 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
