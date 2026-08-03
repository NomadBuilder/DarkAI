/** @type {import('next').NextConfig} */
const path = require("path");

const isProd = process.env.NODE_ENV === "production";
const staticExport = isProd && process.env.STATIC_EXPORT === "true";
const basePath = isProd && process.env.BASE_PATH ? process.env.BASE_PATH : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
