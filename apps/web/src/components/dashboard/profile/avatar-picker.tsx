"use client";

import { cn } from "@helsa/ui/lib/utils";
import { Camera } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	AVATAR_TYPES,
	AvatarUploadUnavailableError,
	uploadAvatar,
	validateAvatar,
} from "@/lib/avatar-upload";

import { EASE_OUT } from "../therapist/parts";
import { UserAvatar } from "../user-menu";
import { ActionButton } from "./parts";

type Draft = { file: File; url: string };

/**
 * Pick, preview and save a profile photo. The storage step lives in
 * `uploadAvatar`; everything around it already works.
 */
export function AvatarPicker({
	name,
	image,
}: {
	name: string;
	image: string | null;
}) {
	const router = useRouter();
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [dragging, setDragging] = useState(false);
	const [pending, setPending] = useState<"save" | "remove" | null>(null);

	// Free the preview's memory when it is replaced or dropped.
	useEffect(() => {
		if (!draft) return;
		return () => URL.revokeObjectURL(draft.url);
	}, [draft]);

	function choose(file: File | undefined) {
		if (!file) return;
		const problem = validateAvatar(file);
		if (problem) {
			toast.error(problem);
			return;
		}
		setDraft({ file, url: URL.createObjectURL(file) });
	}

	function cancel() {
		setDraft(null);
		if (inputRef.current) inputRef.current.value = "";
	}

	async function save() {
		if (!draft) return;
		setPending("save");
		try {
			const url = await uploadAvatar(draft.file);
			const { error } = await authClient.updateUser({ image: url });
			if (error) throw error;
			toast.success("Listo, tu foto ya está puesta.");
			cancel();
			router.refresh();
		} catch (error) {
			if (error instanceof AvatarUploadUnavailableError) {
				toast.info(
					"Todavía no podemos guardar fotos. Muy pronto podrás subir la tuya.",
				);
			} else {
				toast.error("No pudimos guardar tu foto. Intenta de nuevo.");
			}
		} finally {
			setPending(null);
		}
	}

	async function remove() {
		setPending("remove");
		const { error } = await authClient.updateUser({ image: null });
		setPending(null);
		if (error) {
			toast.error("No pudimos quitar tu foto. Intenta de nuevo.");
			return;
		}
		toast.success("Quitamos tu foto. Verás tus iniciales en su lugar.");
		router.refresh();
	}

	const shown = draft ? draft.url : image;

	return (
		<div className="flex flex-col items-start gap-4">
			<label
				htmlFor={inputId}
				onDragOver={(event) => {
					event.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(event) => {
					event.preventDefault();
					setDragging(false);
					choose(event.dataTransfer.files[0]);
				}}
				className={cn(
					"group relative block size-28 shrink-0 cursor-pointer rounded-full outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-4 has-focus-visible:ring-offset-chapter-lilac sm:size-32",
					dragging && "scale-[1.05]",
				)}
			>
				<span className="sr-only">Elegir una foto de perfil</span>
				<AnimatePresence mode="popLayout" initial={false}>
					<m.span
						key={shown ?? "initials"}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.05 }}
						transition={{ duration: 0.35, ease: EASE_OUT }}
						className="block size-full"
					>
						<UserAvatar
							user={{ name, image: shown }}
							className="size-full font-display font-medium text-[2.5rem] sm:text-[2.75rem]"
						/>
					</m.span>
				</AnimatePresence>
				<span
					aria-hidden="true"
					className={cn(
						"absolute right-0 bottom-0 grid size-10 place-items-center rounded-full bg-card text-foreground transition-transform duration-200 group-hover:scale-110",
						dragging && "scale-110",
					)}
				>
					<Camera className="size-[1.15rem]" />
				</span>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept={AVATAR_TYPES.join(",")}
					className="sr-only"
					onChange={(event) => choose(event.target.files?.[0])}
				/>
			</label>

			<AnimatePresence mode="wait" initial={false}>
				{draft ? (
					<m.div
						key="draft"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="flex flex-wrap items-center gap-2"
					>
						<ActionButton
							size="small"
							onClick={save}
							pending={pending === "save"}
							pendingLabel="Guardando…"
						>
							Usar esta foto
						</ActionButton>
						<ActionButton
							size="small"
							variant="quiet"
							className="bg-card"
							onClick={cancel}
							disabled={pending !== null}
						>
							Cancelar
						</ActionButton>
					</m.div>
				) : image ? (
					<m.div
						key="current"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
					>
						<ActionButton
							size="small"
							variant="quiet"
							className="bg-card"
							onClick={remove}
							pending={pending === "remove"}
							pendingLabel="Quitando…"
						>
							Quitar foto
						</ActionButton>
					</m.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
