interface Article {
  date: string;
  category: string;
  title: string;
  description: string;
  tags: [string, string];
}

const articles: Article[] = [
  {
    date: "2026-08-10",
    category: "前端工程化",
    title: "Monorepo 项目架构实践",
    description: "pnpm + Turborepo 搭建前端monorepo，处理包依赖、构建缓存、版本管理。",
    tags: ["工程化", "pnpm"],
  },
  {
    date: "2026-07-22",
    category: "可视化",
    title: "Canvas高性能粒子渲染优化",
    description: "减少重绘、离屏canvas、对象池，解决大量粒子场景卡顿问题。",
    tags: ["Canvas", "性能优化"],
  },
  {
    date: "2026-06-15",
    category: "Vue",
    title: "Vue3 组合式API设计思路",
    description: "从源码角度理解setup、响应式原理，复用逻辑的最佳实践。",
    tags: ["Vue3", "响应式"],
  },
  {
    date: "2026-05-08",
    category: "GIS",
    title: "OpenLayers地图图层管理技巧",
    description: "多图层叠加、矢量渲染、事件监听，大屏地图可视化踩坑记录。",
    tags: ["GIS", "OpenLayers"],
  },
];

export default function Articles() {
  return (
    <section id="articles" className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-10 text-center">
        <span className="text-tech-glow">//</span> 技术文章
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <article key={article.title} className="glass p-6 border-glow-hover">
            <div className="text-xs text-tech-glow mb-2">
              {article.date} · {article.category}
            </div>
            <h3 className="text-xl font-semibold mb-3 hover:text-tech-glow transition-colors cursor-pointer">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm">{article.description}</p>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 bg-tech-glow/10 rounded text-xs">
                {article.tags[0]}
              </span>
              <span className="px-2 py-1 bg-tech-accent/10 rounded text-xs">
                {article.tags[1]}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}