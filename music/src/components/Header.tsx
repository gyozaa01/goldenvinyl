"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;
const AUTH_URL = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
].join("%20");

const Header = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    display_name: string;
    avatar_url: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    setAccessToken(token);

    // Supabase에서 사용자 정보 가져오기
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("사용자 정보 가져오기 오류:", error.message);
      } else {
        setUser(data);
      }
    };

    if (token) fetchUser();
  }, []);

  const handleLogin = () => {
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
    window.location.href = authUrl; // Spotify 로그인 페이지로 이동
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("로그아웃 버튼 클릭됨");

    setMenuOpen(false);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token"); // 리프레시 토큰도 삭제
    localStorage.removeItem("supabase_user_id");

    setAccessToken(null);
    setUser(null);

    window.location.reload(); // 로그아웃 후 상태 초기화
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 z-40">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          priority
        />
        <h1 className="text-2xl font-bold eng">Golden Vinyl</h1>
      </div>

      {accessToken ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full bg-white/10"
          >
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.avatar_url ? "User Avatar" : "Default User Avatar"}
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
            ) : (
              <User size={24} className="text-amber-200/80" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-black text-white rounded-lg shadow-lg z-50">
              <div className="px-4 py-2 text-center border-b border-gray-700">
                <p className="kor text-xl text-sm">
                  {user?.display_name ? `${user.display_name}님` : "사용자"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xl flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-800 kor"
              >
                <LogOut size={18} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleLogin} // Spotify 로그인 페이지로 이동
          className="text-xl px-4 py-2 kor rounded-lg bg-amber-200 text-black font-bold"
        >
          로그인
        </button>
      )}
    </header>
  );
};

export default Header;
