import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // 92 = fotografias em alta qualidade; 75 = padrão do Next para o restante.
    qualities: [75, 92],
  },
};

export default nextConfig;
