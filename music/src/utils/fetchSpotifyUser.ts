export const fetchSpotifyUser = async (accessToken: string) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spotify 사용자 데이터를 가져오는데 실패했습니다.");
  }

  return response.json();
};
