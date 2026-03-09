---
name: domain-driven-design
description: Design software with a focus on the core domain and its logic. Use this skill when the user asks to structure a software project, define its architecture, or model complex business logic. Generates clear, maintainable code that reflects a deep understanding of the domain and its relationships.
---

This skill guides the design of software with a focus on the core domain and its logic. Implement clear, maintainable code that reflects a deep understanding of the domain and its relationships.

The user provides requirements for structuring a software project, defining its architecture, or modeling complex business logic. They may include context about the domain, its entities, relationships, and use cases.

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

## Implementation Guidelines

- Focus on creating a rich domain model that captures the complexities of the business logic.
- Use clear and consistent naming conventions to enhance readability and maintainability.
- Ensure that the code is modular and organized according to the principles of domain-driven design.
- Avoid anemic domain models that lack behavior and only contain data.
- Emphasize the importance of understanding the domain and its relationships to create a software design that truly reflects the business needs and logic.
