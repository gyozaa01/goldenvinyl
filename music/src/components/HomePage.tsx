"use client";

import { useState } from "react";
import Header from "@/components/Header";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import RecommendedTracks from "@/components/RecommendedTracks";
import Player from "@/components/Player";
import Navigation from "@/components/Navigation";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-amber-900 via-stone-900 to-black text-white">
      <Header />
      <main className="relative flex-1 overflow-auto px-6 pb-48">
        {activeTab === "home" && (
          <>
            <RecentlyPlayed />
            <RecommendedTracks />
          </>
        )}
      </main>
      <Player />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
