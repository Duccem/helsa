import z from "zod";

export const signUpSchema = z.object({
	name: z.string().trim().min(2, "Escribe tu nombre y apellido."),
	email: z.email("Escribe un correo válido, como ana@correo.com."),
	password: z.string().min(8, "Usa al menos 8 caracteres."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
