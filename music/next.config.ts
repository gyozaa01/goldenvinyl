import withPWA from "next-pwa";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify 프로필 이미지 도메인 추가
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co", // Spotify 프로필 이미지 도메인 추가
      },
    ],
  },
};

export default isProd
  ? withPWA({
      dest: "public", // 서비스 워커(sw.js) 파일이 생성될 위치
    })(nextConfig)
  : nextConfig;
