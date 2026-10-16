import type { LucideIcon } from "lucide-react";
import { CalendarCheck, FileText, Video, Wallet } from "lucide-react";

export const navLinks = [
	{ href: "#incluye", label: "Producto" },
	{ href: "#venezuela", label: "Hecho para Venezuela" },
	{ href: "#privacidad", label: "Privacidad" },
	{ href: "#preguntas", label: "Preguntas" },
] as const;

export const heroHighlights = [
	"Sin instalar nada",
	"Funciona con poca señal",
	"Datos clínicos cifrados",
];

export type Appointment = {
	time: string;
	initials: string;
	name: string;
	detail: string;
	tone: "violet" | "amber" | "sky";
	confirmed?: boolean;
};

export const todayAppointments: Appointment[] = [
	{
		time: "9:00",
		initials: "MR",
		name: "María R.",
		detail: "Videoconsulta · 50 min",
		tone: "violet",
		confirmed: true,
	},
	{
		time: "11:00",
		initials: "JG",
		name: "José G.",
		detail: "Presencial · 50 min",
		tone: "amber",
	},
	{
		time: "15:30",
		initials: "AL",
		name: "Andrea L.",
		detail: "Videoconsulta · 50 min",
		tone: "sky",
	},
];

export const scatteredTools = [
	"Mensajes para agendar",
	"Link de Meet por sesión",
	"Notas en Word",
	"Historia en papel",
	"¿Quién me debe?",
];

export type Feature = { icon: LucideIcon; title: string; description: string };

export const features: Feature[] = [
	{
		icon: FileText,
		title: "Expediente clínico",
		description:
			"Ficha del paciente, notas por sesión con plantillas SOAP o libres, adjuntos y consentimiento informado con firma digital. Encuentras cualquier nota en segundos.",
	},
	{
		icon: CalendarCheck,
		title: "Agenda que se confirma sola",
		description:
			"Tu link de reservas con tus horarios. Recordatorios automáticos por WhatsApp 24 y 2 horas antes; el paciente confirma o cancela con un toque.",
	},
	{
		icon: Video,
		title: "Videoconsulta privada",
		description:
			"Desde el navegador, sin descargas para ti ni para tu paciente. Sala de espera, link único por cita y ninguna sesión se graba.",
	},
	{
		icon: Wallet,
		title: "Cobros en dólares y bolívares",
		description:
			"Registra Pago Móvil, Zelle, Binance o efectivo a la tasa BCV del día. Sabes quién te debe y cuánto cobraste en el mes, sin libreta.",
	},
];

export const patientBenefits = [
	"Sus próximas citas y el botón para entrar a la sesión",
	"Tareas diarias o semanales que tú defines",
	"Registro de ánimo del 1 al 10 con espacio para escribir",
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

export const venezuelaStats = [
	{
		value: "150 kbps",
		description:
			"Velocidad mínima con la que la videoconsulta sigue funcionando.",
	},
	{
		value: "Solo audio",
		description:
			"Si la señal cae, la sesión cambia a audio y se reconecta sola, sin enviar otro link.",
	},
	{
		value: "Sin perder notas",
		description:
			"Lo que escribes se guarda en tu equipo y se sincroniza al volver la conexión.",
	},
	{
		value: "USD · Bs",
		description:
			"Precios en dólares, pagos en bolívares a tasa BCV, y pacientes en el exterior.",
	},
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

export const earlyAccessPerks = [
	{ title: "Acceso anticipado", detail: "antes del lanzamiento abierto." },
	{ title: "Precio de fundador", detail: "por [DURACIÓN DEL BENEFICIO]." },
	{
		title: "Voz en el producto:",
		detail: "lo que nos pidas entra primero en la lista.",
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
