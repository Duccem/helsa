import { expo } from '@better-auth/expo';
import { PrismaClient } from '@helsa/database';
import { resend } from '@helsa/email';
import ForgetPassword from '@helsa/email/templates/forget-password';
import VerifyEmail from '@helsa/email/templates/verify-email';
import { env } from '@helsa/env';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP } from 'better-auth/plugins';
import { headers } from 'next/headers';
import { cache } from 'react';

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    generateId: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'UNDEFINED',
      },
      bio: {
        type: 'string',
        defaultValue: '',
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['helsapatient://'],
  plugins: [
    emailOTP({
      otpLength: 6,
      sendVerificationOTP: async ({ email, otp, type }) => {
        console.log('code', otp);
        if (type === 'forget-password') {
          await resend.emails.send({
            to: email,
            from: 'Acme <onboarding@resend.dev>',
            subject: 'Verify your email',
            react: ForgetPassword({ verificationCode: otp }),
          });
        } else if (type === 'email-verification') {
          await resend.emails.send({
            to: email,
            from: 'Acme <onboarding@resend.dev>',
            subject: 'Verify your email',
            react: VerifyEmail({ verificationCode: otp }),
          });
        }
      },
      sendVerificationOnSignUp: true,
    }),
    nextCookies(),
    expo(),
  ],
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      enabled: true,
      clientId: env.FACEBOOK_CLIENT_ID!,
      clientSecret: env.FACEBOOK_CLIENT_SECRET!,
    },
  },
});

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});
