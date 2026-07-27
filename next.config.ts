import type { NextConfig } from "next";

// Статичний експорт. Базовий шлях задається змінною NEXT_PUBLIC_BASE_PATH
// (див. scripts у package.json); за замовчуванням — GitHub Pages
// /typewriter-test. Для кореня домену передайте порожній рядок.
const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/typewriter-test";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? basePath : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
