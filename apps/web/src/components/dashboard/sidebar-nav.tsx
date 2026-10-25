"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@helsa/ui/components/tooltip";
import { cn } from "@helsa/ui/lib/utils";
import { Check, Copy, Link2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo, LogoMark } from "@/components/landing/logo";

import {
	type DashboardUser,
	isActive,
	type NavItem,
	navByRole,
	settingsItem,
} from "./navigation";

/** Shows the label beside the icon when the sidebar is collapsed. */
function WithTooltip({
	label,
	enabled,
	children,
}: {
	label: string;
	enabled: boolean;
	children: React.ReactElement;
}) {
	if (!enabled) return children;
	return (
		<Tooltip>
			<TooltipTrigger render={children} />
			<TooltipContent
				side="right"
				sideOffset={12}
				className="rounded-full px-3.5 py-2 font-semibold text-[14px]"
			>
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

function NavLink({
	item,
	collapsed,
	onNavigate,
}: {
	item: NavItem;
	collapsed: boolean;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();
	const active = isActive(pathname, item.href);
	const Icon = item.icon;

	return (
		<WithTooltip label={item.label} enabled={collapsed}>
			<Link
				href={item.href}
				onClick={onNavigate}
				aria-current={active ? "page" : undefined}
				className={cn(
					"group relative flex h-11 items-center gap-3 rounded-full text-[15px] outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
					collapsed ? "w-11 justify-center" : "px-4",
					active
						? "bg-card font-semibold text-chapter-violet dark:text-foreground"
						: "text-foreground/80 hover:bg-card/70 hover:text-foreground",
				)}
			>
				<Icon
					aria-hidden="true"
					className={cn(
						"size-[1.15rem] shrink-0 transition-transform duration-200 group-hover:scale-110",
						active ? "text-dash-link" : "text-muted-foreground",
					)}
				/>
				<span className={collapsed ? "sr-only" : "flex-1 truncate"}>
					{item.label}
				</span>
				{item.badge ? (
					collapsed ? (
						<span className="absolute top-2 right-2 size-2 rounded-full bg-chapter-violet ring-2 ring-dash-ground dark:bg-primary">
							<span className="sr-only">, {item.badge} pendientes</span>
						</span>
					) : (
						<span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-chapter-lilac px-2 font-semibold text-[13px] text-chapter-violet tabular-nums dark:text-foreground">
							<span className="sr-only">, </span>
							{item.badge}
							<span className="sr-only"> pendientes</span>
						</span>
					)
				) : null}
			</Link>
		</WithTooltip>
	);
}

function toSlug(name: string) {
	return name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

/** The therapist's public booking link (sample until `booking_slug` is wired). */
function BookingLink({
	name,
	collapsed,
}: {
	name: string;
	collapsed: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const link = `helsa.app/r/${toSlug(name) || "tu-nombre"}`;

	async function copy() {
		try {
			await navigator.clipboard.writeText(`https://${link}`);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch {
			setCopied(false);
		}
	}

	if (collapsed) {
		return (
			<WithTooltip
				label={copied ? "Enlace copiado" : "Copiar enlace de reservas"}
				enabled
			>
				<button
					type="button"
					onClick={copy}
					aria-label={copied ? "Enlace copiado" : "Copiar enlace de reservas"}
					className="inline-flex size-11 items-center justify-center rounded-full bg-chapter-violet text-white outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-95"
				>
					{copied ? (
						<Check aria-hidden="true" className="size-[1.15rem]" />
					) : (
						<Link2 aria-hidden="true" className="size-[1.15rem]" />
					)}
				</button>
			</WithTooltip>
		);
	}

	return (
		<div className="rounded-3xl bg-chapter-violet p-5 text-white">
			<p className="font-display font-medium text-lg leading-tight">
				Tu enlace de reservas
			</p>
			<p className="mt-1.5 text-[14px] text-white/85 leading-snug">
				Compártelo por WhatsApp y tus pacientes eligen su hora.
			</p>
			<p className="mt-3 truncate font-semibold text-[14px]">{link}</p>
			<button
				type="button"
				onClick={copy}
				className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-[14px] text-chapter-violet outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-chapter-violet active:translate-y-0 active:scale-[0.97]"
			>
				{copied ? (
					<Check aria-hidden="true" className="size-4" />
				) : (
					<Copy aria-hidden="true" className="size-4" />
				)}
				<span aria-live="polite">{copied ? "Copiado" : "Copiar enlace"}</span>
			</button>
		</div>
	);
}

export function SidebarNav({
	user,
	collapsed = false,
	onNavigate,
}: {
	user: DashboardUser;
	collapsed?: boolean;
	onNavigate?: () => void;
}) {
	const items = navByRole[user.role];

	return (
		<div
			className={cn(
				"flex h-full flex-col pt-6 pb-5",
				collapsed ? "items-center px-0" : "px-4",
			)}
		>
			<Link
				href="/dashboard"
				onClick={onNavigate}
				aria-label="Helsa, ir al inicio"
				className={cn(
					"inline-flex h-7 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
					collapsed ? "" : "ml-4 self-start",
				)}
			>
				{collapsed ? (
					<LogoMark eager className="h-7" />
				) : (
					<Logo eager className="h-7" />
				)}
			</Link>

			<nav aria-label="Principal" className="mt-10 flex-1">
				<ul className="flex flex-col gap-1">
					{items.map((item) => (
						<li key={item.href}>
							<NavLink
								item={item}
								collapsed={collapsed}
								onNavigate={onNavigate}
							/>
						</li>
					))}
				</ul>
			</nav>

			<div
				className={cn("flex flex-col gap-4", collapsed ? "items-center" : "")}
			>
				{user.role === "therapist" ? (
					<BookingLink name={user.name} collapsed={collapsed} />
				) : null}
				<NavLink
					item={settingsItem}
					collapsed={collapsed}
					onNavigate={onNavigate}
				/>
			</div>
		</div>
	);
}
