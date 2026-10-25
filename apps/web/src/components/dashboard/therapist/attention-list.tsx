"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	CalendarClock,
	FileSignature,
	HeartPulse,
	MessageCircleWarning,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { type AttentionKind, attentionItems } from "./mock-data";
import { EASE_OUT, Panel, PanelHeading } from "./parts";

const kindStyles: Record<
	AttentionKind,
	{ icon: typeof HeartPulse; field: string }
> = {
	moved: { icon: CalendarClock, field: "bg-chapter-peach" },
	mood: { icon: HeartPulse, field: "bg-chapter-lilac" },
	consent: { icon: FileSignature, field: "bg-chapter-teal" },
	reminder: {
		icon: MessageCircleWarning,
		field: "bg-destructive/12 text-dash-alert",
	},
};

export function AttentionList() {
	const [items, setItems] = useState(attentionItems);

	function resolve(id: string) {
		const item = items.find((entry) => entry.id === id);
		setItems((current) => current.filter((entry) => entry.id !== id));
		if (item)
			toast.success(item.done, {
				description: "Acción de ejemplo: aún no hay datos reales.",
			});
	}

	return (
		<Panel aria-labelledby="attention-title" className="xl:col-span-5">
			<PanelHeading id="attention-title" title="Para revisar">
				<span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-chapter-lilac px-3 font-semibold text-[14px] text-chapter-violet tabular-nums dark:text-foreground">
					{items.length}
					<span className="sr-only"> pendientes</span>
				</span>
			</PanelHeading>

			{items.length === 0 ? (
				<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
					Todo al día. No hay nada esperando por ti.
				</p>
			) : (
				<ul className="mt-4 flex flex-col gap-2">
					<AnimatePresence initial={false}>
						{items.map((item) => {
							const { icon: Icon, field } = kindStyles[item.kind];
							return (
								<m.li
									key={item.id}
									layout
									exit={{
										opacity: 0,
										x: 40,
										transition: { duration: 0.25, ease: EASE_OUT },
									}}
									className="flex gap-4 rounded-2xl bg-dash-ground p-4"
								>
									<span
										aria-hidden="true"
										className={cn(
											"inline-flex size-10 shrink-0 items-center justify-center rounded-full",
											field,
										)}
									>
										<Icon className="size-[1.1rem]" />
									</span>
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-[15px] leading-snug">
											{item.title}
										</p>
										<p className="mt-1 text-[14px] text-foreground/80 leading-snug">
											{item.detail}
										</p>
										<button
											type="button"
											onClick={() => resolve(item.id)}
											className="mt-3 inline-flex h-9 items-center rounded-full bg-card px-4 font-semibold text-[14px] outline-none transition-[background-color,transform] duration-200 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
										>
											{item.action}
										</button>
									</div>
								</m.li>
							);
						})}
					</AnimatePresence>
				</ul>
			)}
		</Panel>
	);
}
