import { BadgeCheck, Languages, MapPin } from "lucide-react";

import type { BookingPage } from "@/lib/core/booking/use-cases/load-booking-page";

import { languages as languageNames } from "../dashboard/settings/schema";

function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	return (
		(parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
	).toUpperCase();
}

export function TherapistCard({
	therapist,
}: {
	therapist: BookingPage["therapist"];
}) {
	const spoken = therapist.languages
		.map((code) => languageNames[code as keyof typeof languageNames] ?? code)
		.join(", ");

	return (
		<section
			aria-labelledby="therapist-name"
			className="rounded-[1.75rem] bg-card p-6 sm:p-8"
		>
			<div className="flex items-center gap-4">
				{therapist.image ? (
					<img
						src={therapist.image}
						alt=""
						className="size-20 shrink-0 rounded-full object-cover"
					/>
				) : (
					<span
						aria-hidden="true"
						className="inline-flex size-20 shrink-0 items-center justify-center rounded-full bg-chapter-lilac font-display font-medium text-[1.75rem] text-chapter-violet dark:text-foreground"
					>
						{initials(therapist.name)}
					</span>
				)}
				<div className="min-w-0">
					<h1
						id="therapist-name"
						className="font-display font-medium text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-[-0.02em]"
					>
						{therapist.name}
					</h1>
					{therapist.title ? (
						<p className="mt-1 text-[16px] text-foreground/80">
							{therapist.title}
						</p>
					) : null}
					{therapist.licenseVerified ? (
						<p className="mt-1.5 inline-flex items-center gap-1.5 font-medium text-[14px] text-dash-good">
							<BadgeCheck aria-hidden="true" className="size-4" />
							Licencia verificada
						</p>
					) : null}
				</div>
			</div>

			{therapist.bio ? (
				<p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed">
					{therapist.bio}
				</p>
			) : null}

			{therapist.specialties.length ? (
				<ul aria-label="Especialidades" className="mt-6 flex flex-wrap gap-2">
					{therapist.specialties.map((item) => (
						<li
							key={item}
							className="rounded-full bg-dash-ground px-3.5 py-1.5 text-[14px]"
						>
							{item}
						</li>
					))}
				</ul>
			) : null}

			<dl className="mt-6 grid gap-3 text-[15px]">
				{therapist.yearsExperience ? (
					<div className="flex gap-2">
						<dt className="text-muted-foreground">Experiencia</dt>
						<dd>
							{therapist.yearsExperience}{" "}
							{therapist.yearsExperience === 1 ? "año" : "años"}
						</dd>
					</div>
				) : null}
				{spoken ? (
					<div className="flex items-center gap-2">
						<dt>
							<Languages
								aria-hidden="true"
								className="size-4 text-muted-foreground"
							/>
							<span className="sr-only">Idiomas</span>
						</dt>
						<dd>{spoken}</dd>
					</div>
				) : null}
				{therapist.officeAddress ? (
					<div className="flex items-start gap-2">
						<dt>
							<MapPin
								aria-hidden="true"
								className="mt-0.5 size-4 text-muted-foreground"
							/>
							<span className="sr-only">Consultorio</span>
						</dt>
						<dd>{therapist.officeAddress}</dd>
					</div>
				) : null}
			</dl>
		</section>
	);
}
