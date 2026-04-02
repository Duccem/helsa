# Architecture Documentation

This directory contains the architecture documentation for **Helsa**, a multi-tenant healthcare SaaS platform built with Next.js 16, React 19, TypeScript, and Domain-Driven Design principles.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Overview](./01-overview.md) | High-level system overview and folder structure |
| [Domain-Driven Design](./02-domain-driven-design.md) | DDD layers, base abstractions, and module structure |
| [Domain Modules](./03-domain-modules.md) | Detailed breakdown of each domain module |
| [Database](./04-database.md) | PostgreSQL setup, Drizzle ORM, schema design, and migrations |
| [Authentication & Authorization](./05-authentication.md) | better-auth setup, roles, guards, and session management |
| [API Routes](./06-api-routes.md) | REST API design patterns and endpoint catalog |
| [Frontend Architecture](./07-frontend.md) | App Router structure, data fetching, forms, tables, and UI |
| [Background Jobs](./08-background-jobs.md) | Inngest workflows, event bus, and scheduled tasks |
| [Billing](./09-billing.md) | Polar integration for subscriptions and payments |
| [AI Chat Agent](./10-ai-chat-agent.md) | Vercel AI SDK + Google Gemini chat assistant |
| [Email System](./11-email.md) | React Email templates and Resend delivery |
| [Internationalization](./12-internationalization.md) | next-intl setup for multi-language support |
| [Multi-Tenancy](./13-multi-tenancy.md) | Organization-based tenant isolation model |
| [Error Handling](./14-error-handling.md) | Domain errors and HTTP error mapping strategy |
| [Configuration & Tooling](./15-configuration.md) | Config files, dev scripts, and developer workflow |
