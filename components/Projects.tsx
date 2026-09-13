interface Project {
  title: string;
  description: string;
  tech: string;
}

const projects: Project[] = [
  {
    title: "列车运行图可视化",
    description: "基于Canvas绘制轨道交通运行图，交路计算、图例渲染。",
    tech: "Canvas + TS",
  },
  {
    title: "Playwright自动化测试工具",
    description: "网页自动化录制、截图、批量巡检前端页面。",
    tech: "Node + Playwright",
  },
  {
    title: "简易数据看板",
    description: "Vue3 + ECharts，深色科技风大屏数据展示。",
    tech: "Vue3 + ECharts",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-10 text-center">
        <span className="text-tech-glow">//</span> 个人项目
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.title} className="glass p-5 border-glow-hover">
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{project.description}</p>
            <div className="text-xs text-tech-glow">{project.tech}</div>
          </div>
        ))}
      </div>
    </section>
  );
}