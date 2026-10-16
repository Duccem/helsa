import { SessionTimer } from "./session-timer";

function SignalIcon() {
	return (
		<span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
			<span className="h-1.5 w-[3px] rounded-full bg-white" />
			<span className="h-2.5 w-[3px] rounded-full bg-white" />
			<span className="h-3.5 w-[3px] rounded-full bg-white/25" />
		</span>
	);
}

export function VideoCallCard() {
	return (
		<div className="rounded-2xl bg-night p-3 text-white shadow-[0_30px_60px_-20px_oklch(0.2_0.06_287/0.6)]">
			<div className="flex items-center justify-between px-1 pb-3">
				<p className="flex items-center gap-1.5 text-[11px] text-white/85">
					<span className="size-1.5 rounded-full bg-emerald-400" />
					En sesión · <SessionTimer startAt={32 * 60 + 10} />
				</p>
				<SignalIcon />
			</div>

			<div className="grid grid-cols-2 gap-2">
				<div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-white/[0.07] text-[11px] text-white/80">
					Tú
				</div>
				<div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg bg-primary/35 text-center text-[11px] text-white/85 leading-tight">
					María R.
					<span className="text-white/60">solo audio</span>
				</div>
			</div>

			<p className="px-1 pt-3 pb-1 text-[11px] text-white/70 leading-snug">
				La señal bajó. Pasamos a solo audio para que la sesión siga sin
				cortarse.
			</p>
		</div>
	);
}
