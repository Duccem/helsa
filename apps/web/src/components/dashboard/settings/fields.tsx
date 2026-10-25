"use client";

import { Input } from "@helsa/ui/components/input";
import { Textarea } from "@helsa/ui/components/textarea";
import { cn } from "@helsa/ui/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { m } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import type z from "zod";

import { ApiError } from "@/lib/api/client";
import { type SettingsSection, useSaveSettings } from "@/lib/api/mutations";

import { ActionButton } from "../profile/parts";
import { EASE_OUT } from "../therapist/parts";
import { fieldErrors } from "./schema";

// ─── Form state ──────────────────────────────────────────────────────────────

/**
 * One settings part as a draft: edit freely, save validates with the shared
 * schema, discard goes back to what was last saved.
 */
export function useSectionForm<T extends object>({
	section,
	schema,
	initial,
	success,
}: {
	section: SettingsSection;
	schema: z.ZodType;
	initial: T;
	success: string;
}) {
	const router = useRouter();
	const mutation = useSaveSettings(section);
	const [saved, setSaved] = useState(initial);
	const [value, setValue] = useState(initial);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const dirty = JSON.stringify(value) !== JSON.stringify(saved);

	function update(patch: Partial<T>) {
		setValue((current) => ({ ...current, ...patch }));
		const touched = Object.keys(patch);
		setErrors((current) =>
			Object.fromEntries(
				Object.entries(current).filter(
					([key]) => !touched.some((name) => key.split(".")[0] === name),
				),
			),
		);
	}

	async function submit(event?: React.FormEvent) {
		event?.preventDefault();
		const parsed = schema.safeParse(value);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			toast.error("Revisa los campos marcados.");
			return;
		}
		setErrors({});
		try {
			await mutation.mutateAsync(parsed.data);
			setSaved(value);
			toast.success(success);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ApiError
					? error.message
					: "No pudimos guardar. Intenta de nuevo.",
			);
		}
	}

	function reset() {
		setValue(saved);
		setErrors({});
	}

	return {
		value,
		update,
		setValue,
		errors,
		setErrors,
		dirty,
		pending: mutation.isPending,
		submit,
		reset,
	};
}

export function SaveBar({
	dirty,
	pending,
	onReset,
	note,
}: {
	dirty: boolean;
	pending: boolean;
	onReset: () => void;
	note?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3 pt-2">
			<ActionButton
				type="submit"
				pending={pending}
				pendingLabel="Guardando…"
				disabled={!dirty}
			>
				Guardar cambios
			</ActionButton>
			{dirty && !pending ? (
				<ActionButton variant="quiet" onClick={onReset}>
					Descartar
				</ActionButton>
			) : null}
			{note ? (
				<p className="text-[14px] text-foreground/75 leading-snug">{note}</p>
			) : null}
		</div>
	);
}

// ─── Field shells ────────────────────────────────────────────────────────────

export function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<m.p
			key={message}
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: EASE_OUT }}
			className="px-5 text-[14px] text-dash-alert"
		>
			{message}
		</m.p>
	);
}

export function Field({
	id,
	label,
	hint,
	error,
	aside,
	className,
	children,
}: {
	id: string;
	label: string;
	hint?: React.ReactNode;
	error?: string;
	aside?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={cn("min-w-0 space-y-2", className)}>
			<div className="flex items-baseline justify-between gap-4 px-5">
				<label htmlFor={id} className="font-medium text-[15px]">
					{label}
				</label>
				{aside}
			</div>
			{children}
			{error ? (
				<FieldError message={error} />
			) : hint ? (
				<p className="px-5 text-[14px] text-foreground/70 leading-snug">
					{hint}
				</p>
			) : null}
		</div>
	);
}

const control =
	"h-12 w-full rounded-full border-transparent bg-dash-ground px-5 text-[15px] text-foreground md:text-[15px] dark:bg-input/30";

export function TextInput({
	id,
	value,
	onValueChange,
	invalid,
	className,
	...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
	id: string;
	value: string;
	onValueChange: (value: string) => void;
	invalid?: boolean;
}) {
	return (
		<Input
			id={id}
			name={id}
			value={value}
			onChange={(event) => onValueChange(event.target.value)}
			aria-invalid={invalid || undefined}
			className={cn(control, className)}
			{...props}
		/>
	);
}

