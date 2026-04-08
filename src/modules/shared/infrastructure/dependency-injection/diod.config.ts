import { ContainerBuilder } from "diod";

// ── Appointment ──────────────────────────────────────────────────────────────
import { AppointmentRepository } from "@/modules/appointment/domain/appointment-repository";
import { DrizzleAppointmentRepository } from "@/modules/appointment/infrastructure/persistence/drizzle-appointment-repository";
import { GetAppointmentDetails } from "@/modules/appointment/application/get-appointment-details";
import { AddAppointmentNote } from "@/modules/appointment/application/add-note";
import { AppointmentAddRating } from "@/modules/appointment/application/add-rating";
import { ScheduleAppointment } from "@/modules/appointment/application/schedule-appointment";
import { RemoveAppointmentNote } from "@/modules/appointment/application/remove-note";
import { SearchAppointments } from "@/modules/appointment/application/search-appointments";
import { UpdateAppointmentStatus } from "@/modules/appointment/application/update-status";

// ── Auth ─────────────────────────────────────────────────────────────────────
import { UserRepository } from "@/modules/auth/domain/user-repository";
import { OrganizationRepository } from "@/modules/auth/domain/organization-repository";
import { AuthNotifier } from "@/modules/auth/domain/auth-notifier";
import { DrizzleUserRepository } from "@/modules/auth/infrastructure/persistence/drizzle-user-repository";
import { DrizzleOrganizationRepository } from "@/modules/auth/infrastructure/persistence/drizzle-organization-repository";
import { ResendAuthNotifier } from "@/modules/auth/infrastructure/email/resend-auth-notifier";
import { UserRegistration } from "@/modules/auth/application/user-registration";
import { OrganizationCreation } from "@/modules/auth/application/organization-creation";
import { GetUser } from "@/modules/auth/application/get-user";
import { GetOrganization } from "@/modules/auth/application/get-organization";
import { ChangeRole } from "@/modules/auth/application/change-role";

// ── Billing ──────────────────────────────────────────────────────────────────
import { BillingService } from "@/modules/billing/domain/billing-service";
import { PolarBillingService } from "@/modules/billing/infrastructure/polar-billing-service";
import { InitializeNewUserBilling } from "@/modules/billing/application/initialize-new-user-billing";
import { InitializeNewOrganizationBilling } from "@/modules/billing/application/initialize-new-organization-billing";
import { GetSubscriptionStatus } from "@/modules/billing/application/get-subscription-status";
import { GetOrderList } from "@/modules/billing/application/get-order-list";
import { GetOrGenerateInvoice } from "@/modules/billing/application/get-or-generate-invoice";

// ── Chat Agent ───────────────────────────────────────────────────────────────
import { ChatRepository } from "@/modules/chat-agent/domain/chat-repository";
import { DrizzleChatRepository } from "@/modules/chat-agent/infrastructure/persistence/drizzle-chat-repository";

// ── Diagnosis ────────────────────────────────────────────────────────────────
import { DiagnosisRepository } from "@/modules/diagnosis/domain/diagnosis-repository";
import { DrizzleDiagnosisRepository } from "@/modules/diagnosis/infrastructure/persistence/drizzle-diagnosis-repository";
import { ListPathologies } from "@/modules/diagnosis/application/list-pathologies";
import { ListDiagnoses } from "@/modules/diagnosis/application/list-diagnoses";
import { CreateDiagnosis } from "@/modules/diagnosis/application/create-diagnosis";

// ── Doctor ───────────────────────────────────────────────────────────────────
import { DoctorRepository, SpecialtyRepository } from "@/modules/doctor/domain/doctor-repository";
import { DoctorLicenseValidationService } from "@/modules/doctor/domain/doctor-license-validation-service";
import {
  DrizzleDoctorRepository,
  DrizzleSpecialtyRepository,
} from "@/modules/doctor/infrastructure/persistence/drizzle-doctor-repository";
import { VenezuelanDoctorLicenseValidationService } from "@/modules/doctor/infrastructure/venezuelan-licencense-validation";
import { RegisterDoctor } from "@/modules/doctor/application/register-doctor";
import { UpdateDoctorProfile } from "@/modules/doctor/application/update-doctor-profile";
import { GetDoctorProfile } from "@/modules/doctor/application/get-doctor-profile";
import { GetDoctorDetails } from "@/modules/doctor/application/get-doctor-details";
import { SearchDoctors } from "@/modules/doctor/application/search-doctors";
import { ListSpecialties } from "@/modules/doctor/application/list-specialties";
import { AddDoctorPrice } from "@/modules/doctor/application/add-doctor-price";
import { AddDoctorOfficeAddress } from "@/modules/doctor/application/add-doctor-office-address";
import { GetDoctorPatients } from "@/modules/doctor/application/get-doctor-patients";

