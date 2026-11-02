import {
	createCipheriv,
	createDecipheriv,
	createHash,
	hkdfSync,
	randomBytes,
} from "node:crypto";

import { ENV } from "@/env.server";
import { CommonError } from "@/lib/utils/error";

/*
 * Clinical data (notes, intake reason, files) is encrypted by the app before it
 * reaches the database or storage. Each therapist gets their own key, derived
 * from CLINICAL_ENCRYPTION_KEY, so one account's data never shares a key with
 * another's. `enc_key_version` is stored beside every value so the master key
 * can be rotated later.
 *
 * Layout: [format 1 byte][iv 12 bytes][auth tag 16 bytes][ciphertext]
 */

export const CURRENT_KEY_VERSION = 1;

const FORMAT = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;

export class EncryptionNotConfigured extends CommonError {
	constructor() {
		super(
			"El cifrado de datos clínicos no está configurado (CLINICAL_ENCRYPTION_KEY).",
		);
	}
}

export class EncryptionKeyUnavailable extends CommonError {
	constructor(version: number) {
		super(`No hay llave de cifrado para la versión ${version}.`);
	}
}

export function isEncryptionConfigured() {
	return Boolean(ENV.CLINICAL_ENCRYPTION_KEY);
}

function masterKey(version: number) {
	if (version !== CURRENT_KEY_VERSION) {
		throw new EncryptionKeyUnavailable(version);
	}
	const secret = ENV.CLINICAL_ENCRYPTION_KEY;
	if (!secret) throw new EncryptionNotConfigured();
	// Accept any long secret: hash it to exactly 32 bytes.
	return createHash("sha256").update(secret).digest();
}

function accountKey(therapistId: string, version: number) {
	return Buffer.from(
		hkdfSync(
			"sha256",
			masterKey(version),
			therapistId,
			`helsa:clinical:v${version}`,
			32,
		),
	);
}

export function encrypt(
	plain: Buffer | string,
	therapistId: string,
	version = CURRENT_KEY_VERSION,
) {
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv(
		"aes-256-gcm",
		accountKey(therapistId, version),
		iv,
	);
	const body = Buffer.concat([
		cipher.update(typeof plain === "string" ? Buffer.from(plain) : plain),
		cipher.final(),
	]);
	return Buffer.concat([Buffer.from([FORMAT]), iv, cipher.getAuthTag(), body]);
}

export function decrypt(sealed: Buffer, therapistId: string, version: number) {
	if (sealed[0] !== FORMAT) throw new Error("Unknown clinical cipher format");
	const iv = sealed.subarray(1, 1 + IV_BYTES);
	const tag = sealed.subarray(1 + IV_BYTES, 1 + IV_BYTES + TAG_BYTES);
	const body = sealed.subarray(1 + IV_BYTES + TAG_BYTES);
	const decipher = createDecipheriv(
		"aes-256-gcm",
		accountKey(therapistId, version),
		iv,
	);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(body), decipher.final()]);
}

export function encryptText(text: string, therapistId: string) {
	return encrypt(text, therapistId);
}

export function decryptText(
	sealed: Buffer,
	therapistId: string,
	version: number,
) {
	return decrypt(sealed, therapistId, version).toString("utf8");
}

export function sha256(data: Buffer) {
	return createHash("sha256").update(data).digest();
}

/**
 * Decrypted text for the UI, or `null` with `locked` when the key is missing
 * or wrong, so one unreadable value doesn't break the whole page.
 */
export function openText(
	sealed: Buffer | null,
	therapistId: string,
	version: number | null,
) {
	if (!sealed || version === null) return { text: null, locked: false };
	try {
		return { text: decryptText(sealed, therapistId, version), locked: false };
	} catch {
		return { text: null, locked: true };
	}
}
