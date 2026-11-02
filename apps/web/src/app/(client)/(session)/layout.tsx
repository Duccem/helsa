import { figtree, outfit } from "@/lib/fonts";

/** Video sessions: full screen, no site navigation. */
export default function SessionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`${outfit.variable} ${figtree.variable} min-h-svh bg-night font-landing text-white`}
		>
			{children}
		</div>
	);
}
