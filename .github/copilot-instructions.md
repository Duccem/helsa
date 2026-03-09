# General instructions for GitHub Copilot

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

