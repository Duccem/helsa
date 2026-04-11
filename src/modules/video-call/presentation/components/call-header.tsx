"use client";

import { Circle, HeartPulse, Sparkles, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { SidebarTrigger } from "@/modules/shared/presentation/components/ui/sidebar";

type CallHeaderProps = {
  title: string;
  participantsCount: number;
  isRecording: boolean;
  callStartedAt: number | null;
  showLiveAssistant?: boolean;
  showLiveVitals?: boolean;
  canManageConsultation?: boolean;
  onToggleLiveAssistantAction?: () => void;
  onToggleLiveVitalsAction?: () => void;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

export const CallHeader = ({
  title,
  participantsCount,
  isRecording,
  callStartedAt,
  showLiveAssistant = true,
  showLiveVitals = true,
  canManageConsultation = false,
  onToggleLiveAssistantAction,
  onToggleLiveVitalsAction,
}: CallHeaderProps) => {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!callStartedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [callStartedAt]);

  const duration = callStartedAt && now ? formatDuration(now - callStartedAt) : "00:00";

  return (
    <div className="flex items-center justify-between gap-4  px-4 py-3  md:px-4">
      <div className="flex min-w-0 items-center gap-3 bg-background px-3 py-2 rounded-2xl">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm">
          <Video className="size-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Live
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">Videollamada clínica activa</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SidebarTrigger className="rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground !p-3" />

        {onToggleLiveVitalsAction && canManageConsultation ? (
          <Button
            type="button"
            variant={showLiveVitals ? "default" : "secondary"}
            size="sm"
            onClick={onToggleLiveVitalsAction}
            className="rounded-full"
          >
            <HeartPulse data-icon="inline-start" />
            Vitals
          </Button>
        ) : null}

        <div className="hidden items-center rounded-full border border-border bg-background px-3 py-1.5 sm:flex">
          <span className="font-mono text-xs text-foreground tabular-nums">{duration}</span>
        </div>

        {isRecording ? (
          <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 sm:flex">
            <Circle className="size-3 animate-pulse fill-primary text-primary" />
            <span className="text-xs font-medium text-primary">AI Recording</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{participantsCount}</span>
        </div>
      </div>
    </div>
  );
};
