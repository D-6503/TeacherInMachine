'use client';
import { useState } from 'react';
import { Video } from '@/types';
import { Play, Clock, Globe, AlertTriangle } from 'lucide-react';

interface Props { videos: Video[]; }

function formatDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return null;
}

export default function VideoPlayer({ videos }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = videos[activeIdx];

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Play className="w-12 h-12 mb-3 opacity-30 animate-float" />
        <p className="text-sm font-semibold">No videos available for this topic yet.</p>
      </div>
    );
  }

  const ytEmbedUrl = getYouTubeEmbedUrl(active.url);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player */}
      <div className="lg:col-span-2">
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-sm border border-border">
          {ytEmbedUrl ? (
            <iframe
              key={active.url}
              src={ytEmbedUrl}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              key={active.url}
              src={active.url}
              controls
              className="w-full h-full"
              preload="metadata"
            />
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-bold text-lg text-foreground font-display">{active.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
              <Clock className="w-3 h-3 text-primary" /> {formatDuration(active.duration_seconds)}
            </span>
            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
              <Globe className="w-3 h-3 text-primary" /> {active.language.toUpperCase()}
            </span>
            {active.duration_seconds > 600 && (
              <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2 py-1 rounded-md">
                <AlertTriangle className="w-3 h-3" /> Over 10 min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Playlist</p>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveIdx(i)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                i === activeIdx
                  ? 'bg-brand-50 border-brand-200 shadow-sm'
                  : 'hover:bg-muted border-transparent'
              }`}
            >
              <p className={`text-sm font-bold leading-tight ${i === activeIdx ? 'text-primary' : 'text-foreground'}`}>
                {v.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> {formatDuration(v.duration_seconds)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
