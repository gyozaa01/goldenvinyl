"use client";

import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Heart, Volume2, VolumeX, ChevronUp } from "lucide-react";
import VinylDisc from "@/components/VinylDisc";

const Player = () => {
  const { currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(50); // 초기 볼륨 50%
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(50); // 음소거 해제 시 복원할 볼륨

  // 볼륨 변경 핸들러
  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    // 음소거 상태에서 볼륨 조절하면, 음소거 해제 처리
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("볼륨 변경 실패:", errorData);
      }
    } catch (error) {
      console.error("볼륨 변경 오류:", error);
    }
  };

  // 음소거 토글 핸들러
  const toggleMute = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      if (!isMuted) {
        // 음소거: 현재 볼륨을 prevVolume에 저장하고 볼륨 0으로 변경
        setPrevVolume(volume);
        setVolume(0);
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=0`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("음소거 실패:", errorData);
        } else {
          setIsMuted(true);
        }
      } else {
        // 음소거 해제: 이전 볼륨으로 복원
        setVolume(prevVolume);
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${prevVolume}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("음소거 해제 실패:", errorData);
        } else {
          setIsMuted(false);
        }
      }
    } catch (error) {
      console.error("음소거 토글 오류:", error);
    }
  };

  return (
    <div
      className={`fixed left-0 right-0 transition-all duration-500 ease-out ${
        isExpanded
          ? "top-0 bottom-0 bg-black/95 z-50"
          : "bottom-0 h-48 bg-black/80"
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
      <VinylDisc
        isPlaying={isPlaying}
        imageUrl={currentTrack?.album.images[0]?.url}
      />

      <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-amber-600/90 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="focus:outline-none">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
