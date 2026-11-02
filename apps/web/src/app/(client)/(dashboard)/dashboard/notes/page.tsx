import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { toDashboardRole } from "@/components/dashboard/navigation";
import {
	NotesBoardView,
	type NotesView,
} from "@/components/dashboard/notes/notes-board";
import { LoadNotesBoard } from "@/lib/core/note/use-cases/load-notes-board";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Notas clínicas" };

const loadNotesBoard = new LoadNotesBoard();

type Search = Record<
	"note" | "new" | "session" | "patient",
	string | string[] | undefined
>;

const single = (value: string | string[] | undefined) =>
	typeof value === "string" ? value : undefined;

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<Partial<Search>>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		redirect("/dashboard");
	}

	const [board, params] = await Promise.all([
		loadNotesBoard.execute(session.user),
		searchParams,
	]);

	const known = new Set(board.patients.map((patient) => patient.id));
	const patient = single(params.patient);
	const note = single(params.note);
	const compose = single(params.new);
	const sessionId = single(params.session);

	// Links can be stale or hand-written: anything that doesn't match opens the list.
	let initialView: NotesView = { kind: "idle" };
	if (note && board.notes.some((item) => item.id === note)) {
		initialView = { kind: "read", id: note };
	} else if (compose) {
		const forPatient = known.has(compose) ? compose : undefined;
		const forSession = board.sessionsWithoutNote.find(
			(item) => item.id === sessionId && item.patientId === forPatient,
		);
		initialView = {
			kind: "new",
			patientId: forPatient,
			sessionId: forSession?.id,
		};
	}

	return (
		<NotesBoardView
			board={board}
			initialView={initialView}
			initialPatient={patient && known.has(patient) ? patient : ""}
		/>
	);
}
