---
name: frontend-form-design
description: This skill provide best practices and guidelines for designing user-friendly and efficient forms in frontend development.
---

- Use zod for schema validation.
- Use @tanstack/react-form for form stat management.
- Use the Field components from shadcn UI for consistent styling and behavior.
  - The components are in: `@/modules/shared/presentation/components/ui`
  - The field components are in: `@/modules/shared/presentation/components/ui/field`
    - Include the components: `Field`, `FieldLabel`, `FieldGroup`, etc.
  - Other components to use on compound with the field are: `Input`, `Select`, `Checkbox`, `RadioGroup`, etc.
  - Use the `Button` component for form submission and other actions.

# Example

```tsx
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldGroup, FieldLabel } from "@/modules/shared/presentation/components/ui/field";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import { Input } from "@/modules/shared/presentation/components/ui/input";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const LoginForm = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email"
                />
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email"
                  type="password"
                />
              </Field>
            );
          }}
        </form.Field>
        <form.Subscribe>
          {(state) => (
            <Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
              {state.isSubmitting ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
};
```

