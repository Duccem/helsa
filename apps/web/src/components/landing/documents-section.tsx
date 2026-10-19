"use client";

import { cn } from "@helsa/ui/lib/utils";
import { CheckCheck, Lock } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef } from "react";

import { Chapter, ChapterInner } from "./chapter";
import { chapters, moodWeek } from "./content";
import {
	AutoProgress,
	AutoplayToggle,
	useAutoAdvance,
} from "./motion/auto-advance";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

/* Each document is built at true size, the way it looks inside Helsa. */

function SessionNote() {
	const parts = [
		{
			label: "Subjetivo",
			text: "Refiere que esta semana pudo hablar con su jefe sin que le temblara la voz. Duerme mejor, de 6 a 7 horas.",
		},
		{
			label: "Objetivo",
			text: "Discurso fluido, afecto congruente. Registro de ánimo de la semana entre 5 y 9.",
		},
		{
			label: "Análisis",
			text: "Avanza en la exposición a situaciones de evaluación. Menos anticipación ansiosa.",
		},
		{
			label: "Plan",
			text: "Mantener el registro diario. Practicar respiración antes de la reunión del jueves. Próxima sesión: lunes 26.",
		},
	];
	return (
		<article
			data-ui
			className="w-[35rem] rounded-2xl bg-background p-8 text-foreground"
		>
			<p className="font-display font-medium text-2xl">María R. · Sesión 12</p>
			<p className="mt-1 text-[15px] text-muted-foreground">
				Lunes 19 oct 2026 · 9:00 · Videoconsulta · 50 min
			</p>
			<dl className="mt-6 space-y-4">
				{parts.map((part) => (
					<div key={part.label}>
						<dt className="font-semibold text-[15px]">{part.label}</dt>
						<dd className="mt-1 text-[15px] leading-relaxed">{part.text}</dd>
					</div>
				))}
			</dl>
			<p className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
				<Lock aria-hidden="true" className="size-3.5" />
				Cifrada. Solo tú puedes leerla.
			</p>
		</article>
	);
}

function Reminder() {
	return (
		<div
			data-ui
			className="w-[27.5rem] rounded-2xl bg-[#efeae2] p-5 text-[15px] text-neutral-900"
		>
			<p className="font-semibold">Consultorio Ana Pérez</p>
			<p className="text-[13px] text-neutral-600">por Helsa · WhatsApp</p>
			<div className="mt-5 max-w-[85%] rounded-xl rounded-tl-sm bg-white p-3.5 leading-relaxed">
				Hola María, te recordamos tu sesión con Ana Pérez mañana lunes 19 a las
				9:00 por videoconsulta. Responde 1 para confirmar o 2 para cambiar la
				hora.
				<span className="mt-1 block text-right text-[13px] text-neutral-500">
					9:00
				</span>
			</div>
			<div className="mt-3 ml-auto w-fit rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5">
				1
				<span className="ml-3 inline-flex items-center gap-1 text-[13px] text-neutral-500">
					9:04 <CheckCheck aria-label="leído" className="size-4 text-sky-600" />
				</span>
			</div>
			<div className="mt-3 max-w-[85%] rounded-xl rounded-tl-sm bg-white p-3.5 leading-relaxed">
				Listo, quedó confirmada. Mañana te llega el link para entrar desde el
				navegador.
				<span className="mt-1 block text-right text-[13px] text-neutral-500">
					9:04
				</span>
			</div>
		</div>
	);
}

