import { Container } from "./container";
import { contactLinks } from "./content";
import { CtaLink } from "./cta-link";
import { Logo } from "./logo";

export function SiteFooter() {
	return (
		<footer className="bg-night text-white">
			<Container className="py-12">
				<div className="flex items-center justify-between gap-6">
					<Logo tone="light" className="h-7" />
					<CtaLink href="#lista" size="sm">
						Unirme a la lista
					</CtaLink>
				</div>

				<div className="mt-12 flex flex-col gap-3 border-white/10 border-t pt-6 text-white/55 text-xs sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Helsa. Hecho en Venezuela.</p>
					<ul className="flex gap-4">
						{contactLinks.map((link) => (
							<li key={link.label}>
								<a
									href={link.href}
									className="transition-colors hover:text-white"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</Container>
		</footer>
	);
}
