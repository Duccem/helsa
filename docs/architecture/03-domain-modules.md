# Domain Modules

Each module represents a bounded context within the healthcare domain. All modules live under `src/modules/`.

## Appointment

Manages the scheduling, tracking, and rating of medical appointments.

- **Aggregate**: `Appointment` with status lifecycle (SCHEDULED → IN_PROGRESS → FINISHED/CANCELLED)
- **Value Objects**: AppointmentNote, AppointmentRating, AppointmentPatient, AppointmentPayment
- **Types**: CONSULTATION, FOLLOW_UP, CHECK_UP, EMERGENCY, PROCEDURE
- **Modes**: ONLINE, IN_PERSON
- **Use Cases**: ScheduleAppointment, AddNote, AddRating, UpdateStatus, GetAppointmentDetails, SearchAppointments

## Auth

Handles user identity, session management, and organization membership.

- **Aggregate**: User, Organization
- **Domain Events**: UserCreatedEvent, OrganizationCreatedEvent
- **Ports** (abstract classes): AuthNotifier (for email notifications)
- **Use Cases**: GetUser, GetOrganization, ChangeRole, UserRegistration, OrganizationCreation
- **Infrastructure**: better-auth server/client, Google OAuth, role-based access control, invitation system

## Billing

Manages subscriptions, orders, and invoicing through the Polar payment platform.

- **Port** (abstract class): BillingService (createCustomer, createSubscription, getSubscriptionStatus, getOrders, getInvoice)
- **Use Cases**: InitializeNewUserBilling, InitializeNewOrganizationBilling, GetSubscriptionStatus, GetOrderList, GetOrGenerateInvoice
- **Infrastructure**: PolarBillingService, product/plan definitions

## Chat Agent

AI-powered mental health support chat assistant.

- **Aggregate**: Chat with messages, status (ACTIVE/ARCHIVED)
- **Value Objects**: ChatMessage (role: user/assistant)
- **Infrastructure**: ToolLoopAgent using Google Gemini via Vercel AI SDK
- **Behavior**: Empathetic mental health support, safety detection for crisis situations

## Diagnosis

Records and classifies medical diagnoses.

- **Aggregate**: Diagnosis
- **Value Objects**: Pathology
- **Types**: ALLERGY, CHRONIC, ACUTE, FAMILY_HISTORY, SOCIAL_HISTORY
- **Use Cases**: CreateDiagnosis, SearchDiagnosis, GetDiagnosisDetails

## Doctor

Manages doctor profiles, credentials, pricing, and office locations.

- **Aggregate**: Doctor
- **Value Objects**: DoctorId, LicenseNumber, Score, Experience, Education, OfficeAddress, Price
- **Use Cases**: RegisterDoctor, GetDoctorProfile, UpdatePricing, SetOfficeAddress
- **Infrastructure**: VenezuelanDoctorLicenseValidationService (country-specific license validation)

## Medical Record

Stores and organizes clinical documentation.

- **Aggregate**: MedicalRecord with JSONB attachments
- **Types**: DIAGNOSIS, PRESCRIPTION, NOTE, LAB_RESULT, IMAGING_RESULT, IMMUNIZATION, PROCEDURE, PLAN, OTHER
- **Statuses**: FINAL, DRAFT, AMENDED, CORRECTED, APPENDED
- **Priority Levels**: Available for clinical triage

## Patient

Manages patient profiles, contact information, physical measurements, and vital signs.

- **Aggregate**: Patient (linked to User)
- **Value Objects**: Contact info, physical information, vitals
- **Use Cases**: CreatePatient, UpdatePatient, AddContactInfo, SetPhysicalInformation, AddVitals, GetPatientProfile, SearchPatients, GetPatientDetails

## Prescription

Handles medication prescriptions and automated reminders.

- **Aggregate**: Prescription
- **Value Objects**: Medication, MedicationReminder
- **Medication States**: PENDING, ACTIVE, PAUSED, COMPLETED
- **Ports** (abstract classes): ReminderNotifier (for dose reminders via email)
- **Use Cases**: CreatePrescription, GetPrescriptionDetails, SearchReminders
- **Background Jobs**: Scheduled reminders via Inngest (every 15 minutes), missed dose alerts

## Schedule

Manages doctor availability and appointment slots.

- **Aggregate**: Schedule
- **Value Objects**: ScheduleDay, AvailabilitySlot
- **Slot States**: TAKEN, AVAILABLE
- **Use Cases**: GenerateAvailability, GetDoctorAvailability
- **Background Jobs**: Automated slot generation

## Module Dependency Map

```
auth ──────────────► billing (user/org creation triggers billing setup)
auth ──────────────► doctor (role assignment triggers doctor creation)
auth ──────────────► patient (role assignment triggers patient creation)
appointment ───────► doctor, patient, schedule
prescription ──────► patient
diagnosis ─────────► patient
medical-record ────► patient, doctor
chat-agent ────────► auth (user context)
schedule ──────────► doctor
```

All inter-module communication happens through domain events published on the event bus, maintaining loose coupling between bounded contexts.
