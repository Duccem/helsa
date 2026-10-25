/**
 * Profile photo upload.
 *
 * The picker in the profile page already validates, previews and, once this
 * returns a URL, saves it on the user with `authClient.updateUser({ image })`.
 * Only the storage step is missing.
 *
 * Pending (Supabase Storage):
 *  1. Upload `file` to the avatars bucket under `<userId>/<timestamp>.<ext>`.
 *  2. Return its public (or long-lived signed) URL.
 *  3. Optionally remove the previous object.
 */

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export class AvatarUploadUnavailableError extends Error {
	constructor() {
		super("Avatar storage is not configured yet.");
		this.name = "AvatarUploadUnavailableError";
	}
}

/** Returns why a file can't be used as a profile photo, or null if it can. */
export function validateAvatar(file: File): string | null {
	if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
		return "Usa una imagen JPG, PNG o WebP.";
	}
	if (file.size > AVATAR_MAX_BYTES) {
		return "La imagen pesa más de 2 MB. Prueba con una más liviana.";
	}
	return null;
}

export async function uploadAvatar(_file: File): Promise<string> {
	throw new AvatarUploadUnavailableError();
}
