import {
	VideoAccessDenied,
	VideoSessionNotActive,
	VideoSessionNotFound,
} from "@/lib/core/video/domain/errors";
import { VideoNotConfigured } from "@/lib/infra/jitsi";
import { type CommonError, NotPermissions } from "@/lib/utils/error";

import { domainError, internalServerError } from "./server";

/** Domain errors of the video routes → HTTP. */
export function videoErrors(error: CommonError) {
	switch (true) {
		case error instanceof NotPermissions:
		case error instanceof VideoAccessDenied:
			return domainError(error, 403);
		case error instanceof VideoSessionNotFound:
			return domainError(error, 404);
		case error instanceof VideoSessionNotActive:
			return domainError(error, 409);
		case error instanceof VideoNotConfigured:
			return domainError(error, 503);
		default:
			return internalServerError();
	}
}
