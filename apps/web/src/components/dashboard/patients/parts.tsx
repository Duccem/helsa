"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@helsa/ui/components/alert-dialog";
import { cn } from "@helsa/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";

import { ActionButton } from "../profile/parts";
import {
	type PatientStatus,
	patientStatusLabels,
	patientStatusStyles,
} from "./schema";

export function StatusBadge({
	status,
	className,
}: {
	status: PatientStatus;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex h-7 shrink-0 items-center rounded-full px-3 font-semibold text-[13px]",
				patientStatusStyles[status],
				className,
			)}
		>
			{patientStatusLabels[status]}
		</span>
	);
}

/** Dates are formatted in the therapist's time zone so server and browser agree. */
export function formatDate(
	iso: string,
	timeZone: string,
	options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
	},
) {
	return new Intl.DateTimeFormat("es", { timeZone, ...options }).format(
		new Date(iso),
	);
}

/** "2026-11-03" (a calendar day, no time zone) → "3 nov 2026". */
export function formatDay(day: string) {
	return new Intl.DateTimeFormat("es", {
		timeZone: "UTC",
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(`${day}T00:00:00Z`));
}

/** Lowercase and without accents, so "jose" finds "José". */
export function normalize(text: string) {
	return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function formatUsd(amount: number) {
	return `$${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(amount)}`;
}

export function errorMessage(error: unknown, fallback: string) {
	return error instanceof ApiError ? error.message : fallback;
}

/** Runs a mutation, shows a toast and refreshes the server data on success. */
export function useRefreshingAction() {
	const router = useRouter();
	return async function run(
		action: () => Promise<unknown>,
		messages: { success: string; error: string },
	) {
		try {
			await action();
			toast.success(messages.success);
			router.refresh();
			return true;
		} catch (error) {
			toast.error(errorMessage(error, messages.error));
			return false;
		}
	};
}

export function EmptyState({
	icon: Icon,
	title,
	children,
}: {
	icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
	title: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col items-start gap-3 rounded-2xl bg-dash-ground px-5 py-8">
			<Icon
				aria-hidden
				className="size-6 text-chapter-violet dark:text-primary"
			/>
			<p className="font-semibold text-[16px]">{title}</p>
			{children ? (
				<div className="max-w-[56ch] text-[15px] text-foreground/80 leading-relaxed">
					{children}
				</div>
			) : null}
		</div>
	);
}

/** Notice for a feature that needs server configuration first. */
export function SetupNotice({ children }: { children: React.ReactNode }) {
	return (
		<p className="rounded-2xl bg-chapter-peach px-5 py-4 text-[15px] leading-relaxed">
			{children}
		</p>
	);
}

/** A button that asks before doing something that can't be undone. */
export function ConfirmButton({
	label,
	title,
	description,
	confirmLabel,
	onConfirm,
	variant = "quiet",
	pending,
	className,
	children,
}: {
	label: string;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => unknown;
	variant?: "quiet" | "danger" | "primary";
	pending?: boolean;
	className?: string;
	children?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<ActionButton
				size="small"
				variant={variant}
				pending={pending}
				onClick={() => setOpen(true)}
				aria-label={children ? label : undefined}
				className={className}
			>
				{children ?? label}
			</ActionButton>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent className="max-w-sm rounded-[1.75rem] bg-card p-6 ring-0 sm:max-w-md">
					<AlertDialogTitle className="font-display font-medium text-[1.375rem] leading-tight">
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-[15px] text-foreground/80 leading-relaxed">
						{description}
					</AlertDialogDescription>
					<AlertDialogFooter className="mt-2 gap-2">
						<AlertDialogCancel
							render={
								<ActionButton size="small" variant="quiet">
									Volver
								</ActionButton>
							}
						/>
						<ActionButton
							size="small"
							variant={variant === "danger" ? "danger" : "primary"}
							onClick={async () => {
								setOpen(false);
								await onConfirm();
							}}
						>
							{confirmLabel}
						</ActionButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
