"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

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
  progress_ms?: number; // 현재 재생 진행 시간
  liked?: boolean; // 좋아요 여부
}

// Spotify 앨범 상세 정보에서 트랙 데이터 타입
interface SpotifyAlbumTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: { name: string }[];
}

// Supabase play_history 테이블의 행 타입 정의
interface PlayHistoryRow {
  user_id: string;
  track_id: string;
  track_name: string;
  album_image: string;
  artist: string;
  track_uri: string;
  duration_ms: number;
  played_at: string;
  heart?: boolean;
}

interface PlayerContextValue {
  currentTrack: SpotifyTrack | null;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => Promise<void>;
  playedTracks: SpotifyTrack[];
  playTrack: (track: SpotifyTrack, isNavigation?: boolean) => Promise<void>;
  playAlbum: (albumId: string) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  shuffleTrack: () => Promise<void>;
  repeatTrack: () => Promise<void>;
  removeFromHistory: (trackId: string) => void;
  toggleLike: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedTracks, setPlayedTracks] = useState<SpotifyTrack[]>([]);

  // 내비게이션으로 재생할 때 playedTracks 업데이트를 건너뛰기 위한 ref
  const updateHistoryRef = useRef(true);

  // 앱 로드시 Supabase에서 재생 기록 불러오기
  useEffect(() => {
    const userId = localStorage.getItem("supabase_user_id");
    if (userId) {
      supabase
        .from("play_history")
        .select("*")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (error) {
            console.error("재생 기록 불러오기 오류:", error);
          } else if (data) {
            // 반환된 데이터를 PlayHistoryRow[]로 캐스팅하고, SpotifyTrack 형식으로 매핑
            const tracks: SpotifyTrack[] = (data as PlayHistoryRow[]).map(
              (row) => ({
                id: row.track_id,
                name: row.track_name,
                album: { images: [{ url: row.album_image }] },
                uri: row.track_uri,
                duration_ms: row.duration_ms,
                type: "track",
                artists: [{ name: row.artist }],
                playedAt: new Date(row.played_at).getTime(),
                liked: row.heart ?? false,
              })
            );
            setPlayedTracks(tracks);
          }
        });
    }
  }, []);

  // 앱 로드시 Spotify의 현재 재생 중인 곡 정보를 불러와서 상태 복원
  useEffect(() => {
    const fetchCurrentPlayback = async () => {
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) return;
      try {
        const res = await fetch(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (res.status === 204) return; // 재생중인 곡이 없으면
        const data = await res.json();
        if (data && data.item) {
          const track: SpotifyTrack = {
            id: data.item.id,
            name: data.item.name,
            album: { images: data.item.album.images },
            uri: data.item.uri,
            duration_ms: data.item.duration_ms,
            type: "track",
            artists: (data.item.artists as { name: string }[]).map((a) => ({
              name: a.name,
            })),
            progress_ms: data.progress_ms,
            liked: false, // 기본값 -> 여기에서 Supabase 데이터로 덮어씌움
          };

          // Supabase에서 기존 재생 기록의 heart 상태를 조회하여, 트랙의 liked 상태 업데이트
          const userId = localStorage.getItem("supabase_user_id");
          if (userId) {
            const { data: historyData, error } = await supabase
              .from("play_history")
              .select("heart")
              .match({ user_id: userId, track_id: track.id })
              .single();
            if (error) {
              console.error("재생 기록에서 좋아요 상태 가져오기 오류:", error);
            } else if (historyData && typeof historyData.heart === "boolean") {
              track.liked = historyData.heart;
            }
          }

          setCurrentTrack(track);
          setIsPlaying(data.is_playing);
        }
      } catch (error) {
        console.error("현재 재생 정보 불러오기 오류:", error);
      }
    };
    fetchCurrentPlayback();
  }, []);

  useEffect(() => {
    if (currentTrack && updateHistoryRef.current) {
      // 로컬 플레이 히스토리 업데이트(동일한 곡은 제거 후 최신 항목으로 추가)
      setPlayedTracks((prev) => {
        const filtered = prev.filter((t) => t.id !== currentTrack.id);
        return [{ ...currentTrack, playedAt: Date.now() }, ...filtered].slice(
          0,
          50
        );
      });

      // Supabase에 재생 기록 upsert(동일한 곡이면 played_at만 업데이트)
      const userId = localStorage.getItem("supabase_user_id");
      if (userId) {
        supabase
          .from("play_history")
          .upsert(
            [
              {
                user_id: userId,
                track_id: currentTrack.id,
                track_name: currentTrack.name,
                album_image: currentTrack.album.images?.[0]?.url,
                artist: currentTrack.artists[0].name,
                track_uri: currentTrack.uri,
                duration_ms: currentTrack.duration_ms,
                played_at: new Date().toISOString(),
                heart: currentTrack.liked ?? false,
              },
            ],
            { onConflict: "user_id, track_id" }
          )
          .then(({ error }) => {
            if (error) {
              console.error("플레이 히스토리 upsert 오류:", error);
            }
          });
      }
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
      // 트랙 재생 시 currentTrack 업데이트 -> 이때 위의 useEffect가 실행됨
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error("Spotify 재생 오류:", error);
    }
  };

  // 앨범 전곡 재생 함수
  const playAlbum = async (albumId: string) => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      // 1. 기기 정보 가져오기
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

      // 2. 앨범 전체 재생 요청
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context_uri: `spotify:album:${albumId}`,
            offset: { position: 0 },
          }),
        }
      );

      // 3. 재생 후 1500ms 딜레이 후, 앨범 상세 정보 불러오기
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const albumDetailRes = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!albumDetailRes.ok) {
        console.error("앨범 상세 정보 불러오기 실패");
        return;
      }
      const albumDetail = await albumDetailRes.json();

      // 4. 앨범 트랙 목록 생성
      const albumTracks: SpotifyTrack[] = (
        albumDetail.tracks.items as SpotifyAlbumTrack[]
      ).map((item: SpotifyAlbumTrack) => ({
        id: item.id,
        name: item.name,
        album: { images: albumDetail.images || [] },
        uri: item.uri,
        duration_ms: item.duration_ms,
        type: "track",
        artists: item.artists.map((a) => ({ name: a.name })),
        liked: false, // 기본값
      }));

      if (albumTracks.length > 0) {
        // 기존의 playedTracks에 앨범 트랙들을 덧붙임
        setPlayedTracks((prev) => [...albumTracks, ...prev]);
        setCurrentTrack(albumTracks[0]);
        setIsPlaying(true);

        // 앨범 트랙들을 Supabase에 업서트(한꺼번에 저장)
        const userId = localStorage.getItem("supabase_user_id");
        if (userId) {
          const records = albumTracks.map((track) => ({
            user_id: userId,
            track_id: track.id,
            track_name: track.name,
            album_image: track.album.images?.[0]?.url,
            artist: track.artists[0].name,
            track_uri: track.uri,
            duration_ms: track.duration_ms,
            played_at: new Date().toISOString(),
            heart: false, // 기본 좋아요 상태
          }));
          supabase
            .from("play_history")
            .upsert(records, { onConflict: "user_id, track_id" })
            .then(({ error }) => {
              if (error) {
                console.error("앨범 전체 업서트 오류:", error);
              }
            });
        }
      }
    } catch (error) {
      console.error("앨범 재생 오류:", error);
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

  // 재생 히스토리에서 해당 트랙 삭제
  const removeFromHistory = (trackId: string) => {
    setPlayedTracks((prev) => prev.filter((track) => track.id !== trackId));

    const userId = localStorage.getItem("supabase_user_id");
    if (userId) {
      supabase
        .from("play_history")
        .delete()
        .match({ user_id: userId, track_id: trackId })
        .then(({ error }) => {
          if (error) {
            console.error("플레이 히스토리 삭제 오류:", error);
          }
        });
    }
  };

  const toggleLike = async () => {
    if (!currentTrack) return;
    const userId = localStorage.getItem("supabase_user_id");
    if (!userId) return;
    const newLiked = !currentTrack.liked;
    const { error } = await supabase
      .from("play_history")
      .update({ heart: newLiked })
      .match({ user_id: userId, track_id: currentTrack.id });
    if (error) {
      console.error("좋아요 토글 업데이트 오류:", error);
    } else {
      setCurrentTrack({ ...currentTrack, liked: newLiked });
      setPlayedTracks((prev) =>
        prev.map((t) =>
          t.id === currentTrack.id ? { ...t, liked: newLiked } : t
        )
      );
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
        playedTracks,
        playTrack,
        playAlbum,
        nextTrack,
        prevTrack,
        shuffleTrack,
        repeatTrack,
        removeFromHistory,
        toggleLike,
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