// ── Medical Record ───────────────────────────────────────────────────────────
import { MedicalRecordRepository } from "@/modules/medical-record/domain/medical-record-repository";
import { DrizzleMedicalRecordRepository } from "@/modules/medical-record/infrastructure/persistence/drizzle-medical-record-repository";

// ── Patient ──────────────────────────────────────────────────────────────────
import { PatientRepository } from "@/modules/patient/domain/patient-repository";
import { DrizzlePatientRepository } from "@/modules/patient/infrastructure/persistence/drizzle-patient-repository";
import { CreatePatient } from "@/modules/patient/application/create-patient";
import { UpdatePatient } from "@/modules/patient/application/update-patient";
import { GetPatientProfile } from "@/modules/patient/application/get-patient-profile";
import { GetPatientDetails } from "@/modules/patient/application/get-patient-details";
import { SearchPatients } from "@/modules/patient/application/search-patients";
import { AddVitals } from "@/modules/patient/application/add-vitals";
import { AddContactInfo } from "@/modules/patient/application/add-contact-info";
import { AddAllergy } from "@/modules/patient/application/add-allergy";
import { RemoveAllergy } from "@/modules/patient/application/remove-allergy";
import { SetPhysicalInformation } from "@/modules/patient/application/set-physical-information";

// ── Prescription ─────────────────────────────────────────────────────────────
import { PrescriptionRepository } from "@/modules/prescription/domain/prescription-repository";
import { ReminderNotifier } from "@/modules/prescription/domain/reminder-notifier";
import { DrizzlePrescriptionRepository } from "@/modules/prescription/infrastructure/persistence/drizzle-prescription-repository";
import { ResendReminderNotifier } from "@/modules/prescription/infrastructure/resend-reminder-notifier";
import { AddPrescription } from "@/modules/prescription/application/add-prescription";
import { SearchPrescriptions } from "@/modules/prescription/application/search-prescriptions";
import { GetPrescriptionDetails } from "@/modules/prescription/application/get-prescription-details";
import { GetPrescriptionDetailsSystem } from "@/modules/prescription/application/get-prescription-details-system";
import { UpdatePrescription } from "@/modules/prescription/application/update-prescription";
import { AddMedicationToPrescription } from "@/modules/prescription/application/add-medication-to-prescription";
import { UpdateMedication } from "@/modules/prescription/application/update-medication";
import { SearchMedications } from "@/modules/prescription/application/search-medications";
import { SearchReminders } from "@/modules/prescription/application/search-reminders";
import { MarkReminderAsTaken } from "@/modules/prescription/application/mark-reminder-as-taken";
import { MarkRemindersAsForgotten } from "@/modules/prescription/application/mark-reminders-as-forgotten";

// ── Schedule ─────────────────────────────────────────────────────────────────
import { ScheduleRepository } from "@/modules/schedule/domain/schedule-repository";
import { DrizzleScheduleRepository } from "@/modules/schedule/infrastructure/persistence/drizzle-schedule-repository";
import { CreateSchedule } from "@/modules/schedule/application/create-schedule";
import { AddDaysToSchedule } from "@/modules/schedule/application/add-days-to-schedule";
import { GetSchedule } from "@/modules/schedule/application/get-schedule";
import { SearchSchedule } from "@/modules/schedule/application/search-schedule";
import { GetAvailabilities } from "@/modules/schedule/application/get-availabilities";
import { GenerateAvailability } from "@/modules/schedule/application/generate-availability";

// ── Video Call ───────────────────────────────────────────────────────────────
import { VideoCallRepository } from "@/modules/video-call/domain/video-call-repository";
import { VideoCallAuthService } from "@/modules/video-call/domain/video-call-auth-service";
import { DrizzleVideoCallRepository } from "@/modules/video-call/infrastructure/persistence/drizzle-video-call-repository";
import { JwtVideoCallAuthService } from "@/modules/video-call/infrastructure/jwt-video-call-auth-service";
import { CreateVideoCallForAppointment } from "@/modules/video-call/application/create-video-call-for-appointment";
import { GeneratePatientVideoCallToken } from "@/modules/video-call/application/generate-patient-video-call-token";
import { GenerateDoctorVideoCallToken } from "@/modules/video-call/application/generate-doctor-video-call-token";

// ── Shared ───────────────────────────────────────────────────────────────────
import { EventBus } from "@/modules/shared/domain/event-bus";
import { InngestEventBus } from "@/modules/shared/infrastructure/event-bus/inngest-event-bus";

const builder = new ContainerBuilder();

