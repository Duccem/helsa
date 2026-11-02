import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
	type DashboardUser,
	type NavBadges,
	toDashboardRole,
} from "@/components/dashboard/navigation";
import { SIDEBAR_COOKIE } from "@/components/dashboard/sidebar-state";
import { CountPendingAppointments } from "@/lib/core/appointment/use-cases/count-pending-appointments";
import { CountDraftNotes } from "@/lib/core/note/use-cases/count-draft-notes";
import { CountUnseenEntries } from "@/lib/core/task/use-cases/count-unseen-entries";
import { LoadBookingLink } from "@/lib/core/therapist/use-cases/load-booking-link";
import { figtree, outfit } from "@/lib/fonts";
import { auth } from "@/services";

const countPendingAppointments = new CountPendingAppointments();
const countDraftNotes = new CountDraftNotes();
const countUnseenEntries = new CountUnseenEntries();
const loadBookingLink = new LoadBookingLink();

/** Live counts for the therapist sidebar. A failed count hides the badge instead of the dashboard. */
async function loadBadges(user: DashboardUser & { id: string }) {
	if (user.role !== "therapist") return undefined;
	const [pending, drafts, answers] = await Promise.all([
		countPendingAppointments.execute(user.id).catch(() => undefined),
		countDraftNotes.execute(user.id).catch(() => undefined),
		countUnseenEntries.execute(user.id).catch(() => undefined),
	]);
	return {
		"/dashboard/schedule": pending,
		"/dashboard/notes": drafts,
		"/dashboard/tasks": answers,
	} satisfies NavBadges;
}

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	const sidebarCollapsed =
		(await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

	const user: DashboardUser = {
		name: session.user.name,
		email: session.user.email,
		image: session.user.image ?? null,
		role: toDashboardRole(session.user.role),
	};

	const [badges, bookingLink] = await Promise.all([
		loadBadges({ ...user, id: session.user.id }),
		user.role === "therapist"
			? loadBookingLink.execute(session.user.id).catch(() => null)
			: null,
	]);
	user.bookingSlug = bookingLink?.enabled ? bookingLink.slug : null;

	return (
		<div className={`${outfit.variable} ${figtree.variable} font-landing`}>
			<DashboardShell
				user={user}
				badges={badges}
				defaultCollapsed={sidebarCollapsed}
			>
				{children}
			</DashboardShell>
		</div>
	);
}
