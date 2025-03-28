import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string(),
      FACEBOOK_CLIENT_SECRET: z.string(),
      FACEBOOK_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
      GOOGLE_CLIENT_ID: z.string(),
    },
    client: {
      NEXT_PUBLIC_BASE_URL: z.string(),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
      FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
  });
