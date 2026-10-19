"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Mic, RefreshCw, Video } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";

import { Chapter, ChapterInner } from "./chapter";
import { chapters } from "./content";
import { EASE_OUT, Reveal, RevealGroup, RevealItem } from "./motion/reveal";
import { SessionTimer } from "./session-timer";

/** The product's own thresholds: video from 150 kbps, audio below, reconnect at zero. */
const VIDEO_MIN_KBPS = 150;

type Mode = "video" | "audio" | "offline";

function modeFor(kbps: number): Mode {
	if (kbps <= 0) return "offline";
	return kbps >= VIDEO_MIN_KBPS ? "video" : "audio";
}

const modeCopy: Record<Mode, { label: string; note: string }> = {
	video: {
		label: "Video y audio",
		note: "La sesión sigue con imagen.",
	},
	audio: {
		label: "Solo audio",
		note: "La señal bajó. Pasamos a solo audio para que la sesión no se corte.",
	},
	offline: {
		label: "Reconectando",
		note: "Se fue la conexión. Volvemos a la misma sala sin enviar otro link; tus notas quedan guardadas en tu equipo.",
	},
};

function CallCard({ mode }: { mode: Mode }) {
	const Icon = mode === "video" ? Video : mode === "audio" ? Mic : RefreshCw;
	return (
		<div
			data-ui
			className="w-full max-w-[25rem] rounded-2xl bg-white/[0.08] p-3 text-white"
		>
			<p className="flex items-center justify-between px-1 pb-3 text-[15px]">
				<span className="flex items-center gap-2">
					<span
						className={cn(
							"size-2 rounded-full",
							mode === "offline" ? "bg-amber-400" : "bg-emerald-400",
						)}
					/>
					En sesión · <SessionTimer startAt={32 * 60 + 10} />
				</span>
				<span className="flex items-center gap-1.5">
					<Icon
						aria-hidden="true"
						className={cn("size-4", mode === "offline" && "animate-spin")}
					/>
					{modeCopy[mode].label}
				</span>
			</p>
			<div className="grid grid-cols-2 gap-2">
				<div className="grid aspect-[4/3] place-items-center rounded-xl bg-white/[0.07] text-[15px]">
					Tú
				</div>
				<div
					className={cn(
						"grid aspect-[4/3] place-items-center rounded-xl text-center text-[15px] leading-tight transition-colors duration-300",
						mode === "video" ? "bg-primary/45" : "bg-white/[0.07]",
					)}
				>
					<span>
						María R.
						{mode !== "video" ? (
							<span className="block text-white/75">
								{mode === "audio" ? "solo audio" : "reconectando"}
							</span>
						) : null}
					</span>
				</div>
			</div>
			<AnimatePresence mode="wait" initial={false}>
				<m.p
					key={mode}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2, ease: EASE_OUT }}
					className="px-1 pt-3 pb-1 text-[15px] leading-snug"
				>
					{modeCopy[mode].note}
				</m.p>
			</AnimatePresence>
		</div>
	);
}

export function SignalSection() {
	const chapter = chapters.senal;
	const [kbps, setKbps] = useState(400);
	const id = useId();
	const mode = modeFor(kbps);

	return (
		<Chapter
			id="senal"
			aria-labelledby="senal-title"
			className={cn(
				"mt-3 flex min-h-[88svh] flex-col py-16 lg:py-20",
				chapter.field,
				chapter.ink,
			)}
		>
			<ChapterInner className="grid gap-10 lg:grid-cols-12 lg:gap-8">
				<RevealGroup className="lg:col-span-6">
					<RevealItem>
						<h2
							id="senal-title"
							className="font-display font-medium text-[clamp(2rem,3vw,2.75rem)] leading-tight tracking-[-0.025em]"
						>
							¿Cuánta señal tienes hoy?
						</h2>
					</RevealItem>
					<RevealItem data-ui className="mt-7 w-full max-w-[25rem]">
						<label htmlFor={id} className="flex justify-between text-[15px]">
							<span>Tu conexión ahora</span>
							<output htmlFor={id} className="font-semibold tabular-nums">
								{kbps} kbps
							</output>
						</label>
						<input
							id={id}
							type="range"
							min={0}
							max={1000}
							step={10}
							value={kbps}
							onChange={(event) => setKbps(Number(event.target.value))}
							aria-valuetext={`${kbps} kbps, ${modeCopy[mode].label}`}
							className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)]"
						/>
						<span className="flex justify-between text-[13px] text-white/75">
							<span>Se fue la luz</span>
							<span>Fibra</span>
						</span>
					</RevealItem>
				</RevealGroup>

				<Reveal delay={0.2} className="lg:col-span-5 lg:col-start-8">
					<CallCard mode={mode} />
				</Reveal>
			</ChapterInner>

			<ChapterInner className="mt-auto grid gap-6 pt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
				<p
					aria-hidden="true"
					className="font-display font-semibold text-[30vw] tabular-nums leading-[0.8] tracking-[-0.05em] lg:col-span-8 lg:text-[clamp(8.75rem,17vw,16rem)]"
				>
					{kbps}
					<span className="ml-[0.08em] text-[0.22em] tracking-normal">
						kbps
					</span>
				</p>
				<p className="max-w-[34ch] text-[17px] leading-relaxed lg:col-span-4">
					Desde {VIDEO_MIN_KBPS} kbps la videoconsulta sigue con imagen. Por
					debajo pasa sola a audio y, si la conexión se cae, vuelve a la misma
					sala sin que nadie envíe otro link.
				</p>
			</ChapterInner>
		</Chapter>
	);
}
