"use client";

import { Button } from "@helsa/ui/components/button";
import { Input } from "@helsa/ui/components/input";
import { Label } from "@helsa/ui/components/label";
import { cn } from "@helsa/ui/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { m } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EASE_OUT, RevealItem } from "@/components/landing/motion/reveal";
import { authClient } from "@/lib/auth-client";

const inputClassName =
	"h-12 rounded-full bg-background px-5 text-[15px] md:text-[15px] dark:bg-input/30";

export function AuthHeader({
	title,
	description,
}: {
	title: string;
	description: React.ReactNode;
}) {
	return (
		<RevealItem>
			<h1 className="text-balance font-display font-medium text-[2.5rem] leading-[1.05] tracking-tight sm:text-5xl">
				{title}
			</h1>
			<p className="mt-4 text-base text-foreground/75 leading-relaxed">
				{description}
			</p>
		</RevealItem>
	);
}

export function FieldErrors({
	errors,
}: {
	errors: Array<{ message?: string } | string | undefined>;
}) {
	const first = errors[0];
	const message = typeof first === "string" ? first : first?.message;
	if (!message) return null;
	return (
		<m.p
			key={message}
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			className="px-5 text-destructive text-sm"
		>
			{message}
		</m.p>
	);
}

type FieldProps = Omit<React.ComponentProps<"input">, "onChange"> & {
	id: string;
	label: string;
	errors: Array<{ message?: string } | string | undefined>;
	onValueChange: (value: string) => void;
	aside?: React.ReactNode;
};

export function TextField({
	id,
	label,
	errors,
	onValueChange,
	aside,
	className,
	...props
}: FieldProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-baseline justify-between gap-4 px-5">
				<Label htmlFor={id} className="font-medium text-[15px]">
					{label}
				</Label>
				{aside}
			</div>
			<Input
				id={id}
				name={id}
				className={cn(inputClassName, className)}
				onChange={(event) => onValueChange(event.target.value)}
				aria-invalid={errors.length > 0}
				{...props}
			/>
			<FieldErrors errors={errors} />
		</div>
	);
}

export function PasswordField(props: Omit<FieldProps, "type">) {
	const [visible, setVisible] = useState(false);
	return (
		<div className="relative">
			<TextField
				{...props}
				type={visible ? "text" : "password"}
				className="pr-14"
			/>
			<button
				type="button"
				onClick={() => setVisible((value) => !value)}
				aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
				aria-pressed={visible}
				className="absolute top-[1.875rem] right-1.5 grid size-10 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
			>
				{visible ? (
					<EyeOff aria-hidden="true" className="size-[18px]" />
				) : (
					<Eye aria-hidden="true" className="size-[18px]" />
				)}
			</button>
		</div>
	);
}

const strengthLabels = ["Muy corta", "Débil", "Aceptable", "Buena", "Fuerte"];

export function scorePassword(password: string) {
	if (password.length < 8) return 0;
	let score = 1;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
	return score;
}

/** Four segments that fill as the password gets harder to guess. */
export function PasswordStrength({ password }: { password: string }) {
	const score = scorePassword(password);
	if (!password) {
		return (
			<p className="px-5 text-muted-foreground text-sm">
				Usa 8 caracteres o más. Una frase corta funciona bien.
			</p>
		);
	}
	return (
		<div className="flex items-center gap-3 px-5" aria-live="polite">
			<div className="flex flex-1 gap-1.5" aria-hidden="true">
				{[1, 2, 3, 4].map((step) => (
					<span
						key={step}
						className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
					>
						<m.span
							className={cn(
								"block h-full origin-left rounded-full",
								score <= 1 ? "bg-destructive" : "bg-primary",
							)}
							initial={false}
							animate={{ scaleX: score >= step ? 1 : 0 }}
							transition={{ duration: 0.35, ease: EASE_OUT }}
						/>
					</span>
				))}
			</div>
			<span className="w-20 text-right text-sm">{strengthLabels[score]}</span>
		</div>
	);
}

export function SubmitButton({
	pending,
	disabled,
	children,
	pendingLabel,
}: {
	pending: boolean;
	disabled?: boolean;
	children: React.ReactNode;
	pendingLabel: string;
}) {
	return (
		<Button
			type="submit"
			disabled={pending || disabled}
			className="h-12 w-full rounded-full bg-(--auth-action) font-semibold text-[15px] text-white transition-[background-color,transform] hover:bg-(--auth-action-hover) active:scale-[0.98]"
		>
			{pending ? (
				<>
					<Loader2 aria-hidden="true" className="animate-spin" />
					{pendingLabel}
				</>
			) : (
				children
			)}
		</Button>
	);
}

export function GoogleMark() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
			<path
				fill="#4285F4"
				d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
			/>
			<path
				fill="#34A853"
				d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
			/>
			<path
				fill="#FBBC05"
				d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
			/>
			<path
				fill="#EA4335"
				d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
			/>
		</svg>
	);
}

export function GoogleButton({
	label,
	callbackURL = "/dashboard",
	newUserCallbackURL,
}: {
	label: string;
	callbackURL?: string;
	/** Where Better Auth sends an account created by this click. */
	newUserCallbackURL?: string;
}) {
	const [pending, setPending] = useState(false);
	return (
		<button
			type="button"
			disabled={pending}
			onClick={async () => {
				setPending(true);
				const { error } = await authClient.signIn.social({
					provider: "google",
					callbackURL,
					newUserCallbackURL,
				});
				if (error) {
					toast.error(error.message || "No pudimos conectar con Google.");
					setPending(false);
				}
			}}
			className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-secondary font-medium text-[15px] text-foreground outline-none transition-[background-color,transform] hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_6%)] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-60"
		>
			{pending ? (
				<Loader2 aria-hidden="true" className="size-5 animate-spin" />
			) : (
				<GoogleMark />
			)}
			{label}
		</button>
	);
}

export function AuthSwitch({
	prompt,
	href,
	label,
}: {
	prompt: string;
	href: Route;
	label: string;
}) {
	return (
		<RevealItem as="p" className="text-base">
			{prompt}{" "}
			<Link
				href={href}
				className="rounded-sm font-semibold text-(--auth-link) underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
			>
				{label}
			</Link>
		</RevealItem>
	);
}

export const authLinkClassName =
	"rounded-sm font-medium text-(--auth-link) text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring";
