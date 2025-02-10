"use client";

import { useState } from "react";
import { Search as SearchIcon, Play, Pause } from "lucide-react";
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

const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults>({
    topResult: null,
    tracks: [],
    albums: [],
    artists: [],
  });

  const { currentTrack, isPlaying, togglePlayPause, playTrack, playAlbum } =
    usePlayer();

  // Spotify API 검색
  const handleSearch = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
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
                    <h3 className="text-lg font-medium truncate w-full max-w-[150px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[320px] overflow-hidden whitespace-nowrap">
                      {track.name}
                    </h3>

                    <p className="text-sm text-amber-300">
                      {track.artists[0].name} -{" "}
                      {formatDuration(track.duration_ms)}
                    </p>
                  </div>
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
    </div>
  );
};

export default Search;
