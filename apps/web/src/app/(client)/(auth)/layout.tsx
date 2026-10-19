import Link from "next/link";

import { AuthPanel, AuthPanelCompact } from "@/components/auth/auth-panel";
import { Logo } from "@/components/landing/logo";
import { MotionProvider } from "@/components/landing/motion/motion-provider";
import { figtree, outfit } from "@/lib/fonts";

// The brand violet a step deeper, so white labels and violet links pass 4.5:1.
const actionTokens = [
	"[--auth-action:color-mix(in_oklch,var(--color-primary),black_14%)]",
	"[--auth-action-hover:color-mix(in_oklch,var(--color-primary),black_24%)]",
	"[--auth-link:color-mix(in_oklch,var(--color-primary),var(--color-foreground)_28%)]",
].join(" ");

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`${outfit.variable} ${figtree.variable} min-h-svh bg-background font-landing text-foreground ${actionTokens}`}
		>
			<MotionProvider>
				<div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-3 lg:p-3">
					<div className="flex flex-col px-5 pt-5 pb-8 sm:px-10 lg:px-14 lg:pt-7 xl:px-20">
						<header>
							<Link
								href="/"
								aria-label="Helsa, ir al inicio"
								className="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
							>
								<Logo className="h-7" eager />
							</Link>
						</header>

						<main className="flex flex-1 flex-col justify-center py-8 lg:py-12">
							<div className="mx-auto w-full max-w-[26rem]">
								<AuthPanelCompact />
								<div className="mt-8 lg:mt-0">{children}</div>
							</div>
						</main>

						<footer className="mx-auto w-full max-w-[26rem] text-[15px] text-muted-foreground">
							Tus notas clínicas se guardan cifradas. Ni el equipo de Helsa
							puede leerlas.
						</footer>
					</div>

					<div className="hidden lg:sticky lg:top-3 lg:block lg:h-[calc(100svh-1.5rem)]">
						<AuthPanel />
					</div>
				</div>
			</MotionProvider>
		</div>
	);
}
