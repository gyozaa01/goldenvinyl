"use client";

import { useState } from "react";
import { Play, Pause, Heart, Volume2, ChevronUp } from "lucide-react";
import VinylDisc from "@/components/VinylDisc";

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed left-0 right-0 transition-all duration-500 ease-out ${
        isExpanded ? "top-0 bottom-0 bg-black/95" : "bottom-0 h-48 bg-black/80"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      >
        <ChevronUp
          className={`text-amber-200/60 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className="flex items-center justify-between px-6 pt-8">
        <h4 className="text-amber-50 kor font-medium">현재 재생 중인 음악</h4>
        <Heart className="text-amber-500/80" />
      </div>

      {/* Vinyl Disc 컴포넌트 */}
      <VinylDisc isPlaying={isPlaying} />

      <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-amber-600/90 flex items-center justify-center"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="flex items-center gap-2 text-amber-200/60">
          <Volume2 size={20} />
          <div className="w-24 h-1 bg-amber-200/20 rounded-full">
            <div className="w-2/3 h-full bg-amber-500/80 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
