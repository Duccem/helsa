/*
 * The slice of the Jitsi Meet IFrame API Helsa uses.
 * https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
 */

export type JitsiDevice = { deviceId: string; label: string; kind: string };

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

export interface JitsiApi {
	executeCommand(command: string, ...args: unknown[]): void;
	addListener(event: string, listener: (payload: never) => void): void;
	getAvailableDevices(): Promise<JitsiDevices>;
	getCurrentDevices(): Promise<JitsiCurrentDevices>;
	setAudioInputDevice(label: string, deviceId: string): void;
	setAudioOutputDevice(label: string, deviceId: string): void;
	setVideoInputDevice(label: string, deviceId: string): void;
	dispose(): void;
}

type JitsiConstructor = new (
	domain: string,
	options: Record<string, unknown>,
) => JitsiApi;

declare global {
	interface Window {
		JitsiMeetExternalAPI?: JitsiConstructor;
	}
}

let loading: Promise<JitsiConstructor> | null = null;

/** Loads `external_api.js` from the Jitsi server once per page. */
export function loadJitsi(scriptUrl: string) {
	if (window.JitsiMeetExternalAPI) {
		return Promise.resolve(window.JitsiMeetExternalAPI);
	}
	loading ??= new Promise<JitsiConstructor>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = scriptUrl;
		script.async = true;
		script.onload = () => {
			if (window.JitsiMeetExternalAPI) resolve(window.JitsiMeetExternalAPI);
			else reject(new Error("Jitsi script loaded without its API"));
		};
		script.onerror = () => {
			script.remove();
			loading = null;
			reject(new Error(`Could not load ${scriptUrl}`));
		};
		document.head.append(script);
	});
	return loading;
}

/** Jitsi's own toolbar is hidden; Helsa draws its own controls. */
export function callConfig(options: {
	moderator: boolean;
	hasToken: boolean;
	startAudioMuted: boolean;
	startVideoMuted: boolean;
}) {
	return {
		configOverwrite: {
			prejoinConfig: { enabled: false },
			startWithAudioMuted: options.startAudioMuted,
			startWithVideoMuted: options.startVideoMuted,
			toolbarButtons: [],
			defaultLanguage: "es",
			disableDeepLinking: true,
			disableInviteFunctions: true,
			hideConferenceSubject: true,
			hideConferenceTimer: true,
			hideParticipantsStats: true,
			disableShortcuts: true,
			// Names come from Helsa for signed-in people.
			readOnlyName: options.hasToken,
			lobby: { autoKnock: true, enableChat: false },
			securityUi: { hideLobbyButton: true, disableLobbyPassword: true },
			disableRemoteMute: !options.moderator,
			remoteVideoMenu: {
				disabled: !options.moderator,
				disableKick: !options.moderator,
				disableGrantModerator: true,
				disablePrivateChat: true,
			},
			participantsPane: { enabled: false },
			breakoutRooms: { hideAddRoomButton: true },
			disableReactions: true,
			disablePolls: true,
			disableSelfViewSettings: true,
			notifications: [],
			enableClosePage: false,
			welcomePage: { disabled: true },
		},
		interfaceConfigOverwrite: {
			SHOW_JITSI_WATERMARK: false,
			SHOW_WATERMARK_FOR_GUESTS: false,
			SHOW_BRAND_WATERMARK: false,
			SHOW_POWERED_BY: false,
			MOBILE_APP_PROMO: false,
			SHOW_CHROME_EXTENSION_BANNER: false,
			DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
		},
	};
}
