import { cn } from "@helsa/ui/lib/utils";
import { Video } from "lucide-react";

import {
	ChatChip,
	DeskDoodle,
	LedgerChip,
	NotebookChip,
} from "@/components/doodles/landing-scenes";

import { Chapter, ChapterInner } from "./chapter";
import {
	type Chapter as ChapterInfo,
	chapters,
	statusLabels,
	week,
} from "./content";
import { CtaLink } from "./cta-link";
import { fadeIn, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

/* The folder stack: one patient file per chapter, the front one open. */

const backFolders: Array<{ chapter: ChapterInfo; tab: string }> = [
	{ chapter: chapters.agenda, tab: "left-[8%] sm:left-[10%]" },
	{ chapter: chapters.senal, tab: "left-[34%] sm:left-[30%]" },
	{ chapter: chapters.documentos, tab: "left-[8%] sm:left-[50%]" },
	{ chapter: chapters.incluye, tab: "left-[44%] sm:left-[70%]" },
];

const tabShape = "[clip-path:polygon(9%_0,91%_0,100%_100%,0_100%)]";

function FolderTab({
	chapter,
	className,
}: {
	chapter: ChapterInfo;
	className?: string;
}) {
	return (
		<a
			href={chapter.href}
			className={cn(
				"absolute flex h-8 items-center px-6 font-semibold text-[15px] outline-none transition-transform hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:underline sm:h-10 sm:px-9",
				tabShape,
				chapter.field,
				chapter.ink,
				className,
			)}
		>
			{chapter.label}
		</a>
	);
}

export function HeroSection() {
	return (
		<section aria-labelledby="hero-title" className="relative">
			<ChapterInner className="pt-10 pb-12 text-center sm:pt-14 lg:pt-14">
				<RevealGroup trigger="mount" stagger={0.1}>
					<RevealItem>
						<h1
							id="hero-title"
							className="text-balance font-display font-medium text-[clamp(3.25rem,8vw,8.25rem)] leading-[0.95] tracking-[-0.04em]"
						>
							Tu consulta, en orden.
						</h1>
					</RevealItem>
					<RevealItem
						as="p"
						className="mx-auto mt-7 max-w-[46ch] text-pretty text-lg leading-relaxed sm:text-xl"
					>
						Expedientes, agenda, videoconsulta y cobros para psicólogos y
						terapeutas en Venezuela. Pensado para cuando baja la señal y cambia
						la tasa.
					</RevealItem>
				</RevealGroup>
			</ChapterInner>

			<nav
				aria-label="Capítulos"
				className="relative h-[calc(4*var(--strip)+var(--tab))] [--strip:2.75rem] [--tab:2rem] sm:[--strip:3.5rem] sm:[--tab:2.5rem]"
			>
				<RevealGroup trigger="mount" delay={0.35} stagger={0.08}>
					{backFolders.map(({ chapter, tab }, index) => (
						<RevealItem
							key={chapter.href}
							className="absolute inset-x-2 sm:inset-x-3"
							style={{ top: `calc(${index} * var(--strip) + var(--tab))` }}
						>
							<div className={cn("h-48 rounded-t-[2rem]", chapter.field)} />
							<FolderTab
								chapter={chapter}
								className={cn("-top-8 sm:-top-10", tab)}
							/>
						</RevealItem>
					))}
				</RevealGroup>
			</nav>
		</section>
	);
}

function TodayCard() {
	const today = week[0];
	return (
		<div
			data-ui
			className="w-[19rem] rounded-2xl bg-background p-5 text-foreground"
		>
			<p className="font-display font-medium text-lg">
				Hoy, {today.day.toLowerCase()} {today.date}
			</p>
			<ul className="mt-3 space-y-3">
				{today.sessions.slice(0, 2).map((session) => (
					<li
						key={session.time}
						className="flex items-center gap-3 text-[15px]"
					>
						<span className="w-12 shrink-0 font-semibold tabular-nums">
							{session.time}
						</span>
						<span className="min-w-0 flex-1">
							<span className="block truncate font-medium">{session.name}</span>
							<span className="block truncate text-[13px] text-muted-foreground">
								{statusLabels[session.status]}
							</span>
						</span>
						{session.detail.startsWith("Video") ? (
							<Video
								aria-hidden="true"
								className="size-4 shrink-0 text-chapter-violet dark:text-primary"
							/>
						) : null}
					</li>
				))}
			</ul>
		</div>
	);
}

function Chip({ children }: { children: React.ReactNode }) {
	return (
		<span
			aria-hidden="true"
			className="mx-1 -my-2 inline-flex h-[1.25em] align-middle text-white sm:mx-2"
		>
			{children}
		</span>
	);
}

/** The front folder, open: the first chapter of the day. */
export function IntroSection() {
	const chapter = chapters.dia;
	return (
		<div className="relative z-10 -mt-px">
			<FolderTab
				chapter={chapter}
				className="-top-8 left-[calc(0.5rem+5%)] sm:-top-10 sm:left-[calc(0.75rem+4%)]"
			/>
			<Chapter
				id="dia"
				aria-label="Tu día"
				className={cn(
					"rounded-tl-[2rem] pt-8 pb-20 sm:pt-10 lg:pb-28",
					chapter.field,
					chapter.ink,
				)}
			>
				<ChapterInner className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
					<RevealGroup trigger="mount" delay={0.5} className="lg:col-span-5">
						<RevealItem>
							<CtaLink href="#lista" variant="light">
								Quiero acceso anticipado
							</CtaLink>
						</RevealItem>
						<RevealItem
							as="p"
							className="mt-5 max-w-sm text-[17px] text-white leading-relaxed"
						>
							Abrimos por grupos pequeños. Te escribimos cuando sea tu turno.
						</RevealItem>
					</RevealGroup>

					<div className="relative lg:col-span-7">
						<Reveal onMount variants={fadeIn} delay={0.6}>
							<DeskDoodle />
						</Reveal>
						<Reveal
							onMount
							delay={1.1}
							className="absolute -bottom-10 left-0 hidden sm:block lg:-left-10"
						>
							<TodayCard />
						</Reveal>
					</div>
				</ChapterInner>

				<ChapterInner className="mt-20 lg:mt-28">
					<Reveal
						as="p"
						className="max-w-[60rem] text-pretty font-display font-medium text-2xl leading-[1.35] tracking-[-0.01em] lg:text-[2rem]"
					>
						Hoy agendas por WhatsApp,
						<Chip>
							<ChatChip />
						</Chip>
						atiendes por Meet, escribes notas en Word o en papel
						<Chip>
							<NotebookChip />
						</Chip>
						y anotas los pagos en una libreta.
						<Chip>
							<LedgerChip />
						</Chip>
						Helsa junta todo en un solo lugar, ordenado por paciente.
					</Reveal>
				</ChapterInner>
			</Chapter>
		</div>
	);
}
