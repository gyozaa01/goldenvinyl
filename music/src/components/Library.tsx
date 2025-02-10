"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Play, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlayer, SpotifyTrack } from "@/contexts/PlayerContext";

type SpotifyPlaylist = {
  id: string;
  name: string;
  images: { url: string }[] | null; // images가 null일 수 있음
  tracks: { total: number };
};

const Library: React.FC = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 무한 스크롤의 로딩 영역을 위한 ref
  const loaderRef = useRef<HTMLDivElement>(null);

  // Spotify 액세스 토큰
  const accessToken =
    typeof window !== "undefined" &&
    localStorage.getItem("spotify_access_token");

  // PlayerContext에서 전곡 재생 기능인 playPlaylist 사용 (playTrack 미사용)
  const { playPlaylist } = usePlayer();

  // 플레이리스트 불러오기 함수
  const fetchPlaylists = useCallback(
    async (url: string) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();

          // 이전에 불러온 항목과 중복되지 않는 항목만 필터링
          setPlaylists((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = data.items.filter(
              (item: SpotifyPlaylist) => !existingIds.has(item.id)
            );
            // 만약 새로 추가할 항목이 없다면 다음 페이지 URL을 null로 처리하여 무한 스크롤 중지
            if (newItems.length === 0) {
              setNextUrl(null);
              return prev;
            }
            return [...prev, ...newItems];
          });

          // API에서 다음 페이지가 없으면 nextUrl을 null로 설정
          if (!data.next) {
            setNextUrl(null);
          } else {
            // 새로 추가된 항목이 없다면 무한 스크롤이 계속 호출되지 않도록 nextUrl을 null로 처리
            const newItemsCount = data.items.filter(
              (item: SpotifyPlaylist) =>
                !playlists.find((p) => p.id === item.id)
            ).length;
            setNextUrl(newItemsCount > 0 ? data.next : null);
          }
        } else {
          console.error("플레이리스트 불러오기 실패", res.status);
        }
      } catch (error) {
        console.error("플레이리스트 불러오기 오류", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, playlists]
  );

  // 컴포넌트 마운트 시 초기 플레이리스트 20개 불러오기
  useEffect(() => {
    if (!accessToken) return;
    fetchPlaylists("https://api.spotify.com/v1/me/playlists?limit=20");
  }, [accessToken, fetchPlaylists]);

  // Intersection Observer를 사용하여 무한 스크롤 구현
  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextUrl && !loading) {
        fetchPlaylists(nextUrl);
      }
    });

    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [nextUrl, loading, fetchPlaylists]);

  // 새 플레이리스트 생성 (POST /v1/me/playlists)
  const addPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaylistName,
          public: false, // 비공개 플레이리스트로 생성
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // 새 플레이리스트는 기존 목록의 앞쪽에 추가
        setPlaylists((prev) => [data, ...prev]);
        setNewPlaylistName("");
      } else {
        console.error("플레이리스트 추가 실패", res.status);
      }
    } catch (error) {
      console.error("플레이리스트 추가 오류", error);
    }
  };

  // 플레이리스트 삭제 (Spotify에서는 실제 삭제 기능은 없고 언팔로우 처리)
  const deletePlaylist = async (playlistId: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.ok) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      } else {
        console.error("플레이리스트 삭제(언팔로우) 실패", res.status);
      }
    } catch (error) {
      console.error("플레이리스트 삭제 오류", error);
    }
  };

  // 선택한 플레이리스트의 전체 트랙 정보를 불러와 전곡 재생
  const handlePlayPlaylist = async (playlistId: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}?market=KR`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.tracks.items && data.tracks.items.length > 0) {
          // 전체 트랙 배열 추출 (각 항목의 track 필드를 사용)
          const tracks: SpotifyTrack[] = data.tracks.items.map(
            (item: { track: SpotifyTrack }) => item.track
          );
          // PlayerContext의 playPlaylist 함수가 전체 트랙 큐를 설정하고 재생 시작합니다.
          playPlaylist(tracks);
        } else {
          alert("플레이리스트에 트랙이 없습니다.");
        }
      } else {
        console.error("플레이리스트 상세 정보 불러오기 실패", res.status);
      }
    } catch (error) {
      console.error("전곡 재생 오류", error);
    }
  };

  return (
    <div className="flex flex-col w-full p-6 text-white bg-transparent from-amber-900 to-black">
      <h1 className="text-3xl font-bold mb-6 kor">🎶 나의 플레이리스트</h1>

      {/* 플레이리스트 추가 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="새 플레이리스트 이름"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="p-3 rounded-lg bg-black/30 text-white placeholder-amber-300 focus:outline-none w-full kor text-xl"
        />
        <Button
          onClick={addPlaylist}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* 플레이리스트 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="relative">
            {/* 클릭하면 상세 페이지로 이동 */}
            <Link href={`/playlist/${playlist.id}`}>
              <div className="bg-black/20 p-4 rounded-lg flex flex-col items-center cursor-pointer">
                <Image
                  src={playlist.images?.[0]?.url || "/images/logo.svg"}
                  alt={playlist.name || "Playlist Thumbnail"}
                  width={100}
                  height={100}
                  className="rounded-lg w-24 h-24 object-cover"
                  priority
                />
                <h3 className="mt-3 text-lg font-semibold text-amber-300 text-center">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {playlist.tracks.total}곡
                </p>
              </div>
            </Link>
            {/* 삭제(언팔로우) 버튼 */}
            <button
              onClick={() => deletePlaylist(playlist.id)}
              className="absolute bottom-2 right-2 text-red-400 hover:text-red-600"
            >
              <Trash size={18} />
            </button>
            {/* 플레이 버튼 (전곡 재생) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPlaylist(playlist.id);
              }}
              className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
            >
              <Play size={18} />
            </button>
          </div>
        ))}
      </div>
      {/* 무한 스크롤을 위한 로딩 영역 */}
      <div ref={loaderRef} className="py-4 text-center">
        {loading && <span>로딩 중...</span>}
      </div>
    </div>
  );
};

export default Library;
