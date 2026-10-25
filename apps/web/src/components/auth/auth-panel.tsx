"use client";

import { cn } from "@helsa/ui/lib/utils";
import { BellRing, Check, Mail, ShieldCheck, Video } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { usePathname } from "next/navigation";
import {
	ArmchairDoodle,
	CalendarDoodle,
	CandleKeyDoodle,
	OpenDoorDoodle,
	SessionDoodle,
} from "@/components/doodles/auth-scenes";
import { doodleTokens } from "@/components/doodles/primitives";
import { EASE_OUT } from "@/components/landing/motion/reveal";

/* A fragment of the product next to each doodle, the way it looks inside Helsa. */

function TodayCard() {
	const sessions = [
		{ time: "9:00", name: "María R.", detail: "Videoconsulta" },
		{ time: "11:00", name: "José G.", detail: "Presencial" },
	];
	return (
		<div className="w-60 rounded-2xl bg-background p-4">
			<p className="font-display font-medium text-base">
				Hoy tienes 3 sesiones
			</p>
			<ul className="mt-3 space-y-2.5">
				{sessions.map((session) => (
					<li key={session.time} className="flex items-center gap-3 text-sm">
						<span className="w-11 shrink-0 font-medium tabular-nums">
							{session.time}
						</span>
						<span className="min-w-0">
							<span className="block truncate">{session.name}</span>
							<span className="block text-[13px] text-muted-foreground">
								{session.detail}
							</span>
						</span>
						{session.detail === "Videoconsulta" ? (
							<Video
								aria-hidden="true"
								className="ml-auto size-4 text-primary"
							/>
						) : null}
					</li>
				))}
			</ul>
		</div>
	);
}

