import Link from "next/link";

import { Logo } from "@/components/landing/logo";
import { figtree, outfit } from "@/lib/fonts";

export default function BookingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`${outfit.variable} ${figtree.variable} min-h-svh bg-dash-ground font-landing text-foreground`}
		>
			<header className="mx-auto flex h-20 max-w-6xl items-center px-4 sm:px-6">
				<Link
					href="/"
					aria-label="Helsa, ir al inicio"
					className="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
				>
					<Logo className="h-7" eager />
				</Link>
			</header>
			<main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">{children}</main>
			<footer className="mx-auto max-w-6xl px-4 pb-10 text-[14px] text-muted-foreground sm:px-6">
				Reservas con Helsa. Tus datos solo los ve tu terapeuta.
			</footer>
		</div>
	);
}
