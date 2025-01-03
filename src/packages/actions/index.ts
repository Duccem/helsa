import { DomainError } from '@helsa/ddd/core/domain-error';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { authMiddleware } from './middlewares/auth-middleware';
import { loggerMiddleware } from './middlewares/logger-middleware';
import { rateLimitMiddleware } from './middlewares/rate-limit-middleware';
import { trackingMiddleware } from './middlewares/tracking-middleware';

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof DomainError) {
      return e.message;
    }
    return 'Internal server error';
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      track: z
        .object({
          event: z.string(),
        })
        .optional(),
    });
  },
})
  .use(loggerMiddleware)
  .use(rateLimitMiddleware);

export const authActionClient = actionClient.use(authMiddleware).use(trackingMiddleware);
