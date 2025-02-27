"use client";

import { useState, useEffect } from "react";
import { fetchTracks } from "./lib/api";
import { Track } from "./types";
import AudioPlayer from "./components/Player/AudioPlayer";
import TrackCard from "./components/TrackList/TrackCard";
import { Music2 } from "lucide-react";
import { Progress } from "./components/ui/progress";

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();

    // Simulate loading progress for better UX
    const totalLoadTime = 20; // seconds
    const interval = 100; // ms
    const steps = (totalLoadTime * 1000) / interval;
    const increment = 100 / steps;

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + increment;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, interval);

    return () => clearInterval(progressTimer);
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
      setLoadingProgress(100);
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
        <div className="flex items-center gap-3 mb-8">
          <Music2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Music Player</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="w-64 space-y-2">
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Loading music library... {Math.round(loadingProgress)}%
              </p>
              <p className="text-center text-xs text-muted-foreground">
                This may take up to 20 seconds
              </p>
            </div>
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
