import { cn } from "@helsa/ui/lib/utils";

const variants = {
	primary:
		"bg-primary text-white shadow-[0_10px_30px_-12px_var(--color-primary)] hover:bg-primary/90",
	outline: "border border-border bg-background text-foreground hover:bg-muted",
} as const;

const sizes = {
	sm: "h-9 px-4 text-[13px]",
	lg: "h-12 px-6 text-sm",
} as const;

type CtaLinkProps = React.ComponentProps<"a"> & {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
};

export function CtaLink({
	variant = "primary",
	size = "lg",
	className,
	...props
}: CtaLinkProps) {
	return (
		<a
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px",
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		/>
	);
}
