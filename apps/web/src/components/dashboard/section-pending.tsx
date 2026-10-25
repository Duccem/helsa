import Link from "next/link";

import { LogoMark } from "@/components/landing/logo";

/** Stand-in for a section whose screen is not built yet. */
export function SectionPending({
	title,
	description = "Esta sección está en construcción. Pronto la tendrás aquí.",
}: {
	title: string;
	description?: string;
}) {
	return (
		<section
			aria-labelledby="pending-title"
			className="flex min-h-[calc(100svh-7.5rem)] flex-col items-start justify-end rounded-[2rem] bg-card p-8 sm:p-12"
		>
			<LogoMark className="h-14 opacity-90" />
			<h1
				id="pending-title"
				className="mt-8 font-display font-medium text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.03em]"
			>
				{title}
			</h1>
			<p className="mt-4 max-w-[42ch] text-lg leading-relaxed">{description}</p>
			<Link
				href="/dashboard"
				className="mt-8 inline-flex h-12 items-center rounded-full bg-chapter-violet px-6 font-semibold text-[15px] text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.97]"
			>
				Volver al inicio
			</Link>
		</section>
	);
}
