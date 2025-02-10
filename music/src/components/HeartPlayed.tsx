"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Play, MoreHorizontal } from "lucide-react";
import { usePlayer, SpotifyTrack } from "@/contexts/PlayerContext";

// Supabase의 play_history 테이블에서 사용하는 타입 정의
interface LikedTrack {
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

// Spotify 플레이리스트 타입(모달 메뉴용)
interface SpotifyPlaylist {
  id: string;
  name: string;
}

// Spotify 플레이리스트 API 응답 타입 정의
interface SpotifyPlaylistsResponse {
  items: {
    id: string;
    name: string;
  }[];
}

const HeartPlayed = () => {
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const { currentTrack, playTrack, togglePlayPause } = usePlayer();

  // 모달 및 플레이리스트 관련 상태 추가
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<LikedTrack | null>(null);

  const accessToken = localStorage.getItem("spotify_access_token");

  useEffect(() => {
    const fetchLikedTracks = async () => {
      // Supabase 사용자 ID를 가져옴(로그인 후 localStorage에 저장된 값)
      const userId = localStorage.getItem("supabase_user_id");
      if (!userId) return;

      // heart 컬럼이 true인 트랙들만 불러오기
      const { data, error } = await supabase
        .from("play_history")
        .select("*")
        .eq("user_id", userId)
        .eq("heart", true);

      if (error) {
        console.error("좋아요한 음악 불러오기 오류:", error);
        return;
      }

      if (data) {
        // 불러온 데이터 배열을 랜덤하게 섞은 후, 4개만 선택
        const shuffled = shuffleArray(data);
        const selected = shuffled.slice(0, 4);
        setLikedTracks(selected as LikedTrack[]);
      }
    };

    fetchLikedTracks();
  }, []);

  // 제네릭을 사용하여 배열을 섞는 함수(Fisher-Yates 알고리즘)
  const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // LikedTrack을 SpotifyTrack 타입으로 변환한 후 재생
  const handlePlay = (likedTrack: LikedTrack) => {
    const spotifyTrack: SpotifyTrack = {
      id: likedTrack.track_id,
      name: likedTrack.track_name,
      album: { images: [{ url: likedTrack.album_image }] },
      uri: likedTrack.track_uri,
      duration_ms: likedTrack.duration_ms,
      type: "track",
      artists: [{ name: likedTrack.artist }],
      playedAt: new Date(likedTrack.played_at).getTime(),
      liked: likedTrack.heart ?? false,
    };

    // 현재 재생 중인 트랙과 동일하면 재생/일시정지 토글, 아니면 새로 재생
    if (currentTrack?.uri === spotifyTrack.uri) {
      togglePlayPause();
    } else {
      playTrack(spotifyTrack);
    }
  };

  // Spotify 플레이리스트 불러오기 (모달 메뉴용)
  useEffect(() => {
    if (!accessToken) return;
    const fetchPlaylists = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data: SpotifyPlaylistsResponse = await res.json();
          const fetchedPlaylists = data.items.map((item) => ({
            id: item.id,
            name: item.name,
          }));
          setPlaylists(fetchedPlaylists);
        } else {
          console.error("플레이리스트 불러오기 실패", res.status);
        }
      } catch (error) {
        console.error("플레이리스트 불러오기 오류", error);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  // 모달 열기 함수
  const openAddToPlaylistModal = (track: LikedTrack) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  // 선택한 플레이리스트에 해당 곡 추가(중복 추가 방지)
  const addTrackToPlaylist = async (track: LikedTrack, playlistId: string) => {
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      // 해당 플레이리스트의 트랙 목록 불러오기
      const resGet = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(uri))`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (resGet.ok) {
        const data = await resGet.json();
        const uris = data.items.map(
          (item: { track: { uri: string } }) => item.track.uri
        );
        if (uris.includes(track.track_uri)) {
          alert("이 곡은 이미 추가되어 있습니다.");
          return;
        }
      } else {
        console.error("플레이리스트 트랙 불러오기 실패", resGet.status);
      }
      // 트랙 추가 요청
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [track.track_uri],
          }),
        }
      );
      if (res.ok) {
        alert(`"${track.track_name}"이(가) 플레이리스트에 추가되었습니다.`);
        setIsModalOpen(false);
        setSelectedTrack(null);
      } else {
        console.error("플레이리스트에 트랙 추가 실패", res.status);
      }
    } catch (error) {
      console.error("플레이리스트에 트랙 추가 오류", error);
    }
  };

  return (
    <div>
      <h2 className="text-3xl kor mb-4 text-amber-200/90">
        내가 좋아하는 음악
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {likedTracks.map((track) => (
          <div
            key={track.track_id}
            className="group relative bg-black/40 rounded-lg p-3"
          >
            <div className="relative">
              <Image
                src={track.album_image}
                alt={track.track_name}
                width={200}
                height={200}
                className="w-full aspect-square object-cover rounded-lg"
                priority
              />
              {/* 모달 열기 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddToPlaylistModal(track);
                }}
                className="absolute top-2 right-2 text-white bg-black/50 p-1 rounded-full hover:bg-black/60 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {/* 재생 버튼 */}
              <button
                onClick={() => handlePlay(track)}
                className="absolute bottom-2 right-2 p-3 bg-amber-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play size={20} fill="white" />
              </button>
            </div>
            <h3 className="font-medium mt-2 text-amber-50 truncate">
              {track.track_name}
            </h3>
            <p className="text-sm text-amber-200/60 truncate">{track.artist}</p>
          </div>
        ))}
      </div>

      {/* 모달: 플레이리스트 선택 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gradient-to-br from-amber-800 to-gray-900 border border-amber-500 rounded-xl shadow-2xl w-80 p-8 transform transition-all duration-300">
            <h3 className="kor text-2xl font-bold text-amber-100 mb-6">
              플레이리스트 선택
            </h3>
            <ul className="space-y-4 max-h-[300px] overflow-y-auto">
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <li
                    key={playlist.id}
                    onClick={() => {
                      if (selectedTrack) {
                        addTrackToPlaylist(selectedTrack, playlist.id);
                      }
                    }}
                    className="cursor-pointer px-4 py-2 rounded hover:bg-amber-700 transition-colors duration-200 text-amber-100"
                  >
                    {playlist.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-400">
                  플레이리스트가 없습니다.
                </li>
              )}
            </ul>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedTrack(null);
              }}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartPlayed;
