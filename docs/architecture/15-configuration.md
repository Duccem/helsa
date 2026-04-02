# Configuration & Tooling

## Config Files

### `next.config.ts`

- React Compiler enabled (`reactCompiler: true`) for React 19 optimizations
- Wrapped with `createNextIntlPlugin()` for internationalization

### `tsconfig.json`

- Target: ES2017
- Module: esnext
- JSX: react-jsx
- Path alias: `@/*` maps to `./src/*`
- Incremental builds enabled

### `biome.json`

- Linter: Recommended rules + Next.js and React domain rules
- Formatter: 2-space indentation
- Import organization: Automatic sorting
- VCS: Git integration with `.gitignore` support

### `drizzle.config.ts`

- Output: `./src/modules/shared/infrastructure/database/migrations`
- Schema: `./src/modules/shared/infrastructure/database/schema.ts`
- Dialect: PostgreSQL
- Credentials: From `DATABASE_URL` environment variable

### `postcss.config.mjs`

- Tailwind CSS 4 via PostCSS plugin

## Environment Variables

Validated at startup via `@t3-oss/env-core` in `src/modules/shared/infrastructure/env/index.ts`.

### Server

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Session encryption key |
| `BETTER_AUTH_URL` | Auth callback base URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPLOADTHING_TOKEN` | UploadThing API token |
| `POLAR_ACCESS_TOKEN` | Polar billing API token |
| `POLAR_MODE` | `sandbox` or `production` |
| `POLAR_WEBHOOK_SECRET` | Polar webhook verification |
| `POLAR_SUCCESS_URL` | Post-checkout redirect |
| `RESEND_API_KEY` | Resend email API key |

### Client

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | Public-facing application URL |

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Development server (port 3000) |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `biome check` | Run linter |
| `format` | `biome format --write` | Auto-format code |
| `database:build` | `drizzle-kit generate` | Generate database migrations |
| `database:migrate` | `drizzle-kit migrate` | Apply migrations |
| `database:dev` | `drizzle-kit studio` | Drizzle Studio (port 3001) |
| `email:dev` | `email dev` | Email template preview (port 3002) |
| `email:build` | `email build` | Build email templates |
| `workflow:dev` | `inngest-cli dev` | Inngest dev server |

## Development Workflow

1. **Start all services**:
   ```bash
   npm run dev           # Next.js on :3000
   npm run database:dev  # Drizzle Studio on :3001
   npm run email:dev     # Email preview on :3002
   npm run workflow:dev  # Inngest dashboard
   ```

2. **Database changes**:
   ```bash
   # Edit schema file in src/modules/<module>/infrastructure/persistence/
   npm run database:build   # Generate migration
   npm run database:migrate # Apply migration
   ```

3. **Code quality**:
   ```bash
   npm run lint    # Check for issues
   npm run format  # Auto-fix formatting
   ```

## Naming Conventions

| Target | Convention | Example |
|--------|-----------|---------|
| Files | kebab-case | `user-repository.ts` |
| Variables / functions | camelCase | `getUserById()` |
| React components | PascalCase | `AppointmentForm` |
| Types / classes / interfaces | PascalCase | `AppointmentRepository` |
| Class properties / DB columns | snake_case | `created_at` |
| CSS classes | kebab-case | (via Tailwind) |
| Strings | Double quotes | `"hello"` |
| Indentation | 2 spaces | |
