import { betterAuthMiddleware } from '@helsa/auth/middleware';
import { NextRequest } from 'next/server';
const publicRoutes = ['/sign-in', '/sign-up', '/recovery-password', '/call'];
export default async function middleware(req: NextRequest) {
  return betterAuthMiddleware(req, publicRoutes);
}
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(!api|trpc)(.*)'],
};
