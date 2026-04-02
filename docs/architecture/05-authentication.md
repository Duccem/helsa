# Authentication & Authorization

The platform uses [better-auth](https://www.better-auth.com/) for authentication, with organization-based multi-tenancy and role-based access control.

## Server Configuration

**File**: `src/modules/auth/infrastructure/auth-server.ts`

### Authentication Methods

- **Email & Password**: Standard credential-based auth with password reset (10-minute token expiry)
- **Google OAuth**: Social login via Google with callback at `/api/auth/callback/google`

### Plugins

| Plugin | Purpose |
|--------|---------|
| `organization` | Multi-tenant organization management with invitations and member roles |
| `admin` | Super admin access with elevated role definitions |
| `bearer` | Bearer token authentication for API access |
| `nextCookies` | Cookie-based session management for Next.js |
| `lastLoginMethod` | Tracks whether the user authenticated via OAuth or password |
| `openAPI` | Auto-generated OpenAPI documentation for auth endpoints |

### Lifecycle Hooks

- **After sign-up**: Executes `UserRegistration` service, which publishes a `user.created` domain event to the event bus. This triggers billing initialization and welcome email workflows.
- **After organization creation**: Executes `OrganizationCreation` service, which sends a confirmation email.
- **After invitation accepted**: Notifies the organization admin via email.

## Client Configuration

**File**: `src/modules/auth/infrastructure/auth-client.ts`

Provides React hooks for client-side auth operations:

```typescript
const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    adminClient({ ac: acAdmin, roles: adminRoles }),
    lastLoginMethodClient(),
  ],
});
```

## Role-Based Access Control

### Organization Roles

**File**: `src/modules/auth/infrastructure/roles.ts`

- **doctor** (default): Medical practitioner within an organization
- **admin**: Organization administrator with member management capabilities

### Super Admin Roles

**File**: `src/modules/auth/infrastructure/roles-admin.ts`

- **superadmin**: Platform-wide administrative access
- **admin**: Elevated admin access

## Guards & Middleware

**Directory**: `src/modules/auth/infrastructure/guards/`

- `require-auth` - Ensures the user has an active session; redirects to sign-in otherwise
- `require-anon` - Ensures the user is not authenticated; redirects to dashboard otherwise
- `require-organization` - Ensures the user has an active organization context

## HTTP Authentication Helpers

**File**: `src/modules/shared/infrastructure/http/http-authenticate.ts`

- `authenticate()` - Retrieves the current session and user; throws if unauthenticated
- `authenticateOrg()` - Retrieves session, user, and active organization context

These helpers are called at the top of every API route handler.

## Session Management

- Sessions are stored in the database (session table)
- Cookie-based session tokens via `nextCookies()` plugin
- Session is revoked on password reset
- Active organization ID is stored in the session context

## Auth API Routes

All better-auth endpoints are served through a catch-all route:

```
src/app/(server)/api/auth/[...all]/route.ts
```

This includes sign-in, sign-up, sign-out, password reset, OAuth callbacks, organization management, and invitation handling.

## Environment Variables

- `BETTER_AUTH_SECRET` - Session encryption secret
- `BETTER_AUTH_URL` - Base URL for auth callbacks
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
