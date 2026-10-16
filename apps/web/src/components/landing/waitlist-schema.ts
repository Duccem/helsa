import z from "zod";

export const waitlistSchema = z.object({
	name: z.string().trim().min(2, "Escribe tu nombre y apellido"),
	email: z.email("Escribe un correo válido"),
	profession: z.string().min(1, "Elige una opción"),
	city: z.string().trim().min(2, "Escribe tu ciudad"),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
