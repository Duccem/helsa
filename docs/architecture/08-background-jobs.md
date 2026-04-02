# Background Jobs

The platform uses [Inngest](https://www.inngest.com/) for event-driven background job processing and scheduled tasks.

## Setup

### Client

**File**: `src/modules/shared/infrastructure/event-bus/inngest-client.ts`

```typescript
export const inngest = new Inngest({ id: "helsa" });
```

### Event Bus

**File**: `src/modules/shared/infrastructure/event-bus/inngest-event-bus.ts`

Implements the abstract `EventBus` interface from the domain layer. Domain events published on aggregates are sent to Inngest as events, which trigger corresponding workflow functions.

### Route Handler

**File**: `src/app/(server)/workflows/route.ts`

Exports GET, POST, PUT handlers that serve all Inngest functions to the Inngest dev server and cloud.

## Workflows

### Billing

| Workflow | Trigger | Action |
|----------|---------|--------|
| `init-user-billing` | `user.created` event | Fetches user data, creates Polar customer |
| `init-org-billing` | Organization creation event | Sets up organization-level billing |

### Doctor

| Workflow | Trigger | Action |
|----------|---------|--------|
| `create-doctor` | `user.role.set_as_doctor` event | Creates doctor profile, validates license |

### Patient

| Workflow | Trigger | Action |
|----------|---------|--------|
| `create-patient` | `user.role.set_as_patient` event | Creates patient profile |

### Prescription Reminders

| Workflow | Trigger | Action |
|----------|---------|--------|
| `next-medications-reminders` | Cron: every 15 minutes (TZ=America/Caracas) | Queries reminders due in next 15 min, fans out events |
| `send-next-medications-reminders` | `helsa/prescription.send-reminder` event | Fetches patient/medication info, sends email |
| `forgotten-medications-reminders` | Cron: scheduled | Detects missed doses, sends alert emails |
| `reschedule-reminders` | Event-triggered | Adjusts reminder schedule |

### Schedule

| Workflow | Trigger | Action |
|----------|---------|--------|
| `generate-availability` | Event-triggered | Generates doctor availability slots |

## Event Flow

```
User Action
  → API Route Handler
    → Use Case executes
      → Aggregate records DomainEvent
        → EventBus.publish() via InngestEventBus
          → Inngest receives event
            → Matching workflow function executes
              → step.run() for atomic operations
              → step.sendEvent() for fan-out
```

## Inngest Features Used

- **`step.run()`** - Atomic, retriable steps within a workflow
- **`step.sendEvent()`** - Fan-out: publish additional events from within a workflow
- **`step.sleep()`** - Delay execution between steps
- **Cron triggers** - Scheduled recurring jobs (e.g., medication reminders every 15 minutes)
- **Event triggers** - React to domain events

## Development

Run the Inngest dev server locally:

```bash
npm run workflow:dev
```

This provides a local dashboard for inspecting events, workflow runs, and debugging.
