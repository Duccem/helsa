"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	noteTemplates,
	sessionLabel,
} from "@/components/dashboard/notes/note-parts";
import { useSaveNote } from "@/lib/api/mutations";
import type { VideoSession } from "@/lib/core/video/use-cases/load-video-session";

type Draft = NonNullable<NonNullable<VideoSession["notes"]>["draft"]>;
type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * The draft as last typed, owned by the page: the call can unmount (leave and
 * rejoin) without losing text or creating the note twice.
 */
export type NoteMemory = React.RefObject<{
	id: string | null;
	title: string;
	content: string;
}>;

export function noteMemoryFrom(draft: Draft | null | undefined) {
	return {
		id: draft?.id ?? null,
		title: draft?.title ?? "",
		content: draft?.content ?? "",
	};
}

const AUTOSAVE_MS = 1200;

/** Saves what is pending right now; the call awaits it before ending. */
export type FlushNotes = () => Promise<void>;

/**
 * The session's draft note, saved as the therapist types. It is the same note
 * the notes board shows, linked to this appointment, and is signed from there.
 */
export function SessionNotes({
	appointmentId,
	patientId,
	available,
	memory,
	startsAt,
	timezone,
	flushRef,
}: {
	appointmentId: string;
	patientId: string;
	available: boolean;
	memory: NoteMemory;
	startsAt: string;
	timezone: string;
	flushRef: React.RefObject<FlushNotes | null>;
}) {
	const save = useSaveNote();
	const [title, setTitle] = useState(
		() =>
			memory.current.title || `Sesión del ${sessionLabel(startsAt, timezone)}`,
	);
	const [content, setContent] = useState(() => memory.current.content);
	const [state, setState] = useState<SaveState>(() =>
		memory.current.id ? "saved" : "idle",
	);
	const [error, setError] = useState<string | null>(null);

	const noteId = useRef(memory.current.id);
	const latest = useRef({ title, content });
	const saving = useRef<Promise<void> | null>(null);
	const again = useRef(false);
	const changed = useRef(false);

	const flush = useCallback(async (): Promise<void> => {
		if (saving.current) {
			again.current = true;
			return saving.current;
		}
		if (!changed.current || !latest.current.content.trim()) return;
		changed.current = false;

		const run = (async () => {
			setState("saving");
			try {
				const result = await save.mutateAsync({
					patientId,
					noteId: noteId.current ?? undefined,
					title: latest.current.title,
					content: latest.current.content,
					appointmentId,
				});
				if (!noteId.current && result?.id) noteId.current = result.id;
				memory.current = { ...memory.current, id: noteId.current };
				setState("saved");
				setError(null);
			} catch (reason) {
				changed.current = true;
				setState("error");
				setError((reason as Error).message);
			}
		})();
		saving.current = run;
		await run;
		saving.current = null;
		if (again.current) {
			again.current = false;
			await flush();
		}
	}, [save, patientId, appointmentId, memory]);

	useEffect(() => {
		flushRef.current = flush;
	}, [flush, flushRef]);

	useEffect(() => {
		latest.current = { title, content };
		memory.current = { ...memory.current, title, content };
		if (!changed.current) return;
		const timer = window.setTimeout(() => void flush(), AUTOSAVE_MS);
		return () => window.clearTimeout(timer);
	}, [title, content, flush, memory]);

	const edit = (next: { title?: string; content?: string }) => {
		changed.current = true;
		if (next.title !== undefined) setTitle(next.title);
		if (next.content !== undefined) setContent(next.content);
	};

	if (!available) {
		return (
			<p className="rounded-2xl bg-dash-ground p-4 text-[15px] leading-relaxed">
				Las notas no están disponibles: falta configurar el cifrado de datos
				clínicos.
			</p>
		);
	}

	const empty =
		content.trim() === "" ||
		noteTemplates.some((template) => template.body === content);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<label className="sr-only" htmlFor="session-note-title">
				Título de la nota
			</label>
			<input
				id="session-note-title"
				value={title}
				maxLength={120}
				onChange={(event) => edit({ title: event.target.value })}
				className="h-11 w-full rounded-xl border border-input bg-background px-3 font-semibold text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>

			{empty ? (
				<fieldset className="flex flex-wrap gap-1.5" aria-label="Plantillas">
					{noteTemplates.map((template) => (
						<button
							key={template.id}
							type="button"
							onClick={() => edit({ content: template.body })}
							className={cn(
								"h-8 rounded-full px-3 font-semibold text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
								content === template.body
									? "bg-chapter-violet text-white"
									: "bg-dash-ground hover:bg-chapter-lilac",
							)}
						>
							{template.label}
						</button>
					))}
				</fieldset>
			) : null}

			<label className="sr-only" htmlFor="session-note-body">
				Nota de la sesión
			</label>
			<textarea
				id="session-note-body"
				value={content}
				maxLength={20000}
				onChange={(event) => edit({ content: event.target.value })}
				onBlur={() => void flush()}
				placeholder="Escribe mientras conversan. Se guarda solo."
				className="min-h-48 w-full flex-1 resize-none rounded-xl border border-input bg-background p-3 text-[15px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>

			<div className="flex items-center justify-between gap-3 text-[13px]">
				<p
					aria-live="polite"
					className="flex items-center gap-1.5 text-muted-foreground"
				>
					{state === "saving" ? (
						<>
							<LoaderCircle
								aria-hidden="true"
								className="size-3.5 animate-spin"
							/>
							Guardando…
						</>
					) : state === "saved" ? (
						<>
							<Check aria-hidden="true" className="size-3.5 text-dash-good" />
							Borrador guardado
						</>
					) : state === "error" ? (
						<span className="flex items-center gap-1.5 text-dash-alert">
							<CircleAlert aria-hidden="true" className="size-3.5" />
							{error ?? "No se guardó"}
						</span>
					) : (
						"Aún sin guardar"
					)}
				</p>
				{state === "error" ? (
					<button
						type="button"
						onClick={() => {
							changed.current = true;
							void flush();
						}}
						className="font-semibold text-dash-link underline-offset-4 hover:underline"
					>
						Reintentar
					</button>
				) : (
					<Link
						href="/dashboard/notes"
						target="_blank"
						className="font-semibold text-dash-link underline-offset-4 hover:underline"
					>
						Firmar después
					</Link>
				)}
			</div>
		</div>
	);
}
