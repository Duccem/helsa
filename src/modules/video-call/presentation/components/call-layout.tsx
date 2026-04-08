"use client";

import { Loader2 } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { authClient } from "@/modules/auth/infrastructure/auth-client";
import { useJitsi } from "../hooks/use-jitsi";
import { CallChat } from "./call-chat";
import { CallControls } from "./call-controls";
import { CallHeader } from "./call-header";

const CONTAINER_ID = "jitsi-container";

export const CallLayout = () => {
  const { data } = authClient.useSession();
  const [token] = useQueryState("token");
  const [appointmentId] = useQueryState("appointmentId", parseAsString.withDefault(""));

  const displayName = data?.user.name ?? "Usuario";

  const { controls, state } = useJitsi({
    containerId: CONTAINER_ID,
    jwt: token ?? "",
    roomName: "consulta-" + appointmentId,
    userInfo: {
      displayName,
      email: data?.user.email ?? "",
    },
  });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />

      <div id={CONTAINER_ID} className="jitsi-custom absolute inset-0 h-full w-full" />

      <CallHeader
        title="Consulta médica"
        participantsCount={state.participantsCount}
        isRecording={state.isRecording}
        callStartedAt={state.callStartedAt}
      />

      <CallControls
        isMicMuted={state.isMicMuted}
        isCameraMuted={state.isCameraMuted}
        isScreenSharing={state.isScreenSharing}
        isChatOpen={state.isChatOpen}
        unreadMessages={state.unreadMessages}
        devices={state.devices}
        currentDevices={state.currentDevices}
        onToggleMic={controls.toggleMic}
        onToggleCamera={controls.toggleCamera}
        onToggleScreenShare={controls.toggleScreenShare}
        onToggleChat={controls.toggleChat}
        onHangup={controls.hangup}
        onSelectAudioInput={controls.setAudioInputDevice}
        onSelectAudioOutput={controls.setAudioOutputDevice}
        onSelectVideoInput={controls.setVideoInputDevice}
      />

      <CallChat
        open={state.isChatOpen}
        messages={state.messages}
        currentUserName={displayName}
        onSend={controls.sendMessage}
        onClose={controls.toggleChat}
      />

      <style jsx global>{`
        .jitsi-custom iframe {
          border: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: #0a0a0f !important;
        }
      `}</style>
    </div>
  );
};

