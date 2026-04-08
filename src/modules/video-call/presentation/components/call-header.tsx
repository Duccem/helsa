"use client";

import { Circle, Users } from "lucide-react";
import { useEffect, useState } from "react";

type CallHeaderProps = {
  title: string;
  participantsCount: number;
  isRecording: boolean;
  callStartedAt: number | null;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

export const CallHeader = ({ title, participantsCount, isRecording, callStartedAt }: CallHeaderProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!callStartedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [callStartedAt]);

  const duration = callStartedAt ? formatDuration(now - callStartedAt) : "00:00";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl">
        <div className="flex size-2 items-center justify-center">
          <span className="absolute size-2 animate-ping rounded-full bg-emerald-400/60" />
          <span className="size-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-sm font-medium text-white">{title}</span>
        <div className="h-4 w-px bg-white/15" />
        <span className="font-mono text-xs text-white/70 tabular-nums">{duration}</span>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {isRecording && (
          <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-3 py-2 backdrop-blur-xl">
            <Circle className="size-3 animate-pulse fill-red-500 text-red-500" />
            <span className="text-xs font-medium text-red-200">Grabando</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
          <Users className="size-4 text-white/70" />
          <span className="text-xs font-medium text-white">{participantsCount}</span>
        </div>
      </div>
    </div>
  );
};
