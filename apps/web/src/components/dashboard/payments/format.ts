import type { ChargeStatus } from "@/lib/core/payment/domain/billing";
import type { PaymentStatus } from "@/lib/core/payment/domain/types";
import type { RangePreset } from "@/lib/utils/date-range";

import { monthNames } from "../therapist/clinic-time";

const usdFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});
const vesFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});
const rateFormat = new Intl.NumberFormat("es-VE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 4,
});
const percentFormat = new Intl.NumberFormat("es-VE", {
	style: "percent",
	maximumFractionDigits: 0,
});

export const usd = (amount: number) => `$${usdFormat.format(amount)}`;
export const ves = (amount: number) => `Bs ${vesFormat.format(amount)}`;
export const rate = (value: number) => rateFormat.format(value);
export const percent = (value: number) => percentFormat.format(value);

/** "+12 %" / "−8 %" against the previous period; null when there's nothing to compare. */
export function delta(current: number, previous: number) {
	if (previous <= 0) return null;
	const change = (current - previous) / previous;
	return {
		change,
		label: `${change >= 0 ? "+" : "−"}${percent(Math.abs(change))}`,
	};
}

export const chargeLabels: Record<ChargeStatus, string> = {
	paid: "Pagadas",
	in_review: "Por verificar",
	partial: "Pago parcial",
	pending: "Pendientes",
	overdue: "Vencidas",
	upcoming: "Por venir",
	no_show: "Inasistencias",
	unpriced: "Sin precio",
};

/** Singular, for one session's badge. */
export const chargeBadge: Record<ChargeStatus, string> = {
	paid: "Pagada",
	in_review: "Por verificar",
	partial: "Parcial",
	pending: "Pendiente",
	overdue: "Vencida",
	upcoming: "Por venir",
	no_show: "No asistió",
	unpriced: "Sin precio",
};

export const chargeHints: Record<ChargeStatus, string> = {
	paid: "Pagos verificados",
	in_review: "Comprobantes por revisar",
	partial: "Lo que falta por pagar",
	pending: "Atendidas sin pagar",
	overdue: "Más de 7 días sin pagar",
	upcoming: "Ingreso esperado",
	no_show: "Valor de las sesiones",
	unpriced: "Configura un precio",
};

/** Fill for the status bar and its legend dot. */
export const chargeFills: Record<ChargeStatus, string> = {
	paid: "bg-chapter-teal-deep",
	in_review: "bg-chapter-lilac-deep",
	partial: "bg-chapter-peach-deep",
	pending: "bg-chapter-peach",
	overdue: "bg-[color-mix(in_oklch,var(--destructive),white_25%)]",
	upcoming: "bg-chapter-violet dark:bg-primary",
	no_show: "bg-foreground/25",
	unpriced: "bg-foreground/10",
};

export const chargeBadgeStyles: Record<ChargeStatus, string> = {
	paid: "bg-chapter-teal text-foreground",
	in_review: "bg-chapter-lilac text-foreground",
	partial: "bg-chapter-peach text-foreground",
	pending: "bg-chapter-peach text-foreground",
	overdue: "bg-destructive/12 text-dash-alert",
	upcoming: "bg-dash-ground text-foreground",
	no_show: "bg-dash-ground text-muted-foreground",
	unpriced: "bg-dash-ground text-muted-foreground",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
	pending_review: "Por verificar",
	verified: "Verificado",
	rejected: "Rechazado",
};

export const paymentStatusStyles: Record<PaymentStatus, string> = {
	pending_review: "bg-chapter-lilac text-foreground",
	verified: "bg-chapter-teal text-foreground",
	rejected: "bg-destructive/12 text-dash-alert",
};

export const presetLabels: Record<RangePreset, string> = {
	this_month: "Este mes",
	last_month: "Mes pasado",
	last_30: "Últimos 30 días",
	this_quarter: "Trimestre",
	this_year: "Este año",
	custom: "Personalizado",
};

/** "2026-11-03" → "3 nov" (with the year when it differs from `today`). */
export function shortDay(day: string, today?: string) {
	const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
	const name = (monthNames[month - 1] ?? "").slice(0, 3);
	const sameYear = today ? today.slice(0, 4) === day.slice(0, 4) : true;
	return sameYear ? `${date} ${name}` : `${date} ${name} ${year}`;
}

export function rangeTitle(from: string, to: string, today: string) {
	if (from === to) return shortDay(from, today);
	return `${shortDay(from, today)} – ${shortDay(to, today)}`;
}

export function sessionsLabel(count: number) {
	return count === 1 ? "1 sesión" : `${count} sesiones`;
}

export function daysLabel(days: number) {
	if (days === 0) return "hoy";
	return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

/** Link to a stored receipt; images and PDFs open in the browser. */
export function proofUrl(patientId: string, fileId: string) {
	return `/api/patients/${patientId}/files/${fileId}`;
}
