---
agent: agent
description: This prompt is used to generate all the necessary code to domain, application and infrastructure layers for a new aggregate in a DDD architecture.
tools: [vscode, execute, read, agent, edit, search, web, browser, todo]
---

Generate all the necessary code to domain, application and infrastructure layers for a new aggregate in a DDD architecture. Following the structure of the existing codebase

Use the #tool:vscode/askQuestions to ask for the aggregate name and the use cases if not provided.

- On domain create the aggregate root entity, other entities, value objects, domain services, domain events and domain errors if needed, and the interfaces for repositories and external services if needed.
  - Each entity should be in a separate file.
  - The value objects may be on a separate file if the logic inside them is complex, otherwise they can be in the same file as the entity that owns them.
- On application create the use cases related to the aggregate, don`t use dtos for input and output, use primitive types or domain objects, and use the existing codebase as a reference for the structure and patterns to follow.
  - If the use case is a command, the return type should be void.
- On the infrastructure layer create the persistence schema and repository implementation for the aggregate, and others external services implementations if needed.
- Make sure to follow the existing code style and patterns used in the codebase.

