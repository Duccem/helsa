# API Routes

All API endpoints live under `src/app/(server)/api/` and follow a consistent pattern.

## Route Handler Pattern

Every route handler follows these steps:

```typescript
import { container } from "@/modules/shared/infrastructure/dependency-injection/diod.config";

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const { session } = await authenticate();
  // or: const { session, organization } = await authenticateOrg();

  // 2. Validate input
  const body = await parseBody(request, z.object({
    name: z.string(),
    // ...
  }));

  // 3. Resolve the use case from the DI container
  const service = container.get(CreateEntity);

  // 4. Execute with error handling
  return routeHandler(
    async () => {
      await service.execute({ ...body, userId: session.userId });
      return HttpNextResponse.created();
    },
    (error) => {
      if (error instanceof EntityNotFound) {
        return HttpNextResponse.domainError(error, 404);
      }
    },
  );
}
```

Use cases, repositories, notifiers, and adapters are wired in [`src/modules/shared/infrastructure/dependency-injection/diod.config.ts`](../../src/modules/shared/infrastructure/dependency-injection/diod.config.ts). Route handlers never call `new` on application or infrastructure classes — they always go through `container.get(...)`. The same pattern applies to Inngest workflows under `src/app/(server)/workflows/`.

### Key Utilities

| Utility | File | Purpose |
|---------|------|---------|
| `authenticate()` | `shared/infrastructure/http/http-authenticate.ts` | Validates session, returns user |
| `authenticateOrg()` | Same | Validates session + active organization |
| `parseBody()` | `shared/infrastructure/http/http-parsers.ts` | Parses and validates request body with Zod |
| `parseQuery()` | Same | Parses and validates query parameters with Zod |
| `routeHandler()` | `shared/infrastructure/http/route-handler.ts` | Wraps execution with error handling |
| `HttpNextResponse` | `shared/infrastructure/http/next-http-response.ts` | Response helpers (.json, .created, .domainError) |

## Endpoint Catalog

### Auth
| Method | Path | Description |
|--------|------|-------------|
| * | `/api/auth/[...all]` | better-auth catch-all (sign-in, sign-up, OAuth, etc.) |

### Appointments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/appointment` | Schedule a new appointment |
| GET | `/api/appointment` | Search appointments with filters |
| GET | `/api/appointment/[id]` | Get appointment details |
| PUT | `/api/appointment/[id]` | Update appointment status |
| DELETE | `/api/appointment/[id]` | Cancel appointment |
| POST | `/api/appointment/[id]/note` | Add a note to an appointment |
| POST | `/api/appointment/[id]/rate` | Rate an appointment |

### Billing
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing` | Get subscription status |
| GET | `/api/billing/orders` | List orders with pagination |
| GET | `/api/billing/usage` | Get usage metrics |
| GET | `/api/billing/invoice/[orderId]` | Get or generate invoice PDF |

### Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/helsa` | Send message to AI chat agent |

### Diagnosis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/diagnosis` | Create a diagnosis |
| GET | `/api/diagnosis` | Search diagnoses |
| GET | `/api/diagnosis/pathology` | Look up pathologies |

### Doctor
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/doctor` | List doctors |
| POST | `/api/doctor` | Register a doctor |
| GET | `/api/doctor/me` | Get current doctor profile |
| GET | `/api/doctor/patients` | List doctor's patients |
| GET | `/api/doctor/specialty` | List specialties |
| GET | `/api/doctor/[id]` | Get doctor details |
| PUT | `/api/doctor/[id]` | Update doctor profile |
| POST | `/api/doctor/[id]/price` | Update pricing |
| POST | `/api/doctor/[id]/office-address` | Add office location |

### Patient
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/patient` | List patients |
| POST | `/api/patient` | Create a patient |
| GET | `/api/patient/[id]` | Get patient details |
| PUT | `/api/patient/[id]` | Update patient |
| POST | `/api/patient/[id]/contact` | Update contact info |
| POST | `/api/patient/[id]/vitals` | Add vital signs |
| POST | `/api/patient/[id]/physical-info` | Update physical information |

### Prescription
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/prescription` | Create a prescription |
| GET | `/api/prescription` | Search prescriptions |
| GET | `/api/prescription/[id]` | Get prescription details |
| * | `/api/prescription/[id]/reminder/[reminderId]` | Manage reminders |

### User
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/user/role` | Change user role |

## Error Mapping

Domain errors are mapped to HTTP status codes in the `routeHandler` error callback:

| HTTP Status | Domain Errors |
|-------------|---------------|
| 400 | InvalidArgument, validation errors |
| 401 | NotAuthorized |
| 404 | *NotFound errors (per module) |
| 409 | *AlreadyExists errors |
| 500 | Unhandled exceptions |
