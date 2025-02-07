"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

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
  images?: { url: string }[];
  playedAt?: number; // 재생 시각(최신 재생 시각)
}

interface PlayerContextValue {
  currentTrack: SpotifyTrack | null;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => Promise<void>;
  playedTracks: SpotifyTrack[];
  playTrack: (track: SpotifyTrack, isNavigation?: boolean) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  shuffleTrack: () => Promise<void>;
  repeatTrack: () => Promise<void>;
  removeFromHistory: (trackId: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedTracks, setPlayedTracks] = useState<SpotifyTrack[]>([]);

  const updateHistoryRef = useRef(true);

  useEffect(() => {
    if (currentTrack && updateHistoryRef.current) {
      setPlayedTracks((prev) => {
        // 동일한 곡은 제거한 후 새 항목으로 추가
        const filtered = prev.filter((t) => t.id !== currentTrack.id);
        return [{ ...currentTrack, playedAt: Date.now() }, ...filtered].slice(
          0,
          50
        );
      });
    }
    updateHistoryRef.current = true;
  }, [currentTrack]);

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

  // 트랙 재생 함수
  const playTrack = async (
    track: SpotifyTrack,
    isNavigation: boolean = false
  ) => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }

    // 내비게이션 호출이면 playedTracks 업데이트를 건너뛰도록 ref를 설정
    updateHistoryRef.current = !isNavigation;

    try {
      const deviceResponse = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const deviceData = await deviceResponse.json();
      if (!deviceData.devices || !deviceData.devices.length) {
        alert(
          "Spotify에서 재생할 수 있는 기기가 없습니다. Spotify 앱을 열고 한 번 재생한 후 다시 시도해주세요."
        );
        return;
      }
      const deviceId = deviceData.devices[0].id;
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [track.uri] }),
        }
      );
      // setCurrentTrack 호출 시 useEffect가 실행되는데,
      // updateHistoryRef.current에 따라 재생 이력 업데이트 여부가 결정
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error("Spotify 재생 오류:", error);
    }
  };

  const nextTrack = async () => {
    if (!currentTrack) return;
    const index = playedTracks.findIndex((t) => t.id === currentTrack.id);
    if (index >= 0 && index < playedTracks.length - 1) {
      const next = playedTracks[index + 1];
      // 내비게이션 호출이므로 isNavigation true 전달 → history 업데이트 건너뜀.
      await playTrack(next, true);
    }
  };

  const prevTrack = async () => {
    if (!currentTrack) return;
    const index = playedTracks.findIndex((t) => t.id === currentTrack.id);
    if (index > 0) {
      const prev = playedTracks[index - 1];
      await playTrack(prev, true);
    }
  };

  const shuffleTrack = async () => {
    if (playedTracks.length === 0) return;
    let filtered = playedTracks;
    if (currentTrack) {
      filtered = playedTracks.filter((t) => t.id !== currentTrack.id);
    }
    if (filtered.length === 0) filtered = playedTracks;
    const randomTrack = filtered[Math.floor(Math.random() * filtered.length)];
    await playTrack(randomTrack);
  };

  const repeatTrack = async () => {
    if (currentTrack) {
      await playTrack(currentTrack);
    }
  };

  const removeFromHistory = (trackId: string) => {
    setPlayedTracks((prev) => prev.filter((track) => track.id !== trackId));
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        togglePlayPause,
        playedTracks,
        playTrack,
        nextTrack,
        prevTrack,
        shuffleTrack,
        repeatTrack,
        removeFromHistory,
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
