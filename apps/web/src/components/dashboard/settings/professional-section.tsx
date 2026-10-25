"use client";

import { BadgeCheck, Clock3, Plus, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";

import { ProfileSection } from "../profile/parts";
import {
	ChipGroup,
	Field,
	NumberInput,
	SaveBar,
	SelectInput,
	TextArea,
	TextInput,
	useSectionForm,
} from "./fields";
import {
	countries,
	type LanguageCode,
	languages,
	type ProfessionalInput,
	professionalSchema,
	specialtySuggestions,
} from "./schema";

const countryOptions = Object.entries(countries) as Array<[string, string]>;
const languageOptions = Object.entries(languages) as Array<
	[LanguageCode, string]
>;

function LicenseStatus({
	verified,
	hasNumber,
}: {
	verified: boolean;
	hasNumber: boolean;
}) {
	if (!hasNumber) return null;
	return verified ? (
		<span className="inline-flex items-center gap-1.5 font-medium text-[14px] text-dash-good">
			<BadgeCheck aria-hidden="true" className="size-4" />
			Verificada
		</span>
	) : (
		<span className="inline-flex items-center gap-1.5 font-medium text-[14px] text-foreground/75">
			<Clock3 aria-hidden="true" className="size-4" />
			En revisión
		</span>
	);
}

/** Chosen specialties as removable pills, suggestions below, and a field for your own. */
function Specialties({
	value,
	onChange,
	error,
}: {
	value: string[];
	onChange: (next: string[]) => void;
	error?: string;
}) {
	const [draft, setDraft] = useState("");
	const remaining = specialtySuggestions.filter(
		(item) =>
			!value.some((chosen) => chosen.toLowerCase() === item.toLowerCase()),
	);

	function add(raw: string) {
		const text = raw.trim().replace(/\s+/g, " ");
		if (text.length < 2) return;
		if (value.some((item) => item.toLowerCase() === text.toLowerCase())) return;
		onChange([...value, text.slice(0, 40)]);
		setDraft("");
	}

	return (
		<Field
			id="specialty-new"
			label="Especialidades"
			error={error}
			hint="Aparecen en tu página de reservas. Elige hasta 12."
			aside={
				<span className="text-[14px] text-foreground/70 tabular-nums">
					{value.length} / 12
				</span>
			}
		>
			<ul
				className="flex flex-wrap gap-2 px-1"
				aria-label="Especialidades elegidas"
			>
				<AnimatePresence initial={false}>
					{value.map((item) => (
						<m.li
							key={item}
							layout
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
						>
							<button
								type="button"
								onClick={() =>
									onChange(value.filter((other) => other !== item))
								}
								aria-label={`Quitar ${item}`}
								className="inline-flex h-10 items-center gap-1.5 rounded-full bg-chapter-violet pr-3 pl-4 font-medium text-[14px] text-white outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.96]"
							>
								{item}
								<X aria-hidden="true" className="size-4 opacity-80" />
							</button>
						</m.li>
					))}
				</AnimatePresence>
			</ul>

			{value.length < 12 ? (
				<>
					<div className="flex gap-2">
						<TextInput
							id="specialty-new"
							value={draft}
							onValueChange={setDraft}
							placeholder="Escribe otra y pulsa Enter"
							maxLength={40}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									add(draft);
								}
							}}
						/>
						<button
							type="button"
							onClick={() => add(draft)}
							disabled={draft.trim().length < 2}
							aria-label="Añadir especialidad"
							className="grid size-12 shrink-0 place-items-center rounded-full bg-dash-ground outline-none transition-[background-color,transform] hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:opacity-50"
						>
							<Plus aria-hidden="true" className="size-5" />
						</button>
					</div>
					{remaining.length > 0 ? (
						<div className="flex flex-wrap gap-2 px-1">
							{remaining.slice(0, 8).map((item) => (
								<button
									key={item}
									type="button"
									onClick={() => add(item)}
									className="inline-flex h-9 items-center gap-1 rounded-full bg-dash-ground px-3.5 text-[14px] outline-none transition-[background-color,transform] hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
								>
									<Plus aria-hidden="true" className="size-3.5" />
									{item}
								</button>
							))}
						</div>
					) : null}
				</>
			) : null}
		</Field>
	);
}

