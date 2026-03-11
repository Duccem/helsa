---
agent: agent
description: This prompt is used to generate all the necessary code to domain, application and infrastructure layers for a new aggregate in a DDD architecture.
tools: [vscode, execute, read, agent, edit, search, web, browser, todo]
---

Generate all the necessary code to domain, application and infrastructure layers for a new aggregate in a DDD architecture. Following the structure of the existing codebase

Use the #tool:vscode/askQuestions to ask for the aggregate name and the use cases if not provided.

- On domain create the aggregate root entity, other entities, value objects, domain services, domain events and domain errors if needed, and the interfaces for repositories and external services if needed.
- On application create the use cases related to the aggregate, including input and output DTOs, and error union types.
  - If the use case is a command, the return type should be void.
  - If the use case is a query, the return type should be a DTO or a primitive type.
- On the infrastructure layer create the persistence schema and repository implementation for the aggregate, and others external services implementations if needed.
- Make sure to follow the existing code style and patterns used in the codebase.

