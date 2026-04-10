# General instructions for GitHub Copilot

## Commands

| Command                    | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `npm run dev`              | Next.js dev server (port 3000)                       |
| `npm run build`            | Production build                                     |
| `npm run lint`             | Biome linter (`biome check`)                         |
| `npm run format`           | Biome formatter (`biome format --write`)             |
| `npm run database:build`   | Generate Drizzle migrations (`drizzle-kit generate`) |
| `npm run database:migrate` | Apply migrations (`drizzle-kit migrate`)             |
| `npm run database:dev`     | Drizzle Studio (port 3001)                           |
| `npm run email:dev`        | Email template preview (port 3002)                   |
| `npm run workflow:dev`     | Inngest dev server                                   |

## Tech Stack

Next.js 16 (App Router, React 19, React Compiler) | TypeScript | PostgreSQL (Neon) + Drizzle ORM | better-auth | Polar (billing) | Vercel AI SDK + Google AI | Inngest (background jobs) | React Email + Resend | UploadThing | next-intl (i18n) | Tailwind CSS 4 + shadcn/ui + Base UI + Motion | Biome (lint/format) | Zod 4

## Architecture

Multi-tenant healthcare SaaS with modular DDD architecture. Each domain module (`src/modules/<module>/`) has four layers:

- **domain/** — Aggregate root entities (extend `Aggregate`), value objects (extend `ValueObject`), domain errors (extend `DomainError`), domain events, repository/notifier abstract classes (not interfaces — see DI below)
- **application/** — Use cases/services. Commands return `void`. Use primitive types or domain objects for I/O (no DTOs)
- **infrastructure/** — Drizzle schema + repository implementations, external service adapters
- **presentation/** — React components, hooks (client-side)

Domain modules: `appointment`, `auth`, `billing`, `chat-agent`, `diagnosis`, `doctor`, `patient`, `prescription`, `schedule`. Shared infrastructure lives in `src/modules/shared/`.

### Dependency Injection

The project uses [`diod`](https://www.npmjs.com/package/diod) for DI. Because `diod` resolves dependencies via constructor metadata, **repository and notifier ports are abstract classes, not TypeScript interfaces** — abstract classes survive at runtime as tokens the container can bind to.

- Decorate classes with the appropriate service decorator from [src/modules/shared/domain/service..ts](src/modules/shared/domain/service..ts):
  - `@DomainService` — domain services
  - `@ApplicationService` — application use cases
  - `@InfrastructureService` — repository/adapter implementations
- All bindings live in [src/modules/shared/infrastructure/dependency-injection/diod.config.ts](src/modules/shared/infrastructure/dependency-injection/diod.config.ts), which exports a singleton `container`. Register new abstract ports with `.registerAndUse(Abstract).asInstance(Concrete)` and new use cases with `.registerAndUse(UseCase)`.
- Consumers (API routes, workflows) retrieve services with `container.get(UseCase)` — never instantiate use cases or repositories manually.

### Database

- Single schema file re-exports all module schemas: `src/modules/shared/infrastructure/database/schema.ts`
- Each module defines its own schema in `<module>/infrastructure/persistence/<module>.schema.ts`
- Migrations output to `src/modules/shared/infrastructure/database/migrations/`
- Environment variables validated via `@t3-oss/env-core` in `src/modules/shared/infrastructure/env/index.ts`

### API Routes

Routes live in `src/app/(server)/api/`. Pattern for each route handler:

1. Call `authenticate()` or `authenticateOrg()` from `@/modules/shared/infrastructure/http/http-authenticate`
2. Parse input with `parseBody()`/`parseQuery()` using Zod schemas defined inline
3. Resolve the use case via `container.get(UseCase)` from `@/modules/shared/infrastructure/dependency-injection/diod.config` — do not instantiate services or repositories directly
4. Wrap execution in `routeHandler()` with domain error mapping to HTTP status codes
5. Return responses via `HttpNextResponse` helpers (`.json()`, `.created()`, `.domainError()`)

The same `container.get(...)` pattern applies to Inngest workflows under `src/app/(server)/workflows/`.

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

- Use kebab-case for file names.
- Use kebab-case for CSS class names.
- Use camelCase for JavaScript variable and function names.
- Use PascalCase for React component names.
- Use PascalCase for TypeScript types, classes and interface names.
- Use snake_case for classes properties and database column names.
- Use 2 spaces for indentation.
- Use double quotes for strings in JavaScript and TypeScript.

## DDD

- All domain entities, interfaces and types should be placed in the domain folder of the corresponding module/aggregate.
- All application services, commands, queries and handlers should be placed in the application folder of the corresponding module/aggregate.
- All infrastructure services, repositories and implementations should be placed in the infrastructure folder of the corresponding module/aggregate.
- All presentation layer components, such as controllers, routes and views should be placed in the presentation folder of the corresponding module/aggregate.
- Use the repository pattern for data access and persistence.
- Use the command-query separation principle for application services.
- Use the dependency inversion principle to decouple the application layer from the infrastructure layer.
- Use domain events to communicate between different parts of the system and to trigger side effects.
- Use value objects to represent complex data structures and to encapsulate business rules.
- Use aggregates to group related entities and to enforce invariants.

## Testing

- Use Vitest for unit testing and integration testing.
- Use Playwright for end-to-end testing.
- Use test-driven development (TDD) approach for writing tests.
- Write tests taking into account edge cases and potential failure scenarios.
- The small pieces of code that should be tested are use cases on the application layer, domain services and value objects on the domain layer, and infrastructure services on the infrastructure layer.
- Use mocks and stubs to isolate the code being tested and to simulate dependencies.
