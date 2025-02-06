"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    images: { url: string }[];
  };
  uri: string;
  duration_ms: number;
  type: "track";
  artists: { name: string }[];
  images: { url: string }[];
}

interface PlayerContextValue {
  currentTrack: SpotifyTrack | null;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      if (isPlaying) {
        // 현재 재생중이면 일시정지
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setIsPlaying(false);
      } else {
        // 재생 중이지 않으면 재개(재생 중인 트랙이 있을 때)
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("재생/일시정지 토글 중 오류 발생:", error);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        togglePlayPause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer는 PlayerProvider 내부에서 사용되어야 합니다.");
  }
  return context;
};
