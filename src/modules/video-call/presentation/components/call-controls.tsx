"use client";

import {
  Camera,
  ClipboardPlus,
  Headphones,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { cn } from "@/modules/shared/presentation/lib/utils";
import type { JitsiCurrentDevices, JitsiDevice, JitsiDevices } from "../hooks/use-jitsi";
import { DevicePicker } from "./device-picker";

type CallControlsProps = {
  isMicMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  canManageConsultation: boolean;
  isDoctorPanelOpen: boolean;
  unreadMessages: number;
  devices: JitsiDevices;
  currentDevices: JitsiCurrentDevices;
  onToggleMicAction: () => void;
  onToggleCameraAction: () => void;
  onToggleScreenShareAction: () => void;
  onToggleChatAction: () => void;
  onToggleDoctorPanelAction: () => void;
  onHangupAction: () => void;
  onSelectAudioInputAction: (device: JitsiDevice) => void;
  onSelectAudioOutputAction: (device: JitsiDevice) => void;
  onSelectVideoInputAction: (device: JitsiDevice) => void;
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
        "group relative flex size-11 items-center justify-center rounded-full border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        "active:scale-95",
        active
          ? "border-border bg-background text-foreground hover:bg-muted"
          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        danger && "size-12 border-transparent bg-destructive text-white hover:bg-destructive/90",
        hasOptions && "rounded-r-none",
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
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
  canManageConsultation,
  isDoctorPanelOpen,
  unreadMessages,
  devices,
  currentDevices,
  onToggleMicAction,
  onToggleCameraAction,
  onToggleScreenShareAction,
  onToggleChatAction,
  onToggleDoctorPanelAction,
  onHangupAction,
  onSelectAudioInputAction,
  onSelectAudioOutputAction,
  onSelectVideoInputAction,
}: CallControlsProps) => {
  return (
    <div className="flex items-center justify-center px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/70 bg-background/95 px-3 py-2 shadow-lg">
        <div className="flex  items-center gap-0">
          <ControlButton
            active={!isMicMuted}
            onClick={onToggleMicAction}
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
                onSelect: onSelectAudioInputAction,
                emptyLabel: "Sin micrófonos disponibles",
              },
              {
                title: "Salida de audio",
                icon: <Headphones className="size-3.5" />,
                devices: devices.audioOutput,
                currentDeviceId: currentDevices.audioOutput?.deviceId,
                onSelect: onSelectAudioOutputAction,
                emptyLabel: "Sin altavoces disponibles",
              },
            ]}
          />
        </div>

        <div className="flex items-center gap-0">
          <ControlButton
            active={!isCameraMuted}
            onClick={onToggleCameraAction}
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
                onSelect: onSelectVideoInputAction,
                emptyLabel: "Sin cámaras disponibles",
              },
            ]}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <ControlButton
            active={!isScreenSharing}
            onClick={onToggleScreenShareAction}
            label={isScreenSharing ? "Detener compartir" : "Compartir pantalla"}
          >
            <MonitorUp className="size-5" />
          </ControlButton>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ControlButton
            active={!isChatOpen}
            onClick={onToggleChatAction}
            label="Chat"
            badge={isChatOpen ? 0 : unreadMessages}
          >
            <MessageSquare className="size-5" />
          </ControlButton>
        </div>

        {canManageConsultation ? (
          <div className="flex flex-col items-center gap-1">
            <ControlButton
              active={isDoctorPanelOpen}
              onClick={onToggleDoctorPanelAction}
              label={isDoctorPanelOpen ? "Cerrar panel clínico" : "Abrir panel clínico"}
            >
              <ClipboardPlus className="size-5" />
            </ControlButton>
          </div>
        ) : null}

        <div className="mx-1 hidden h-10 w-px self-center bg-border md:block" />

        <div className="flex flex-col items-center gap-1">
          <ControlButton danger onClick={onHangupAction} label="Finalizar llamada">
            <PhoneOff className="size-5" />
          </ControlButton>
        </div>
      </div>
    </div>
  );
};