function Receipt() {
	const rows = [
		["Sesión individual, 50 min", "USD 30,00"],
		["Tasa BCV del 19 oct", "Bs 210,00"],
	];
	return (
		<div
			data-ui
			className="w-[19rem] rounded-2xl bg-background p-6 text-[15px] text-foreground"
		>
			<p className="font-display font-medium text-xl">Recibo de pago</p>
			<p className="mt-1 text-muted-foreground">Ana Pérez, psicóloga</p>
			<p className="mt-5">María R.</p>
			<p className="text-muted-foreground">Lunes 19 oct 2026</p>
			<dl className="mt-5 space-y-2">
				{rows.map(([label, value]) => (
					<div key={label} className="flex justify-between gap-4">
						<dt>{label}</dt>
						<dd className="tabular-nums">{value}</dd>
					</div>
				))}
			</dl>
			<div className="mt-4 flex justify-between gap-4 rounded-xl bg-chapter-teal px-3 py-2.5 font-semibold">
				<span>Total</span>
				<span className="tabular-nums">Bs 6.300,00</span>
			</div>
			<p className="mt-4 text-muted-foreground">Pago Móvil · ref. 004512</p>
		</div>
	);
}

function Consent() {
	return (
		<article
			data-ui
			className="w-[35rem] rounded-2xl bg-background p-8 text-foreground"
		>
			<p className="font-display font-medium text-2xl leading-tight">
				Consentimiento informado para atención psicológica en línea
			</p>
			<p className="mt-4 text-[15px] leading-relaxed">
				Entiendo que las sesiones se realizan por videoconsulta, que no se
				graban y que lo conversado está protegido por el secreto profesional,
				salvo las excepciones que establece la ley.
			</p>
			<p className="mt-3 text-[15px] leading-relaxed">
				Sé que puedo pedir copia de mi expediente y retirar este consentimiento
				cuando quiera.
			</p>
			<svg
				viewBox="0 0 200 60"
				aria-hidden="true"
				className="mt-6 h-12 w-auto text-foreground"
			>
				<path
					d="M6 44 c14 -30 24 10 36 -8 c10 -16 16 14 28 -2 c8 -10 12 6 22 -4 c16 -14 30 4 46 -10 c10 -8 26 2 54 -6"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
			</svg>
			<p className="mt-2 text-[15px]">Andrea L.</p>
			<p className="text-[13px] text-muted-foreground">
				Firmado digitalmente el 2 oct 2026 a las 18:42
			</p>
		</article>
	);
}

function MoodLog() {
	return (
		<div
			data-ui
			className="w-[27.5rem] rounded-2xl bg-background p-6 text-foreground"
		>
			<p className="font-display font-medium text-xl">
				Registro de ánimo · María R.
			</p>
			<p className="mt-1 text-[15px] text-muted-foreground">
				¿Cómo te sentiste hoy? Del 1 al 10.
			</p>
			<ol className="mt-6 grid h-40 grid-cols-7 items-end gap-2.5">
				{moodWeek.map(({ day, value }, index) => {
					const today = index === moodWeek.length - 1;
					return (
						<li
							key={day}
							className="flex h-full flex-col items-center justify-end gap-2"
						>
							<span
								className={cn(
									"w-full rounded-md",
									today ? "bg-chapter-violet" : "bg-chapter-lilac-deep",
								)}
								style={{ height: `${value * 10}%` }}
							/>
							<span className={cn("text-[13px]", today && "font-semibold")}>
								{day}
								<span className="sr-only">: {value} de 10</span>
							</span>
						</li>
					);
				})}
			</ol>
			<blockquote className="mt-5 rounded-xl bg-muted px-4 py-3 text-[15px] leading-relaxed">
				Hoy pude hablar con mi jefe sin que me temblara la voz.
			</blockquote>
		</div>
	);
}

const documents = [
	{ name: "Nota de sesión", Sheet: SessionNote },
	{ name: "Recordatorio", Sheet: Reminder },
	{ name: "Recibo", Sheet: Receipt },
	{ name: "Consentimiento", Sheet: Consent },
	{ name: "Registro de ánimo", Sheet: MoodLog },
];

