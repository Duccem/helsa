---
name: frontend-data-fetching
description: This skill provides guidelines and best practices for implementing data fetching in frontend components, following the conventions of the codebase and the framework.
---

For fetching data in frontend components, use the library @tanstack/react-query, each component that needs to fetch data should use the hook `useQuery` from the library, and use the `use client` directive at the top of the file.

- The query key should be an array that includes a string identifier for the query and any relevant parameters, for example: `['user', userId]`.
- The query function should use the `fetch` API to make a request to the appropriate endpoint, and return the data in JSON format.
- The refetchOnWindowFocus option should be set to false to prevent unnecessary refetching when the user switches back to the tab.
- The initial data should be set according to the expected shape of the data, for example: `initialData: { name: '', email: '' }` or `initialData: []`.
- Each component that uses data fetching should handle loading and error states appropriately, for example by displaying a loading spinner or an error message.
  Here is an example of how to implement data fetching in a frontend component using @tanstack/react-query:

```jsx
"use client";
import { useQuery } from "@tanstack/react-query";

export const UserProfile = ({ userId }) => {
  const { data, error, isLoading } = useQuery(
    ["user", userId],
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    {
      refetchOnWindowFocus: false,
      initialData: { name: "", email: "" },
    },
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
};
```

- For more complex data fetching scenarios, such as dependent queries or mutations, refer to the @tanstack/react-query documentation for additional hooks and patterns.
- Always ensure that the data fetching logic is encapsulated within the component and does not leak into other parts of the application, to maintain separation of concerns and improve maintainability.