/** A number with its unit inside the field ("50 min", "40 USD"). */
export function NumberInput({
	id,
	value,
	onValueChange,
	unit,
	nullable = false,
	invalid,
	className,
	step = 1,
	...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> & {
	id: string;
	value: number | null;
	onValueChange: (value: number | null) => void;
	unit?: string;
	nullable?: boolean;
	invalid?: boolean;
}) {
	const shown = value === null || Number.isNaN(value) ? "" : String(value);
	return (
		<div className={cn("relative", className)}>
			<Input
				id={id}
				name={id}
				type="number"
				inputMode={Number(step) < 1 ? "decimal" : "numeric"}
				step={step}
				value={shown}
				onChange={(event) => {
					const raw = event.target.value;
					if (raw === "") onValueChange(nullable ? null : Number.NaN);
					else onValueChange(Number(raw));
				}}
				aria-invalid={invalid || undefined}
				className={cn(
					control,
					"tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
					unit ? "pr-16" : "",
				)}
				{...props}
			/>
			{unit ? (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[15px] text-foreground/70"
				>
					{unit}
				</span>
			) : null}
		</div>
	);
}

export function TextArea({
	id,
	value,
	onValueChange,
	maxLength,
	invalid,
	className,
	...props
}: Omit<React.ComponentProps<"textarea">, "onChange" | "value"> & {
	id: string;
	value: string;
	onValueChange: (value: string) => void;
	invalid?: boolean;
}) {
	return (
		<div className="relative">
			<Textarea
				id={id}
				name={id}
				value={value}
				maxLength={maxLength}
				onChange={(event) => onValueChange(event.target.value)}
				aria-invalid={invalid || undefined}
				className={cn(
					"min-h-36 rounded-[1.5rem] border-transparent bg-dash-ground px-5 py-4 pb-9 text-[15px] text-foreground leading-relaxed md:text-[15px] dark:bg-input/30",
					className,
				)}
				{...props}
			/>
			{maxLength ? (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute right-5 bottom-3 text-[13px] text-foreground/60 tabular-nums"
				>
					{value.length} / {maxLength}
				</span>
			) : null}
		</div>
	);
}

export function SelectInput({
	id,
	value,
	onValueChange,
	options,
	invalid,
	className,
	...props
}: Omit<React.ComponentProps<"select">, "onChange" | "value"> & {
	id: string;
	value: string;
	onValueChange: (value: string) => void;
	options: ReadonlyArray<readonly [string, string]>;
	invalid?: boolean;
}) {
	return (
		<div className={cn("relative", className)}>
			<select
				id={id}
				name={id}
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
				aria-invalid={invalid || undefined}
				className="h-12 w-full cursor-pointer appearance-none rounded-full bg-dash-ground pr-12 pl-5 text-[15px] text-foreground outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive/40 dark:bg-input/30"
				{...props}
			>
				{options.map(([optionValue, label]) => (
					<option key={optionValue} value={optionValue}>
						{label}
					</option>
				))}
			</select>
			<ChevronDown
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-foreground/70"
			/>
		</div>
	);
}

// ─── Choices ─────────────────────────────────────────────────────────────────

export function Toggle({
	checked,
	onCheckedChange,
	label,
	labelledBy,
	describedBy,
	disabled,
}: {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	labelledBy?: string;
	describedBy?: string;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			aria-labelledby={labelledBy}
			aria-describedby={describedBy}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full p-1 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 disabled:opacity-50",
				checked ? "bg-chapter-violet" : "bg-foreground/20",
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"block size-6 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
					checked ? "translate-x-5" : "translate-x-0",
				)}
			/>
		</button>
	);
}

