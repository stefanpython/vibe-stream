"use client";

import { useState, useEffect, useRef } from "react";
import { fetchTracks } from "./lib/api";
import { Track } from "./types";
import AudioPlayer from "./components/Player/AudioPlayer";
import TrackCard from "./components/TrackList/TrackCard";
import SearchInput from "./components/SearchInput";
import { Music2, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadMoreProgress, setLoadMoreProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const limit = 20;

  useEffect(() => {
    loadTracks();

    // Simulate loading progress for better UX
    startProgressTimer(setLoadingProgress);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Effect to reload tracks when search query changes
  useEffect(() => {
    loadTracks(true);
  }, [searchQuery]);

  const startProgressTimer = (
    setProgressFn: React.Dispatch<React.SetStateAction<number>>
  ) => {
    // Reset progress
    setProgressFn(0);

    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    // Start new timer
    const totalLoadTime = 20; // seconds
    const interval = 100; // ms
    const steps = (totalLoadTime * 1000) / interval;
    const increment = 100 / steps;

    progressTimerRef.current = setInterval(() => {
      setProgressFn((prev) => {
        const newProgress = prev + increment;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, interval);

    // Clear timer after total load time
    setTimeout(() => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }, totalLoadTime * 1000);
  };

  async function loadTracks(reset = true) {
    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
        startProgressTimer(setLoadingProgress);
      } else {
        setIsLoadingMore(true);
        startProgressTimer(setLoadMoreProgress);
      }

      const currentOffset = reset ? 0 : offset;
      const result = await fetchTracks(limit, currentOffset, searchQuery);

      if (reset) {
        setTracks(result.tracks);
      } else {
        setTracks((prev) => [...prev, ...result.tracks]);
      }

      // Check if there are more tracks to load
      // If we received a full page of results, assume there are more
      const receivedFullPage = result.tracks.length >= limit;
      const newOffset = currentOffset + result.tracks.length;
      setOffset(newOffset);

      // If the API doesn't provide a reliable total count, we'll use the number of tracks returned
      // If we got fewer tracks than requested, assume we've reached the end
      setHasMore(receivedFullPage);
    } catch (err) {
      console.log(err);
      setError("Failed to load tracks. Please try again later.");
    } finally {
      if (reset) {
        setIsLoading(false);
        setLoadingProgress(100);
      } else {
        setIsLoadingMore(false);
        setLoadMoreProgress(100);
      }

      // Clear the progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }
  }

  const loadMoreTracks = () => {
    if (hasMore) {
      loadTracks(false);
    }
  };

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shadow-lg p-2 rounded-xl bg-background py-4">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Music Player</h1>
          </div>
          <SearchInput onSearch={handleSearch} />
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
        ) : tracks.length === 0 ? (
          <div className="text-center p-12 bg-accent/50 rounded-lg">
            <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No tracks found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "No tracks available. Try again later."}
            </p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-6 p-3 bg-accent/50 rounded-lg">
                <p className="text-sm">
                  Showing results for:{" "}
                  <span className="font-medium">`{searchQuery}`</span>
                </p>
              </div>
            )}

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

            <div className="mt-8 flex justify-center">
              <Button
                onClick={loadMoreTracks}
                disabled={isLoadingMore || !hasMore}
                className="px-6 relative min-w-[150px] h-10"
              >
                {isLoadingMore ? (
                  <>
                    <div className="absolute inset-0 overflow-hidden rounded-md">
                      <div
                        className="h-full bg-primary/20 transition-all duration-300"
                        style={{ width: `${loadMoreProgress}%` }}
                      ></div>
                    </div>
                    <div className="relative flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading... {Math.round(loadMoreProgress)}%
                    </div>
                  </>
                ) : hasMore ? (
                  "Load More"
                ) : (
                  "No More Tracks"
                )}
              </Button>
            </div>
          </>
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
