# Email System

The platform uses [React Email](https://react.email/) for template design and [Resend](https://resend.com/) for delivery.

## Setup

**File**: `src/modules/shared/infrastructure/email/index.ts`

```typescript
import { Resend } from "resend";
export const resend = new Resend(env.RESEND_API_KEY);
```

## Email Templates

All templates are React components located in `src/modules/shared/infrastructure/email/templates/`:

| Template | Purpose |
|----------|---------|
| `welcome-signup.tsx` | Welcome email for new user registration |
| `reset-password-email.tsx` | Password reset link with token |
| `password-changed.tsx` | Confirmation after password change |
| `organization-invitation-email.tsx` | Invite a user to join an organization (includes role) |
| `invitation-accepted-email.tsx` | Notification to org admin when invite is accepted |
| `organization-created-email.tsx` | Confirmation when a new organization is created |
| `next-dose-reminder-email.tsx` | Upcoming medication dose reminder |
| `missed-dose-reminder-email.tsx` | Missed medication dose alert |

## Notifier Pattern

Email sending is abstracted behind domain interfaces, following DDD principles:

### AuthNotifier

**Interface**: `src/modules/auth/domain/auth-notifier.ts`
**Implementation**: `src/modules/auth/infrastructure/email/resend-auth-notifier.ts`

Methods:
- `notifyPasswordResetRequest()` - Sends reset password link
- `notifyPasswordResetSuccess()` - Confirms password change
- `notifyInvitationSent()` - Sends organization invitation
- `notifyInvitationAccepted()` - Notifies admin of accepted invite
- `notifyOrganizationCreated()` - Confirms org creation
- `notifyWelcomeEmail()` - Sends welcome email

### ReminderNotifier

**Interface**: `src/modules/prescription/domain/reminder-notifier.ts`
**Implementation**: `src/modules/prescription/infrastructure/resend-reminder-notifier.ts`

Methods:
- `notifyNextReminder()` - Sends upcoming dose reminder
- `notifyMissedReminder()` - Sends missed dose alert

## Sender Address

All emails are sent from: `Helsa <onboarding@resend.dev>`

## Development

Preview email templates locally:

```bash
npm run email:dev    # Starts preview server on port 3002
```

Build templates for production:

```bash
npm run email:build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for email delivery |