export function ProfessionalSection({
	initial,
	licenseVerified,
}: {
	initial: ProfessionalInput;
	licenseVerified: boolean;
}) {
	const form = useSectionForm({
		section: "professional",
		schema: professionalSchema,
		initial,
		success: "Guardamos tu perfil profesional.",
	});
	const { value, update, errors } = form;

	return (
		<ProfileSection
			id="profesional"
			title="Perfil profesional"
			description="Lo que ven tus pacientes antes de reservar: tu nombre, tu título, tu licencia y cómo trabajas."
		>
			<form noValidate onSubmit={form.submit} className="grid gap-5">
				<div className="grid gap-5 md:grid-cols-2">
					<Field
						id="pro-name"
						label="Nombre para tus pacientes"
						error={errors.displayName}
					>
						<TextInput
							id="pro-name"
							value={value.displayName}
							onValueChange={(displayName) => update({ displayName })}
							invalid={Boolean(errors.displayName)}
							autoComplete="name"
						/>
					</Field>
					<Field id="pro-title" label="Título" error={errors.professionalTitle}>
						<TextInput
							id="pro-title"
							value={value.professionalTitle ?? ""}
							onValueChange={(professionalTitle) =>
								update({ professionalTitle })
							}
							placeholder="Psicóloga clínica"
						/>
					</Field>
				</div>

				<div className="grid gap-5 rounded-[1.5rem] bg-chapter-lilac p-4 sm:p-5 md:grid-cols-2">
					<Field
						id="pro-license"
						label="Número de licencia"
						error={errors.licenseNumber}
						aside={
							<LicenseStatus
								verified={
									licenseVerified &&
									value.licenseNumber === initial.licenseNumber
								}
								hasNumber={Boolean(value.licenseNumber)}
							/>
						}
						hint={
							value.licenseNumber &&
							value.licenseNumber !== initial.licenseNumber
								? "Al cambiarla la revisamos de nuevo."
								: undefined
						}
					>
						<TextInput
							id="pro-license"
							value={value.licenseNumber ?? ""}
							onValueChange={(licenseNumber) => update({ licenseNumber })}
							className="bg-card dark:bg-card"
							placeholder="FPV 12.345"
						/>
					</Field>
					<Field
						id="pro-license-body"
						label="Colegio o ente que la emite"
						error={errors.licenseBody}
					>
						<TextInput
							id="pro-license-body"
							value={value.licenseBody ?? ""}
							onValueChange={(licenseBody) => update({ licenseBody })}
							className="bg-card dark:bg-card"
							placeholder="Federación de Psicólogos de Venezuela"
						/>
					</Field>
				</div>

				<Field
					id="pro-bio"
					label="Sobre ti"
					error={errors.bio}
					hint="Cuéntalo como lo dirías en la primera sesión: a quién acompañas y cómo trabajas."
				>
					<TextArea
						id="pro-bio"
						value={value.bio ?? ""}
						onValueChange={(bio) => update({ bio })}
						maxLength={1200}
						placeholder="Acompaño a adultos con ansiedad y duelo desde la terapia cognitivo-conductual…"
					/>
				</Field>

				<Specialties
					value={value.specialties}
					onChange={(specialties) => update({ specialties })}
					error={errors.specialties}
				/>

				<div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
					<div className="min-w-0 space-y-2">
						<p id="pro-languages" className="px-5 font-medium text-[15px]">
							Idiomas en los que atiendes
						</p>
						<ChipGroup
							label="Idiomas en los que atiendes"
							options={languageOptions}
							selected={value.languages}
							onChange={(next) => update({ languages: next })}
						/>
						{errors.languages ? (
							<p className="px-5 text-[14px] text-dash-alert">
								{errors.languages}
							</p>
						) : null}
					</div>
					<Field
						id="pro-years"
						label="Años de práctica"
						error={errors.yearsExperience}
					>
						<NumberInput
							id="pro-years"
							value={value.yearsExperience}
							onValueChange={(yearsExperience) => update({ yearsExperience })}
							nullable
							min={0}
							max={70}
							unit="años"
						/>
					</Field>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<Field
						id="pro-phone"
						label="Teléfono de contacto"
						error={errors.phone}
						hint="Lo usamos para avisarte por WhatsApp. No se muestra a tus pacientes."
					>
						<TextInput
							id="pro-phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							value={value.phone}
							onValueChange={(phone) => update({ phone })}
							invalid={Boolean(errors.phone)}
							placeholder="+58 412 555 0101"
						/>
					</Field>
					<Field id="pro-country" label="País donde ejerces">
						<SelectInput
							id="pro-country"
							value={value.countryCode}
							onValueChange={(countryCode) =>
								update({
									countryCode: countryCode as ProfessionalInput["countryCode"],
								})
							}
							options={countryOptions}
						/>
					</Field>
				</div>

				<SaveBar
					dirty={form.dirty}
					pending={form.pending}
					onReset={form.reset}
				/>
			</form>
		</ProfileSection>
	);
}
