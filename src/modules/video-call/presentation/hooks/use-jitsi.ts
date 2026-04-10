import { useCallback, useEffect, useRef, useState } from "react";

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

export type JitsiChatMessage = {
  id: string;
  from: string;
  message: string;
  privateMessage: boolean;
  timestamp: number;
};

export type JitsiDevice = {
  deviceId: string;
  label: string;
  groupId?: string;
  kind?: string;
};

export type JitsiDevices = {
  audioInput: JitsiDevice[];
  audioOutput: JitsiDevice[];
  videoInput: JitsiDevice[];
};

export type JitsiCurrentDevices = {
  audioInput?: JitsiDevice;
  audioOutput?: JitsiDevice;
  videoInput?: JitsiDevice;
};

export type JitsiState = {
  isReady: boolean;
  isMicMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isRecording: boolean;
  hasCallEnded: boolean;
  participantsCount: number;
  messages: JitsiChatMessage[];
  unreadMessages: number;
  callStartedAt: number | null;
  callEndedAt: number | null;
  devices: JitsiDevices;
  currentDevices: JitsiCurrentDevices;
};

export function useJitsi({ containerId, roomName, jwt, userInfo, onEvents = {} }: UseJitsiOptions) {
  const apiRef = useRef<any>(null);

  const [state, setState] = useState<JitsiState>({
    isReady: false,
    isMicMuted: false,
    isCameraMuted: false,
    isScreenSharing: false,
    isChatOpen: false,
    isRecording: false,
    hasCallEnded: false,
    participantsCount: 1,
    messages: [],
    unreadMessages: 0,
    callStartedAt: null,
    callEndedAt: null,
    devices: { audioInput: [], audioOutput: [], videoInput: [] },
    currentDevices: {},
  });

  const loadScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if ((window as any).JitsiMeetExternalAPI) return resolve(1);
      const script = document.createElement("script");
      script.src = `https://${process.env.NEXT_PUBLIC_JITSI_DOMAIN}/external_api.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const teardownConference = useCallback(
    (markAsEnded = false) => {
      apiRef.current?.dispose?.();
      apiRef.current = null;

      const container = document.getElementById(containerId);
      container?.replaceChildren();

      if (markAsEnded) {
        setState((s) => ({
          ...s,
          hasCallEnded: true,
          isReady: false,
          isRecording: false,
          isScreenSharing: false,
          participantsCount: 1,
          callEndedAt: Date.now(),
        }));
      }
    },
    [containerId],
  );

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await loadScript();
      if (!mounted || !jwt || !document.getElementById(containerId)) return;

      const api = new (window as any).JitsiMeetExternalAPI(process.env.NEXT_PUBLIC_JITSI_DOMAIN, {
        roomName,
        parentNode: document.getElementById(containerId),
        jwt,
        userInfo,
        width: "100%",
        height: "100%",
        configOverwrite: {
          startWithVideoMuted: false,
          startWithAudioMuted: false,
          prejoinPageEnabled: false,
          disableThirdPartyRequests: true,
          enableNoisyMicDetection: true,
          disableDeepLinking: true,
          hideConferenceSubject: true,
          hideConferenceTimer: true,
          hideParticipantsStats: true,
          hideDisplayName: false,
          disableTileView: false,
          toolbarButtons: [],
          notifications: [],
          disableInviteFunctions: true,
          disableProfile: true,
          readOnlyName: true,
          filmstrip: {
            disabled: false,
          },
          prejoinConfig: {
            enabled: false,
          },
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          DEFAULT_BACKGROUND: "#0a0a0f",
          DEFAULT_REMOTE_DISPLAY_NAME: "Participante",
          DISABLE_VIDEO_BACKGROUND: false,
          DISABLE_FOCUS_INDICATOR: true,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          RECENT_LIST_ENABLED: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          DISABLE_PRESENCE_STATUS: true,
          DISABLE_RINGING: true,
          FILM_STRIP_MAX_HEIGHT: 0,
          VERTICAL_FILMSTRIP: false,
          TILE_VIEW_MAX_COLUMNS: 2,
        },
      });

      apiRef.current = api;

      const refreshDevices = async () => {
        try {
          const [available, current] = await Promise.all([
            api.getAvailableDevices?.() ?? Promise.resolve({}),
            api.getCurrentDevices?.() ?? Promise.resolve({}),
          ]);
          setState((s) => ({
            ...s,
            devices: {
              audioInput: available?.audioInput ?? [],
              audioOutput: available?.audioOutput ?? [],
              videoInput: available?.videoInput ?? [],
            },
            currentDevices: {
              audioInput: current?.audioInput,
              audioOutput: current?.audioOutput,
              videoInput: current?.videoInput,
            },
          }));
        } catch {}
      };

      const markCallAsEnded = () => teardownConference(true);

      api.addEventListener("videoConferenceJoined", () => {
        setState((s) => ({
          ...s,
          isReady: true,
          hasCallEnded: false,
          callStartedAt: Date.now(),
          callEndedAt: null,
        }));
        refreshDevices();
      });

      api.addEventListener("videoConferenceLeft", markCallAsEnded);
      api.addEventListener("readyToClose", markCallAsEnded);

      api.addEventListener("deviceListChanged", refreshDevices);

      api.addEventListener("audioMuteStatusChanged", (e: any) => {
        setState((s) => ({ ...s, isMicMuted: !!e.muted }));
      });

      api.addEventListener("videoMuteStatusChanged", (e: any) => {
        setState((s) => ({ ...s, isCameraMuted: !!e.muted }));
      });

      api.addEventListener("screenSharingStatusChanged", (e: any) => {
        setState((s) => ({ ...s, isScreenSharing: !!e.on }));
      });

      api.addEventListener("recordingStatusChanged", (e: any) => {
        setState((s) => ({ ...s, isRecording: !!e.on }));
      });

      const recomputeParticipants = () => {
        try {
          const count = api.getNumberOfParticipants?.() ?? 1;
          setState((s) => ({ ...s, participantsCount: count }));
        } catch {}
      };

      api.addEventListener("participantJoined", recomputeParticipants);
      api.addEventListener("participantLeft", recomputeParticipants);

      api.addEventListener("incomingMessage", (e: any) => {
        setState((s) => ({
          ...s,
          messages: [
            ...s.messages,
            {
              id: `${Date.now()}-${Math.random()}`,
              from: e.nick || e.from || "Participante",
              message: e.message,
              privateMessage: !!e.privateMessage,
              timestamp: Date.now(),
            },
          ],
          unreadMessages: s.isChatOpen ? 0 : s.unreadMessages + 1,
        }));
      });

      api.addEventListener("outgoingMessage", (e: any) => {
        setState((s) => ({
          ...s,
          messages: [
            ...s.messages,
            {
              id: `${Date.now()}-${Math.random()}`,
              from: userInfo.displayName,
              message: e.message,
              privateMessage: false,
              timestamp: Date.now(),
            },
          ],
        }));
      });

      Object.entries(onEvents).forEach(([event, handler]) => {
        api.addEventListener(event, handler);
      });
    };
    init();

    return () => {
      mounted = false;
      teardownConference(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, jwt, teardownConference]);

  const controls = {
    toggleMic: () => apiRef.current?.executeCommand("toggleAudio"),
    toggleCamera: () => apiRef.current?.executeCommand("toggleVideo"),
    toggleScreenShare: () => apiRef.current?.executeCommand("toggleShareScreen"),
    toggleTileView: () => apiRef.current?.executeCommand("toggleTileView"),
    toggleChat: () =>
      setState((s) => ({ ...s, isChatOpen: !s.isChatOpen, unreadMessages: !s.isChatOpen ? 0 : s.unreadMessages })),
    hangup: () => {
      apiRef.current?.executeCommand("hangup");
      teardownConference(true);
    },
    sendMessage: (msg: string) => apiRef.current?.executeCommand("sendChatMessage", msg),
    startRecording: () => apiRef.current?.executeCommand("startRecording", { mode: "file" }),
    stopRecording: () => apiRef.current?.executeCommand("stopRecording", "file"),
    setAudioInputDevice: (device: JitsiDevice) => {
      apiRef.current?.setAudioInputDevice?.(device.label, device.deviceId);
      setState((s) => ({ ...s, currentDevices: { ...s.currentDevices, audioInput: device } }));
    },
    setAudioOutputDevice: (device: JitsiDevice) => {
      apiRef.current?.setAudioOutputDevice?.(device.label, device.deviceId);
      setState((s) => ({ ...s, currentDevices: { ...s.currentDevices, audioOutput: device } }));
    },
    setVideoInputDevice: (device: JitsiDevice) => {
      apiRef.current?.setVideoInputDevice?.(device.label, device.deviceId);
      setState((s) => ({ ...s, currentDevices: { ...s.currentDevices, videoInput: device } }));
    },
  };

  return { controls, apiRef, state };
}

