import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      POLAR_SECRET_KEY: z.string(),
      POLAR_WEBHOOK_SECRET: z.string(),
    },
    runtimeEnv: {
      POLAR_SECRET_KEY: process.env.POLAR_SECRET_KEY,
      POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    },
  });
