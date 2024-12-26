import { auth } from '@helsa/engine/shared/infrastructure/auth/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
