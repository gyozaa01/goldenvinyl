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

  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
  } = usePlayer();
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

  // 재생/일시정지(트랙 클릭 시)
  const togglePlay = async (track: SpotifyTrack) => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      // 만약 같은 트랙이면, 재생/일시정지 토글
      if (currentTrack?.uri === track.uri) {
        await togglePlayPause(); // context에 있는 togglePlayPause 호출
      } else {
        // 다른 트랙이면 새 트랙으로 재생 시작
        const deviceResponse = await fetch(
          "https://api.spotify.com/v1/me/player/devices",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const deviceData = await deviceResponse.json();
        if (!deviceData.devices.length) {
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
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Spotify 재생 오류:", error);
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
                alt={results.topResult.name}
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
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    width={50}
                    height={50}
                    className="w-12 h-12 rounded-lg object-cover"
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
                <div key={album.id} className="flex-none w-40">
                  <Image
                    src={album.images[0]?.url}
                    alt={album.name}
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-lg object-cover"
                  />
                  <p className="text-lg truncate w-40">{album.name}</p>
                  <p className="text-sm text-amber-300">
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
