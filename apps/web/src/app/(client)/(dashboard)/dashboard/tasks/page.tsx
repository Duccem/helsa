import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { toDashboardRole } from "@/components/dashboard/navigation";
import {
	loadPortal,
	NotLinked,
} from "@/components/dashboard/patient/not-linked";
import { PatientTasksPage } from "@/components/dashboard/patient/tasks-page";
import {
	TasksBoardView,
	type TasksView,
} from "@/components/dashboard/tasks/tasks-board";
import { LoadPatientTasks } from "@/lib/core/task/use-cases/load-patient-tasks";
import { LoadTasksBoard } from "@/lib/core/task/use-cases/load-tasks-board";
import { auth } from "@/services";

export const metadata: Metadata = { title: "Tareas" };

const loadTasksBoard = new LoadTasksBoard();
const loadPatientTasks = new LoadPatientTasks();

type Param = string | string[] | undefined;

const single = (value: Param) =>
	typeof value === "string" ? value : undefined;

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<
		Partial<Record<"task" | "new" | "from" | "patient", Param>>
	>;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/sign-in");
	}

	if (toDashboardRole(session.user.role) === "patient") {
		const user = session.user;
		const data = await loadPortal(() => loadPatientTasks.execute(user));
		if (!data) return <NotLinked title="Mis tareas" />;
		return <PatientTasksPage data={data} />;
	}

	const [board, params] = await Promise.all([
		loadTasksBoard.execute(session.user),
		searchParams,
	]);

	const known = new Set(board.patients.map((patient) => patient.id));
	const patient = single(params.patient);
	const task = single(params.task);
	const compose = single(params.new);
	const from = single(params.from);

	// Links can be stale or hand-written: anything that doesn't match opens the list.
	let initialView: TasksView = { kind: "idle" };
	if (task && board.tasks.some((item) => item.id === task)) {
		initialView = { kind: "read", id: task };
	} else if (compose) {
		initialView = {
			kind: "new",
			patientId: known.has(compose) ? compose : undefined,
			fromTaskId: board.tasks.some((item) => item.id === from)
				? from
				: undefined,
		};
	}

	return (
		<TasksBoardView
			board={board}
			initialView={initialView}
			initialPatient={patient && known.has(patient) ? patient : ""}
		/>
	);
}
