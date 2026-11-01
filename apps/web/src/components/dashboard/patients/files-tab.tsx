"use client";

import { cn } from "@helsa/ui/lib/utils";
import {
	Download,
	ExternalLink,
	FileAudio,
	FileImage,
	FileSpreadsheet,
	FileText,
	type LucideIcon,
	Paperclip,
	Trash2,
	UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useDeleteFile, useUploadFile } from "@/lib/api/mutations";
import type { PatientProfile } from "@/lib/core/patient/use-cases/load-patient-profile";

import { Panel, PanelHeading } from "../therapist/parts";
import {
	ConfirmButton,
	EmptyState,
	errorMessage,
	formatDate,
	SetupNotice,
	useRefreshingAction,
} from "./parts";
import { FILE_TYPES, formatBytes, validateFile } from "./schema";

const ACCEPT = Object.keys(FILE_TYPES).join(",");
const INLINE = /^(application\/pdf|image\/(jpeg|png|webp))$/;

function iconFor(mimeType: string): LucideIcon {
	if (mimeType.startsWith("image/")) return FileImage;
	if (mimeType.startsWith("audio/")) return FileAudio;
	if (mimeType.includes("sheet") || mimeType.includes("excel"))
		return FileSpreadsheet;
	return FileText;
}

const linkButton =
	"inline-flex h-10 items-center gap-2 rounded-full bg-dash-ground px-4 font-semibold text-[14px] outline-none transition-colors hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring";

function Uploader({ patientId }: { patientId: string }) {
	const router = useRouter();
	const upload = useUploadFile(patientId);
	const input = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [progress, setProgress] = useState<string | null>(null);

	async function send(files: File[]) {
		if (files.length === 0) return;
		let uploaded = 0;
		for (const [index, file] of files.entries()) {
			const problem = validateFile(file);
			if (problem) {
				toast.error(`${file.name}: ${problem}`);
				continue;
			}
			setProgress(
				files.length > 1
					? `Subiendo ${index + 1} de ${files.length}…`
					: "Subiendo…",
			);
			try {
				await upload.mutateAsync(file);
				uploaded++;
			} catch (error) {
				toast.error(
					`${file.name}: ${errorMessage(error, "No pudimos subirlo.")}`,
				);
			}
		}
		setProgress(null);
		if (input.current) input.current.value = "";
		if (uploaded) {
			toast.success(
				uploaded === 1
					? "Archivo adjuntado."
					: `${uploaded} archivos adjuntados.`,
			);
			router.refresh();
		}
	}

	return (
		<label
			htmlFor="file-input"
			onDragOver={(event) => {
				event.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={(event) => {
				event.preventDefault();
				setDragging(false);
				void send([...event.dataTransfer.files]);
			}}
			className={cn(
				"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
				dragging
					? "border-chapter-violet bg-chapter-lilac"
					: "border-border hover:border-chapter-violet/60 hover:bg-dash-ground",
				progress && "pointer-events-none opacity-70",
			)}
		>
			<UploadCloud
				aria-hidden="true"
				className="size-8 text-chapter-violet dark:text-primary"
			/>
			<span className="font-semibold text-[16px]" aria-live="polite">
				{progress ?? "Arrastra archivos aquí o elige desde tu equipo"}
			</span>
			<span className="text-[14px] text-muted-foreground">
				PDF, imágenes, Word, Excel, texto o audio · hasta 4 MB cada uno
			</span>
			<input
				ref={input}
				id="file-input"
				type="file"
				multiple
				accept={ACCEPT}
				className="sr-only"
				disabled={Boolean(progress)}
				onChange={(event) => void send([...(event.target.files ?? [])])}
			/>
		</label>
	);
}

export function FilesTab({ profile }: { profile: PatientProfile }) {
	const { patient, files, timezone, storageReady, encryptionReady } = profile;
	const remove = useDeleteFile(patient.id);
	const run = useRefreshingAction();
	const ready = storageReady && encryptionReady;
	const base = `/api/patients/${patient.id}/files`;

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			<Panel
				aria-labelledby="upload-title"
				className="xl:col-span-5 xl:self-start"
			>
				<PanelHeading id="upload-title" title="Adjuntar" />
				<p className="mt-1 text-[15px] text-muted-foreground">
					Informes, evaluaciones, consentimientos firmados en papel. Se guardan
					cifrados.
				</p>
				<div className="mt-4">
					{ready ? (
						<Uploader patientId={patient.id} />
					) : (
						<SetupNotice>
							Para adjuntar archivos falta configurar en el servidor{" "}
							{[
								!storageReady && "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY",
								!encryptionReady && "CLINICAL_ENCRYPTION_KEY",
							]
								.filter(Boolean)
								.join(" y ")}
							.
						</SetupNotice>
					)}
				</div>
			</Panel>

			<Panel aria-labelledby="files-title" className="xl:col-span-7">
				<PanelHeading id="files-title" title="Archivos">
					<p className="text-[15px] text-muted-foreground">
						{files.length === 0
							? "Ninguno"
							: `${files.length} ${files.length === 1 ? "archivo" : "archivos"}`}
					</p>
				</PanelHeading>
				<div className="mt-4">
					{files.length === 0 ? (
						<EmptyState icon={Paperclip} title="Sin archivos adjuntos" />
					) : (
						<ul className="flex flex-col gap-1">
							{files.map((file) => {
								const Icon = iconFor(file.mimeType);
								return (
									<li
										key={file.id}
										className="flex flex-wrap items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-dash-ground sm:flex-nowrap sm:px-4"
									>
										<span className="grid size-10 shrink-0 place-items-center rounded-full bg-chapter-lilac">
											<Icon
												aria-hidden="true"
												className="size-5 text-chapter-violet dark:text-foreground"
											/>
										</span>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-[15px]">
												{file.name}
											</p>
											<p className="text-[14px] text-muted-foreground">
												{FILE_TYPES[file.mimeType] ?? "Archivo"} ·{" "}
												{formatBytes(file.size)} ·{" "}
												{formatDate(file.createdAt, timezone)}
											</p>
										</div>
										<div className="flex shrink-0 gap-2">
											{INLINE.test(file.mimeType) ? (
												<a
													href={`${base}/${file.id}`}
													target="_blank"
													rel="noopener"
													className={linkButton}
												>
													<ExternalLink aria-hidden="true" className="size-4" />
													<span className="sr-only sm:not-sr-only">Abrir</span>
												</a>
											) : null}
											<a
												href={`${base}/${file.id}?download=1`}
												download={file.name}
												className={linkButton}
												aria-label={`Descargar ${file.name}`}
											>
												<Download aria-hidden="true" className="size-4" />
											</a>
											<ConfirmButton
												label={`Eliminar ${file.name}`}
												title="¿Eliminar este archivo?"
												description="Dejará de aparecer en la ficha del paciente."
												confirmLabel="Eliminar"
												variant="danger"
												pending={
													remove.isPending && remove.variables === file.id
												}
												onConfirm={() =>
													run(() => remove.mutateAsync(file.id), {
														success: "Archivo eliminado.",
														error: "No pudimos eliminar el archivo.",
													})
												}
											>
												<Trash2 aria-hidden="true" className="size-4" />
											</ConfirmButton>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</Panel>
		</div>
	);
}
