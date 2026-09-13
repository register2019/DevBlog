const navItems = [
  { href: "#home", label: "首页" },
  { href: "#articles", label: "文章" },
  { href: "#projects", label: "项目" },
  { href: "#about", label: "关于我" },
];

export default function Header() {
  return (
    <header className="glass fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl px-6 py-3">
      <nav className="flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-tech-glow text-glow">
          DevBlog<span className="text-tech-accent">.</span>
        </a>
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-tech-glow transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
        <button className="md:hidden text-xl" aria-label="打开菜单">
          <i className="fa fa-bars"></i>
        </button>
      </nav>
    </header>
  );
}