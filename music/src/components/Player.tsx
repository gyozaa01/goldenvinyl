"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX,
  ChevronUp,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Trash2,
} from "lucide-react";
import VinylDisc from "@/components/VinylDisc";
import Image from "next/image";

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    nextTrack,
    shuffleTrack,
    repeatTrack,
    playedTracks,
    playTrack,
    removeFromHistory,
    toggleLike,
  } = usePlayer();

  // 기본 상태들
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  // 반복/셔플 모드 상태
  const [shuffleActive, setShuffleActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);

  // currentTrack 변경 시 duration과 progress 초기화
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration_ms);
      // 만약 currentTrack.progress_ms가 있다면 그 값을, 없으면 0으로 초기화
      setProgress(currentTrack.progress_ms || 0);
      setTimerKey((prev) => prev + 1);
    }
  }, [currentTrack]);

  // handleNextTrack: 반복/셔플 모드에 따라 또는 다음 곡이 없으면 재생 중지
  const handleNextTrack = useCallback(async () => {
    if (repeatActive) {
      // 반복 모드: 현재 곡의 재생 위치를 0으로 강제 이동하고 타이머 재시작
      if (currentTrack) {
        const accessToken = localStorage.getItem("spotify_access_token");
        if (accessToken) {
          try {
            await fetch(
              `https://api.spotify.com/v1/me/player/seek?position_ms=0`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            setProgress(0);
            // timerKey를 업데이트하여 인터벌을 재시작
            setTimerKey((prev) => prev + 1);
          } catch (error) {
            console.error("반복 모드에서 재생 위치 이동 오류:", error);
          }
        } else {
          alert("Spotify 로그인 필요");
        }
      }
      await repeatTrack();
    } else if (shuffleActive) {
      await shuffleTrack();
    } else {
      if (currentTrack) {
        const index = playedTracks.findIndex((t) => t.id === currentTrack.id);
        if (index >= 0 && index < playedTracks.length - 1) {
          await nextTrack();
        } else {
          if (isPlaying) {
            await togglePlayPause();
          }
        }
      }
    }
  }, [
    repeatActive,
    shuffleActive,
    nextTrack,
    shuffleTrack,
    currentTrack,
    playedTracks,
    isPlaying,
    togglePlayPause,
    repeatTrack,
  ]);

  // 프로그레스바 인터벌: timerKey를 의존성에 포함하여 재시작
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev + 1000 >= currentTrack.duration_ms) {
            clearInterval(interval);
            setProgress(currentTrack.duration_ms);
            handleNextTrack();
            return currentTrack.duration_ms;
          }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, timerKey, handleNextTrack]);

  // ← 이전 버튼 동작:
  // - 진행 시간이 3초 이상이면 현재 곡의 재생 위치를 0으로 이동(그리고 타이머 재시작)
  // - 진행 시간이 3초 미만이면 이전 곡으로 전환하거나, 첫 곡이면 재생 정지 또는 0으로 이동
  const handlePrevTrack = async () => {
    if (!currentTrack) return;
    const threshold = 3000; // 3초 기준
    if (progress > threshold) {
      setProgress(0);
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) {
        alert("Spotify 로그인 필요");
        return;
      }
      try {
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=0`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // 타이머 재시작
        setTimerKey((prev) => prev + 1);
      } catch (error) {
        console.error("재생 위치 초기화 오류:", error);
      }
    } else {
      const index = playedTracks.findIndex((t) => t.id === currentTrack.id);
      if (index > 0) {
        await playTrack(playedTracks[index - 1], true);
      } else {
        if (progress === 0 && isPlaying) {
          await togglePlayPause();
        } else {
          setProgress(0);
          const accessToken = localStorage.getItem("spotify_access_token");
          if (!accessToken) {
            alert("Spotify 로그인 필요");
            return;
          }
          try {
            await fetch(
              `https://api.spotify.com/v1/me/player/seek?position_ms=0`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            setTimerKey((prev) => prev + 1);
          } catch (error) {
            console.error("재생 위치 초기화 오류:", error);
          }
        }
      }
    }
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    // 음소거 상태에서 볼륨 조절하면, 음소거 해제 처리
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("볼륨 변경 실패:", errorData);
      }
    } catch (error) {
      console.error("볼륨 변경 오류:", error);
    }
  };

  // 음소거 토글 핸들러
  const toggleMute = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      if (!isMuted) {
        // 음소거: 현재 볼륨을 prevVolume에 저장하고 볼륨 0으로 변경
        setPrevVolume(volume);
        setVolume(0);
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=0`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("음소거 실패:", errorData);
        } else {
          setIsMuted(true);
        }
      } else {
        // 음소거 해제: 이전 볼륨으로 복원
        setVolume(prevVolume);
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${prevVolume}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("음소거 해제 실패:", errorData);
        } else {
          setIsMuted(false);
        }
      }
    } catch (error) {
      console.error("음소거 토글 오류:", error);
    }
  };

  // 시간 포맷 함수 (mm:ss)
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // 프로그레스바 조작 시 재생 위치 이동(seek)
  const handleProgressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      alert("Spotify 로그인 필요");
      return;
    }
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${newProgress}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error) {
      console.error("재생 위치 이동 오류:", error);
    }
  };

  return (
    <div
      className={`fixed left-0 right-0 transition-all duration-500 ease-out ${
        isExpanded
          ? "top-0 bottom-0 bg-black/95 z-50"
          : "bottom-0 h-48 bg-black/80"
      } flex flex-col`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      >
        <ChevronUp
          className={`text-amber-200/60 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 헤더 영역 */}
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between">
          <h4 className="text-amber-50 kor font-medium">현재 재생 중인 음악</h4>
          <button onClick={toggleLike} className="focus:outline-none">
            <Heart
              size={24}
              fill={
                currentTrack && currentTrack.liked ? "currentColor" : "none"
              }
              className={
                currentTrack && currentTrack.liked
                  ? "text-amber-500"
                  : "text-amber-500/80"
              }
            />
          </button>
        </div>
      </div>

      {/* Vinyl Disc 컴포넌트 */}
      <div className="flex flex-col items-center mt-4">
        <VinylDisc
          isPlaying={isPlaying}
          imageUrl={currentTrack?.album.images?.[0]?.url}
        />
        {currentTrack && (
          <div className="mt-2 text-center">
            <p className="text-amber-50 font-medium truncate max-w-[250px] mx-auto">
              {currentTrack.name}
            </p>
            <p className="text-xs text-amber-300 truncate max-w-[250px] mx-auto">
              {currentTrack.artists[0].name}
            </p>
          </div>
        )}
      </div>

      {/* 총 곡 수 영역 */}
      <div className="px-6 py-2 text-sm text-amber-200">
        총 {playedTracks.length} 곡
      </div>

      {/* 재생 히스토리 영역 – 바이닐, 헤더, 총 곡 수, 컨트롤 영역을 제외한 남은 영역을 채움 */}
      <div className="flex-1 overflow-y-auto px-6 space-y-2 scrollbar-hidden">
        {playedTracks
          .slice()
          .reverse()
          .map((track) => (
            <div
              key={`${track.id}-${track.playedAt}`}
              className="flex items-center bg-black/50 p-2 rounded-md"
            >
              <Image
                src={track.album?.images?.[0]?.url || "/images/logo.svg"}
                alt={track.name || "Track Album Image"}
                width={40}
                height={40}
                className="rounded-md"
                priority
              />
              <div className="ml-2 flex-1">
                <p className="text-sm text-amber-50 truncate max-w-[140px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[250px]">
                  {track.name}
                </p>
                <p className="text-xs text-amber-300 truncate max-w-[140px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[250px]">
                  {track.artists[0].name}
                </p>
              </div>
              <button
                onClick={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlayPause();
                  } else {
                    playTrack(track);
                  }
                }}
                className="mr-2 focus:outline-none"
              >
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </button>
              <button
                onClick={() => removeFromHistory(track.id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-xs"
              >
                <Trash2 size={16} />
                <span>삭제</span>
              </button>
            </div>
          ))}
      </div>

      {/* 컨트롤 영역 */}
      <div className="p-4 flex flex-col gap-4">
        {/* 상단 컨트롤 행: 이전/다음, 셔플/반복, 진행바 */}
        <div className="flex items-center justify-between">
          <button onClick={handlePrevTrack} className="focus:outline-none">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setShuffleActive((prev) => !prev)}
            className="focus:outline-none"
          >
            <Shuffle
              size={20}
              className={shuffleActive ? "text-amber-400" : "text-amber-200"}
            />
          </button>
          <button
            onClick={() => setRepeatActive((prev) => !prev)}
            className="focus:outline-none"
          >
            <Repeat
              size={20}
              className={repeatActive ? "text-amber-400" : "text-amber-200"}
            />
          </button>
          <div className="flex items-center gap-2 flex-1 mx-4">
            <span className="text-amber-200 text-sm">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={handleProgressChange}
              className="w-full"
            />
            <span className="text-amber-200 text-sm">
              {formatTime(duration)}
            </span>
          </div>
          <button onClick={handleNextTrack} className="focus:outline-none">
            <SkipForward size={20} />
          </button>
        </div>

        {/* 하단 컨트롤 행: 재생/일시정지 및 볼륨 */}
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-amber-600/90 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="focus:outline-none">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
