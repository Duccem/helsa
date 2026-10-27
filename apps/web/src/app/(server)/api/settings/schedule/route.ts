import type { NextRequest } from "next/server";
import z from "zod";
import { domainError, internalServerError, ok, readJson } from "@/lib/api/server";
import { type AuthContext, withAuth } from "@/lib/auth/with-auth";
import { TherapistNotFound } from "@/lib/core/therapist/domain/errors";
import { SaveAvailabilityRules } from "@/lib/core/therapist/use-cases/save-availability-rules";

const saveAvailabilityRules = new SaveAvailabilityRules();
export const availabilityRangeSchema = z
	.object({
		/** 0 = Monday … 6 = Sunday (the database counts from Sunday). */
		weekday: z.number().int().min(0).max(6),
		start: z.string(),
		end: z.string(),
		id: z.string(),
		modality: z.enum(["in_person", "video", "phone"]).nullable()
	});
const scheduleSchema = z
	.object({
		timezone: z.string().refine((zone) => {
			try {
				new Intl.DateTimeFormat("en-US", { timeZone: zone });
				return true;
			} catch {
				return false;
			}
		}, "Elige una zona horaria de la lista."),
		sessionMinutes: z
			.number()
			.int()
			.min(15, "Una sesión dura 15 minutos o más.")
			.max(180, "Una sesión dura 3 horas o menos."),
		bufferMinutes: z
			.number()
			.int()
			.min(0, "La pausa no puede ser negativa.")
			.max(60, "Usa una pausa de una hora o menos."),
		ranges: z.array(availabilityRangeSchema).max(40, "Son demasiadas franjas."),
	})

export const PUT = withAuth(
	async (request: NextRequest, _, ctx: AuthContext) => {
		const parsed = scheduleSchema.parse(await readJson(request));

		await saveAvailabilityRules.execute(parsed, ctx.user);

		return ok();
	},
	(error: TherapistNotFound) => {
		switch (true) {
			case error instanceof TherapistNotFound:
				return domainError(error, 404);
			default:
				return internalServerError();
		}
	}
)
