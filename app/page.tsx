"use client";

import { useState, useEffect } from "react";
import { fetchTracks } from "./lib/api";
import { Track } from "./types";
import AudioPlayer from "./components/Player/AudioPlayer";
import TrackCard from "./components/TrackList/TrackCard";
import { Music2 } from "lucide-react";

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (err) {
      console.log(err);
      setError("Failed to load tracks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleTrackSelect = (index: number) => {
    if (currentTrackIndex === index) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8 shadow-lg py-5 px-4">
          <Music2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Vibe Stream</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={isPlaying}
                isActive={currentTrackIndex === index}
                onPlay={() => handleTrackSelect(index)}
              />
            ))}
          </div>
        )}
      </div>

      <AudioPlayer
        currentTrack={currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </main>
  );
}
