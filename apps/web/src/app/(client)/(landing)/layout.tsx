import { MotionProvider } from "@/components/landing/motion/motion-provider";
import { figtree, outfit } from "@/lib/fonts";

export default function LandingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`${outfit.variable} ${figtree.variable} min-h-svh font-landing`}
		>
			<MotionProvider>{children}</MotionProvider>
		</div>
	);
}
