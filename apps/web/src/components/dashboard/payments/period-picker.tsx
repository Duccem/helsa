"use client";

import { Input } from "@helsa/ui/components/input";
import { cn } from "@helsa/ui/lib/utils";
import { CalendarRange } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import type { PaymentsOverview } from "@/lib/core/payment/use-cases/load-payments-overview";
import { type RangePreset, rangePresets } from "@/lib/utils/date-range";

import { ActionButton } from "../profile/parts";
import { presetLabels } from "./format";

const quick = rangePresets.filter((preset) => preset !== "custom");

/** Keeps the period in the URL so a refresh or a shared link shows the same numbers. */
export function PeriodPicker({
	period,
}: {
	period: PaymentsOverview["period"];
}) {
	const router = useRouter();
	const pathname = usePathname();
	const id = useId();
	const [pending, startTransition] = useTransition();
	const [custom, setCustom] = useState(period.preset === "custom");
	const [from, setFrom] = useState(period.from);
	const [to, setTo] = useState(period.to);

	function go(params: Record<string, string>) {
		startTransition(() => {
			router.push(
				`${pathname}?${new URLSearchParams(params).toString()}` as Route,
				{
					scroll: false,
				},
			);
		});
	}

	function pick(preset: RangePreset) {
		setCustom(false);
		go({ preset });
	}

	const active = custom ? "custom" : period.preset;
	const invalid = !from || !to || from > to;

	return (
		<div
			className="flex flex-col items-start gap-3"
			aria-busy={pending || undefined}
		>
			<fieldset
				aria-label="Periodo"
				className="m-0 flex min-w-0 max-w-full flex-wrap gap-1 rounded-[1.5rem] border-0 bg-card p-1"
			>
				{[...quick, "custom" as const].map((preset) => {
					const on = active === preset;
					return (
						<button
							key={preset}
							type="button"
							aria-pressed={on}
							onClick={() =>
								preset === "custom" ? setCustom(true) : pick(preset)
							}
							className={cn(
								"inline-flex h-9 items-center gap-2 rounded-full px-4 font-semibold text-[14px] outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-ring",
								on
									? "bg-chapter-lilac text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{preset === "custom" ? (
								<CalendarRange aria-hidden="true" className="size-4" />
							) : null}
							{presetLabels[preset]}
						</button>
					);
				})}
			</fieldset>

			{custom ? (
				<form
					className="flex flex-wrap items-end gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						if (!invalid) go({ preset: "custom", from, to });
					}}
				>
					<div className="flex flex-col gap-1 text-[14px]">
						<label htmlFor={`${id}-from`} className="px-4 font-medium">
							Desde
						</label>
						<Input
							id={`${id}-from`}
							type="date"
							value={from}
							max={to || undefined}
							onChange={(event) => setFrom(event.target.value)}
							className="h-10 rounded-full border-transparent bg-card px-4 text-[15px] md:text-[15px]"
						/>
					</div>
					<div className="flex flex-col gap-1 text-[14px]">
						<label htmlFor={`${id}-to`} className="px-4 font-medium">
							Hasta
						</label>
						<Input
							id={`${id}-to`}
							type="date"
							value={to}
							min={from || undefined}
							onChange={(event) => setTo(event.target.value)}
							className="h-10 rounded-full border-transparent bg-card px-4 text-[15px] md:text-[15px]"
						/>
					</div>
					<ActionButton
						type="submit"
						size="small"
						disabled={invalid}
						pending={pending}
					>
						Aplicar
					</ActionButton>
				</form>
			) : null}
		</div>
	);
}
