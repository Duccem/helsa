import Link from "next/link";

import { Chapter, ChapterInner } from "./chapter";
import { chapters, contactLinks } from "./content";
import { Logo } from "./logo";
import { Reveal } from "./motion/reveal";

const linkClassName =
	"rounded-sm text-[15px] text-white outline-none transition-colors hover:text-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring";

export function SiteFooter() {
	return (
		<footer className="pt-3 pb-2 sm:pb-3">
			<Chapter className="bg-night pt-12 pb-10 text-white lg:pt-16">
				<ChapterInner>
					<Reveal>
						<Logo tone="light" className="h-auto w-full" />
					</Reveal>

					<div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
						<div className="lg:col-span-5">
							<p className="font-display font-medium text-[1.625rem] lg:text-[2rem]">
								Hecho en Venezuela
							</p>
							<ul className="mt-3 space-y-1">
								{contactLinks.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="rounded-sm font-display font-medium text-[1.625rem] text-chapter-lilac outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring lg:text-[2rem]"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<nav
							aria-label="Pie de página"
							className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8"
						>
							<ul className="space-y-3">
								{Object.values(chapters).map((chapter) => (
									<li key={chapter.href}>
										<a href={chapter.href} className={linkClassName}>
											{chapter.label}
										</a>
									</li>
								))}
							</ul>
							<ul className="space-y-3">
								<li>
									<a href="#privacidad" className={linkClassName}>
										Privacidad
									</a>
								</li>
								<li>
									<a href="#preguntas" className={linkClassName}>
										Preguntas
									</a>
								</li>
								<li>
									<Link href="/sign-in" className={linkClassName}>
										Entrar
									</Link>
								</li>
								<li>
									<a href="#lista" className={linkClassName}>
										Lista de espera
									</a>
								</li>
							</ul>
						</nav>
					</div>

					<div className="mt-20 flex items-center justify-between gap-6 text-[13px] text-white/80 lg:mt-24">
						<p>© {new Date().getFullYear()} Helsa</p>
						<a
							href="#top"
							className="rounded-sm outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
						>
							Volver arriba
						</a>
					</div>
				</ChapterInner>
			</Chapter>
		</footer>
	);
}
