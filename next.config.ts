import type { NextConfig } from "next";

// Статичний експорт. Для GitHub Pages за адресою
// https://<user>.github.io/typewriter-test/ лишіть repo як є;
// для власного домену в корені — зробіть repo = "".
const isProd = process.env.NODE_ENV === "production";
const repo = "typewriter-test";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd && repo ? `/${repo}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
