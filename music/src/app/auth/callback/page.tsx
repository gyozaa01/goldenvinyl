"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchSpotifyUser } from "@/utils/fetchSpotifyUser";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const getToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) return;

      try {
        // Spotify에서 Access Token 가져오기
        const response = await fetch(TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI!,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Spotify 인증에 실패했습니다.");
        }

        console.log("Access Token:", data.access_token);

        if (data.access_token) {
          localStorage.setItem("spotify_access_token", data.access_token);

          // Spotify 사용자 정보 가져오기
          const spotifyUser = await fetchSpotifyUser(data.access_token);
          console.log("Spotify User:", spotifyUser);

          // Supabase에 사용자 정보 저장 (uuid 사용)
          const { error } = await supabase.from("users").upsert({
            email: spotifyUser.email || "",
            display_name: spotifyUser.display_name || "",
            avatar_url: spotifyUser.images?.[0]?.url || "",
          });

          if (error) {
            console.error("Supabase 저장 오류:", error.message);
          } else {
            console.log("사용자 정보 저장 성공!");
          }

          // 홈 화면으로 이동
          router.push("/");
        }
      } catch (err) {
        console.error("Spotify 인증 오류:", err);
      }
    };

    getToken();
  }, [router]);

  return <p className="text-white">로그인 중...</p>;
};

export default Callback;
