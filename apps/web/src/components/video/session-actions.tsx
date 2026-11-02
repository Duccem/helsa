"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, Link2, LoaderCircle, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useGuestLink } from "@/lib/api/mutations";

/** The therapist's way into a video appointment. */
export function JoinSessionLink({
	appointmentId,
	className,
	children = "Entrar a la sesión",
}: {
	appointmentId: string;
	className?: string;
	children?: React.ReactNode;
}) {
	return (
		<Link
			href={`/s/${appointmentId}` as never}
			className={cn(
				"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold outline-none transition-[background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]",
				className,
			)}
		>
			<Video aria-hidden="true" className="size-4" />
			{children}
		</Link>
	);
}

/** Copies the patient's join link, which works without a Helsa account. */
export function CopyPatientLink({
	appointmentId,
	className,
	label = "Copiar enlace del paciente",
}: {
	appointmentId: string;
	className?: string;
	label?: string;
}) {
	const link = useGuestLink();
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			const { url } = await link.mutateAsync(appointmentId);
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Enlace copiado. Envíaselo a tu paciente.");
			window.setTimeout(() => setCopied(false), 2500);
		} catch (error) {
			toast.error((error as Error).message || "No pudimos copiar el enlace.");
		}
	}

	const Icon = link.isPending ? LoaderCircle : copied ? Check : Link2;

	return (
		<button
			type="button"
			onClick={copy}
			disabled={link.isPending}
			className={cn(
				"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70",
				className,
			)}
		>
			<Icon
				aria-hidden="true"
				className={cn("size-4", link.isPending && "animate-spin")}
			/>
			<span aria-live="polite">{copied ? "Copiado" : label}</span>
		</button>
	);
}
