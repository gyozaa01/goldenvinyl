"use client";

import { useState } from "react";
import { Search as SearchIcon, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

// 검색 결과 타입 정의
type ResultItem = {
  id: number;
  type: "song" | "artist" | "album";
  name: string;
  artist?: string;
  album?: string;
  image: string;
};

// 더미 데이터
const allResults: ResultItem[] = [
  {
    id: 1,
    type: "artist",
    name: "투어스",
    image: "https://picsum.photos/200/200?random=1",
  },
  {
    id: 2,
    type: "artist",
    name: "tws",
    image: "https://picsum.photos/200/200?random=2",
  },
  {
    id: 3,
    type: "album",
    name: "투어스 1집",
    artist: "투어스",
    image: "https://picsum.photos/200/200?random=3",
  },
  {
    id: 4,
    type: "album",
    name: "투어스 2집",
    artist: "투어스",
    image: "https://picsum.photos/200/200?random=4",
  },
  {
    id: 5,
    type: "album",
    name: "투어스 3집",
    artist: "투어스",
    image: "https://picsum.photos/200/200?random=5",
  },
  {
    id: 6,
    type: "album",
    name: "tws album",
    artist: "tws",
    image: "https://picsum.photos/200/200?random=6",
  },
  {
    id: 7,
    type: "song",
    name: "Plot Twist",
    artist: "투어스",
    album: "투어스 1집",
    image: "https://picsum.photos/200/200?random=7",
  },
  {
    id: 8,
    type: "song",
    name: "unplugged boy",
    artist: "투어스",
    album: "투어스 1집",
    image: "https://picsum.photos/200/200?random=8",
  },
  {
    id: 9,
    type: "song",
    name: "first hooky",
    artist: "투어스",
    album: "투어스 1집",
    image: "https://picsum.photos/200/200?random=9",
  },
  {
    id: 10,
    type: "song",
    name: "BFF",
    artist: "투어스",
    album: "투어스 1집",
    image: "https://picsum.photos/200/200?random=10",
  },
  {
    id: 11,
    type: "song",
    name: "Oh Mymy : 7s",
    artist: "투어스",
    album: "투어스 1집",
    image: "https://picsum.photos/200/200?random=11",
  },
  {
    id: 12,
    type: "song",
    name: "Hey! Hey!",
    artist: "투어스",
    album: "투어스 2집",
    image: "https://picsum.photos/200/200?random=12",
  },
  {
    id: 13,
    type: "song",
    name: "Double Take",
    artist: "투어스",
    album: "투어스 2집",
    image: "https://picsum.photos/200/200?random=13",
  },
  {
    id: 14,
    type: "song",
    name: "Fire Confetti",
    artist: "투어스",
    album: "투어스 2집",
    image: "https://picsum.photos/200/200?random=14",
  },
  {
    id: 15,
    type: "song",
    name: "Last Festival",
    artist: "투어스",
    album: "투어스 3집",
    image: "https://picsum.photos/200/200?random=15",
  },
  {
    id: 16,
    type: "song",
    name: "Highlight",
    artist: "투어스",
    album: "투어스 3집",
    image: "https://picsum.photos/200/200?random=16",
  },
  {
    id: 17,
    type: "song",
    name: "Comma,",
    artist: "투어스",
    album: "투어스 3집",
    image: "https://picsum.photos/200/200?random=17",
  },
  {
    id: 18,
    type: "song",
    name: "투어스 노래",
    artist: "tws",
    album: "tws album",
    image: "https://picsum.photos/200/200?random=18",
  },
];

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [artists, setArtists] = useState<ResultItem[]>([]);
  const [albums, setAlbums] = useState<ResultItem[]>([]);
  const [songs, setSongs] = useState<ResultItem[]>([]);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

  // 검색 기능
  const handleSearch = () => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) {
      setArtists([]);
      setAlbums([]);
      setSongs([]);
      return;
    }

    // 가수 검색 (name 필드에서 검색)
    const filteredArtists = allResults.filter(
      (item) =>
        item.type === "artist" && item.name.toLowerCase().includes(trimmedQuery)
    );

    // 앨범 검색 (name 또는 artist 필드에서 검색)
    const filteredAlbums = allResults.filter(
      (item) =>
        item.type === "album" &&
        (item.name.toLowerCase().includes(trimmedQuery) ||
          (item.artist && item.artist.toLowerCase().includes(trimmedQuery)))
    );

    // 노래 검색 (name, artist, album 필드에서 검색)
    const filteredSongs = allResults.filter(
      (item) =>
        item.type === "song" &&
        (item.name.toLowerCase().includes(trimmedQuery) ||
          (item.artist && item.artist.toLowerCase().includes(trimmedQuery)) ||
          (item.album && item.album.toLowerCase().includes(trimmedQuery)))
    );

    console.log("검색 결과");
    console.log("가수:", filteredArtists);
    console.log("앨범:", filteredAlbums);
    console.log("노래:", filteredSongs);

    setArtists(filteredArtists);
    setAlbums(filteredAlbums);
    setSongs(filteredSongs);
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
            className="w-full p-3 rounded-lg bg-black/10 text-white placeholder-amber-300 focus:outline-none"
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
      <div className="flex-1 overflow-auto p-6 scrollbar-hidden">
        {artists.length === 0 && albums.length === 0 && songs.length === 0 ? (
          <p className="text-center text-amber-300">검색 결과가 없습니다.</p>
        ) : (
          <>
            {/* 가수 */}
            {artists.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-amber-200 mb-2">
                  아티스트
                </h2>
                {artists.map((artist) => (
                  <div key={artist.id}>
                    <button
                      className="flex items-center bg-black/20 p-3 rounded-lg w-full text-left"
                      onClick={() =>
                        setExpandedArtist(
                          expandedArtist === artist.name ? null : artist.name
                        )
                      }
                    >
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium">{artist.name}</h3>
                        <p className="text-xs text-amber-500">가수</p>
                      </div>
                      {expandedArtist === artist.name ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 앨범 */}
            {albums.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-amber-200 mb-2">앨범</h2>
                {albums.map((album) => (
                  <div key={album.id}>
                    <button
                      className="flex items-center bg-black/20 p-3 rounded-lg w-full text-left"
                      onClick={() =>
                        setExpandedAlbum(
                          expandedAlbum === album.name ? null : album.name
                        )
                      }
                    >
                      <Image
                        src={album.image}
                        alt={album.name}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium">{album.name}</h3>
                        <p className="text-sm text-amber-300">{album.artist}</p>
                      </div>
                      {expandedAlbum === album.name ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    {/* 선택된 앨범의 노래 표시 */}
                    {expandedAlbum === album.name && (
                      <div className="ml-6 mt-2 space-y-3">
                        {songs
                          .filter((song) => song.album === album.name)
                          .map((song) => (
                            <div
                              key={song.id}
                              className="flex items-center bg-black/30 p-3 rounded-lg"
                            >
                              <Image
                                src={song.image}
                                alt={song.name}
                                width={50}
                                height={50}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <h3 className="text-lg font-medium">
                                  {song.name}
                                </h3>
                                <p className="text-sm text-amber-300">
                                  {song.artist}
                                </p>
                                <p className="text-xs text-amber-500">곡</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
