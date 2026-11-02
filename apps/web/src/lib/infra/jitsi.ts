import {
	createHash,
	createHmac,
	randomBytes,
	timingSafeEqual,
} from "node:crypto";

import { ENV } from "@/env.server";
import { CommonError } from "@/lib/utils/error";

/*
 * Jitsi Meet (docker/jitsi). Helsa signs an HS256 JWT per participant; the
 * Prosody `token_affiliation` module makes `context.user.moderator: true` the
 * room moderator. Guests join with no token.
 */

/** XMPP domain inside the Jitsi containers; the token's `sub`. */
const JITSI_XMPP_DOMAIN = "meet.jitsi";

export class VideoNotConfigured extends CommonError {
	constructor() {
		super(
			"Las videollamadas no están configuradas (JITSI_URL, JITSI_APP_SECRET).",
		);
	}
}

export type JitsiServer = {
	/** "localhost:8443": what the IFrame API calls the domain. */
	domain: string;
	/** Where the IFrame API script is served. */
	scriptUrl: string;
};

function settings() {
	const url = ENV.JITSI_URL;
	const secret = ENV.JITSI_APP_SECRET;
	if (!url || !secret) throw new VideoNotConfigured();
	return {
		url: new URL(url),
		secret,
		appId: ENV.JITSI_APP_ID || "helsa",
		audience: ENV.JITSI_AUDIENCE || "helsa-video",
	};
}

export function jitsiServer(): JitsiServer {
	const { url } = settings();
	return {
		domain: url.host,
		scriptUrl: new URL("/external_api.js", url).toString(),
	};
}

/** Jitsi room names are lowercase; this one can't be guessed from the appointment. */
export function newRoomName() {
	return `helsa-${randomBytes(12).toString("hex")}`;
}

type TokenInput = {
	room: string;
	user: {
		id: string;
		name: string;
		email?: string | null;
		avatar?: string | null;
	};
	moderator: boolean;
	notBefore: Date;
	expiresAt: Date;
};

const base64url = (value: string | Buffer) =>
	Buffer.from(value).toString("base64url");

/** JWT accepted by Prosody's token_verification for one room. */
export function signJitsiToken(data: TokenInput) {
	const { secret, appId, audience } = settings();
	const header = { alg: "HS256", typ: "JWT" };
	const payload = {
		iss: appId,
		aud: audience,
		sub: JITSI_XMPP_DOMAIN,
		room: data.room,
		nbf: Math.floor(data.notBefore.getTime() / 1000),
		exp: Math.floor(data.expiresAt.getTime() / 1000),
		context: {
			user: {
				id: data.user.id,
				name: data.user.name,
				email: data.user.email ?? undefined,
				avatar: data.user.avatar ?? undefined,
				moderator: data.moderator,
			},
		},
	};
	const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
	const signature = createHmac("sha256", secret)
		.update(unsigned)
		.digest("base64url");
	return `${unsigned}.${signature}`;
}

/**
 * The secret part of a patient's join link. Derived from the room id, so the
 * therapist can copy the same link as many times as needed; only its hash is stored.
 */
export function guestKey(room_id: string) {
	return createHmac("sha256", ENV.BETTER_AUTH_SECRET)
		.update(`video-guest:${room_id}`)
		.digest("base64url")
		.slice(0, 32);
}

export function hashGuestKey(key: string) {
	return createHash("sha256").update(key).digest();
}

export function isGuestKey(key: string, stored: Buffer | null) {
	if (!stored) return false;
	const given = hashGuestKey(key);
	return given.length === stored.length && timingSafeEqual(given, stored);
}
