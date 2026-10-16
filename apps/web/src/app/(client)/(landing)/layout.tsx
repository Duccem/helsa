import { Figtree, Outfit } from "next/font/google";

import { MotionProvider } from "@/components/landing/motion/motion-provider";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

const figtree = Figtree({
	variable: "--font-figtree",
	subsets: ["latin"],
});

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