export function DocumentsSection() {
	const chapter = chapters.documentos;
	const auto = useAutoAdvance(documents.length, 4500);
	const selected = auto.index;
	const { Sheet } = documents[selected];
	const listRef = useRef<HTMLDivElement>(null);

	// On phones the names scroll sideways: keep the current one in view.
	useEffect(() => {
		const list = listRef.current?.querySelector("ul");
		const button = list?.querySelector<HTMLElement>(`[data-doc="${selected}"]`);
		if (!list || !button || list.scrollWidth <= list.clientWidth) return;
		const offset =
			button.getBoundingClientRect().left - list.getBoundingClientRect().left;
		list.scrollTo({ left: list.scrollLeft + offset - 20, behavior: "smooth" });
	}, [selected]);

	return (
		<Chapter
			id="documentos"
			aria-labelledby="documentos-title"
			className={cn("mt-3 py-16 lg:py-24", chapter.field, chapter.ink)}
			{...auto.holdProps}
		>
			<ChapterInner className="grid gap-10 lg:grid-cols-12 lg:gap-8">
				<div ref={listRef} className="lg:col-span-5 lg:pt-10">
					<h2 id="documentos-title" className="sr-only">
						Lo que deja cada sesión
					</h2>
					<RevealGroup
						as="ul"
						className="-mx-5 flex snap-x scroll-px-5 gap-6 overflow-x-auto px-5 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0"
					>
						{documents.map((document, index) => (
							<RevealItem
								as="li"
								key={document.name}
								className="shrink-0 snap-start"
							>
								<button
									type="button"
									data-doc={index}
									aria-pressed={selected === index}
									onClick={() => auto.select(index)}
									onPointerEnter={(event) => {
										if (event.pointerType === "mouse") auto.select(index);
									}}
									onFocus={() => auto.select(index)}
									className={cn(
										"rounded-lg text-left font-display font-medium text-[1.375rem] leading-[1.15] tracking-[-0.025em] outline-none transition-[color,transform] duration-300 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] lg:text-[clamp(2.25rem,3.6vw,3.5rem)]",
										selected === index
											? "text-foreground"
											: "text-foreground/45 hover:text-foreground/70",
									)}
								>
									{document.name}
									<AutoProgress
										running={selected === index && auto.running}
										interval={auto.interval}
										stepKey={auto.stepKey}
										className={cn(
											"mt-1 w-full transition-opacity lg:mt-1.5 lg:max-w-[12rem]",
											selected === index && auto.canAutoplay
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</button>
							</RevealItem>
						))}
					</RevealGroup>
					<Reveal
						as="p"
						delay={0.3}
						className="mt-8 max-w-sm text-lg leading-relaxed lg:mt-12"
					>
						Cada sesión deja papeles. Helsa los escribe contigo, los guarda
						cifrados y los envía por WhatsApp.
					</Reveal>
					{auto.canAutoplay ? (
						<Reveal delay={0.4} className="mt-6">
							<AutoplayToggle
								paused={auto.paused}
								onToggle={auto.togglePaused}
								label="documentos"
							/>
						</Reveal>
					) : null}
				</div>

				<Reveal
					variants={fadeIn}
					className="relative h-[70svh] overflow-hidden rounded-[2rem] bg-chapter-teal-deep lg:col-span-7 lg:h-[40rem]"
				>
					<AnimatePresence initial={false}>
						<m.div
							key={selected}
							aria-live={auto.running ? "off" : "polite"}
							className="absolute top-4 left-4 origin-bottom-left sm:top-[4.5rem] sm:left-16"
							initial={{ opacity: 0, y: 140, rotate: 5 }}
							animate={{ opacity: 1, y: 0, rotate: 0 }}
							exit={{ opacity: 0, y: -48, rotate: -4, scale: 0.94 }}
							transition={{ type: "spring", stiffness: 120, damping: 20 }}
						>
							<Sheet />
						</m.div>
					</AnimatePresence>
				</Reveal>
			</ChapterInner>
		</Chapter>
	);
}
