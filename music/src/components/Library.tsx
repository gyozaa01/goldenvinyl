"use client";

import { useState } from "react";
import { Plus, Play, Trash } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// 플레이리스트 타입 정의
type Library = {
  id: number;
  name: string;
  songs: string[]; // 곡 ID 배열 (나중에 API 연동 시 ID로 관리)
  thumbnail: string;
};

const Library: React.FC = () => {
  const [playlists, setPlaylists] = useState<Library[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // 플레이리스트 추가
  const addPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Library = {
      id: Date.now(),
      name: newPlaylistName,
      songs: [],
      thumbnail: `https://picsum.photos/200/200?random=${Date.now()}`,
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName("");
  };

  // 플레이리스트 삭제
  const deletePlaylist = (id: number) => {
    setPlaylists(playlists.filter((playlist) => playlist.id !== id));
  };

  return (
    <div className="flex flex-col w-full h-screen p-6 text-white from-amber-900 to-black bg-transparent">
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
          <div
            key={playlist.id}
            className="bg-black/20 p-4 rounded-lg flex flex-col items-center relative"
          >
            <Image
              src={playlist.thumbnail}
              alt={playlist.name}
              width={100}
              height={100}
              className="rounded-lg w-24 h-24 object-cover"
            />
            <h3 className="mt-3 text-lg font-semibold text-amber-300 text-center">
              {playlist.name}
            </h3>
            <p className="text-sm text-gray-400">{playlist.songs.length}곡</p>

            {/* 플레이 버튼 */}
            <button className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70">
              <Play size={18} />
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={() => deletePlaylist(playlist.id)}
              className="absolute bottom-2 right-2 text-red-400 hover:text-red-600"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
