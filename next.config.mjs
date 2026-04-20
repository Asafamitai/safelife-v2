/** @type {import('next').NextConfig} */

// GitHub Pages serves project repos under /<repo-name>/ — drive basePath
// from an env var so local `next dev` stays at the root while the Pages
// workflow sets this to `/safelife-v2` at build time.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
