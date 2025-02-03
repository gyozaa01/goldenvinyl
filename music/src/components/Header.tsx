"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
const AUTH_URL = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-email", "user-read-private"].join("%20");

const Header = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    setAccessToken(token);
  }, []);

  const handleLogin = () => {
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
    window.location.href = authUrl;
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("로그아웃 버튼 클릭됨");

    setMenuOpen(false);
    localStorage.removeItem("spotify_access_token");
    setAccessToken(null);
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 z-40">
      <div className="flex items-center gap-2">
        <Image src="/images/logo.svg" alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-bold eng">Golden Vinyl</h1>
      </div>

      {accessToken ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full bg-white/10"
          >
            <User size={24} className="text-amber-200/80" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-32 bg-black text-white rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
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
          onClick={handleLogin}
          className="text-xl px-4 py-2 kor rounded-lg bg-amber-200 text-black font-bold"
        >
          로그인
        </button>
      )}
    </header>
  );
};

export default Header;
