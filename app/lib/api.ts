import { JAMENDO_API_URL, JAMENDO_CLIENT_ID } from "../config/constants";

export async function fetchTracks(limit = 20) {
  const response = await fetch(
    `${JAMENDO_API_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo&audioformat=mp32`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tracks");
  }

  const data = await response.json();
  return data.results.map(
    (track: {
      id: string;
      name: string;
      duration: number;
      artist_name: string;
      album_name: string;
      audio: string;
      image: string;
    }) => ({
      id: track.id,
      name: track.name,
      duration: track.duration,
      artist_name: track.artist_name,
      album_name: track.album_name,
      audio_url: track.audio,
      image_url: track.image,
    })
  );
}
