import { type NextRequest, NextResponse } from "next/server";
import { patientErrors } from "@/lib/api/patient-errors";
import { ok } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { DeletePatientFile } from "@/lib/core/file/use-cases/delete-patient-file";
import { DownloadPatientFile } from "@/lib/core/file/use-cases/download-patient-file";

const downloadFile = new DownloadPatientFile();
const deleteFile = new DeletePatientFile();

type Params = { id: string; fileId: string };

/** Only these open in the browser; everything else downloads. */
const INLINE = /^(application\/pdf|image\/(jpeg|png|webp))$/;

export const GET = withAuth<Params>(
	async (request: NextRequest, params, ctx: AuthContext) => {
		const { id, fileId } = await params;
		const file = await downloadFile.execute(
			{ patientId: id, fileId },
			ctx.user,
		);
		const inline =
			INLINE.test(file.mimeType) &&
			request.nextUrl.searchParams.get("download") === null;
		const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");

		return new NextResponse(new Uint8Array(file.bytes), {
			status: 200,
			headers: {
				"Content-Type": file.mimeType,
				"Content-Length": String(file.bytes.length),
				"Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
				"Cache-Control": "private, no-store",
				"X-Content-Type-Options": "nosniff",
				// Chrome's PDF viewer does not run under a sandbox policy.
				"Content-Security-Policy":
					file.mimeType === "application/pdf"
						? "default-src 'none'; object-src 'self'; style-src 'unsafe-inline'"
						: "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
			},
		});
	},
	patientErrors,
);

export const DELETE = withAuth<Params>(async (_, params, ctx: AuthContext) => {
	const { id, fileId } = await params;
	await deleteFile.execute({ patientId: id, fileId }, ctx.user);
	return ok();
}, patientErrors);