/** A setting that is on or off, with a sentence on what it does. */
export function ToggleRow({
	title,
	detail,
	checked,
	onCheckedChange,
	disabled,
	children,
}: {
	title: string;
	detail?: React.ReactNode;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	children?: React.ReactNode;
}) {
	const id = useId();
	return (
		<div className="rounded-[1.25rem] bg-dash-ground p-4 sm:p-5">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p id={`${id}-title`} className="font-semibold text-[15px]">
						{title}
					</p>
					{detail ? (
						<p
							id={`${id}-detail`}
							className="mt-1 text-[14px] text-foreground/75 leading-snug"
						>
							{detail}
						</p>
					) : null}
				</div>
				<Toggle
					checked={checked}
					onCheckedChange={onCheckedChange}
					labelledBy={`${id}-title`}
					describedBy={detail ? `${id}-detail` : undefined}
					disabled={disabled}
				/>
			</div>
			{children}
		</div>
	);
}

/** Several of a set, as pills that read "on" when chosen. */
export function ChipGroup<V extends string>({
	label,
	options,
	selected,
	onChange,
	tone = "ground",
}: {
	label: string;
	options: ReadonlyArray<readonly [V, string]>;
	selected: V[];
	onChange: (next: V[]) => void;
	/** "card" when the chips sit on a tinted row. */
	tone?: "ground" | "card";
}) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: a fieldset would add a border and legend layout we don't want.
		<div role="group" aria-label={label} className="flex flex-wrap gap-2">
			{options.map(([value, text]) => {
				const on = selected.includes(value);
				return (
					<button
						key={value}
						type="button"
						aria-pressed={on}
						onClick={() =>
							onChange(
								on
									? selected.filter((item) => item !== value)
									: [...selected, value],
							)
						}
						className={cn(
							"inline-flex h-10 items-center gap-1.5 rounded-full px-4 font-medium text-[14px] outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
							on
								? "bg-chapter-violet text-white"
								: tone === "card"
									? "bg-card text-foreground hover:bg-chapter-lilac"
									: "bg-dash-ground text-foreground hover:bg-chapter-lilac",
						)}
					>
						{on ? <Check aria-hidden="true" className="size-4" /> : null}
						{text}
					</button>
				);
			})}
		</div>
	);
}

/** One of a few, as a sliding pill. Arrow keys move between options. */
export function Segmented<V extends string | number>({
	label,
	options,
	value,
	onChange,
	tone = "ground",
}: {
	label: string;
	options: ReadonlyArray<readonly [V, string]>;
	value: V;
	onChange: (next: V) => void;
	tone?: "ground" | "card";
}) {
	const id = useId();
	const refs = useRef<Array<HTMLButtonElement | null>>([]);

	function move(index: number) {
		const next = (index + options.length) % options.length;
		const option = options[next];
		if (!option) return;
		onChange(option[0]);
		refs.current[next]?.focus();
	}

	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={cn(
				"inline-flex max-w-full flex-wrap gap-1 rounded-[1.5rem] p-1",
				tone === "card" ? "bg-card" : "bg-dash-ground",
			)}
		>
			{options.map(([optionValue, text], index) => {
				const on = optionValue === value;
				return (
					// biome-ignore lint/a11y/useSemanticElements: a styled pill group; arrow keys and roving focus are handled here.
					<button
						key={String(optionValue)}
						ref={(element) => {
							refs.current[index] = element;
						}}
						type="button"
						role="radio"
						aria-checked={on}
						tabIndex={on ? 0 : -1}
						onClick={() => onChange(optionValue)}
						onKeyDown={(event) => {
							if (event.key === "ArrowRight" || event.key === "ArrowDown") {
								event.preventDefault();
								move(index + 1);
							}
							if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
								event.preventDefault();
								move(index - 1);
							}
						}}
						className={cn(
							"relative inline-flex h-10 items-center rounded-full px-4 font-medium text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
							on
								? "text-foreground"
								: "text-foreground/70 hover:text-foreground",
						)}
					>
						{on ? (
							<m.span
								layoutId={`${id}-pill`}
								aria-hidden="true"
								className={cn(
									"absolute inset-0 rounded-full",
									tone === "card" ? "bg-chapter-lilac" : "bg-card",
								)}
								transition={{ type: "spring", stiffness: 420, damping: 34 }}
							/>
						) : null}
						<span className="relative">{text}</span>
					</button>
				);
			})}
		</div>
	);
}
