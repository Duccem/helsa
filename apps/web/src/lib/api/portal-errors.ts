import {
	AppointmentNotActive,
	AppointmentNotFound,
	CancellationTooLate,
} from "@/lib/core/appointment/domain/errors";
import { FileRejected } from "@/lib/core/file/domain/errors";
import { PatientNotFound } from "@/lib/core/patient/domain/errors";
import {
	PaymentInFuture,
	PaymentSessionMismatch,
} from "@/lib/core/payment/domain/errors";
import {
	MoodRequired,
	TaskNotActive,
	TaskNotFound,
	TaskNotStarted,
} from "@/lib/core/task/domain/errors";
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

/** Domain errors of the patient portal routes → HTTP. */
export function portalErrors(error: CommonError) {
	switch (true) {
		case error instanceof NotPermissions:
			return domainError(error, 403);
		case error instanceof PatientNotFound:
		case error instanceof AppointmentNotFound:
		case error instanceof TaskNotFound:
			return domainError(error, 404);
		case error instanceof AppointmentNotActive:
		case error instanceof CancellationTooLate:
		case error instanceof TaskNotActive:
		case error instanceof TaskNotStarted:
			return domainError(error, 409);
		case error instanceof MoodRequired:
		case error instanceof FileRejected:
		case error instanceof PaymentInFuture:
		case error instanceof PaymentSessionMismatch:
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
