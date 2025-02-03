"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [menuOpen, setMenuOpen] = useState(false); // 드롭다운 메뉴 상태

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Image src="/images/logo.svg" alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-bold dancing-script">Golden Vinyl</h1>
      </div>

      {isLoggedIn ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full bg-white/10"
          >
            <User size={24} className="text-amber-200/80" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-black text-white rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="text-xl flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-800 nanum-pen-script-regular"
              >
                <LogOut size={18} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="text-xl px-4 py-2 nanum-pen-script-regular rounded-lg bg-amber-200 text-black font-bold"
        >
          로그인
        </button>
      )}
    </header>
  );
};

export default Header;
