import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import { ProfilePage } from "@/components/dashboard/profile/profile-page";
import type {
	ProfileAccount,
	ProfileSession,
} from "@/components/dashboard/profile/types";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function Page() {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });

	if (!session?.user) {
		redirect("/sign-in");
	}

	const [accounts, sessions] = await Promise.all([
		auth.api.listUserAccounts({ headers: requestHeaders }),
		auth.api.listSessions({ headers: requestHeaders }),
	]);

	const profileAccounts: ProfileAccount[] = accounts.map((account) => ({
		id: account.id,
		providerId: account.providerId,
		createdAt: new Date(account.createdAt).toISOString(),
	}));

	const profileSessions: ProfileSession[] = sessions
		.map((entry) => ({
			token: entry.token,
			userAgent: entry.userAgent ?? null,
			ipAddress: entry.ipAddress ?? null,
			lastActiveAt: new Date(entry.updatedAt ?? entry.createdAt).toISOString(),
			current: entry.token === session.session.token,
		}))
		.sort(
			(a, b) =>
				Number(b.current) - Number(a.current) ||
				b.lastActiveAt.localeCompare(a.lastActiveAt),
		);

	return (
		<ProfilePage
			user={{
				name: session.user.name,
				email: session.user.email,
				emailVerified: session.user.emailVerified,
				image: session.user.image ?? null,
				role: toDashboardRole(session.user.role),
				createdAt: new Date(session.user.createdAt).toISOString(),
			}}
			accounts={profileAccounts}
			sessions={profileSessions}
		/>
	);
}
