import { FileNotFound, FileRejected } from "@/lib/core/file/domain/errors";
import {
	NoteAlreadySigned,
	NoteNotFound,
	NoteSessionMismatch,
} from "@/lib/core/note/domain/errors";
import { PatientNotFound } from "@/lib/core/patient/domain/errors";
import { TaskNotActive, TaskNotFound } from "@/lib/core/task/domain/errors";
import {
	EncryptionKeyUnavailable,
	EncryptionNotConfigured,
} from "@/lib/infra/clinical-cipher";
import {
	StorageNotConfigured,
	StorageRequestFailed,
} from "@/lib/infra/file-storage";
import { type CommonError, NotPermissions } from "@/lib/utils/error";

import { domainError, internalServerError } from "./server";

/** Domain errors of the patient routes → HTTP. */
export function patientErrors(error: CommonError) {
	switch (true) {
		case error instanceof NotPermissions:
			return domainError(error, 403);
		case error instanceof PatientNotFound:
		case error instanceof NoteNotFound:
		case error instanceof TaskNotFound:
		case error instanceof FileNotFound:
			return domainError(error, 404);
		case error instanceof NoteAlreadySigned:
		case error instanceof TaskNotActive:
			return domainError(error, 409);
		case error instanceof FileRejected:
		case error instanceof NoteSessionMismatch:
			return domainError(error, 400);
		case error instanceof StorageRequestFailed:
			return domainError(error, 502);
		case error instanceof EncryptionNotConfigured:
		case error instanceof EncryptionKeyUnavailable:
		case error instanceof StorageNotConfigured:
			return domainError(error, 503);
		default:
			return internalServerError();
	}
}
