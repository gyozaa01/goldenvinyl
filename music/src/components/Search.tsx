"use client";

import { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  Play,
  Pause,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { usePlayer, SpotifyTrack } from "@/contexts/PlayerContext";

// 시간 변환 함수(밀리초 → mm:ss)
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
};

interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  release_date: string;
  type: "album";
}

interface SpotifyArtist {
  id: string;
  name: string;
  images?: { url: string }[];
  type: "artist";
}

type SearchResults = {
  topResult: SpotifyArtist | SpotifyAlbum | SpotifyTrack | null;
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
};

// Spotify 플레이리스트 타입(모달 메뉴용)
interface SpotifyPlaylist {
  id: string;
  name: string;
}

// Spotify 플레이리스트 API 응답 타입 정의
interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
}

const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults>({
    topResult: null,
    tracks: [],
    albums: [],
    artists: [],
  });

  // 모달 및 플레이리스트 관련 상태
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  // 컴포넌트 마운트 시 한 번만 accessToken을 읽어옴.
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("spotify_access_token")
      : null;

  const { currentTrack, isPlaying, togglePlayPause, playTrack, playAlbum } =
    usePlayer();

  // Spotify API 검색
  const handleSearch = async () => {
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track,album,artist&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      const topArtist = data.artists?.items?.[0] || null;
      const topAlbum = data.albums?.items?.[0] || null;
      const topTrack = data.tracks?.items?.[0] || null;
      const topResult = topArtist || topAlbum || topTrack;
      setResults({
        topResult,
        tracks: data.tracks?.items || [],
        albums: data.albums?.items || [],
        artists: data.artists?.items || [],
      });
    } catch (error) {
      console.error("Spotify 검색 오류:", error);
    }
  };

  // 트랙 재생/일시정지: 현재 재생 중이면 토글, 아니면 새로 playTrack 호출
  const togglePlay = async (track: SpotifyTrack) => {
    if (currentTrack?.uri === track.uri) {
      await togglePlayPause();
    } else {
      await playTrack(track);
    }
  };

  // 모달 열기 함수: 해당 트랙을 선택하고 모달을 오픈
  const openAddToPlaylistModal = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  // Spotify 플레이리스트 불러오기(모달 메뉴용)
  useEffect(() => {
    if (!accessToken) return;
    const fetchPlaylists = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = (await res.json()) as SpotifyPlaylistsResponse;
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
  }, [accessToken]); // accessToken은 마운트 시 고정 값으로 가정

  // 선택한 플레이리스트에 해당 트랙 추가(중복 추가 방지)
  const addTrackToPlaylist = async (
    track: SpotifyTrack,
    playlistId: string
  ) => {
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
        if (uris.includes(track.uri)) {
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
            uris: [track.uri],
          }),
        }
      );
      if (res.ok) {
        alert(`"${track.name}"이(가) 플레이리스트에 추가되었습니다.`);
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
    <div className="flex flex-col w-full h-screen bg-transparent text-white">
      {/* 검색 바 */}
      <div className="sticky top-0 bg-transparent p-6 z-10 rounded-b-lg backdrop-blur-md">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="어떤 음악을 턴테이블에 올릴까요?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full p-3 rounded-lg bg-black/10 text-white placeholder-amber-300 focus:outline-none kor text-xl"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 text-amber-400"
          >
            <SearchIcon size={24} />
          </button>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 overflow-auto p-6 scrollbar-hidden space-y-6">
        {/* 상위 결과 */}
        {results.topResult && (
          <div className="bg-black/20 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-3 kor">상위 결과</h2>
            <div className="flex items-center">
              <Image
                src={
                  results.topResult.images?.[0]?.url || "/images/default.png"
                }
                alt={results.topResult?.name ?? "검색 결과 이미지"}
                priority
                width={80}
                height={80}
                className={`object-cover aspect-square ${
                  results.topResult.type === "artist"
                    ? "rounded-full w-20 h-20"
                    : "rounded-lg"
                }`}
              />

              <div className="ml-4">
                <h3 className="text-lg font-bold truncate w-40">
                  {results.topResult.name}
                </h3>
                <p className="text-amber-300">
                  {results.topResult.type === "artist"
                    ? "아티스트"
                    : results.topResult.type === "album"
                    ? "앨범"
                    : "곡"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 곡 리스트 */}
        {results.tracks.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-3 kor">곡</h2>
            <div className="space-y-4">
              {results.tracks.map((track: SpotifyTrack) => (
                <div
                  key={track.id}
                  className="flex items-center bg-black/20 p-3 rounded-lg"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("trackData", JSON.stringify(track));
                  }}
                >
                  <Image
                    src={track.album.images?.[0]?.url || "/images/logo.svg"}
                    alt={track.name ?? "트랙 앨범 이미지"}
                    width={50}
                    height={50}
                    className="w-12 h-12 rounded-lg object-cover"
                    priority
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium truncate w-full max-w-[120px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[320px] overflow-hidden whitespace-nowrap">
                      {track.name}
                    </h3>

                    <p className="text-sm text-amber-300">
                      {track.artists[0].name} -{" "}
                      {formatDuration(track.duration_ms)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePlay(track)}
                      className="text-amber-400"
                    >
                      {currentTrack?.uri === track.uri && isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </button>
                    {/* 추가 버튼: 모달을 통해 플레이리스트에 추가 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylistModal(track);
                      }}
                      className="text-white bg-black/50 p-1 rounded-full hover:bg-black/60 transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 앨범 리스트(슬라이드 가능) */}
        {results.albums.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-3 kor">앨범</h2>
            <div className="flex overflow-x-auto space-x-4 scrollbar-hidden">
              {results.albums.map((album: SpotifyAlbum) => (
                <div
                  key={album.id}
                  className="flex-none w-44 group relative bg-black/40 rounded-lg p-3"
                >
                  <div className="relative">
                    <Image
                      src={album.images?.[0]?.url || "/images/logo.svg"}
                      alt={album.name ?? "앨범 이미지"}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover rounded-lg"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
                    <button
                      onClick={() => playAlbum(album.id)}
                      className="absolute bottom-2 right-2 p-3 bg-amber-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play size={20} fill="white" />
                    </button>
                  </div>
                  <h3 className="font-medium mt-2 text-amber-50 truncate">
                    {album.name}
                  </h3>
                  <p className="text-sm text-amber-200/60 truncate">
                    {album.artists[0].name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default Search;
