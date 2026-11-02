"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@helsa/ui/components/dialog";
import { cn } from "@helsa/ui/lib/utils";

/** The dashboard's dialog: rounded card, display title, scrolls on small screens. */
export function DialogShell({
	open,
	onOpenChange,
	title,
	description,
	className,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[1.75rem] bg-card p-6 text-[15px] ring-0 sm:max-w-lg sm:p-7",
					className,
				)}
			>
				<DialogTitle className="pr-8 font-display font-medium text-[1.5rem] leading-tight tracking-[-0.01em]">
					{title}
				</DialogTitle>
				{description ? (
					<DialogDescription className="mt-2 text-[15px] text-foreground/75 leading-relaxed">
						{description}
					</DialogDescription>
				) : null}
				<div className="mt-5">{children}</div>
			</DialogContent>
		</Dialog>
	);
}
