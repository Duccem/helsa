---
agent: agent
description: This prompt is used to generate the API routes for an aggregate in a DDD architecture, following the structure of the existing codebase. and using the use cases defined for the aggregate.
tools: [vscode, execute, read, agent, edit, search, web, browser, todo]
---

Generate the API routes for an aggregate in a DDD architecture, following the structure of the existing codebase and using the use cases defined for the aggregate.

Use the #tool:vscode/askQuestions to ask for the aggregate name if not provided.

- Use the existing API routes as a reference for the structure and patterns to follow.
- Create the necessary controllers, request handlers, and route definitions for the aggregate.
- Make sure to handle all the use cases defined for the aggregate, including input validation and error handling.
- Use the helpers and utilities available in the codebase for common tasks such as authentication, authorization, and response formatting.
- Generate the schema validations for params, queries and body of the requests using the existing codebase as a reference.
- For routes that retrive collections of information, use the same patron for pagination, filtering and sorting as the existing codebase.
