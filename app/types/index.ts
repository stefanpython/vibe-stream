export interface Track {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_name?: string;
  audio_url: string;
  image_url: string;
}

export interface PlaylistType {
  tracks: Track[];
  currentTrackIndex: number;
}
