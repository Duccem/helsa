"use client";

import { Button } from "@helsa/ui/components/button";
import { Input } from "@helsa/ui/components/input";
import { Label } from "@helsa/ui/components/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "@helsa/ui/components/native-select";
import { useForm } from "@tanstack/react-form";
import { CircleCheck } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { joinWaitlist } from "@/app/(client)/(landing)/actions";

import { professionOptions } from "./content";
import { EASE_OUT } from "./motion/reveal";
import { type WaitlistInput, waitlistSchema } from "./waitlist-schema";

const inputClassName =
	"h-12 rounded-full bg-background px-5 text-[15px] md:text-[15px] dark:bg-input/30";

function FieldErrors({
	errors,
}: {
	errors: Array<{ message?: string } | undefined>;
}) {
	const message = errors[0]?.message;
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

export function WaitlistForm() {
	const [joinedEmail, setJoinedEmail] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			profession: professionOptions[0],
			city: "",
		} as WaitlistInput,
		validators: { onSubmit: waitlistSchema },
		onSubmit: async ({ value }) => {
			const result = await joinWaitlist(value);
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			setJoinedEmail(value.email);
		},
	});

	if (joinedEmail) {
		return (
			<m.div
				role="status"
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: EASE_OUT }}
				className="flex flex-col items-start gap-3 py-6"
			>
				<m.span
					initial={{ scale: 0.4, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 380,
						damping: 18,
						delay: 0.15,
					}}
				>
					<CircleCheck
						aria-hidden="true"
						className="size-8 text-chapter-violet dark:text-primary"
					/>
				</m.span>
				<h3 className="font-display font-medium text-xl">
					¡Tu lugar está reservado!
				</h3>
				<p className="text-[15px] text-muted-foreground leading-relaxed">
					Te escribiremos a{" "}
					<span className="font-medium text-foreground">{joinedEmail}</span>{" "}
					cuando abramos tu grupo.
				</p>
			</m.div>
		);
	}

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<h3 className="font-display font-medium text-2xl">
				Únete a la lista de espera
			</h3>

			<form.Field name="name">
				{(field) => (
					<div className="space-y-1.5">
						<Label
							htmlFor={field.name}
							className="px-5 font-medium text-[15px]"
						>
							Nombre y apellido
						</Label>
						<Input
							id={field.name}
							name={field.name}
							autoComplete="name"
							placeholder="Ana Pérez"
							className={inputClassName}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							aria-invalid={field.state.meta.errors.length > 0}
						/>
						<FieldErrors errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<div className="space-y-1.5">
						<Label
							htmlFor={field.name}
							className="px-5 font-medium text-[15px]"
						>
							Correo electrónico
						</Label>
						<Input
							id={field.name}
							name={field.name}
							type="email"
							autoComplete="email"
							placeholder="ana@correo.com"
							className={inputClassName}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							aria-invalid={field.state.meta.errors.length > 0}
						/>
						<FieldErrors errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="profession">
					{(field) => (
						<div className="space-y-1.5">
							<Label
								htmlFor={field.name}
								className="px-5 font-medium text-[15px]"
							>
								Trabajas como
							</Label>
							<NativeSelect
								id={field.name}
								name={field.name}
								className="w-full [&_select]:h-12 [&_select]:rounded-full [&_select]:pl-5 [&_select]:text-[15px]"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							>
								{professionOptions.map((option) => (
									<NativeSelectOption key={option} value={option}>
										{option}
									</NativeSelectOption>
								))}
							</NativeSelect>
							<FieldErrors errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>

				<form.Field name="city">
					{(field) => (
						<div className="space-y-1.5">
							<Label
								htmlFor={field.name}
								className="px-5 font-medium text-[15px]"
							>
								Ciudad
							</Label>
							<Input
								id={field.name}
								name={field.name}
								autoComplete="address-level2"
								placeholder="Caracas"
								className={inputClassName}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldErrors errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>
			</div>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						type="submit"
						disabled={isSubmitting}
						className="mt-2 h-12 w-full rounded-full bg-chapter-violet font-semibold text-[15px] text-white transition-[background-color,transform] hover:bg-chapter-violet/90 active:scale-[0.98]"
					>
						{isSubmitting ? "Reservando…" : "Reservar mi lugar"}
					</Button>
				)}
			</form.Subscribe>

			<p className="text-[13px] text-muted-foreground leading-relaxed">
				Solo te escribiremos sobre el lanzamiento de Helsa. Puedes salir de la
				lista cuando quieras.
			</p>
		</form>
	);
}
