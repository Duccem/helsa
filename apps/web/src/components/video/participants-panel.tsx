"use client";

import { Switch } from "@helsa/ui/components/switch";
import { UserX } from "lucide-react";
import { useState } from "react";

import { PatientAvatar } from "@/components/dashboard/therapist/parts";

import { ConfirmDialog } from "./parts";
import type { CallPerson, JitsiCall } from "./use-jitsi-call";

/** Therapist only: who is in the call, who is waiting, and the waiting room switch. */
export function ParticipantsPanel({
	call,
	selfName,
}: {
	call: JitsiCall;
	selfName: string;
}) {
	const [removing, setRemoving] = useState<CallPerson | null>(null);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-start justify-between gap-4 rounded-2xl bg-dash-ground p-4">
				<span>
					<span id="lobby-label" className="block font-semibold text-[15px]">
						Sala de espera
					</span>
					<span className="block text-[14px] text-muted-foreground leading-snug">
						Quien entre espera a que lo admitas.
					</span>
				</span>
				<Switch
					checked={call.lobby}
					onCheckedChange={(checked) => call.setLobby(checked)}
					aria-labelledby="lobby-label"
				/>
			</div>

			{call.knocking.length > 0 ? (
				<section aria-labelledby="waiting-title">
					<h3
						id="waiting-title"
						className="mb-2 font-semibold text-[14px] text-muted-foreground"
					>
						Esperando ({call.knocking.length})
					</h3>
					<ul className="flex flex-col gap-2">
						{call.knocking.map((person) => (
							<li
								key={person.id}
								className="flex items-center gap-3 rounded-2xl bg-chapter-lilac p-3"
							>
								<PatientAvatar name={person.name} />
								<span className="min-w-0 flex-1 truncate font-semibold text-[15px]">
									{person.name}
								</span>
								<button
									type="button"
									onClick={() => call.answerKnock(person.id, false)}
									className="h-9 rounded-full px-3 font-semibold text-[13px] outline-none hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-ring"
								>
									Rechazar
								</button>
								<button
									type="button"
									onClick={() => call.answerKnock(person.id, true)}
									className="h-9 rounded-full bg-chapter-violet px-3 font-semibold text-[13px] text-white outline-none hover:bg-chapter-violet/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									Admitir
								</button>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<section aria-labelledby="in-call-title">
				<h3
					id="in-call-title"
					className="mb-2 font-semibold text-[14px] text-muted-foreground"
				>
					En la llamada ({call.people.length + 1})
				</h3>
				<ul className="flex flex-col gap-1">
					<li className="flex items-center gap-3 rounded-2xl p-2">
						<PatientAvatar name={selfName} />
						<span className="min-w-0 flex-1 truncate font-semibold text-[15px]">
							{selfName}{" "}
							<span className="font-normal text-muted-foreground">(tú)</span>
						</span>
					</li>
					{call.people.map((person) => (
						<li
							key={person.id}
							className="flex items-center gap-3 rounded-2xl p-2 hover:bg-dash-ground"
						>
							<PatientAvatar name={person.name} />
							<span className="min-w-0 flex-1 truncate font-semibold text-[15px]">
								{person.name}
							</span>
							<button
								type="button"
								onClick={() => setRemoving(person)}
								aria-label={`Sacar a ${person.name} de la llamada`}
								className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[13px] text-dash-alert outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
							>
								<UserX aria-hidden="true" className="size-4" />
								Sacar
							</button>
						</li>
					))}
				</ul>
				{call.people.length === 0 ? (
					<p className="mt-2 px-2 text-[14px] text-muted-foreground">
						Aún no entra nadie más.
					</p>
				) : null}
			</section>

			<ConfirmDialog
				open={removing !== null}
				onOpenChange={(open) => {
					if (!open) setRemoving(null);
				}}
				title={`¿Sacar a ${removing?.name ?? ""}?`}
				description="Sale de la llamada ahora. Puede volver a entrar con su enlace y, con la sala de espera activa, tendrás que admitirlo."
				confirmLabel="Sacar de la llamada"
				onConfirm={() => {
					if (removing) call.kick(removing.id);
				}}
			/>
		</div>
	);
}
