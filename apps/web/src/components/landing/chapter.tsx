import { cn } from "@helsa/ui/lib/utils";

/**
 * One chapter of the page: a flat colour field, inset from the window edge
 * with the same 12px gutter and corner as the auth panel.
 */
export function Chapter({
	className,
	...props
}: React.ComponentProps<"section">) {
	return (
		<section
			className={cn(
				"relative mx-2 scroll-mt-20 overflow-hidden rounded-[2rem] sm:mx-3",
				className,
			)}
			{...props}
		/>
	);
}

/** The content column every chapter shares, so headings start on one edge. */
export function ChapterInner({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-16",
				className,
			)}
			{...props}
		/>
	);
}
