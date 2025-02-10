"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Play } from "lucide-react";
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

const HeartPlayed = () => {
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const { currentTrack, playTrack, togglePlayPause } = usePlayer();

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
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
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
    </div>
  );
};

export default HeartPlayed;
