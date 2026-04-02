# Error Handling

The platform uses a structured error handling strategy that maps domain errors to HTTP responses.

## Domain Errors

All domain errors extend the base `DomainError` class from `src/modules/shared/domain/domain-error.ts`. Each module defines its own specific error types.

### Shared Errors

| Error | Description |
|-------|-------------|
| `NotAuthorized` | User lacks permission for the requested action |
| `InvalidArgument` | Input fails business rule validation |

### Module-Specific Errors

| Module | Errors |
|--------|--------|
| Appointment | `AppointmentNotFound`, `AppointmentAlreadyHasRating`, `AppointmentScheduledAtSameTime` |
| Doctor | `DoctorLicenseNotValid`, `DoctorAlreadyExists` |
| Patient | `PatientAlreadyExists` |
| Auth | `UserNotFound`, `InvalidRole` |

## HTTP Error Mapping

The `routeHandler()` utility wraps API route execution. The second argument is an error callback that maps domain errors to HTTP responses:

```typescript
return routeHandler(
  async () => {
    // Execute use case
    await service.execute(params);
    return HttpNextResponse.created();
  },
  (error) => {
    if (error instanceof AppointmentNotFound) {
      return HttpNextResponse.domainError(error, 404);
    }
    if (error instanceof InvalidArgument) {
      return HttpNextResponse.domainError(error, 400);
    }
    // Unhandled errors fall through to 500
  },
);
```

### Status Code Mapping

| HTTP Status | When Used |
|-------------|-----------|
| 400 Bad Request | `InvalidArgument`, Zod validation failures |
| 401 Unauthorized | `NotAuthorized`, missing/invalid session |
| 404 Not Found | `*NotFound` errors (entity does not exist) |
| 409 Conflict | `*AlreadyExists` errors (duplicate creation) |
| 500 Internal Server Error | Unhandled exceptions |

## Response Helpers

**File**: `src/modules/shared/infrastructure/http/next-http-response.ts`

| Method | Description |
|--------|-------------|
| `HttpNextResponse.json(data, status?)` | Success response with JSON body |
| `HttpNextResponse.created(data?)` | 201 Created response |
| `HttpNextResponse.domainError(error, status)` | Error response from a domain error |
| `HttpNextResponse.internalServerError()` | Generic 500 response |

## Input Validation

Request bodies and query parameters are validated at the API route level using Zod schemas via `parseBody()` and `parseQuery()`. Validation failures are returned as 400 responses before the use case is invoked.
