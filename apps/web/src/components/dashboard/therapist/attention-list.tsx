"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	CalendarClock,
	FilePen,
	HeartPulse,
	ReceiptText,
	ShieldCheck,
	Signature,
} from "lucide-react";
import { m } from "motion/react";
import type { Route } from "next";
import Link from "next/link";

import type {
	AttentionKind,
	TherapistHome,
} from "@/lib/core/therapist/use-cases/load-therapist-home";

import { itemIn, Panel, PanelHeading, stagger } from "./parts";

const kindStyles: Record<
	AttentionKind,
	{ icon: typeof HeartPulse; field: string }
> = {
	mood: { icon: HeartPulse, field: "bg-destructive/12 text-dash-alert" },
	unconfirmed: { icon: CalendarClock, field: "bg-chapter-peach" },
	payment: { icon: ShieldCheck, field: "bg-chapter-lilac" },
	note: { icon: FilePen, field: "bg-chapter-teal" },
	overdue: { icon: ReceiptText, field: "bg-chapter-peach" },
	draft: { icon: Signature, field: "bg-dash-ground" },
};

export function AttentionList({
	attention,
}: {
	attention: TherapistHome["attention"];
}) {
	const { items, total } = attention;

	return (
		<Panel aria-labelledby="attention-title" className="xl:col-span-5">
			<PanelHeading id="attention-title" title="Para revisar">
				<span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-chapter-lilac px-3 font-semibold text-[14px] text-chapter-violet tabular-nums dark:text-foreground">
					{total}
					<span className="sr-only"> pendientes</span>
				</span>
			</PanelHeading>

			{items.length === 0 ? (
				<p className="mt-4 rounded-2xl bg-dash-ground px-5 py-8 text-[16px]">
					Todo al día. No hay nada esperando por ti.
				</p>
			) : (
				<m.ul variants={stagger(0.05)} className="mt-4 flex flex-col gap-2">
					{items.map((item) => {
						const { icon: Icon, field } = kindStyles[item.kind];
						return (
							<m.li
								key={item.id}
								variants={itemIn}
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
									<Link
										href={item.href as Route}
										className="mt-3 inline-flex h-9 items-center rounded-full bg-card px-4 font-semibold text-[14px] outline-none transition-[background-color,transform] duration-200 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
									>
										{item.action}
									</Link>
								</div>
							</m.li>
						);
					})}
				</m.ul>
			)}
			{total > items.length ? (
				<p className="mt-3 px-1 text-[14px] text-muted-foreground">
					Y {total - items.length} más. Atiende estos primero.
				</p>
			) : null}
		</Panel>
	);
}
