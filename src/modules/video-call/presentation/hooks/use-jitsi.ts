import { useCallback, useEffect, useRef } from "react";

export type UseJitsiOptions = {
  containerId: string;
  roomName: string;
  jwt: string;
  userInfo: {
    displayName: string;
    email: string;
  };
  onEvents?: Record<string, (event: any) => void>;
};

export function useJitsi({ containerId, roomName, jwt, userInfo, onEvents = {} }: UseJitsiOptions) {
  const apiRef = useRef(null);

  const loadScript = useCallback(() => {
    console.log("Cargando script de Jitsi...");
    return new Promise((resolve, reject) => {
      if ((window as any).JitsiMeetExternalAPI) return resolve(1);
      const script = document.createElement("script");
      script.src = `https://${process.env.NEXT_PUBLIC_JITSI_DOMAIN}/external_api.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log("Iniciando Jitsi con room:", roomName);
    const init = async () => {
      console.log("Cargando Jitsi...");
      await loadScript();
      if (!mounted || !jwt || !document.getElementById(containerId)) return;
      console.log("Inicializando JitsiMeetExternalAPI...");
      apiRef.current = new (window as any).JitsiMeetExternalAPI(process.env.NEXT_PUBLIC_JITSI_DOMAIN, {
        roomName,
        parentNode: document.getElementById(containerId),
        jwt,
        userInfo,
        configOverwrite: {
          startWithVideoMuted: false,
          startWithAudioMuted: false,
          prejoinPageEnabled: true,
          disableThirdPartyRequests: true,
          enableNoisyMicDetection: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ["microphone", "camera", "desktop", "chat", "recording", "hangup"],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: "#1a1a2e",
        },
      });
      Object.entries(onEvents).forEach(([event, handler]) => {
        (apiRef.current as any)?.addEventListener(event, handler);
      });
    };
    init();

    return () => {
      mounted = false;
      (apiRef.current as any)?.dispose();
      apiRef.current = null;
    };
  }, [roomName, jwt]);
  const controls = {
    muteMic: () => (apiRef.current as any)?.executeCommand("toggleAudio"),
    muteCamera: () => (apiRef.current as any)?.executeCommand("toggleVideo"),
    hangup: () => (apiRef.current as any)?.executeCommand("hangup"),
    sendMessage: (msg: any) => (apiRef.current as any)?.executeCommand("sendChatMessage", msg),
    startRecording: () =>
      (apiRef.current as any)?.executeCommand("startRecording", {
        mode: "file",
      }),
  };

  return { controls, apiRef };
}

