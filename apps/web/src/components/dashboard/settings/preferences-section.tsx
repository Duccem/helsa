"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ProfileSection } from "../profile/parts";
import { SaveBar, Segmented, ToggleRow, useSectionForm } from "./fields";
import { type PreferencesInput, preferencesSchema } from "./schema";

function Row({
	title,
	detail,
	children,
}: {
	title: string;
	detail?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-3 rounded-[1.25rem] bg-dash-ground p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
			<div className="min-w-0">
				<p className="font-semibold text-[15px]">{title}</p>
				{detail ? (
					<p className="mt-0.5 text-[14px] text-foreground/75 leading-snug">
						{detail}
					</p>
				) : null}
			</div>
			{children}
		</div>
	);
}

/** Light, dark or the device's choice. Applies at once and stays on this device. */
function ThemeRow() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const current = mounted ? (theme ?? "system") : "system";

	return (
		<Row
			title="Apariencia"
			detail="Cambia al instante y se recuerda en este equipo."
		>
			<Segmented
				label="Apariencia"
				tone="card"
				options={[
					["light", "Claro"],
					["dark", "Oscuro"],
					["system", "Como el equipo"],
				]}
				value={current}
				onChange={setTheme}
			/>
		</Row>
	);
}

export function PreferencesSection({ initial }: { initial: PreferencesInput }) {
	const form = useSectionForm({
		section: "preferences",
		schema: preferencesSchema,
		initial,
		success: "Guardamos tus preferencias.",
	});
	const { value, update } = form;

	return (
		<ProfileSection
			id="preferencias"
			title="Preferencias de la app"
			description="Cómo se ve y cómo se lee Helsa para ti. Tus pacientes no ven estos ajustes."
		>
			<form noValidate onSubmit={form.submit} className="grid gap-2">
				<ThemeRow />
				<Row
					title="Formato de hora"
					detail="En la agenda, el inicio y los recordatorios."
				>
					<Segmented
						label="Formato de hora"
						tone="card"
						options={[
							["24h", "14:30"],
							["12h", "2:30 p. m."],
						]}
						value={value.timeFormat}
						onChange={(timeFormat) => update({ timeFormat })}
					/>
				</Row>
				<Row title="La semana empieza el">
					<Segmented
						label="La semana empieza el"
						tone="card"
						options={[
							[0, "Lunes"],
							[6, "Domingo"],
						]}
						value={value.weekStartsOn}
						onChange={(weekStartsOn) => update({ weekStartsOn })}
					/>
				</Row>
				<Row
					title="Montos"
					detail="En bolívares se usa la tasa BCV del día del pago."
				>
					<Segmented
						label="Mostrar montos en"
						tone="card"
						options={[
							["usd", "Dólares"],
							["ves", "Bolívares"],
							["both", "Los dos"],
						]}
						value={value.currencyDisplay}
						onChange={(currencyDisplay) => update({ currencyDisplay })}
					/>
				</Row>
				<ToggleRow
					title="Modo discreto"
					detail="Muestra solo las iniciales de tus pacientes en el inicio, por si alguien más ve tu pantalla."
					checked={value.privateMode}
					onCheckedChange={(privateMode) => update({ privateMode })}
				/>
				<div className="pt-4">
					<SaveBar
						dirty={form.dirty}
						pending={form.pending}
						onReset={form.reset}
					/>
				</div>
			</form>
		</ProfileSection>
	);
}
