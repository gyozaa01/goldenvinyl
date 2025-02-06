"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollTop";
import { PlayerProvider } from "@/contexts/PlayerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!refreshToken) return;

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      console.log("토큰 갱신 완료");
    } else {
      console.error("토큰 갱신 실패");
    }
  } catch (error) {
    console.error("토큰 갱신 중 오류 발생:", error);
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    refreshToken(); // 앱 실행 시 토큰 갱신
    const interval = setInterval(refreshToken, 1000 * 60 * 60); // 1시간마다 갱신

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlayerProvider>
          <ScrollToTop />
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
