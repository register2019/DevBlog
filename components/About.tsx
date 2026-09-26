const skills = ["TypeScript", "Vue", "React", "Canvas", "GIS"];

export default function About() {
  return (
    <section id="about" className="py-20 px-6 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-center">
        <span className="text-tech-glow">{"//"}</span> 关于我
      </h2>
      <div className="glass p-5 md:p-8 border-glow-hover">
        <p className="text-tech-soft leading-relaxed">
          前端开发工程师，专注Web可视化、Canvas/GIS、前端工程化。热爱钻研图形渲染、性能优化，平时会在这里记录技术学习笔记、踩坑经验。
          <br />
          <br />
          技术栈：Vue3 / React / TS / Canvas / OpenLayers / Playwright / Monorepo
        </p>
        <div className="mt-6 pt-4 border-t border-tech-border">
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className={`px-3 py-1 rounded-md text-sm ${
                  skill === "GIS"
                    ? "bg-tech-accent/10 text-tech-accent"
                    : "bg-tech-glow/10 text-tech-glow"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
