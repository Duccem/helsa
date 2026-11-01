import { ENV } from "@/env.server";
import { CommonError } from "@/lib/utils/error";

/*
 * Supabase Storage through its REST API. The bucket must be private: files are
 * encrypted before upload and only ever served back through our own routes.
 */

export class StorageNotConfigured extends CommonError {
	constructor() {
		super(
			"El almacenamiento de archivos no está configurado (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).",
		);
	}
}

export class StorageRequestFailed extends CommonError {
	constructor(action: string, status: number) {
		super(`No pudimos ${action} el archivo (storage ${status}).`);
	}
}

function config() {
	const url = ENV.SUPABASE_URL;
	const key = ENV.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new StorageNotConfigured();
	return {
		base: `${url.replace(/\/$/, "")}/storage/v1`,
		bucket: ENV.SUPABASE_STORAGE_BUCKET || "patient-files",
		headers: { Authorization: `Bearer ${key}`, apikey: key },
	};
}

function objectPath(key: string) {
	return key.split("/").map(encodeURIComponent).join("/");
}

export function isStorageConfigured() {
	return Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_SERVICE_ROLE_KEY);
}

export async function putObject(key: string, body: Buffer) {
	const { base, bucket, headers } = config();
	const response = await fetch(`${base}/object/${bucket}/${objectPath(key)}`, {
		method: "POST",
		headers: {
			...headers,
			"Content-Type": "application/octet-stream",
			"x-upsert": "false",
		},
		body: new Uint8Array(body),
	});
	if (!response.ok) throw new StorageRequestFailed("subir", response.status);
}

export async function getObject(key: string) {
	const { base, bucket, headers } = config();
	const response = await fetch(
		`${base}/object/authenticated/${bucket}/${objectPath(key)}`,
		{ headers },
	);
	if (!response.ok)
		throw new StorageRequestFailed("descargar", response.status);
	return Buffer.from(await response.arrayBuffer());
}

export async function removeObject(key: string) {
	const { base, bucket, headers } = config();
	const response = await fetch(`${base}/object/${bucket}`, {
		method: "DELETE",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify({ prefixes: [key] }),
	});
	if (!response.ok) throw new StorageRequestFailed("borrar", response.status);
}
