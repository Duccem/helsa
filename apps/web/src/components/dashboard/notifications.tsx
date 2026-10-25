"use client";

import {
	Popover,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@helsa/ui/components/popover";
import { cn } from "@helsa/ui/lib/utils";
import { Bell, BellOff } from "lucide-react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

export type DashboardNotification = {
	id: string;
	title: string;
	detail: string;
	when: string;
	read: boolean;
};

// Sample notifications until the real feed exists.
const sampleNotifications: DashboardNotification[] = [
	{
		id: "n1",
		title: "Andrea L. pidió otra hora",
		detail: "Quiere mover la sesión del lunes a las 17:00.",
		when: "Hace 12 min",
		read: false,
	},
	{
		id: "n2",
		title: "Carlos P. respondió su tarea",
		detail: "Registro de pensamientos · ánimo 3 de 10.",
		when: "Hace 1 h",
		read: false,
	},
	{
		id: "n3",
		title: "Pago recibido de José G.",
		detail: "$40 por Pago móvil, a tasa BCV del día.",
		when: "Hace 3 h",
		read: false,
	},
	{
		id: "n4",
		title: "No se entregó un recordatorio",
		detail: "El WhatsApp para Rafael D. falló. Prueba por correo.",
		when: "Ayer",
		read: true,
	},
];

type NotificationsContextValue = {
	items: DashboardNotification[];
	unread: number;
	muted: boolean;
	setMuted: (muted: boolean) => void;
	markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
	null,
);

const MUTED_KEY = "helsa:notifications-muted";

export function NotificationsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [items, setItems] = useState(sampleNotifications);
	const [muted, setMutedState] = useState(false);

	useEffect(() => {
		try {
			setMutedState(window.localStorage.getItem(MUTED_KEY) === "1");
		} catch {
			// Storage can be blocked; notifications simply stay on.
		}
	}, []);

	const setMuted = useCallback((value: boolean) => {
		setMutedState(value);
		try {
			window.localStorage.setItem(MUTED_KEY, value ? "1" : "0");
		} catch {
			// Ignore: the preference lasts for this visit only.
		}
	}, []);

	const markAllRead = useCallback(() => {
		setItems((current) => current.map((item) => ({ ...item, read: true })));
	}, []);

	const value = useMemo(
		() => ({
			items,
			unread: items.filter((item) => !item.read).length,
			muted,
			setMuted,
			markAllRead,
		}),
		[items, muted, setMuted, markAllRead],
	);

	return <NotificationsContext value={value}>{children}</NotificationsContext>;
}

export function useNotifications() {
	const context = use(NotificationsContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used inside NotificationsProvider",
		);
	}
	return context;
}

export function NotificationsButton() {
	const { items, unread, muted, markAllRead } = useNotifications();
	const showCount = unread > 0 && !muted;

	return (
		<Popover>
			<PopoverTrigger
				aria-label={
					muted
						? "Notificaciones silenciadas"
						: `Notificaciones, ${unread} sin leer`
				}
				className="relative inline-flex size-11 items-center justify-center rounded-full bg-card text-foreground outline-none transition-[background-color,transform] duration-200 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring active:scale-95 data-popup-open:bg-chapter-lilac"
			>
				{muted ? (
					<BellOff aria-hidden="true" className="size-[1.15rem]" />
				) : (
					<Bell aria-hidden="true" className="size-[1.15rem]" />
				)}
				{showCount ? (
					<span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-chapter-violet px-1 font-semibold text-[13px] text-white tabular-nums">
						{unread}
					</span>
				) : null}
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-[min(24rem,calc(100vw-2rem))] gap-0 rounded-3xl bg-popover p-2 text-[15px] shadow-[0_24px_60px_-20px_oklch(0.2_0.06_287/0.35)] ring-0"
			>
				<div className="flex items-center justify-between gap-4 px-3 pt-2 pb-3">
					<PopoverTitle className="font-display font-medium text-lg">
						Notificaciones
					</PopoverTitle>
					{unread > 0 ? (
						<button
							type="button"
							onClick={markAllRead}
							className="rounded-full px-3 py-1.5 font-semibold text-[14px] text-dash-link outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring"
						>
							Marcar como leídas
						</button>
					) : null}
				</div>
				{muted ? (
					<p className="mx-1 mb-2 rounded-2xl bg-dash-ground px-4 py-3 text-[14px] text-muted-foreground">
						Están silenciadas. Las sigues viendo aquí, pero no te avisamos.
					</p>
				) : null}
				<ul className="flex flex-col gap-1">
					{items.map((item) => (
						<li
							key={item.id}
							className={cn(
								"flex gap-3 rounded-2xl px-3 py-3",
								item.read ? "" : "bg-dash-ground",
							)}
						>
							<span
								aria-hidden="true"
								className={cn(
									"mt-2 size-2 shrink-0 rounded-full",
									item.read
										? "bg-transparent"
										: "bg-chapter-violet dark:bg-primary",
								)}
							/>
							<div className="min-w-0 flex-1">
								<p className="font-semibold leading-snug">
									{item.title}
									{item.read ? null : (
										<span className="sr-only"> (sin leer)</span>
									)}
								</p>
								<p className="mt-0.5 text-[14px] text-muted-foreground leading-snug">
									{item.detail}
								</p>
								<p className="mt-1 text-[13px] text-muted-foreground">
									{item.when}
								</p>
							</div>
						</li>
					))}
				</ul>
			</PopoverContent>
		</Popover>
	);
}
