"use client";

import { ArrowLeft, Lock } from "lucide-react";
import { m } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCreatePatient, useUpdatePatient } from "@/lib/api/mutations";

import { ActionButton, ProfileSection } from "../profile/parts";
import {
	Field,
	NumberInput,
	SelectInput,
	TextArea,
	TextInput,
	ToggleRow,
} from "../settings/fields";
import { countries, fieldErrors, timezones } from "../settings/schema";
import { itemIn, stagger } from "../therapist/parts";
import { errorMessage, SetupNotice } from "./parts";
import {
	genderOptions,
	type PatientInput,
	patientSchema,
	patientStatuses,
	patientStatusLabels,
} from "./schema";

const countryOptions = Object.entries(countries) as Array<[string, string]>;
const statusOptions = patientStatuses.map(
	(status) => [status, patientStatusLabels[status]] as const,
);

type Props =
	| { mode: "create"; initial: PatientInput; patientId?: never; name?: never }
	| { mode: "edit"; initial: PatientInput; patientId: string; name: string };

export function PatientForm(props: Props) {
	const { mode, initial } = props;
	const router = useRouter();
	const create = useCreatePatient();
	const update = useUpdatePatient(props.patientId ?? "");
	const [value, setValue] = useState(initial);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const pending = create.isPending || update.isPending;
	const backHref = (
		mode === "edit"
			? `/dashboard/patients/${props.patientId}`
			: "/dashboard/patients"
	) as Route;

	function set(patch: Partial<PatientInput>) {
		setValue((current) => ({ ...current, ...patch }));
		setErrors((current) => {
			const next = { ...current };
			for (const key of Object.keys(patch)) delete next[key];
			return next;
		});
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		const parsed = patientSchema.safeParse(value);
		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			toast.error("Revisa los campos marcados.");
			return;
		}
		try {
			if (mode === "create") {
				const { id } = await create.mutateAsync(parsed.data);
				toast.success("Paciente registrado.");
				router.push(`/dashboard/patients/${id}`);
			} else {
				await update.mutateAsync(parsed.data);
				toast.success("Guardamos los cambios.");
				router.push(backHref);
			}
			router.refresh();
		} catch (error) {
			toast.error(errorMessage(error, "No pudimos guardar. Intenta de nuevo."));
		}
	}

	const timezoneOptions = timezones.some(([zone]) => zone === value.timezone)
		? timezones
		: ([[value.timezone, value.timezone], ...timezones] as const);

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="pt-2 pb-8">
				<Link
					href={backHref}
					className="-ml-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					{mode === "edit" ? props.name : "Pacientes"}
				</Link>
				<h1 className="mt-3 font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
					{mode === "edit" ? "Editar paciente" : "Nuevo paciente"}
				</h1>
			</m.header>

			<form noValidate onSubmit={submit} className="grid gap-4">
				<ProfileSection
					id="datos"
					title="Datos personales"
					description="Cómo se llama y cómo prefiere que le llames."
				>
					<div className="grid gap-5 md:grid-cols-2">
						<Field id="p-first" label="Nombre" error={errors.firstName}>
							<TextInput
								id="p-first"
								value={value.firstName}
								onValueChange={(firstName) => set({ firstName })}
								invalid={Boolean(errors.firstName)}
								autoComplete="off"
								required
							/>
						</Field>
						<Field id="p-last" label="Apellido" error={errors.lastName}>
							<TextInput
								id="p-last"
								value={value.lastName}
								onValueChange={(lastName) => set({ lastName })}
								invalid={Boolean(errors.lastName)}
								autoComplete="off"
								required
							/>
						</Field>
						<Field
							id="p-preferred"
							label="Cómo prefiere que le llamen"
							hint="Opcional."
							error={errors.preferredName}
						>
							<TextInput
								id="p-preferred"
								value={value.preferredName}
								onValueChange={(preferredName) => set({ preferredName })}
								autoComplete="off"
							/>
						</Field>
						<Field
							id="p-id"
							label="Cédula o documento"
							hint="Opcional."
							error={errors.nationalId}
						>
							<TextInput
								id="p-id"
								value={value.nationalId}
								onValueChange={(nationalId) => set({ nationalId })}
								autoComplete="off"
							/>
						</Field>
						<Field
							id="p-birth"
							label="Fecha de nacimiento"
							error={errors.birthDate}
						>
							<TextInput
								id="p-birth"
								type="date"
								value={value.birthDate}
								onValueChange={(birthDate) => set({ birthDate })}
								invalid={Boolean(errors.birthDate)}
							/>
						</Field>
						<Field id="p-gender" label="Género" error={errors.gender}>
							<SelectInput
								id="p-gender"
								value={value.gender}
								onValueChange={(gender) => set({ gender })}
								options={genderOptions}
							/>
						</Field>
					</div>
				</ProfileSection>

				<ProfileSection
					id="contacto"
					title="Contacto"
					description="Para recordatorios de citas y para enviarle sus tareas."
				>
					<div className="grid gap-5 md:grid-cols-2">
						<Field
							id="p-phone"
							label="Teléfono"
							hint="Con código de país, por ejemplo +58 412 1234567."
							error={errors.phone}
						>
							<TextInput
								id="p-phone"
								type="tel"
								inputMode="tel"
								value={value.phone}
								onValueChange={(phone) => set({ phone })}
								invalid={Boolean(errors.phone)}
								autoComplete="off"
							/>
						</Field>
						<Field id="p-email" label="Correo" error={errors.email}>
							<TextInput
								id="p-email"
								type="email"
								value={value.email}
								onValueChange={(email) => set({ email })}
								invalid={Boolean(errors.email)}
								autoComplete="off"
							/>
						</Field>
						<div className="md:col-span-2">
							<ToggleRow
								title="Acepta mensajes por WhatsApp"
								detail="Solo enviamos recordatorios por WhatsApp si el paciente lo autorizó."
								checked={value.whatsappOptIn}
								onCheckedChange={(whatsappOptIn) => set({ whatsappOptIn })}
							/>
						</div>
						<Field id="p-country" label="País de residencia">
							<SelectInput
								id="p-country"
								value={value.countryCode}
								onValueChange={(countryCode) => set({ countryCode })}
								options={countryOptions}
							/>
						</Field>
						<Field id="p-city" label="Ciudad" error={errors.city}>
							<TextInput
								id="p-city"
								value={value.city}
								onValueChange={(city) => set({ city })}
								autoComplete="off"
							/>
						</Field>
						<Field
							id="p-tz"
							label="Zona horaria"
							hint="Para mostrarle sus citas a su hora si vive en otro país."
							className="md:col-span-2"
						>
							<SelectInput
								id="p-tz"
								value={value.timezone}
								onValueChange={(timezone) => set({ timezone })}
								options={timezoneOptions}
							/>
						</Field>
					</div>
				</ProfileSection>

				<ProfileSection
					id="emergencia"
					title="Contacto de emergencia"
					description="A quién llamar si algo le pasa al paciente. Opcional."
				>
					<div className="grid gap-5 md:grid-cols-3">
						<Field id="p-em-name" label="Nombre" error={errors.emergencyName}>
							<TextInput
								id="p-em-name"
								value={value.emergencyName}
								onValueChange={(emergencyName) => set({ emergencyName })}
								autoComplete="off"
							/>
						</Field>
						<Field
							id="p-em-phone"
							label="Teléfono"
							error={errors.emergencyPhone}
						>
							<TextInput
								id="p-em-phone"
								type="tel"
								value={value.emergencyPhone}
								onValueChange={(emergencyPhone) => set({ emergencyPhone })}
								autoComplete="off"
							/>
						</Field>
						<Field
							id="p-em-rel"
							label="Parentesco"
							error={errors.emergencyRelation}
						>
							<TextInput
								id="p-em-rel"
								value={value.emergencyRelation}
								onValueChange={(emergencyRelation) =>
									set({ emergencyRelation })
								}
								placeholder="Madre, pareja…"
								autoComplete="off"
							/>
						</Field>
					</div>
				</ProfileSection>

				<ProfileSection
					id="clinico"
					title="Motivo de consulta"
					description={
						<span className="inline-flex items-start gap-1.5">
							<Lock aria-hidden="true" className="mt-1 size-3.5 shrink-0" />
							Se guarda cifrado. Solo tú puedes leerlo.
						</span>
					}
				>
					{value.intakeReason === undefined ? (
						<SetupNotice>
							No pudimos descifrar el motivo guardado, así que no se puede
							editar aquí. Al guardar, se conserva tal cual.
						</SetupNotice>
					) : (
						<Field
							id="p-intake"
							label="Por qué consulta"
							error={errors.intakeReason}
						>
							<TextArea
								id="p-intake"
								value={value.intakeReason}
								onValueChange={(intakeReason) => set({ intakeReason })}
								maxLength={4000}
								placeholder="En sus palabras: qué le trae, desde cuándo, qué espera de la terapia."
							/>
						</Field>
					)}
				</ProfileSection>

				<ProfileSection
					id="consulta"
					title="En tu consulta"
					description="Su estado y, si le cobras distinto, su precio por sesión."
				>
					<div className="grid gap-5 md:grid-cols-2">
						<Field id="p-status" label="Estado">
							<SelectInput
								id="p-status"
								value={value.status}
								onValueChange={(status) =>
									set({ status: status as PatientInput["status"] })
								}
								options={statusOptions}
							/>
						</Field>
						<Field
							id="p-price"
							label="Precio por sesión"
							hint="Vacío = tu tarifa habitual."
							error={errors.sessionPriceUsd}
						>
							<NumberInput
								id="p-price"
								value={value.sessionPriceUsd}
								onValueChange={(sessionPriceUsd) =>
									set({
										sessionPriceUsd:
											sessionPriceUsd === null || Number.isNaN(sessionPriceUsd)
												? null
												: sessionPriceUsd,
									})
								}
								nullable
								unit="USD"
								step={0.01}
								min={0}
								invalid={Boolean(errors.sessionPriceUsd)}
							/>
						</Field>
					</div>
				</ProfileSection>

				<div className="flex flex-wrap items-center gap-3 pb-4">
					<ActionButton
						type="submit"
						pending={pending}
						pendingLabel="Guardando…"
					>
						{mode === "create" ? "Registrar paciente" : "Guardar cambios"}
					</ActionButton>
					<Link
						href={backHref}
						className="inline-flex h-12 items-center rounded-full bg-card px-6 font-semibold text-[15px] outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
					>
						Cancelar
					</Link>
				</div>
			</form>
		</m.div>
	);
}
