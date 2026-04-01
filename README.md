# Health SaaS

A multi-tenant healthcare management platform built with Next.js 16. Supports appointment scheduling, doctor and patient management, prescriptions, diagnoses, billing, and an AI-powered chat agent.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** better-auth
- **Billing:** Polar
- **AI:** Vercel AI SDK + Google AI
- **Background Jobs:** Inngest
- **Email:** React Email + Resend
- **File Uploads:** UploadThing
- **i18n:** next-intl
- **UI:** Tailwind CSS 4, shadcn/ui, Base UI, Motion
- **Linting/Formatting:** Biome

## Architecture

The project follows a modular architecture with domain-driven design. Each module is organized into layers:

```
src/
  app/                          # Next.js App Router
    (app)/
      (auth)/                   # Sign in, sign up, password reset
      (dashboard)/              # Main app (appointments, doctors, settings)
      (onboarding)/             # Organization setup, role selection, invitations
      (public)/                 # Blog, privacy, terms
    (server)/api/               # API routes
  modules/
    appointment/                # Appointment scheduling and management
    auth/                       # Authentication and authorization
    billing/                    # Subscription and payment handling
    chat-agent/                 # AI-powered chat assistant
    diagnosis/                  # Medical diagnoses
    doctor/                     # Doctor profiles and pricing
    patient/                    # Patient records
    prescription/               # Prescription management
    schedule/                   # Doctor availability and scheduling
    shared/                     # Shared infrastructure
      domain/                   # Base errors, value objects
      infrastructure/           # Database, email, env, DI, event bus, CMS, storage, i18n
```

Each domain module follows a consistent structure:

```
module/
  application/                  # Use cases / services
  domain/                       # Entities, value objects, repository interfaces
  infrastructure/               # Persistence, external service adapters
  presentation/                 # React components, hooks
```

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon recommended)
- Accounts/keys for: Resend (email), Polar (billing), Google AI, UploadThing, Inngest

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the required environment variables (see `src/modules/shared/infrastructure/env/` for the schema).

3. Run database migrations:

   ```bash
   npm run database:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

### Additional Dev Servers

```bash
npm run database:dev       # Drizzle Studio (port 3001)
npm run email:dev          # Email template preview (port 3002)
npm run workflow:dev       # Inngest dev server
```

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start Next.js dev server             |
| `npm run build`      | Production build                     |
| `npm run start`      | Start production server              |
| `npm run lint`       | Run Biome linter                     |
| `npm run format`     | Format code with Biome               |
| `npm run database:build`   | Generate Drizzle migrations    |
| `npm run database:migrate` | Apply database migrations      |
| `npm run database:dev`     | Open Drizzle Studio            |
| `npm run email:dev`        | Preview email templates        |
| `npm run email:build`      | Build email templates          |
| `npm run workflow:dev`     | Start Inngest dev server       |
