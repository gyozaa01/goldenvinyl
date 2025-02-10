"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, MoreHorizontal } from "lucide-react";
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

// Spotify 플레이리스트 타입(모달 메뉴용, 필요한 최소 정보)
type SpotifyPlaylist = {
  id: string;
  name: string;
};

interface SpotifyPlaylistSimple {
  id: string;
  name: string;
}

const RecentTopArtists: React.FC = () => {
  const [artistData, setArtistData] = useState<ArtistData[]>([]);
  const { playTrack } = usePlayer();

  // 사용자 플레이리스트 목록과 모달 상태
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  // 모달 열림 여부와 현재 선택한 트랙
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<TopTrack | null>(null);

  const accessToken = localStorage.getItem("spotify_access_token");

  // 사용자 Top Tracks와 아티스트 데이터 불러오기
  useEffect(() => {
    const fetchUserTopTracksAndArtists = async () => {
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
  }, [accessToken]);

  // 사용자 플레이리스트 불러오기(모달 메뉴에 사용)
  useEffect(() => {
    if (!accessToken) return;
    const fetchPlaylists = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = (await res.json()) as { items: SpotifyPlaylistSimple[] };
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

  // 모달 열기: 특정 트랙을 선택하여 플레이리스트에 추가할 수 있도록 함
  const openAddToPlaylistModal = (track: TopTrack) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  // 선택한 플레이리스트에 해당 트랙 추가(중복 추가 방지)
  const addTrackToPlaylist = async (track: TopTrack, playlistId: string) => {
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      // 먼저 해당 플레이리스트의 트랙 목록을 불러와 중복 여부 확인
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
                    className="relative flex-shrink-0 w-44 group bg-black/40 rounded-lg p-3"
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
                      {/* 모달 열기 버튼: 카드 우측 상단 */}
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

export default RecentTopArtists;
