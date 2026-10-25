import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
	type DashboardUser,
	toDashboardRole,
} from "@/components/dashboard/navigation";
import { SIDEBAR_COOKIE } from "@/components/dashboard/sidebar-state";
import { figtree, outfit } from "@/lib/fonts";
import { auth } from "@/services";

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

	return (
		<div className={`${outfit.variable} ${figtree.variable} font-landing`}>
			<DashboardShell user={user} defaultCollapsed={sidebarCollapsed}>
				{children}
			</DashboardShell>
		</div>
	);
}
