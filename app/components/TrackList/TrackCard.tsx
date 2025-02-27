"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { Track } from "@/app/types";
import Image from "next/image";

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
}

export default function TrackCard({
  track,
  isPlaying,
  isActive,
  onPlay,
}: TrackCardProps) {
  return (
    <div
      className={`p-4 rounded-lg transition-colors ${
        isActive ? "bg-accent" : "hover:bg-accent/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Image
            src={track.image_url}
            alt={track.name}
            width={64} // 16 * 4 = 64px
            height={64} // 16 * 4 = 64px
            className="rounded-md object-cover"
          />
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
          >
            {isPlaying && isActive ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        <div>
          <h3 className="font-medium line-clamp-1">{track.name}</h3>
          <p className="text-sm text-muted-foreground">{track.artist_name}</p>
          {track.album_name && (
            <p className="text-xs text-muted-foreground mt-1">
              {track.album_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
