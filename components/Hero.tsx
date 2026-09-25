export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-24"
    >
      <div className="glass px-5 md:px-8 py-10 md:py-12 max-w-3xl text-center border-glow-hover">
        <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-bold mb-4">
          Hi, I&apos;m <span className="text-tech-glow text-glow">Frontend Dev</span>
        </h1>
        <p className="text-gray-300 text-base md:text-lg mb-6">
          专注前端可视化、工程化、WebGL / Canvas 开发 | 记录技术踩坑与思考
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#articles"
            className="px-6 py-2 bg-tech-glow/10 border border-tech-glow rounded-lg hover:bg-tech-glow/20 transition-all"
          >
            📖 阅读博客
          </a>
          <a
            href="#projects"
            className="px-6 py-2 bg-tech-accent/10 border border-tech-accent rounded-lg hover:bg-tech-accent/20 transition-all"
          >
            💻 查看项目
          </a>
        </div>
        <div className="mt-8 flex gap-5 justify-center text-xl">
          <a href="#" className="hover:text-tech-glow transition-colors">
            <i className="fa fa-github"></i>
          </a>
          <a href="#" className="hover:text-tech-glow transition-colors">
            <i className="fa fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-tech-glow transition-colors">
            <i className="fa fa-link"></i>
          </a>
        </div>
      </div>
      <div className="absolute bottom-10 animate-bounce">
        <i className="fa fa-angle-down text-tech-glow text-2xl"></i>
      </div>
    </section>
  );
}
