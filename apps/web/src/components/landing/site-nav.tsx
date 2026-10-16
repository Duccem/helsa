"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { navLinks } from "./content";
import { CtaLink } from "./cta-link";
import { Logo, LogoAppIcon } from "./logo";
import { EASE_OUT } from "./motion/reveal";

export function SiteNav() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const close = () => setOpen(false);

	return (
		<m.header
			initial={{ opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: EASE_OUT }}
			className={cn(
				"sticky top-0 z-50 border-b transition-colors duration-300",
				scrolled || open
					? "border-border/70 bg-background/85 backdrop-blur-lg"
					: "border-transparent",
			)}
		>
			<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
				<Link href="/" aria-label="Helsa, inicio" onClick={close}>
					<span className="sm:hidden">
						<LogoAppIcon eager />
					</span>
					<span className="hidden sm:flex">
						<Logo eager />
					</span>
				</Link>

				<nav
					aria-label="Principal"
					className="hidden items-center gap-8 md:flex"
				>
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<CtaLink href="#lista" size="sm" className="hidden sm:inline-flex">
						Unirme a la lista
					</CtaLink>
					<button
						type="button"
						className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
						aria-expanded={open}
						aria-controls="landing-mobile-nav"
						aria-label={open ? "Cerrar menú" : "Abrir menú"}
						onClick={() => setOpen((value) => !value)}
					>
						{open ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{open && (
					<m.nav
						id="landing-mobile-nav"
						aria-label="Principal móvil"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="overflow-hidden border-border/70 border-t md:hidden"
					>
						<ul className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-8">
							{navLinks.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										onClick={close}
										className="block py-3 text-[15px] text-foreground"
									>
										{link.label}
									</a>
								</li>
							))}
							<li className="py-2">
								<CtaLink href="#lista" onClick={close} className="w-full">
									Unirme a la lista
								</CtaLink>
							</li>
						</ul>
					</m.nav>
				)}
			</AnimatePresence>
		</m.header>
	);
}
