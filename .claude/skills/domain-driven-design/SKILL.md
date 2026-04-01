---
name: domain-driven-design
description: This skill guides the generation and design of code following the principles of Domain-Driven Design (DDD). It focuses on creating a rich domain model that captures the complexities of the business logic, and structuring the codebase according to DDD principles.
---

This skill provides guidelines and best practices for implementing Domain-Driven Design (DDD) in software development. It emphasizes the importance of modeling the domain accurately and structuring the codebase to reflect the business logic effectively.

The user can use this skill to generate code for a new aggregate in a DDD architecture, following the structure of the existing codebase. Generating all the necessary code for the domain, application, and infrastructure layers, including entities, value objects, domain services, repositories, and use cases.

The user should provide the necessary information about the domain and the specific requirements for the aggregate, and the skill will generate the code accordingly, adhering to the principles of DDD and the existing codebase structure.

The user will provide the data model for the aggregate, the use cases, the relationships with other aggregates, the invariants of the aggregate, and any specific business rules or logic that need to be implemented.

If the user not provide all the necessary information, the skill will ask for clarification and additional details to ensure that the generated code accurately reflects the domain and meets the requirements.

## Implementation Guidelines

- Focus on creating a rich domain model that captures the complexities of the business logic.
- Use clear and consistent naming conventions to enhance readability and maintainability.
- Ensure that the code is modular and organized according to the principles of domain-driven design.
- Avoid anemic domain models that lack behavior and only contain data.
- Emphasize the importance of understanding the domain and its relationships to create a software design that truly reflects the business needs and logic.
- On domain create the aggregate root entity, other entities, value objects, domain services, domain events and domain errors if needed, and the interfaces for repositories and external services if needed.
  - Each entity should be in a separate file.
  - The value objects may be on a separate file if the logic inside them is complex, otherwise they can be in the same file as the entity that owns them.
- On application create the use cases related to the aggregate, don`t use dtos for input and output, use primitive types or domain objects, and use the existing codebase as a reference for the structure and patterns to follow.
  - If the use case is a command, the return type should be void.
- On the infrastructure layer create the persistence schema and repository implementation for the aggregate, and others external services implementations if needed.
- Make sure to follow the existing code style and patterns used in the codebase.

## Domain-Driven Design Principles

### Aggregates and Entities

- Identify the core entities in the domain and model them as classes or data structures.
- Define aggregates to group related entities and enforce invariants.
- Use repositories to manage the persistence of aggregates.

### Value Objects

- Model immutable value objects that represent concepts in the domain without identity.
- Ensure value objects are self-contained and can be easily compared for equality.

### Repositories

- Implement repositories to abstract the data access layer and provide a clean interface for retrieving and storing aggregates.
- Use repositories to encapsulate the logic for querying and persisting domain objects.

### Services

- Define domain services to encapsulate business logic that doesn't naturally fit within entities or value objects.
- Ensure services are stateless and focused on a specific domain operation.

### Bounded Contexts

- Identify bounded contexts to separate different parts of the domain that have distinct models and logic.
- Define clear interfaces and communication patterns between bounded contexts.
- Use context maps to visualize the relationships and interactions between bounded contexts.

### Use Cases and Application Layer

- Model use cases to represent the specific interactions users have with the system.
- Implement an application layer to orchestrate the execution of use cases and coordinate between domain objects and external systems.
- Ensure the application layer is thin and delegates most of the logic to the domain layer.

