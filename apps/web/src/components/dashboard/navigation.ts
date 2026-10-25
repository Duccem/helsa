import {
	CalendarDays,
	House,
	ListChecks,
	type LucideIcon,
	NotebookPen,
	Settings,
	Users,
	Wallet,
} from "lucide-react";
import type { Route } from "next";

export type DashboardRole = "therapist" | "patient";

export type NavItem = {
	href: Route;
	label: string;
	icon: LucideIcon;
	/** Sample count shown next to the label until real data is wired. */
	badge?: number;
};

export type DashboardUser = {
	name: string;
	email: string;
	image: string | null;
	role: DashboardRole;
};

/**
 * Better Auth stores the role as free text. Admins and organizations see the
 * therapist navigation until they get their own.
 */
export function toDashboardRole(
	role: string | null | undefined,
): DashboardRole {
	return role === "patient" ? "patient" : "therapist";
}

export const roleLabels: Record<DashboardRole, string> = {
	therapist: "Terapeuta",
	patient: "Paciente",
};

const therapistNav: NavItem[] = [
	{ href: "/dashboard", label: "Inicio", icon: House },
	{
		href: "/dashboard/schedule",
		label: "Agenda",
		icon: CalendarDays,
		badge: 3,
	},
	{ href: "/dashboard/patients", label: "Pacientes", icon: Users },
	{ href: "/dashboard/notes", label: "Notas clínicas", icon: NotebookPen },
	{ href: "/dashboard/tasks", label: "Tareas", icon: ListChecks, badge: 3 },
	{ href: "/dashboard/payments", label: "Cobros", icon: Wallet },
];

// Pending: the patient dashboard reuses these routes with its own content.
const patientNav: NavItem[] = [
	{ href: "/dashboard", label: "Inicio", icon: House },
	{ href: "/dashboard/schedule", label: "Mis citas", icon: CalendarDays },
	{ href: "/dashboard/tasks", label: "Mis tareas", icon: ListChecks },
	{ href: "/dashboard/payments", label: "Pagos", icon: Wallet },
];

export const navByRole: Record<DashboardRole, NavItem[]> = {
	therapist: therapistNav,
	patient: patientNav,
};

export const settingsItem: NavItem = {
	href: "/dashboard/settings",
	label: "Configuración",
	icon: Settings,
};

export function isActive(pathname: string, href: string) {
	if (href === "/dashboard") return pathname === "/dashboard";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}
