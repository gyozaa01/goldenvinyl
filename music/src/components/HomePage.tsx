"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeartPlayed from "@/components/HeartPlayed";
import RecentTopArtists from "@/components/RecentTopArtists";
import Player from "@/components/Player";
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import Library from "@/components/Library";

// 로그인하지 않은 사용자에게 보여줄 제품 소개 컴포넌트
const ProductIntro = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <h2 className="text-3xl kor font-bold mb-4">
      Golden Vinyl에 오신 것을 환영합니다!
    </h2>
    <p className="text-lg kor mb-6">
      Golden Vinyl은 음악을 단순히 듣는 것을 넘어, 감각적으로 즐길 수 있는
      경험을 제공하는 음악 추천 및 플레이어입니다.
    </p>
    <p className="text-md kor mb-4">
      LP 감성의 직관적인 UI와 Spotify API를 활용한 개인화된 음악 추천으로,
      사용자에게 아날로그와 디지털이 조화를 이루는 새로운 음악 감상 방식을
      제안합니다.
    </p>
    <p className="text-md kor">
      지금 로그인하여 나만의 음악 세상을 경험해보세요!
    </p>
  </div>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log(`현재 활성화된 탭: ${activeTab}`);
  }, [activeTab]);

  useEffect(() => {
    // 로컬 스토리지에 access token이 있으면 로그인 상태로 간주
    const token = localStorage.getItem("spotify_access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-amber-900 via-stone-900 to-black text-white">
      <Header />
      <main className="relative flex-1 overflow-auto px-6 pb-48 scrollbar-hidden">
        {activeTab === "home" && (
          <>
            {isLoggedIn ? (
              <>
                <HeartPlayed />
                <RecentTopArtists />
              </>
            ) : (
              <ProductIntro />
            )}
          </>
        )}
        {activeTab === "search" && <Search />}
        {activeTab === "library" && <Library />}
      </main>
      <Player />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
