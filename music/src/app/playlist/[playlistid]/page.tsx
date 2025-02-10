"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Pause, Trash, ArrowLeft } from "lucide-react";
import { usePlayer, SpotifyTrack } from "@/contexts/PlayerContext";

// 플레이리스트 상세 데이터를 위한 타입 정의
interface PlaylistDetailData {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    items: {
      added_at: string;
      track: PlaylistTrack;
    }[];
    total: number;
  };
}

// Playlist 내의 개별 트랙 타입
interface PlaylistTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const PlaylistDetail: React.FC = () => {
  // 폴더명이 [playlistid]이므로 useParams에서 playlistid로 받음
  const { playlistid } = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistDetailData | null>(null);
  const accessToken =
    typeof window !== "undefined" &&
    localStorage.getItem("spotify_access_token");

  // usePlayer에서 playPlaylist 함수를 추가로 가져옴
  const { currentTrack, isPlaying, togglePlayPause, playTrack, playPlaylist } =
    usePlayer();

  // 플레이리스트 상세 정보 불러오기 (GET /v1/playlists/{playlist_id})
  useEffect(() => {
    if (!accessToken || !playlistid) return;
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistid}?market=KR`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPlaylist(data);
        } else {
          console.error("플레이리스트 상세 정보 불러오기 실패", res.status);
        }
      } catch (error) {
        console.error("플레이리스트 상세 정보 불러오기 오류", error);
      }
    };
    fetchPlaylist();
  }, [accessToken, playlistid]);

  // 특정 트랙 재생 함수 (개별 재생)
  const handlePlayTrack = (trackData: PlaylistTrack) => {
    const spotifyTrack: SpotifyTrack = {
      id: trackData.id,
      name: trackData.name,
      album: {
        images: trackData.album.images.map((img) => ({ url: img.url })),
      },
      uri: trackData.uri,
      duration_ms: trackData.duration_ms,
      type: "track",
      artists: trackData.artists.map((artist) => ({ name: artist.name })),
      liked: false,
    };
    playTrack(spotifyTrack);
  };

  // 전체 재생: 플레이리스트의 전체 트랙을 배열로 만들어 재생
  const handlePlayAll = () => {
    if (playlist && playlist.tracks.items.length > 0) {
      const tracks: SpotifyTrack[] = playlist.tracks.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        album: {
          images: item.track.album.images.map((img) => ({ url: img.url })),
        },
        uri: item.track.uri,
        duration_ms: item.track.duration_ms,
        type: "track",
        artists: item.track.artists.map((a) => ({ name: a.name })),
        liked: false,
      }));
      // playPlaylist 함수가 전체 트랙을 재생 목록(플레이어 큐 및 재생 히스토리)에 추가하고 재생하도록 호출
      playPlaylist(tracks);
    }
  };

  // 전체 재생 버튼 토글: 현재 재생 중이면 일시정지, 아니면 전체 재생
  const handlePlayAllToggle = () => {
    if (!playlist || playlist.tracks.items.length === 0) return;
    const firstTrack = playlist.tracks.items[0].track;
    const isPlaylistPlaying =
      currentTrack && isPlaying && currentTrack.id === firstTrack.id;
    if (isPlaylistPlaying) {
      togglePlayPause();
    } else {
      handlePlayAll();
    }
  };

  // 특정 트랙 삭제 (DELETE /playlists/{playlist_id}/tracks)
  const deleteTrack = async (trackUri: string) => {
    if (!accessToken || !playlistid) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistid}/tracks`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tracks: [{ uri: trackUri }],
          }),
        }
      );
      if (res.ok && playlist) {
        const updatedItems = playlist.tracks.items.filter(
          (item) => item.track.uri !== trackUri
        );
        setPlaylist({
          ...playlist,
          tracks: { ...playlist.tracks, items: updatedItems },
        });
      } else {
        console.error("트랙 삭제 실패", res.status);
      }
    } catch (error) {
      console.error("트랙 삭제 오류", error);
    }
  };

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-900 to-black text-white">
        <p>플레이리스트 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 플레이리스트의 첫 번째 트랙을 기준으로 전체 재생 상태를 판단
  const firstTrack =
    playlist.tracks.items.length > 0 ? playlist.tracks.items[0].track : null;
  const isPlaylistPlaying =
    firstTrack &&
    currentTrack &&
    isPlaying &&
    currentTrack.id === firstTrack.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 to-black text-white">
      {/* 헤더 영역 */}
      <header className="flex items-center p-6">
        <button
          onClick={() => router.back()}
          className="mr-4 text-amber-300 hover:text-amber-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="kor eng text-3xl font-bold">{playlist.name}</h1>
      </header>

      {/* 플레이리스트 기본 정보 */}
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Image
            src={playlist.images?.[0]?.url || "/images/logo.svg"}
            alt={playlist.name}
            width={150}
            height={150}
            className="rounded-lg object-cover"
            priority
          />
          <div className="ml-6">
            <p className="text-sm text-gray-400">
              총 {playlist.tracks.total}곡
            </p>
            {playlist.description && playlist.description !== "null" && (
              <p className="mt-2 text-lg">{playlist.description}</p>
            )}
            {/* 전체 재생 버튼 */}
            <button
              onClick={handlePlayAllToggle}
              className="mt-4 p-2 rounded-full bg-amber-600 hover:bg-amber-700"
            >
              {isPlaylistPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </div>

        {/* 트랙 목록 */}
        <div>
          {playlist.tracks.items.length === 0 ? (
            <p>플레이리스트에 트랙이 없습니다.</p>
          ) : (
            <ul className="space-y-4">
              {playlist.tracks.items.map((item) => (
                <li
                  key={item.track.id}
                  className="flex items-center justify-between bg-black/30 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <Image
                      src={
                        item.track.album.images?.[0]?.url ||
                        "/images/default.png"
                      }
                      alt={item.track.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                      priority
                    />
                    <div className="ml-4">
                      <p className="font-medium">{item.track.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (
                          currentTrack &&
                          currentTrack.id === item.track.id &&
                          isPlaying
                        ) {
                          togglePlayPause();
                        } else {
                          handlePlayTrack(item.track);
                        }
                      }}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      {currentTrack &&
                      currentTrack.id === item.track.id &&
                      isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteTrack(item.track.uri)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash size={24} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
