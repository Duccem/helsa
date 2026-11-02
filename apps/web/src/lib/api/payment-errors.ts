import { PatientNotFound } from "@/lib/core/patient/domain/errors";
import {
	NothingOwed,
	PaymentAlreadyReviewed,
	PaymentInFuture,
	PaymentNotFound,
	PaymentProofMismatch,
	PaymentSessionMismatch,
	WhatsAppNotAllowed,
} from "@/lib/core/payment/domain/errors";
import { MessageNotDelivered, RecipientMissing } from "@/lib/infra/messaging";
import { type CommonError, NotPermissions } from "@/lib/utils/error";

import { domainError, internalServerError } from "./server";

/** Domain errors of the payment routes → HTTP. */
export function paymentErrors(error: CommonError) {
	switch (true) {
		case error instanceof NotPermissions:
			return domainError(error, 403);
		case error instanceof PatientNotFound:
		case error instanceof PaymentNotFound:
			return domainError(error, 404);
		case error instanceof PaymentAlreadyReviewed:
		case error instanceof NothingOwed:
			return domainError(error, 409);
		case error instanceof PaymentInFuture:
		case error instanceof PaymentProofMismatch:
		case error instanceof PaymentSessionMismatch:
		case error instanceof RecipientMissing:
		case error instanceof WhatsAppNotAllowed:
			return domainError(error, 400);
		case error instanceof MessageNotDelivered:
			return domainError(error, 502);
		default:
			return internalServerError();
	}
}
