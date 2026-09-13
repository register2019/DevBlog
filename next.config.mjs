/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // GitHub Actions 的 configure-pages 会自动注入 BASE_PATH（如 /DevBlog）
  basePath: process.env.BASE_PATH || "",
  trailingSlash: true,
};

export default nextConfig;