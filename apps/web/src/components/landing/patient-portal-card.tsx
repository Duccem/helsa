import { Check } from "lucide-react";

import { patientBenefits } from "./content";
import { MoodLogPreview } from "./mood-log-preview";

export function PatientPortalCard() {
	return (
		<div className="grid gap-10 rounded-[1.5rem] border border-border/70 bg-card p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-12">
			<div>
				<p className="font-semibold text-primary text-xs uppercase tracking-[0.14em]">
					Para tus pacientes
				</p>
				<h3 className="mt-3 font-display font-medium text-2xl tracking-tight">
					El trabajo continúa entre sesiones.
				</h3>
				<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
					Asigna registros y ejercicios. Tu paciente entra con un link, sin
					contraseñas, anota cómo se siente y tú lo ves antes de la próxima
					cita.
				</p>
				<ul className="mt-6 space-y-3">
					{patientBenefits.map((benefit) => (
						<li key={benefit} className="flex items-start gap-2.5 text-sm">
							<Check
								aria-hidden="true"
								className="mt-0.5 size-4 shrink-0 text-primary"
							/>
							{benefit}
						</li>
					))}
				</ul>
			</div>

			<MoodLogPreview />
		</div>
	);
}
