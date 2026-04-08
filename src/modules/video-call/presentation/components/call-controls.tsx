"use client";

import { Camera, Headphones, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react";
import type { JitsiCurrentDevices, JitsiDevice, JitsiDevices } from "../hooks/use-jitsi";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { DevicePicker } from "./device-picker";

type CallControlsProps = {
  isMicMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  unreadMessages: number;
  devices: JitsiDevices;
  currentDevices: JitsiCurrentDevices;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onHangup: () => void;
  onSelectAudioInput: (device: JitsiDevice) => void;
  onSelectAudioOutput: (device: JitsiDevice) => void;
  onSelectVideoInput: (device: JitsiDevice) => void;
};

type ControlButtonProps = {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  children: React.ReactNode;
  hasOptions?: boolean;
};

const ControlButton = ({ active, danger, onClick, label, badge, children, hasOptions = false }: ControlButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "group relative flex size-12 items-center justify-center border rounded-full transition-all duration-200",
        "backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        "active:scale-95",
        active
          ? "border-white/10 bg-white/10 text-white hover:bg-white/15"
          : "border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/25",
        danger && "size-14 border-red-500/40 bg-red-500 text-white hover:bg-red-600",
        hasOptions && "rounded-r-none",
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-[#0a0a0f]">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
};

export const CallControls = ({
  isMicMuted,
  isCameraMuted,
  isScreenSharing,
  isChatOpen,
  unreadMessages,
  devices,
  currentDevices,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onHangup,
  onSelectAudioInput,
  onSelectAudioOutput,
  onSelectVideoInput,
}: CallControlsProps) => {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 shadow-2xl backdrop-blur-xl">
        <div className="flex  items-center gap-0">
          <ControlButton
            active={!isMicMuted}
            onClick={onToggleMic}
            label={isMicMuted ? "Activar micrófono" : "Silenciar micrófono"}
            hasOptions
          >
            {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </ControlButton>
          <DevicePicker
            label="Configuración de audio"
            sections={[
              {
                title: "Micrófono",
                icon: <Mic className="size-3.5" />,
                devices: devices.audioInput,
                currentDeviceId: currentDevices.audioInput?.deviceId,
                onSelect: onSelectAudioInput,
                emptyLabel: "Sin micrófonos disponibles",
              },
              {
                title: "Salida de audio",
                icon: <Headphones className="size-3.5" />,
                devices: devices.audioOutput,
                currentDeviceId: currentDevices.audioOutput?.deviceId,
                onSelect: onSelectAudioOutput,
                emptyLabel: "Sin altavoces disponibles",
              },
            ]}
          />
        </div>

        <div className="flex items-center gap-0">
          <ControlButton
            active={!isCameraMuted}
            onClick={onToggleCamera}
            label={isCameraMuted ? "Activar cámara" : "Apagar cámara"}
            hasOptions
          >
            {isCameraMuted ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </ControlButton>
          <DevicePicker
            label="Configuración de cámara"
            sections={[
              {
                title: "Cámara",
                icon: <Camera className="size-3.5" />,
                devices: devices.videoInput,
                currentDeviceId: currentDevices.videoInput?.deviceId,
                onSelect: onSelectVideoInput,
                emptyLabel: "Sin cámaras disponibles",
              },
            ]}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <ControlButton
            active={!isScreenSharing}
            onClick={onToggleScreenShare}
            label={isScreenSharing ? "Detener compartir" : "Compartir pantalla"}
          >
            <MonitorUp className="size-5" />
          </ControlButton>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ControlButton
            active={!isChatOpen}
            onClick={onToggleChat}
            label="Chat"
            badge={isChatOpen ? 0 : unreadMessages}
          >
            <MessageSquare className="size-5" />
          </ControlButton>
        </div>

        <div className="mx-1 h-12 w-px self-center bg-white/10" />

        <div className="flex flex-col items-center gap-1">
          <ControlButton danger onClick={onHangup} label="Finalizar llamada">
            <PhoneOff className="size-5" />
          </ControlButton>
        </div>
      </div>
    </div>
  );
};

