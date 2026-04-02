# Overview

Helsa is a production-grade, multi-tenant healthcare SaaS platform. It provides appointment scheduling, patient management, doctor profiles, prescriptions, diagnoses, medical records, billing, and an AI-powered mental health chat assistant.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Language | TypeScript |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Authentication | better-auth |
| Billing | Polar |
| AI | Vercel AI SDK + Google Gemini |
| Background Jobs | Inngest |
| Email | React Email + Resend |
| File Uploads | UploadThing |
| i18n | next-intl |
| UI | Tailwind CSS 4 + shadcn/ui + Base UI + Motion |
| Linting/Formatting | Biome |
| Validation | Zod 4 |

## Folder Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (app)/                        # Main application layout group
│   │   ├── (auth)/                   # Sign-in, sign-up, password reset
│   │   ├── (dashboard)/              # Appointments, doctors, settings
│   │   ├── (onboarding)/             # Organization setup, role selection
│   │   └── (public)/                 # Landing page, blog, legal
│   └── (server)/                     # Server-only routes
│       ├── api/                      # REST API endpoints
│       └── workflows/                # Inngest workflow definitions
│
└── modules/                          # Domain-driven design modules
    ├── appointment/
    ├── auth/
    ├── billing/
    ├── chat-agent/
    ├── diagnosis/
    ├── doctor/
    ├── medical-record/
    ├── patient/
    ├── prescription/
    ├── schedule/
    └── shared/                       # Cross-cutting concerns
        ├── domain/                   # Base DDD primitives
        └── infrastructure/           # Database, email, env, events, storage, i18n
```

## Key Design Decisions

- **Domain-Driven Design**: Each bounded context is a self-contained module with four layers (domain, application, infrastructure, presentation).
- **No DI Container**: Dependencies are instantiated inline at the API route level, keeping the system simple and explicit.
- **Event-Driven**: Domain events are published through an event bus (backed by Inngest) to decouple modules and trigger asynchronous workflows.
- **Multi-Tenant by Organization**: All data is scoped to organizations, with role-based access control at the member level.
- **API-First**: All mutations go through REST API routes; frontend components fetch data via React Query.
