# Multi-Tenancy

Helsa uses an organization-based multi-tenancy model where each organization is an isolated tenant.

## Model

```
Organization (tenant)
├── Members (users with roles)
├── Appointments
├── Doctors
├── Patients
├── Prescriptions
├── Diagnoses
├── Medical Records
└── Billing (per-organization subscription)
```

## Organization as Tenant

- **Organizations** are the primary isolation boundary for all data.
- Users can belong to multiple organizations (e.g., a doctor consulting at several clinics).
- The **active organization** is stored in the user's session and determines which data is visible.
- All queries include the organization ID to enforce data isolation.

## Membership & Roles

Organizations use a member table to track which users belong to which organization:

| Field | Description |
|-------|-------------|
| `user_id` | Reference to the user |
| `organization_id` | Reference to the organization |
| `role` | Member role (doctor, admin) |

### Roles

- **admin** - Full organization management (members, settings, billing)
- **doctor** - Medical practitioner with clinical access

## Invitation Flow

1. Admin sends an invitation to an email address with a specified role
2. System sends an invitation email via Resend
3. Invitee accepts the invitation, creating their membership
4. Admin is notified that the invitation was accepted

## Authentication Context

The `authenticateOrg()` helper retrieves both the session and the active organization context:

```typescript
const { session, organization } = await authenticateOrg();
// organization.id is used to scope all subsequent queries
```

## Billing

- Each organization has its own subscription through Polar
- Billing is initialized automatically when an organization is created (via Inngest workflow)
- Users also have personal billing for individual-tier features
