"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { VideoSession } from "@/lib/core/video/use-cases/load-video-session";

import { callConfig, type JitsiApi, loadJitsi } from "./jitsi";

export type CallJoin = NonNullable<VideoSession["join"]>;

export type CallStatus =
	/** Script loading, or waiting for the therapist / to be admitted. */
	| "connecting"
	| "joined"
	/** This person left or the session was ended for everyone. */
	| "left"
	| "kicked"
	| "error";

export type CallPerson = { id: string; name: string };

type Options = {
	join: CallJoin;
	displayName: string;
	startAudioMuted: boolean;
	startVideoMuted: boolean;
	/** Someone else entered the call (the therapist uses it to mark the start). */
	onRemoteJoined?: () => void;
};

const fallbackName = "Participante";

/** Mounts the Jitsi call in `container` and mirrors its state for Helsa's controls. */
export function useJitsiCall(options: Options) {
	const container = useRef<HTMLDivElement>(null);
	const api = useRef<JitsiApi | null>(null);
	const onRemoteJoined = useRef(options.onRemoteJoined);
	useEffect(() => {
		onRemoteJoined.current = options.onRemoteJoined;
	});

	const [status, setStatus] = useState<CallStatus>("connecting");
	const [error, setError] = useState<string | null>(null);
	const [audioMuted, setAudioMuted] = useState(options.startAudioMuted);
	const [videoMuted, setVideoMuted] = useState(options.startVideoMuted);
	const [sharing, setSharing] = useState(false);
	const [people, setPeople] = useState<CallPerson[]>([]);
	const [knocking, setKnocking] = useState<CallPerson[]>([]);
	const [lobby, setLobby] = useState(false);
	const [joinedAt, setJoinedAt] = useState<number | null>(null);

	const { join, displayName, startAudioMuted, startVideoMuted } = options;

	useEffect(() => {
		let disposed = false;
		const parentNode = container.current;
		if (!parentNode) return;

		loadJitsi(join.scriptUrl)
			.then((JitsiMeetExternalAPI) => {
				if (disposed) return;
				const instance = new JitsiMeetExternalAPI(join.domain, {
					roomName: join.roomName,
					parentNode,
					width: "100%",
					height: "100%",
					lang: "es",
					...(join.jwt ? { jwt: join.jwt } : {}),
					userInfo: {
						displayName,
						...(join.email ? { email: join.email } : {}),
					},
					...callConfig({
						moderator: join.moderator,
						hasToken: Boolean(join.jwt),
						startAudioMuted,
						startVideoMuted,
					}),
				});
				api.current = instance;
				const on = <T>(event: string, listener: (payload: T) => void) =>
					instance.addListener(event, listener as (payload: never) => void);

				on("videoConferenceJoined", () => {
					setStatus("joined");
					setJoinedAt(Date.now());
					if (join.moderator) {
						// Waiting room on: the therapist admits whoever arrives.
						instance.executeCommand("toggleLobby", true);
						setLobby(true);
					}
				});
				on<{ id: string; displayName?: string }>("participantJoined", (p) => {
					setPeople((list) => [
						...list.filter((item) => item.id !== p.id),
						{ id: p.id, name: p.displayName || fallbackName },
					]);
					setKnocking((list) =>
						list.filter((item) => item.name !== p.displayName),
					);
					onRemoteJoined.current?.();
				});
				on<{ id: string }>("participantLeft", (p) => {
					setPeople((list) => list.filter((item) => item.id !== p.id));
				});
				on<{ id: string; displayname?: string }>("displayNameChange", (p) => {
					setPeople((list) =>
						list.map((item) =>
							item.id === p.id
								? { ...item, name: p.displayname || item.name }
								: item,
						),
					);
				});
				on<{ participant: { id: string; name?: string } }>(
					"knockingParticipant",
					({ participant }) => {
						setKnocking((list) => [
							...list.filter((item) => item.id !== participant.id),
							{ id: participant.id, name: participant.name || fallbackName },
						]);
					},
				);
				on<{ kicked: { id: string; local?: boolean } }>(
					"participantKickedOut",
					({ kicked }) => {
						if (kicked.local) setStatus("kicked");
						else
							setPeople((list) => list.filter((item) => item.id !== kicked.id));
					},
				);
				on<{ muted: boolean }>("audioMuteStatusChanged", ({ muted }) =>
					setAudioMuted(muted),
				);
				on<{ muted: boolean }>("videoMuteStatusChanged", ({ muted }) =>
					setVideoMuted(muted),
				);
				on<{ on: boolean }>("screenSharingStatusChanged", (event) =>
					setSharing(event.on),
				);
				const leave = () =>
					setStatus((current) => (current === "kicked" ? current : "left"));
				on("videoConferenceLeft", leave);
				on("readyToClose", leave);
				on<{ error?: { isFatal?: boolean; message?: string } }>(
					"errorOccurred",
					({ error: details }) => {
						if (!details?.isFatal) return;
						setError(details.message ?? null);
						setStatus("error");
					},
				);
			})
			.catch((reason: Error) => {
				if (disposed) return;
				setError(reason.message);
				setStatus("error");
			});

		return () => {
			disposed = true;
			api.current?.dispose();
			api.current = null;
		};
	}, [join, displayName, startAudioMuted, startVideoMuted]);

	const command = useCallback((name: string, ...args: unknown[]) => {
		api.current?.executeCommand(name, ...args);
	}, []);

	return {
		container,
		api,
		status,
		error,
		audioMuted,
		videoMuted,
		sharing,
		people,
		knocking,
		lobby,
		joinedAt,
		toggleAudio: () => command("toggleAudio"),
		toggleVideo: () => command("toggleVideo"),
		toggleShare: () => command("toggleShareScreen"),
		hangup: () => command("hangup"),
		/** Therapist only: the server refuses these to anyone else. */
		kick: (id: string) => command("kickParticipant", id),
		endForAll: () => command("endConference"),
		setLobby: (on: boolean) => {
			command("toggleLobby", on);
			setLobby(on);
		},
		answerKnock: (id: string, approved: boolean) => {
			command("answerKnockingParticipant", id, approved);
			setKnocking((list) => list.filter((item) => item.id !== id));
		},
	};
}

export type JitsiCall = ReturnType<typeof useJitsiCall>;
