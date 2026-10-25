import type { DashboardRole } from "../navigation";

export type ProfileUser = {
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: DashboardRole;
	createdAt: string;
};

/** One way of signing in: "credential" is email and password. */
export type ProfileAccount = {
	id: string;
	providerId: string;
	createdAt: string;
};

export type ProfileSession = {
	token: string;
	userAgent: string | null;
	ipAddress: string | null;
	lastActiveAt: string;
	current: boolean;
};
