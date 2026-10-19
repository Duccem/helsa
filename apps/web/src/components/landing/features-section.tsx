import { cn } from "@helsa/ui/lib/utils";
import { CheckCheck } from "lucide-react";

import {
	FolderDoodle,
	PaymentDoodle,
	VideoDoodle,
} from "@/components/doodles/landing-scenes";

import { Chapter, ChapterInner } from "./chapter";
import { chapters } from "./content";
import { RevealGroup, RevealItem } from "./motion/reveal";

function Tile({
	className,
	title,
	description,
	children,
	dark = false,
}: {
	className?: string;
	title: string;
	description: string;
	children: React.ReactNode;
	dark?: boolean;
}) {
	return (
		<RevealItem
			as="li"
			className={cn(
				"group relative flex flex-col justify-end overflow-hidden rounded-[2rem] p-5 sm:p-6",
				dark ? "text-white" : "text-foreground",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
				{children}
			</div>
			<div className="relative">
				<h3 className="font-display font-medium text-lg leading-snug">
					{title}
				</h3>
				<p
					className={cn(
						"mt-1 max-w-[34ch] text-[15px] leading-snug",
						dark ? "text-white" : "text-foreground/80",
					)}
				>
					{description}
				</p>
			</div>
		</RevealItem>
	);
}

/** A doodle sitting above the caption, inside a tall tile. */
function TileDoodle({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"absolute inset-x-4 top-4 sm:inset-x-6 sm:top-6",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function FeaturesSection() {
	const chapter = chapters.incluye;
	return (
		<Chapter
			id="incluye"
			aria-labelledby="incluye-title"
			className={cn("mt-3 py-3 sm:py-3", chapter.field)}
		>
			<RevealGroup
				as="ul"
				stagger={0.07}
				className="grid auto-rows-[28vw] grid-cols-2 gap-2 px-1.5 sm:auto-rows-[104px] sm:grid-cols-12 sm:px-2.5"
			>
				<RevealItem
					as="li"
					className="col-span-2 row-span-1 flex items-end p-5 sm:col-span-6 sm:row-span-2 sm:items-start sm:p-8 lg:p-10"
				>
					<h2
						id="incluye-title"
						className="font-display font-medium text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.035em]"
					>
						Todo en su sitio
					</h2>
				</RevealItem>

				<Tile
					className="col-span-1 row-span-2 bg-background sm:col-span-3"
					title="Agenda que se confirma sola"
					description="Recordatorios por WhatsApp 24 y 2 horas antes."
				>
					<span
						data-ui
						className="absolute -top-3 right-3 flex items-center gap-[0.4em] rounded-full bg-emerald-500/15 px-[0.7em] py-[0.35em] font-semibold text-[1.375rem] text-emerald-800 sm:-top-4 sm:right-5 sm:text-[2.25rem] dark:text-emerald-300"
					>
						<CheckCheck aria-hidden="true" className="size-[1em]" />
						Confirmó
					</span>
				</Tile>

				<Tile
					dark
					className="col-span-1 row-span-2 bg-night sm:col-span-3"
					title="Notas SOAP o libres"
					description="Una plantilla por sesión, o escribe a tu manera."
				>
					<span
						data-ui
						aria-hidden="true"
						className="absolute -top-4 -right-6 flex gap-[0.25em] font-display font-semibold text-[2.25rem] sm:text-[3.25rem]"
					>
						{["S", "O", "A", "P"].map((key) => (
							<span
								key={key}
								className="grid size-[1.5em] place-items-center rounded-[0.3em] bg-white/12 text-white"
							>
								{key}
							</span>
						))}
					</span>
				</Tile>

				<Tile
					className="col-span-2 row-span-3 bg-background sm:col-span-6 sm:row-span-4"
					title="Expediente clínico"
					description="Ficha del paciente, notas por sesión, adjuntos y consentimiento informado con firma digital."
				>
					<TileDoodle className="mx-auto max-w-[24rem] sm:inset-x-10">
						<FolderDoodle />
					</TileDoodle>
				</Tile>

				<Tile
					className="col-span-2 row-span-3 bg-chapter-teal-deep sm:col-span-3 sm:row-span-4"
					title="Videoconsulta privada"
					description="Desde el navegador, sin descargas. Ninguna sesión se graba."
				>
					<TileDoodle className="mx-auto max-w-[20rem]">
						<VideoDoodle />
					</TileDoodle>
				</Tile>

				<Tile
					className="col-span-2 row-span-3 bg-chapter-peach-deep sm:col-span-3 sm:row-span-4"
					title="Cobros en USD y Bs"
					description="Pago Móvil, Zelle, Binance o efectivo, a la tasa BCV del día."
				>
					<TileDoodle className="mx-auto max-w-[20rem]">
						<PaymentDoodle />
					</TileDoodle>
				</Tile>

				<Tile
					dark
					className="col-span-2 row-span-2 bg-chapter-violet sm:col-span-6"
					title="Entre sesiones"
					description="Tu paciente registra cómo se siente y tú lo lees antes de la próxima cita."
				>
					<span
						data-ui
						aria-hidden="true"
						className="absolute top-5 -right-16 flex gap-[0.3em] font-display font-medium text-[2.25rem] sm:top-6"
					>
						{[5, 6, 7, 8, 9, 10].map((value) => (
							<span
								key={value}
								className={cn(
									"grid size-[1.6em] place-items-center rounded-full tabular-nums",
									value === 9
										? "bg-white text-chapter-violet"
										: "bg-white/12 text-white",
								)}
							>
								{value}
							</span>
						))}
					</span>
				</Tile>

				<Tile
					className="col-span-2 row-span-2 bg-background sm:col-span-6"
					title="Tu link de reservas"
					description="Tus horarios publicados, para que te agenden sin escribirte."
				>
					<span
						data-ui
						aria-hidden="true"
						className="absolute top-5 -right-20 flex items-center gap-[0.4em] whitespace-nowrap rounded-full bg-chapter-lilac py-[0.3em] pr-[0.3em] pl-[0.8em] text-[1.375rem] sm:top-6 sm:text-[1.9rem]"
					>
						helsa.app/ana-perez
						<span className="rounded-full bg-chapter-violet px-[0.7em] py-[0.25em] font-semibold text-white">
							Reservar
						</span>
					</span>
				</Tile>
			</RevealGroup>
		</Chapter>
	);
}
