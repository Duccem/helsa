import { cn } from "@helsa/ui/lib/utils";

import { RevealGroup, RevealItem } from "./motion/reveal";

type SectionHeadingProps = {
	eyebrow: string;
	title: React.ReactNode;
	description?: React.ReactNode;
	tone?: "light" | "dark";
	className?: string;
};

export function SectionHeading({
	eyebrow,
	title,
	description,
	tone = "light",
	className,
}: SectionHeadingProps) {
	const dark = tone === "dark";

	return (
		<RevealGroup className={cn("max-w-xl", className)}>
			<RevealItem
				as="p"
				className={cn(
					"font-semibold text-xs uppercase tracking-[0.14em]",
					dark ? "text-primary/90" : "text-primary",
				)}
			>
				{eyebrow}
			</RevealItem>
			<RevealItem>
				<h2
					className={cn(
						"mt-4 text-balance font-display font-medium text-3xl leading-[1.1] tracking-tight sm:text-4xl",
						dark ? "text-white" : "text-foreground",
					)}
				>
					{title}
				</h2>
			</RevealItem>
			{description && (
				<RevealItem
					as="p"
					className={cn(
						"mt-4 text-[15px] leading-relaxed",
						dark ? "text-white/65" : "text-muted-foreground",
					)}
				>
					{description}
				</RevealItem>
			)}
		</RevealGroup>
	);
}
