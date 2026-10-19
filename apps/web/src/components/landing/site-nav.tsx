"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { ChapterInner } from "./chapter";
import { navLinks } from "./content";
import { CtaLink } from "./cta-link";
import { Logo } from "./logo";
import { EASE_OUT } from "./motion/reveal";

const linkClassName =
	"rounded-sm text-[15px] text-foreground outline-none transition-colors hover:text-chapter-violet focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-primary";

export function SiteNav() {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<header className="sticky top-0 z-50 bg-background">
			<ChapterInner className="flex h-18 items-center justify-between gap-6">
				<Link
					href="/"
					aria-label="Helsa, inicio"
					onClick={close}
					className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<Logo eager className="h-7" />
				</Link>

				<nav
					aria-label="Principal"
					className="hidden items-center gap-8 md:flex"
				>
					{navLinks.map((link) => (
						<a key={link.href} href={link.href} className={linkClassName}>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-5">
					<Link href="/sign-in" className={`${linkClassName} hidden sm:inline`}>
						Entrar
					</Link>
					<CtaLink href="#lista" size="sm" className="hidden sm:inline-flex">
						Quiero acceso
					</CtaLink>
					<button
						type="button"
						className="inline-flex size-11 items-center justify-center rounded-full text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:hidden"
						aria-expanded={open}
						aria-controls="landing-mobile-nav"
						aria-label={open ? "Cerrar menú" : "Abrir menú"}
						onClick={() => setOpen((value) => !value)}
					>
						{open ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</div>
			</ChapterInner>

			<AnimatePresence initial={false}>
				{open && (
					<m.nav
						id="landing-mobile-nav"
						aria-label="Principal móvil"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="overflow-hidden bg-background md:hidden"
					>
						<ul className="flex flex-col px-5 pb-5">
							{navLinks.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										onClick={close}
										className="block py-3 font-display text-2xl"
									>
										{link.label}
									</a>
								</li>
							))}
							<li>
								<Link
									href="/sign-in"
									className="block py-3 font-display text-2xl"
								>
									Entrar
								</Link>
							</li>
							<li className="pt-3">
								<CtaLink href="#lista" onClick={close} className="w-full">
									Quiero acceso anticipado
								</CtaLink>
							</li>
						</ul>
					</m.nav>
				)}
			</AnimatePresence>
		</header>
	);
}
