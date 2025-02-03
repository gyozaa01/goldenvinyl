"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import RecommendedTracks from "@/components/RecommendedTracks";
import Player from "@/components/Player";
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import Library from "@/components/Library";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    console.log(`현재 활성화된 탭: ${activeTab}`);
  }, [activeTab]);

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-amber-900 via-stone-900 to-black text-white">
      <Header />
      <main className="relative flex-1 overflow-auto px-6 pb-48 scrollbar-hidden">
        {activeTab === "home" && (
          <>
            <RecentlyPlayed />
            <RecommendedTracks />
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
