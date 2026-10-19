/*
 * Landing copy. The page follows a therapist's day in Venezuela; each chapter
 * has its own flat colour, and the hero's folder tabs point at them.
 */

export type Chapter = {
	href: `#${string}`;
	label: string;
	/** Background of the chapter's field and of its folder in the hero. */
	field: string;
	/** Text colour that reads on that field. */
	ink: string;
};

export const chapters = {
	dia: {
		href: "#dia",
		label: "Tu día",
		field: "bg-chapter-violet",
		ink: "text-white",
	},
	incluye: {
		href: "#incluye",
		label: "Qué incluye",
		field: "bg-chapter-lilac",
		ink: "text-foreground",
	},
	documentos: {
		href: "#documentos",
		label: "Documentos",
		field: "bg-chapter-teal",
		ink: "text-foreground",
	},
	senal: {
		href: "#senal",
		label: "Si baja la señal",
		field: "bg-night",
		ink: "text-white",
	},
	agenda: {
		href: "#agenda",
		label: "Tu semana",
		field: "bg-chapter-peach",
		ink: "text-foreground",
	},
} satisfies Record<string, Chapter>;

export const navLinks = [
	chapters.incluye,
	chapters.senal,
	{ href: "#privacidad", label: "Privacidad" },
	{ href: "#preguntas", label: "Preguntas" },
] as const;

export type Appointment = {
	time: string;
	initials: string;
	name: string;
	detail: string;
	status: "confirmed" | "reminded" | "moved";
};

export const statusLabels: Record<Appointment["status"], string> = {
	confirmed: "Confirmó por WhatsApp",
	reminded: "Recordatorio enviado",
	moved: "Pidió otra hora",
};

/* A sample week. Monday is today in the hero card. */
export const week: Array<{
	day: string;
	date: string;
	sessions: Appointment[];
}> = [
	{
		day: "Lunes",
		date: "19 oct",
		sessions: [
			{
				time: "9:00",
				initials: "MR",
				name: "María R.",
				detail: "Videoconsulta · 50 min",
				status: "confirmed",
			},
			{
				time: "11:00",
				initials: "JG",
				name: "José G.",
				detail: "Presencial · 50 min",
				status: "confirmed",
			},
			{
				time: "15:30",
				initials: "AL",
				name: "Andrea L.",
				detail: "Videoconsulta · desde Madrid",
				status: "reminded",
			},
		],
	},
	{
		day: "Martes",
		date: "20 oct",
		sessions: [
			{
				time: "8:00",
				initials: "CP",
				name: "Carlos P.",
				detail: "Videoconsulta · 50 min",
				status: "confirmed",
			},
			{
				time: "10:00",
				initials: "VM",
				name: "Valentina M.",
				detail: "Primera consulta · 60 min",
				status: "reminded",
			},
		],
	},
	{
		day: "Miércoles",
		date: "21 oct",
		sessions: [
			{
				time: "9:00",
				initials: "MR",
				name: "María R.",
				detail: "Videoconsulta · 50 min",
				status: "reminded",
			},
			{
				time: "14:00",
				initials: "LS",
				name: "Luis S.",
				detail: "Pareja · Presencial · 80 min",
				status: "moved",
			},
			{
				time: "16:00",
				initials: "GT",
				name: "Gabriela T.",
				detail: "Videoconsulta · 50 min",
				status: "reminded",
			},
			{
				time: "18:00",
				initials: "RD",
				name: "Rafael D.",
				detail: "Videoconsulta · desde Bogotá",
				status: "reminded",
			},
		],
	},
	{
		day: "Jueves",
		date: "22 oct",
		sessions: [
			{
				time: "11:00",
				initials: "JG",
				name: "José G.",
				detail: "Presencial · 50 min",
				status: "reminded",
			},
		],
	},
	{
		day: "Viernes",
		date: "23 oct",
		sessions: [
			{
				time: "9:30",
				initials: "AL",
				name: "Andrea L.",
				detail: "Videoconsulta · desde Madrid",
				status: "reminded",
			},
			{
				time: "12:00",
				initials: "VM",
				name: "Valentina M.",
				detail: "Seguimiento · 50 min",
				status: "reminded",
			},
		],
	},
];

export const moodWeek = [
	{ day: "Vie", value: 4 },
	{ day: "Sáb", value: 5 },
	{ day: "Dom", value: 5 },
	{ day: "Lun", value: 6 },
	{ day: "Mar", value: 5 },
	{ day: "Mié", value: 7 },
	{ day: "Hoy", value: 9 },
];

export const privacyPoints = [
	{
		title: "Notas cifradas",
		description:
			"Tus notas clínicas y adjuntos se guardan cifrados. Ni el equipo de Helsa puede leerlos.",
	},
	{
		title: "Sesiones sin grabar",
		description: "Las videoconsultas nunca se graban ni se transcriben.",
	},
	{
		title: "Registro de accesos",
		description:
			"Cada vez que alguien abre un expediente queda registrado: quién y cuándo.",
	},
	{
		title: "Tus datos son tuyos",
		description:
			"Exporta todo en PDF o CSV cuando quieras, y llévatelo si te vas.",
	},
];

export const professionOptions = [
	"Psicólogo/a independiente",
	"Terapeuta",
	"Psiquiatra",
	"Consultorio o equipo",
	"Otro",
];

export const faqs = [
	{
		question: "¿Cuándo estará disponible?",
		answer:
			"Abriremos por grupos pequeños en las próximas semanas. Quienes estén en la lista de espera reciben acceso primero, en el orden en que se anotaron.",
	},
	{
		question: "¿Cuánto costará?",
		answer:
			"Tendrá una suscripción mensual en dólares, con pago posible en bolívares a tasa BCV. Las personas de la lista de espera mantienen un precio de fundador.",
	},
	{
		question: "¿Mis pacientes tienen que instalar algo?",
		answer:
			"No. Entran a la videoconsulta y a su espacio desde el navegador del teléfono o la computadora, con el link que les llega por WhatsApp.",
	},
	{
		question: "¿Sirve si atiendo pacientes fuera de Venezuela?",
		answer:
			"Sí. Puedes atender en línea a pacientes en cualquier país, cobrar en dólares y ver cada cita en la zona horaria de cada quien.",
	},
	{
		question: "¿Puedo pasar mis expedientes actuales?",
		answer:
			"Sí. Te ayudamos a importar tus pacientes y notas desde Excel, Word o PDF para que no empieces de cero.",
	},
];

export const contactLinks = [
	{ href: "#", label: "[CORREO DE CONTACTO]" },
	{ href: "#", label: "[INSTAGRAM]" },
];
