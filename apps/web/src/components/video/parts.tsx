"use client";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@helsa/ui/components/alert-dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@helsa/ui/components/popover";
import { cn } from "@helsa/ui/lib/utils";
import { Settings2 } from "lucide-react";
import { type ComponentProps, useState } from "react";

import type { JitsiApi, JitsiCurrentDevices, JitsiDevices } from "./jitsi";

/** Round button of the call bar. `off` paints a muted mic or camera red. */
export function ControlButton({
	label,
	off,
	active,
	className,
	children,
	...props
}: ComponentProps<"button"> & {
	label: string;
	off?: boolean;
	active?: boolean;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			className={cn(
				"inline-flex size-12 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:size-14 [&_svg]:size-5",
				off
					? "bg-destructive text-white hover:bg-destructive/85"
					: active
						? "bg-white text-night hover:bg-white/85"
						: "bg-white/12 text-white hover:bg-white/20",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

/** Pill button used on the dark call screens. */
export function PillButton({
	variant = "light",
	className,
	...props
}: ComponentProps<"button"> & { variant?: "light" | "ghost" | "danger" }) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 font-semibold text-[15px] outline-none transition-[background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4",
				variant === "light" && "bg-white text-night hover:bg-white/85",
				variant === "ghost" && "bg-white/12 text-white hover:bg-white/20",
				variant === "danger" &&
					"bg-destructive text-white hover:bg-destructive/85",
				className,
			)}
			{...props}
		/>
	);
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => unknown;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-sm rounded-[1.75rem] bg-card p-6 ring-0 sm:max-w-md">
				<AlertDialogTitle className="font-display font-medium text-[1.375rem] leading-tight">
					{title}
				</AlertDialogTitle>
				<AlertDialogDescription className="text-[15px] text-foreground/80 leading-relaxed">
					{description}
				</AlertDialogDescription>
				<AlertDialogFooter className="mt-2 gap-2">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="inline-flex h-10 items-center justify-center rounded-full px-4 font-semibold text-[14px] outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
					>
						Volver
					</button>
					<button
						type="button"
						onClick={() => {
							onOpenChange(false);
							onConfirm();
						}}
						className="inline-flex h-10 items-center justify-center rounded-full bg-destructive px-4 font-semibold text-[14px] text-white outline-none hover:bg-destructive/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						{confirmLabel}
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

type DeviceKind = keyof JitsiDevices;

const deviceLabels: Record<DeviceKind, string> = {
	audioInput: "Micrófono",
	audioOutput: "Altavoz",
	videoInput: "Cámara",
};

/** Microphone, speaker and camera pickers, read from the call when opened. */
export function DeviceMenu({ api }: { api: React.RefObject<JitsiApi | null> }) {
	const [devices, setDevices] = useState<JitsiDevices | null>(null);
	const [current, setCurrent] = useState<JitsiCurrentDevices>({});

	async function refresh() {
		const call = api.current;
		if (!call) return;
		const [available, selected] = await Promise.all([
			call.getAvailableDevices(),
			call.getCurrentDevices(),
		]);
		setDevices(available);
		setCurrent(selected);
	}

	function choose(kind: DeviceKind, deviceId: string) {
		const call = api.current;
		const device = devices?.[kind].find((item) => item.deviceId === deviceId);
		if (!call || !device) return;
		if (kind === "audioInput") call.setAudioInputDevice(device.label, deviceId);
		if (kind === "audioOutput")
			call.setAudioOutputDevice(device.label, deviceId);
		if (kind === "videoInput") call.setVideoInputDevice(device.label, deviceId);
		setCurrent((value) => ({ ...value, [kind]: device }));
	}

	return (
		<Popover
			onOpenChange={(open) => {
				if (open) void refresh().catch(() => setDevices(null));
			}}
		>
			<PopoverTrigger
				render={
					<ControlButton label="Elegir micrófono y cámara">
						<Settings2 aria-hidden="true" />
					</ControlButton>
				}
			/>
			<PopoverContent
				side="top"
				sideOffset={10}
				className="w-80 gap-4 rounded-3xl p-5 text-[14px]"
			>
				{devices ? (
					(Object.keys(deviceLabels) as DeviceKind[])
						.filter((kind) => devices[kind].length > 0)
						.map((kind) => (
							<label key={kind} className="flex flex-col gap-1.5">
								<span className="font-semibold">{deviceLabels[kind]}</span>
								<select
									value={current[kind]?.deviceId ?? ""}
									onChange={(event) => choose(kind, event.target.value)}
									className="h-11 w-full rounded-xl border border-input bg-background px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									{devices[kind].map((device) => (
										<option key={device.deviceId} value={device.deviceId}>
											{device.label || deviceLabels[kind]}
										</option>
									))}
								</select>
							</label>
						))
				) : (
					<p className="text-muted-foreground">
						Los dispositivos aparecen cuando entras a la llamada.
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}

/** "12:05" since `from`, ticking every second. */
export function elapsed(from: number, now: number) {
	const seconds = Math.max(0, Math.floor((now - from) / 1000));
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	const pad = (value: number) => String(value).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function clock(iso: string, timeZone: string) {
	return new Intl.DateTimeFormat("es", {
		timeZone,
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(iso));
}

export function longDate(iso: string, timeZone: string) {
	return new Intl.DateTimeFormat("es", {
		timeZone,
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(new Date(iso));
}
