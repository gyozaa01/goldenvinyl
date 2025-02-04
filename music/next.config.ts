/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

module.exports = nextConfig;