// ── Infrastructure: repositories & external service implementations ───────────
builder.register(AppointmentRepository).use(DrizzleAppointmentRepository);
builder.register(UserRepository).use(DrizzleUserRepository);
builder.register(OrganizationRepository).use(DrizzleOrganizationRepository);
builder.register(AuthNotifier).use(ResendAuthNotifier);
builder.register(BillingService).use(PolarBillingService);
builder.register(ChatRepository).use(DrizzleChatRepository);
builder.register(DiagnosisRepository).use(DrizzleDiagnosisRepository);
builder.register(DoctorRepository).use(DrizzleDoctorRepository);
builder.register(SpecialtyRepository).use(DrizzleSpecialtyRepository);
builder.register(DoctorLicenseValidationService).use(VenezuelanDoctorLicenseValidationService);
builder.register(MedicalRecordRepository).use(DrizzleMedicalRecordRepository);
builder.register(PatientRepository).use(DrizzlePatientRepository);
builder.register(PrescriptionRepository).use(DrizzlePrescriptionRepository);
builder.register(ReminderNotifier).use(ResendReminderNotifier);
builder.register(ScheduleRepository).use(DrizzleScheduleRepository);
builder.register(VideoCallRepository).use(DrizzleVideoCallRepository);
builder.register(VideoCallAuthService).use(JwtVideoCallAuthService);
builder.register(EventBus).use(InngestEventBus);

// ── Application: use cases ────────────────────────────────────────────────────

// Appointment
builder.registerAndUse(GetAppointmentDetails);
builder.registerAndUse(AddAppointmentNote);
builder.registerAndUse(AppointmentAddRating);
builder.registerAndUse(ScheduleAppointment);
builder.registerAndUse(RemoveAppointmentNote);
builder.registerAndUse(SearchAppointments);
builder.registerAndUse(UpdateAppointmentStatus);

// Auth
builder.registerAndUse(UserRegistration);
builder.registerAndUse(OrganizationCreation);
builder.registerAndUse(GetUser);
builder.registerAndUse(GetOrganization);
builder.registerAndUse(ChangeRole);

// Billing
builder.registerAndUse(InitializeNewUserBilling);
builder.registerAndUse(InitializeNewOrganizationBilling);
builder.registerAndUse(GetSubscriptionStatus);
builder.registerAndUse(GetOrderList);
builder.registerAndUse(GetOrGenerateInvoice);

// Diagnosis
builder.registerAndUse(ListPathologies);
builder.registerAndUse(ListDiagnoses);
builder.registerAndUse(CreateDiagnosis);

// Doctor
builder.registerAndUse(RegisterDoctor);
builder.registerAndUse(UpdateDoctorProfile);
builder.registerAndUse(GetDoctorProfile);
builder.registerAndUse(GetDoctorDetails);
builder.registerAndUse(SearchDoctors);
builder.registerAndUse(ListSpecialties);
builder.registerAndUse(AddDoctorPrice);
builder.registerAndUse(AddDoctorOfficeAddress);
builder.registerAndUse(GetDoctorPatients);

// Patient
builder.registerAndUse(CreatePatient);
builder.registerAndUse(UpdatePatient);
builder.registerAndUse(GetPatientProfile);
builder.registerAndUse(GetPatientDetails);
builder.registerAndUse(SearchPatients);
builder.registerAndUse(AddVitals);
builder.registerAndUse(AddContactInfo);
builder.registerAndUse(AddAllergy);
builder.registerAndUse(RemoveAllergy);
builder.registerAndUse(SetPhysicalInformation);

// Prescription
builder.registerAndUse(AddPrescription);
builder.registerAndUse(SearchPrescriptions);
builder.registerAndUse(GetPrescriptionDetails);
builder.registerAndUse(GetPrescriptionDetailsSystem);
builder.registerAndUse(UpdatePrescription);
builder.registerAndUse(AddMedicationToPrescription);
builder.registerAndUse(UpdateMedication);
builder.registerAndUse(SearchMedications);
builder.registerAndUse(SearchReminders);
builder.registerAndUse(MarkReminderAsTaken);
builder.registerAndUse(MarkRemindersAsForgotten);

// Schedule
builder.registerAndUse(CreateSchedule);
builder.registerAndUse(AddDaysToSchedule);
builder.registerAndUse(GetSchedule);
builder.registerAndUse(SearchSchedule);
builder.registerAndUse(GetAvailabilities);
builder.registerAndUse(GenerateAvailability);

// Video Call
builder.registerAndUse(CreateVideoCallForAppointment);
builder.registerAndUse(GeneratePatientVideoCallToken);
builder.registerAndUse(GenerateDoctorVideoCallToken);

export const container = builder.build();

