import { JAMENDO_API_URL, JAMENDO_CLIENT_ID } from "../config/constants";

export async function fetchTracks(limit = 20, offset = 0, searchQuery = "") {
  let url = `${JAMENDO_API_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&offset=${offset}&include=musicinfo&audioformat=mp32`;

  // Add search query if provided
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch tracks");
  }

  const data = await response.json();

  // Jamendo API might not return x-total-count in headers as expected
  // Using a fallback approach to determine if there are more tracks
  const tracks = data.results.map(
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

  return {
    tracks,
    headers: {
      // If we can't get the total count from headers, we'll use the presence of tracks
      // to determine if there might be more (if we got a full page of results)
      totalCount: parseInt(data.headers?.["x-total-count"] || "0", 10),
      resultsCount: tracks.length,
    },
  };
}
