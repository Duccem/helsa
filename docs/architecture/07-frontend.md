# Frontend Architecture

The frontend uses Next.js 16 App Router with React 19 and the React Compiler enabled.

## App Router Structure

Pages are organized into route groups under `src/app/(app)/`:

```
(app)/
├── (auth)/                  # Unauthenticated routes
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   ├── change-password/
│   └── check-email/
├── (dashboard)/             # Main application
│   ├── home/
│   ├── appointments/
│   │   ├── [id]/           # Detail view with notes, ratings
│   │   └── new/            # Schedule appointment flow
│   ├── doctors/
│   │   └── [id]/           # Doctor profile
│   └── settings/
│       ├── billing/        # Subscription, orders, invoices
│       ├── organization/   # Org name, logo
│       └── team/           # Members, invitations, roles
├── (onboarding)/            # First-time setup
│   ├── new-organization/
│   ├── select-role/
│   └── accept-invitation/
└── (public)/                # Public pages
    ├── page.tsx             # Landing page
    ├── blog/
    │   └── [slug]/
    ├── privacy/
    └── terms/
```

## Layouts

- **(auth) / (onboarding)**: Three-column layout with marketing copy alongside the form
- **(dashboard)**: Sidebar navigation (SidebarProvider + AppSidebar) + header + main content area
- **(public)**: Standalone layout for public pages

## Data Fetching

**Library**: `@tanstack/react-query`

Conventions:
- Always use `useQuery` with a descriptive `queryKey`
- Always set `initialData` (often from server-side data or empty arrays)
- `refetchOnWindowFocus: false` across the application
- Fetch from `/api/*` endpoints

```typescript
const { data } = useQuery({
  queryKey: ["appointments", filters],
  queryFn: () => fetch("/api/appointment?" + params).then(r => r.json()),
  refetchOnWindowFocus: false,
  initialData: [],
});
```

## Forms

**Library**: `@tanstack/react-form` + Zod validation

- Zod schemas define validation rules
- shadcn Field components provide consistent form UI
- Components from `@/modules/shared/presentation/components/ui/field`

## Tables

**Library**: `@tanstack/react-table`

- Server-side table components from `@/modules/shared/presentation/components/ui/server-table`
- Column definitions with sorting, filtering, and pagination

## State Management

| Concern | Library |
|---------|---------|
| Global state | `jotai` (atomic, minimal) |
| URL state | `nuqs` (search params sync) |
| Server state | `@tanstack/react-query` |

## UI Components

- **Component library**: shadcn/ui (60+ components in `src/modules/shared/presentation/components/ui/`)
- **Base components**: `@base-ui/react` for lower-level primitives
- **Custom**: kibo-ui calendar component for date selection
- **Icons**: `lucide-react`
- **Animations**: `motion` (framer-motion)
- **Theming**: `next-themes` with class-based dark/light mode
- **Toasts**: `sonner` for notifications

## Providers

**File**: `src/modules/shared/presentation/providers.tsx`

Client-side providers wrapped around the application:

1. `NextIntlClientProvider` - Internationalization
2. `ThemeProvider` - Dark/light mode (next-themes)
3. `NuqsAdapter` - URL state management
4. `QueryClientProvider` - React Query
5. `TooltipProvider` - Tooltip context

## Shared Hooks

- `useIsMobile()` - Responsive breakpoint detection (768px)
- Auth hooks from `auth-client.ts` (useSession, useOrganization, etc.)

## Utility

- `cn()` function from `src/modules/shared/presentation/lib/utils.ts` - Combines `clsx` + `tailwind-merge` for conditional class names
