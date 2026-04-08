"use client";

import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { JitsiChatMessage } from "../hooks/use-jitsi";
import { cn } from "@/modules/shared/presentation/lib/utils";

type CallChatProps = {
  open: boolean;
  messages: JitsiChatMessage[];
  currentUserName: string;
  onSend: (message: string) => void;
  onClose: () => void;
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const CallChat = ({ open, messages, currentUserName, onSend, onClose }: CallChatProps) => {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col p-4 transition-all duration-300",
        open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Chat</h3>
            <p className="text-xs text-white/50">Mensajes de la llamada</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar chat"
            className="flex size-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm text-white/60">No hay mensajes aún</p>
              <p className="mt-1 text-xs text-white/40">Envía el primer mensaje a los participantes</p>
            </div>
          )}
          {messages.map((m) => {
            const isMine = m.from === currentUserName;
            return (
              <div key={m.id} className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
                {!isMine && <span className="px-1 text-[10px] font-medium text-white/50">{m.from}</span>}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    isMine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-white/10 text-white",
                  )}
                >
                  {m.message}
                </div>
                <span className="px-1 text-[10px] text-white/40">{formatTime(m.timestamp)}</span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-white/10 bg-black/30 p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Enviar mensaje"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
