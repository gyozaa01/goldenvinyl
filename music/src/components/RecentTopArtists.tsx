"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { usePlayer, SpotifyTrack } from "@/contexts/PlayerContext";

// /v1/me/top/tracks API 응답에서 필요한 필드만 포함하는 타입 정의
interface TopTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    images: { url: string; height: number; width: number }[];
  };
  uri: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
}

// /v1/me/top/tracks API 응답 타입(items 배열만 사용)
interface TopTracksResponse {
  items: TopTrack[];
}

// /v1/artists/{id}/top-tracks API 응답 타입(tracks 배열만 사용)
interface ArtistTopTracksResponse {
  tracks: TopTrack[];
}

// 각 아티스트의 빈도와 인기곡을 담을 타입
interface ArtistData {
  id: string;
  name: string;
  frequency: number;
  topTracks: TopTrack[];
}

const RecentTopArtists: React.FC = () => {
  const [artistData, setArtistData] = useState<ArtistData[]>([]);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchUserTopTracksAndArtists = async () => {
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) {
        alert("Spotify 로그인 필요");
        return;
      }
      try {
        // 1. 사용자의 Top Tracks 불러오기
        const res = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!res.ok) {
          console.error("사용자 top 트랙 불러오기 실패", res.status);
          return;
        }
        const data: TopTracksResponse = await res.json();

        // 2. 각 트랙의 아티스트 빈도 집계하기
        const frequencyMap = new Map<
          string,
          { name: string; frequency: number }
        >();
        data.items.forEach((track) => {
          track.artists.forEach((artist) => {
            if (frequencyMap.has(artist.id)) {
              const entry = frequencyMap.get(artist.id)!;
              entry.frequency++;
              frequencyMap.set(artist.id, entry);
            } else {
              frequencyMap.set(artist.id, { name: artist.name, frequency: 1 });
            }
          });
        });

        // 3. 빈도 기준 내림차순 정렬 후 상위 3개 아티스트 선정
        const sortedArtists = Array.from(frequencyMap.entries())
          .sort(([, a], [, b]) => b.frequency - a.frequency)
          .slice(0, 3);

        // 4. 각 상위 아티스트별 인기곡 불러오기
        const topArtistsData: ArtistData[] = await Promise.all(
          sortedArtists.map(async ([artistId, info]) => {
            const resArtist = await fetch(
              `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=KR`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            if (!resArtist.ok) {
              console.error(`아티스트 인기곡 불러오기 실패: ${info.name}`);
              return {
                id: artistId,
                name: info.name,
                frequency: info.frequency,
                topTracks: [],
              };
            }
            const dataArtist: ArtistTopTracksResponse = await resArtist.json();
            // API에서 기본적으로 최대 10개 트랙을 반환함
            return {
              id: artistId,
              name: info.name,
              frequency: info.frequency,
              topTracks: dataArtist.tracks,
            };
          })
        );
        setArtistData(topArtistsData);
      } catch (error) {
        console.error(
          "사용자 Top Tracks 및 아티스트 데이터 불러오기 오류:",
          error
        );
      }
    };

    fetchUserTopTracksAndArtists();
  }, []);

  // PlayerContext의 playTrack 함수가 사용하는 SpotifyTrack 형식으로 변환 후 재생 호출
  const handlePlay = (track: TopTrack) => {
    const spotifyTrack: SpotifyTrack = {
      id: track.id,
      name: track.name,
      album: { images: track.album.images.map((img) => ({ url: img.url })) },
      uri: track.uri,
      duration_ms: track.duration_ms,
      type: "track",
      artists: track.artists.map((artist) => ({ name: artist.name })),
      liked: false,
    };
    playTrack(spotifyTrack);
  };

  return (
    <div>
      <h2 className="text-3xl kor mt-5 mb-2 text-amber-200/90">
        최근 자주 들은 아티스트
      </h2>
      {artistData.length === 0 ? (
        <p className="text-sm text-amber-200/60">
          데이터를 불러오는 중입니다...
        </p>
      ) : (
        artistData.map((artist) => (
          <div key={artist.id} className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-amber-200 kor eng">
              {artist.name}의 인기곡
            </h3>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 scrollbar-hidden">
              {artist.topTracks.length > 0 ? (
                artist.topTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex-shrink-0 w-44 group relative bg-black/40 rounded-lg p-3"
                  >
                    <div className="relative">
                      <Image
                        src={
                          track.album.images?.[0]?.url || "/images/default.png"
                        }
                        alt={track.name}
                        width={200}
                        height={200}
                        className="w-full aspect-square object-cover rounded-lg"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
                      <button
                        onClick={() => handlePlay(track)}
                        className="absolute bottom-2 right-2 p-3 bg-amber-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play size={20} fill="white" />
                      </button>
                    </div>
                    <h4 className="font-medium text-sm text-amber-50 truncate">
                      {track.name}
                    </h4>
                    <p className="text-xs text-amber-200/60 truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-200/60">인기곡이 없습니다.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentTopArtists;
