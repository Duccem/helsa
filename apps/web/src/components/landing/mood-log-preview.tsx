import { cn } from "@helsa/ui/lib/utils";

import { moodWeek } from "./content";
import { growUp, Reveal, RevealGroup, RevealItem } from "./motion/reveal";

export function MoodLogPreview() {
	return (
		<figure
			aria-label="Vista previa del registro de ánimo de un paciente"
			className="rounded-2xl border border-border/70 bg-muted/60 p-5 sm:p-6"
		>
			<div className="flex items-baseline justify-between">
				<p className="font-medium text-sm">Registro de hoy</p>
				<p className="text-[11px] text-muted-foreground">Tarea diaria</p>
			</div>
			<p className="mt-2 text-muted-foreground text-xs">
				¿Cómo te sentiste hoy?
			</p>

			<RevealGroup
				as="ol"
				delay={0.2}
				stagger={0.07}
				className="mt-6 grid h-36 grid-cols-7 items-end gap-2 sm:gap-3"
			>
				{moodWeek.map(({ day, value }, index) => {
					const isToday = index === moodWeek.length - 1;
					return (
						<li
							key={day}
							className="flex h-full flex-col items-center justify-end gap-2"
						>
							<RevealItem
								as="span"
								variants={growUp}
								className={cn(
									"w-full origin-bottom rounded-md",
									isToday ? "bg-primary" : "bg-primary/20",
								)}
								style={{ height: `${value * 10}%` }}
							/>
							<span
								className={cn(
									"text-[10px]",
									isToday
										? "font-semibold text-foreground"
										: "text-muted-foreground",
								)}
							>
								{day}
								<span className="sr-only">: {value} de 10</span>
							</span>
						</li>
					);
				})}
			</RevealGroup>

			<Reveal delay={0.7}>
				<blockquote className="mt-5 rounded-xl border border-border/70 bg-card px-4 py-3 text-muted-foreground text-xs leading-relaxed">
					Hoy pude hablar con mi jefe sin que me temblara la voz.
				</blockquote>
			</Reveal>
		</figure>
	);
}
