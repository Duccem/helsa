# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run lint` | Biome linter (`biome check`) |
| `npm run format` | Biome formatter (`biome format --write`) |
| `npm run database:build` | Generate Drizzle migrations (`drizzle-kit generate`) |
| `npm run database:migrate` | Apply migrations (`drizzle-kit migrate`) |
| `npm run database:dev` | Drizzle Studio (port 3001) |
| `npm run email:dev` | Email template preview (port 3002) |
| `npm run workflow:dev` | Inngest dev server |

## Tech Stack

Next.js 16 (App Router, React 19, React Compiler) | TypeScript | PostgreSQL (Neon) + Drizzle ORM | better-auth | Polar (billing) | Vercel AI SDK + Google AI | Inngest (background jobs) | React Email + Resend | UploadThing | next-intl (i18n) | Tailwind CSS 4 + shadcn/ui + Base UI + Motion | Biome (lint/format) | Zod 4

## Architecture

Multi-tenant healthcare SaaS with modular DDD architecture. Each domain module (`src/modules/<module>/`) has four layers:

- **domain/** — Aggregate root entities (extend `Aggregate`), value objects (extend `ValueObject`), domain errors (extend `DomainError`), domain events, repository interfaces
- **application/** — Use cases/services. Commands return `void`. Use primitive types or domain objects for I/O (no DTOs)
- **infrastructure/** — Drizzle schema + repository implementations, external service adapters
- **presentation/** — React components, hooks (client-side)

Domain modules: `appointment`, `auth`, `billing`, `chat-agent`, `diagnosis`, `doctor`, `patient`, `prescription`, `schedule`. Shared infrastructure lives in `src/modules/shared/`.

### Database

- Single schema file re-exports all module schemas: `src/modules/shared/infrastructure/database/schema.ts`
- Each module defines its own schema in `<module>/infrastructure/persistence/<module>.schema.ts`
- Migrations output to `src/modules/shared/infrastructure/database/migrations/`
- Environment variables validated via `@t3-oss/env-core` in `src/modules/shared/infrastructure/env/index.ts`

### API Routes

Routes live in `src/app/(server)/api/`. Pattern for each route handler:

1. Call `authenticate()` or `authenticateOrg()` from `@/modules/shared/infrastructure/http/http-authenticate`
2. Parse input with `parseBody()`/`parseQuery()` using Zod schemas defined inline
3. Instantiate the use case service with its repository/dependencies directly (no DI container)
4. Wrap execution in `routeHandler()` with domain error mapping to HTTP status codes
5. Return responses via `HttpNextResponse` helpers (`.json()`, `.created()`, `.domainError()`)

### Frontend

- App Router pages in `src/app/(app)/` organized by route group: `(auth)`, `(dashboard)`, `(onboarding)`, `(public)`
- Data fetching: `@tanstack/react-query` with `useQuery`, `refetchOnWindowFocus: false`, always set `initialData`
- Forms: `@tanstack/react-form` + Zod validation + shadcn Field components from `@/modules/shared/presentation/components/ui/field`
- Tables: `@tanstack/react-table` + components from `@/modules/shared/presentation/components/ui/server-table`
- UI components: shadcn/ui aliased to `@/modules/shared/presentation/components/ui`
- Icons: `lucide-react`
- State management: `jotai`
- URL state: `nuqs`

## Naming Conventions

- **Files:** kebab-case
- **Variables/functions:** camelCase
- **React components:** PascalCase
- **Types/classes/interfaces:** PascalCase
- **Class properties / DB columns:** snake_case
- **CSS classes:** kebab-case
- **Strings:** double quotes
- **Indentation:** 2 spaces

## Testing

- Vitest for unit/integration tests, Playwright for E2E
- Test targets: use cases (application layer), domain services, value objects, infrastructure services
