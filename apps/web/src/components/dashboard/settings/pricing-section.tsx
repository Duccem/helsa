"use client";

import { cn } from "@helsa/ui/lib/utils";
import { ArrowUpToLine, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useRef } from "react";

import { ProfileSection } from "../profile/parts";
import { EASE_OUT, ves } from "../therapist/parts";
import {
	ChipGroup,
	Field,
	FieldError,
	NumberInput,
	SaveBar,
	SelectInput,
	TextArea,
	TextInput,
	Toggle,
	useSectionForm,
} from "./fields";
import {
	type Modality,
	modalityLabels,
	type PaymentMethod,
	type PricingInput,
	paymentMethodLabels,
	pricingSchema,
	type Rate,
} from "./schema";

const methodOptions = Object.entries(paymentMethodLabels) as Array<
	[PaymentMethod, string]
>;
const modalityOptions: Array<[string, string]> = [
	["", "Cualquier modalidad"],
	...(Object.entries(modalityLabels) as Array<[Modality, string]>),
];

const usdFormat = new Intl.NumberFormat("es-VE", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 2,
	minimumFractionDigits: 0,
});

export function PricingSection({
	initial,
	vesPerUsd,
	sessionMinutes,
}: {
	initial: PricingInput;
	vesPerUsd: number | null;
	sessionMinutes: number;
}) {
	const form = useSectionForm({
		section: "pricing",
		schema: pricingSchema,
		initial,
		success: "Guardamos tus precios.",
	});
	const { value, update, errors } = form;
	// Stable keys for rows that have no id until they are saved.
	const keys = useRef(new WeakMap<Rate, string>());
	const counter = useRef(0);
	function keyOf(rate: Rate) {
		let key = keys.current.get(rate);
		if (!key) {
			counter.current += 1;
			key = rate.id ?? `new-${counter.current}`;
			keys.current.set(rate, key);
		}
		return key;
	}

	function patchRate(index: number, patch: Partial<Rate>) {
		const rates = value.rates.map((rate, position) => {
			if (position !== index) return rate;
			const next = { ...rate, ...patch };
			keys.current.set(next, keyOf(rate));
			return next;
		});
		update({ rates });
	}

	function addRate() {
		update({
			rates: [
				...value.rates,
				{
					name: "",
					durationMinutes: sessionMinutes,
					priceUsd: Number.NaN,
					modality: null,
					isActive: true,
				},
			],
		});
	}

	function makeMain(index: number) {
		const rate = value.rates[index];
		if (!rate) return;
		update({
			rates: [rate, ...value.rates.filter((_, position) => position !== index)],
		});
	}

	const mainIndex = value.rates.findIndex((rate) => rate.isActive);

	return (
		<ProfileSection
			id="precios"
			title="Precios y pagos"
			description="Lo que cobras por cada tipo de sesión y cómo te pagan. Cada cita guarda el precio del día en que se agenda."
		>
			<form noValidate onSubmit={form.submit} className="grid gap-6">
				<ul className="grid gap-2" aria-label="Tus precios">
					<AnimatePresence initial={false}>
						{value.rates.map((rate, index) => {
							const main = index === mainIndex;
							const error = (field: string) =>
								errors[`rates.${index}.${field}`];
							return (
								<m.li
									key={keyOf(rate)}
									layout
									initial={{ opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: 24 }}
									transition={{ duration: 0.3, ease: EASE_OUT }}
									className={cn(
										"grid gap-4 rounded-[1.5rem] p-4 sm:p-5",
										main ? "bg-chapter-lilac" : "bg-dash-ground",
										rate.isActive ? "" : "opacity-75",
									)}
								>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<p className="font-display font-medium text-[1.75rem] tabular-nums leading-none tracking-[-0.02em]">
											{Number.isFinite(rate.priceUsd)
												? usdFormat.format(rate.priceUsd)
												: "$—"}
											{vesPerUsd && Number.isFinite(rate.priceUsd) ? (
												<span className="ml-3 font-landing font-normal text-[15px] tracking-normal">
													{ves(rate.priceUsd * vesPerUsd)} a tasa BCV
												</span>
											) : null}
										</p>
										<div className="flex items-center gap-1">
											{main ? (
												<span className="px-2 font-semibold text-[14px]">
													Precio principal
												</span>
											) : rate.isActive ? (
												<button
													type="button"
													onClick={() => makeMain(index)}
													className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
												>
													<ArrowUpToLine
														aria-hidden="true"
														className="size-4"
													/>
													Hacer principal
												</button>
											) : null}
											<div className="flex items-center gap-2 pl-2">
												<span
													className="text-[14px]"
													id={`rate-${index}-active`}
												>
													{rate.isActive ? "Visible" : "Oculto"}
												</span>
												<Toggle
													checked={rate.isActive}
													onCheckedChange={(isActive) =>
														patchRate(index, { isActive })
													}
													labelledBy={`rate-${index}-active`}
													label={`Mostrar ${rate.name || "este precio"} a tus pacientes`}
												/>
											</div>
											{value.rates.length > 1 ? (
												<button
													type="button"
													onClick={() =>
														update({
															rates: value.rates.filter(
																(_, position) => position !== index,
															),
														})
													}
													aria-label={`Eliminar ${rate.name || "este precio"}`}
													className="grid size-10 place-items-center rounded-full text-foreground/70 outline-none transition-[background-color,color,transform] hover:bg-card hover:text-dash-alert focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
												>
													<Trash2 aria-hidden="true" className="size-[18px]" />
												</button>
											) : null}
										</div>
									</div>

									<div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)]">
										<Field
											id={`rate-${index}-name`}
											label="Nombre"
											error={error("name")}
										>
											<TextInput
												id={`rate-${index}-name`}
												value={rate.name}
												onValueChange={(name) => patchRate(index, { name })}
												placeholder="Sesión individual"
												className="bg-card dark:bg-card"
												invalid={Boolean(error("name"))}
											/>
										</Field>
										<Field id={`rate-${index}-duration`} label="Duración">
											<NumberInput
												id={`rate-${index}-duration`}
												value={rate.durationMinutes}
												onValueChange={(durationMinutes) =>
													patchRate(index, {
														durationMinutes: durationMinutes ?? Number.NaN,
													})
												}
												min={15}
												max={240}
												step={5}
												unit="min"
												className="[&_input]:bg-card"
												invalid={Boolean(error("durationMinutes"))}
											/>
										</Field>
										<Field id={`rate-${index}-price`} label="Precio">
											<NumberInput
												id={`rate-${index}-price`}
												value={rate.priceUsd}
												onValueChange={(priceUsd) =>
													patchRate(index, { priceUsd: priceUsd ?? Number.NaN })
												}
												min={0}
												step={0.5}
												unit="USD"
												className="[&_input]:bg-card"
												invalid={Boolean(error("priceUsd"))}
											/>
										</Field>
										<Field id={`rate-${index}-modality`} label="Modalidad">
											<SelectInput
												id={`rate-${index}-modality`}
												value={rate.modality ?? ""}
												onValueChange={(modality) =>
													patchRate(index, {
														modality: (modality || null) as Modality | null,
													})
												}
												options={modalityOptions}
												className="[&_select]:bg-card"
											/>
										</Field>
									</div>
									<FieldError
										message={error("durationMinutes") ?? error("priceUsd")}
									/>
								</m.li>
							);
						})}
					</AnimatePresence>
				</ul>

				{value.rates.length < 10 ? (
					<div>
						<button
							type="button"
							onClick={addRate}
							className="inline-flex h-11 items-center gap-2 rounded-full bg-dash-ground px-5 font-semibold text-[15px] outline-none transition-[background-color,transform] hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
						>
							<Plus aria-hidden="true" className="size-4" />
							Añadir otro precio
						</button>
						<p className="mt-2 px-1 text-[14px] text-foreground/70">
							Por ejemplo: primera consulta, pareja, paquete de cuatro sesiones.
						</p>
					</div>
				) : null}
				<FieldError message={errors.rates} />

				<div className="grid gap-2">
					<p className="px-5 font-medium text-[15px]">
						Formas de pago que aceptas
					</p>
					<ChipGroup
						label="Formas de pago que aceptas"
						options={methodOptions}
						selected={value.paymentMethods}
						onChange={(paymentMethods) => update({ paymentMethods })}
					/>
					<FieldError message={errors.paymentMethods} />
				</div>

				<Field
					id="pay-instructions"
					label="Datos para pagarte"
					error={errors.paymentInstructions}
					hint="Se los enviamos a tu paciente cuando confirma la cita."
				>
					<TextArea
						id="pay-instructions"
						value={value.paymentInstructions ?? ""}
						onValueChange={(paymentInstructions) =>
							update({ paymentInstructions })
						}
						maxLength={600}
						className="min-h-28"
						placeholder={
							"Pago móvil: 0412 555 0101 · V-12.345.678 · Banesco\nZelle: nombre@correo.com"
						}
					/>
				</Field>

				<SaveBar
					dirty={form.dirty}
					pending={form.pending}
					onReset={form.reset}
					note={
						vesPerUsd
							? undefined
							: "Cuando haya tasa BCV del día te mostramos el precio en bolívares."
					}
				/>
			</form>
		</ProfileSection>
	);
}
