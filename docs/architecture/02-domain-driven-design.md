# Domain-Driven Design

The codebase follows a modular DDD architecture. Each domain module lives under `src/modules/<module>/` and is organized into four layers with strict dependency rules.

## Layer Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  React components, hooks
├─────────────────────────────────────┤
│         Application Layer           │  Use cases / services
├─────────────────────────────────────┤
│           Domain Layer              │  Aggregates, value objects, events, errors
├─────────────────────────────────────┤
│       Infrastructure Layer          │  Drizzle repos, external adapters
└─────────────────────────────────────┘
```

**Dependency rule**: Inner layers never depend on outer layers. The domain layer has zero external dependencies. The application layer depends only on domain interfaces. Infrastructure implements those interfaces.

## Base Abstractions (`src/modules/shared/domain/`)

### Aggregate (`aggregate.ts`)

Base class for aggregate roots. Provides domain event recording and retrieval:

```typescript
class Aggregate {
  record(event: DomainEvent): void   // Queue a domain event
  pullDomainEvents(): DomainEvent[]  // Retrieve and clear queued events
}
```

### Value Object (`value-object.ts`)

Immutable objects defined by their attributes, not identity. Includes typed variants:

- `ValueObject<T>` - Generic base
- `StringValueObject` - String-valued
- `NumberValueObject` - Number-valued
- `BooleanValueObject` - Boolean-valued
- Specialized: `Uuid`, `Timestamp`, `Enum`

### Domain Entity (`domain-entity.ts`)

Base entity class with identity.

### Domain Error (`domain-error.ts`)

Base class for all domain-specific errors. Each module defines its own error types extending this.

### Domain Event (`domain-event.ts`)

Base event class with an abstract `toPrimitives()` method for serialization. Events are recorded on aggregates and published through the event bus.

### Event Bus (`event-bus.ts`)

Abstract interface for publishing domain events. Implemented by `InngestEventBus` in infrastructure.

### Supporting Patterns

- `query.ts` - Query specification pattern
- `result.ts` - Result type for operation outcomes
- `specification.ts` - Specification pattern for filtering
- `adapter.ts` - Adapter base

## Module Structure

Every domain module follows this file layout:

```
src/modules/<module>/
├── domain/
│   ├── <aggregate>.ts              # Aggregate root
│   ├── <value-object>.ts           # Value objects
│   ├── <module>-repository.ts      # Repository interface
│   ├── errors/                     # Domain errors
│   └── events/                     # Domain events
├── application/
│   ├── create-<entity>.ts          # Command use cases
│   ├── get-<entity>.ts             # Query use cases
│   └── search-<entities>.ts        # Search/list use cases
├── infrastructure/
│   ├── persistence/
│   │   ├── <module>.schema.ts      # Drizzle table definitions
│   │   └── drizzle-<module>-repository.ts
│   └── <external-service>.ts       # Third-party adapters
└── presentation/
    ├── components/                 # React components
    └── hooks/                      # Client-side hooks
```

## Application Layer Conventions

- **Commands** return `void` (side-effect only).
- **Queries** return primitive types or domain objects directly (no DTOs).
- Use cases receive repository interfaces and service interfaces through constructor parameters.
- No DI container; dependencies are wired at the API route handler level.
