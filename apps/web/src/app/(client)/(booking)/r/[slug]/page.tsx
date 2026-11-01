import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
	BookingFlow,
	type BookingSelection,
	type Viewer,
} from "@/components/booking/booking-flow";
import { TherapistCard } from "@/components/booking/therapist-card";
import { BookingPageNotFound } from "@/lib/core/booking/domain/errors";
import { LoadBookingPage } from "@/lib/core/booking/use-cases/load-booking-page";
import { LoadBookingLink } from "@/lib/core/therapist/use-cases/load-booking-link";
import { auth } from "@/services";

const loadBookingPage = new LoadBookingPage();
const loadBookingLink = new LoadBookingLink();

/** Shared by the metadata and the page within one request. */
const loadPage = cache(async (slug: string) => {
	try {
		return await loadBookingPage.execute(slug);
	} catch (error) {
		if (error instanceof BookingPageNotFound) notFound();
		throw error;
	}
});

type Props = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const page = await loadPage((await params).slug);
	return {
		title: `Agenda con ${page.therapist.name} · Helsa`,
		description: page.therapist.title
			? `${page.therapist.title}. Elige día y hora y agenda tu sesión.`
			: "Elige día y hora y agenda tu sesión.",
	};
}

async function viewerOf(slug: string): Promise<Viewer> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return "anonymous";
	if (session.user.role === "patient") return "patient";
	const own = await loadBookingLink.execute(session.user.id);
	return own.slug === slug ? "owner" : "therapist";
}

const one = (value: string | string[] | undefined) =>
	typeof value === "string" ? value : undefined;

export default async function Page({ params, searchParams }: Props) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const [page, viewer] = await Promise.all([
		loadPage(slug),
		viewerOf(slug.toLowerCase()),
	]);

	const initial: BookingSelection = {
		rate: one(query.rate),
		modality: one(query.modality),
		start: one(query.start),
		pay: one(query.pay),
	};

	return (
		<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
			<div className="lg:sticky lg:top-6">
				<TherapistCard therapist={page.therapist} />
			</div>
			<BookingFlow page={page} viewer={viewer} initial={initial} />
		</div>
	);
}
