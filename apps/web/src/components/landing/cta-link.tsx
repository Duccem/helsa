import { cn } from "@helsa/ui/lib/utils";

const variants = {
	primary: "bg-chapter-violet text-white hover:bg-chapter-violet/90",
	/** For violet and night fields. */
	light: "bg-white text-chapter-violet hover:bg-white/90",
} as const;

const sizes = {
	sm: "h-10 px-5 text-[15px]",
	lg: "h-14 px-7 text-[17px]",
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
				"inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold outline-none transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]",
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		/>
	);
}