function ChecklistCard() {
	const items = [
		"Notas clínicas cifradas",
		"Recordatorios por WhatsApp",
		"Cobros en USD y Bs",
	];
	return (
		<div className="rounded-2xl bg-background px-5 py-4">
			<p className="font-display font-medium text-base">Tu consulta en Helsa</p>
			<ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
				{items.map((item) => (
					<li key={item} className="flex items-center gap-2.5 text-sm">
						<span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-white">
							<Check aria-hidden="true" className="size-3" strokeWidth={3} />
						</span>
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}

function EmailCard() {
	return (
		<div className="flex w-64 gap-3 rounded-2xl bg-background p-4">
			<span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white">
				<Mail aria-hidden="true" className="size-4" />
			</span>
			<div className="min-w-0 text-sm">
				<p className="font-medium">Restablece tu contraseña</p>
				<p className="mt-0.5 text-[13px] text-muted-foreground">
					De Helsa · el enlace vence en 10 minutos
				</p>
			</div>
		</div>
	);
}

function SessionsClosedCard() {
	return (
		<div className="flex w-64 gap-3 rounded-2xl bg-background p-4">
			<span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white">
				<ShieldCheck aria-hidden="true" className="size-4" />
			</span>
			<div className="min-w-0 text-sm">
				<p className="font-medium">Sesiones cerradas</p>
				<p className="mt-0.5 text-[13px] text-muted-foreground">
					En todos tus dispositivos, por seguridad
				</p>
			</div>
		</div>
	);
}

function NextSessionCard() {
	return (
		<div className="w-72 rounded-2xl bg-background p-4">
			<p className="font-display font-medium text-base">Tu próxima sesión</p>
			<div className="mt-3 flex items-center gap-3 text-sm">
				<span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white">
					<Video aria-hidden="true" className="size-4" />
				</span>
				<span className="min-w-0">
					<span className="block font-medium">Jueves, 4:00 pm</span>
					<span className="block text-[13px] text-muted-foreground">
						Videoconsulta · 50 minutos
					</span>
				</span>
			</div>
			<p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
				<BellRing aria-hidden="true" className="size-3.5 text-primary" />
				Te avisamos por WhatsApp un día antes
			</p>
		</div>
	);
}

type Scene = {
	Doodle: () => React.ReactNode;
	Card: () => React.ReactNode;
	/** Where the card floats over the doodle; without one it sits below it. */
	cardPosition?: string;
	title: string;
	description: string;
};

const scenes: Record<string, Scene> = {
	"/sign-in": {
		Doodle: ArmchairDoodle,
		Card: TodayCard,
		cardPosition: "top-0 -left-[2%]",
		title: "Tu consulta te espera donde la dejaste.",
		description:
			"Las sesiones de hoy, tus notas y los pagos, sin perder el hilo.",
	},
	"/sign-up": {
		Doodle: SessionDoodle,
		Card: ChecklistCard,
		title: "Agenda, expedientes y cobros, juntos.",
		description:
			"Pensado para psicólogos y terapeutas que atienden en Venezuela.",
	},
	"/sign-up/patient": {
		Doodle: CalendarDoodle,
		Card: NextSessionCard,
		title: "Tu terapeuta y tus citas, en un solo lugar.",
		description:
			"Eliges el horario, te recordamos la sesión y pagas en USD o Bs.",
	},
	"/forgot-password": {
		Doodle: CandleKeyDoodle,
		Card: EmailCard,
		cardPosition: "top-[2%] left-0",
		title: "Hasta en la mejor consulta se va la luz.",
		description:
			"Te enviamos un enlace a tu correo y vuelves a entrar en un minuto.",
	},
	"/reset-password": {
		Doodle: OpenDoorDoodle,
		Card: SessionsClosedCard,
		cardPosition: "top-[4%] right-0",
		title: "Una contraseña nueva y vuelves a lo tuyo.",
		description:
			"Al cambiarla cerramos tus sesiones abiertas en otros equipos.",
	},
};

function useScene() {
	const pathname = usePathname();
	return {
		key: pathname in scenes ? pathname : "/sign-in",
		scene: scenes[pathname] ?? scenes["/sign-in"],
	};
}

/** The illustrated half of the auth layout. It persists between auth routes and swaps its scene. */
export function AuthPanel() {
	const { key, scene } = useScene();
	const { Doodle, Card } = scene;

	return (
		<aside
			className={cn(
				"relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[color-mix(in_oklch,var(--color-primary)_9%,var(--color-background))]",
				doodleTokens,
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				<m.div
					key={key}
					className="flex flex-1 flex-col justify-between gap-10 p-10 xl:p-14"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="relative mx-auto my-auto w-full max-w-[38rem]">
						<m.div
							initial={{ opacity: 0, y: 24, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.8, ease: EASE_OUT }}
						>
							<Doodle />
						</m.div>
						<m.div
							className={
								scene.cardPosition
									? cn("absolute", scene.cardPosition)
									: "mx-auto mt-2 w-fit"
							}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 }}
						>
							<Card />
						</m.div>
					</div>

					<m.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
					>
						<p className="max-w-[26ch] text-balance font-display font-medium text-[2rem] leading-[1.1] tracking-tight">
							{scene.title}
						</p>
						<p className="mt-3 max-w-md text-base text-foreground/75 leading-relaxed">
							{scene.description}
						</p>
					</m.div>
				</m.div>
			</AnimatePresence>
		</aside>
	);
}

/** The phone version: just the doodle, small, above the form. */
export function AuthPanelCompact() {
	const { key, scene } = useScene();
	const { Doodle } = scene;

	return (
		<div
			aria-hidden="true"
			className={cn(
				"overflow-hidden rounded-3xl bg-[color-mix(in_oklch,var(--color-primary)_9%,var(--color-background))] px-6 pt-4 lg:hidden",
				doodleTokens,
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				<m.div
					key={key}
					className="mx-auto -mb-2 max-w-[13rem]"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.4, ease: EASE_OUT }}
				>
					<Doodle />
				</m.div>
			</AnimatePresence>
		</div>
	);
}
