import "reflect-metadata";
import { ContainerBuilder, type Identifier, type Newable } from "diod";

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

// --- Home ---
import { HomeMetricRepository } from "@/modules/home/domain/home-metric-repository";
import { DrizzleHomeMetricRepository } from "@/modules/home/infrastructure/drizzle-home-metric-repository";
import { GetDoctorHomeMetrics } from "@/modules/home/application/get-doctor-home-metrics";

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

const registerImplementation = <T>(
  identifier: Identifier<T>,
  implementation: Newable<T>,
  dependencies: Identifier<unknown>[] = [],
) => builder.register(identifier).use(implementation).withDependencies(dependencies);

const registerUseCase = <T>(service: Newable<T>, dependencies: Identifier<unknown>[] = []) =>
  builder.registerAndUse(service).withDependencies(dependencies);

// ── Infrastructure: repositories & external service implementations ───────────
registerImplementation(AppointmentRepository, DrizzleAppointmentRepository);
registerImplementation(UserRepository, DrizzleUserRepository);
registerImplementation(OrganizationRepository, DrizzleOrganizationRepository);
registerImplementation(AuthNotifier, ResendAuthNotifier);
registerImplementation(BillingService, PolarBillingService);
registerImplementation(ChatRepository, DrizzleChatRepository);
registerImplementation(DiagnosisRepository, DrizzleDiagnosisRepository);
registerImplementation(DoctorRepository, DrizzleDoctorRepository);
registerImplementation(SpecialtyRepository, DrizzleSpecialtyRepository);
registerImplementation(DoctorLicenseValidationService, VenezuelanDoctorLicenseValidationService);
registerImplementation(HomeMetricRepository, DrizzleHomeMetricRepository);
registerImplementation(MedicalRecordRepository, DrizzleMedicalRecordRepository);
registerImplementation(PatientRepository, DrizzlePatientRepository);
registerImplementation(PrescriptionRepository, DrizzlePrescriptionRepository);
registerImplementation(ReminderNotifier, ResendReminderNotifier);
registerImplementation(ScheduleRepository, DrizzleScheduleRepository);
registerImplementation(VideoCallRepository, DrizzleVideoCallRepository);
registerImplementation(VideoCallAuthService, JwtVideoCallAuthService);
registerImplementation(EventBus, InngestEventBus);

// ── Application: use cases ────────────────────────────────────────────────────

// Appointment
registerUseCase(GetAppointmentDetails, [AppointmentRepository]);
registerUseCase(AddAppointmentNote, [AppointmentRepository]);
registerUseCase(AppointmentAddRating, [AppointmentRepository]);
registerUseCase(ScheduleAppointment, [AppointmentRepository]);
registerUseCase(RemoveAppointmentNote, [AppointmentRepository]);
registerUseCase(SearchAppointments, [AppointmentRepository]);
registerUseCase(UpdateAppointmentStatus, [AppointmentRepository]);

// Auth
registerUseCase(UserRegistration, [AuthNotifier, EventBus]);
registerUseCase(OrganizationCreation, [AuthNotifier, EventBus]);
registerUseCase(GetUser, [UserRepository]);
registerUseCase(GetOrganization, [OrganizationRepository]);
registerUseCase(ChangeRole, [UserRepository, EventBus]);

// Billing
registerUseCase(InitializeNewUserBilling, [BillingService]);
registerUseCase(InitializeNewOrganizationBilling, [BillingService]);
registerUseCase(GetSubscriptionStatus, [BillingService]);
registerUseCase(GetOrderList, [BillingService]);
registerUseCase(GetOrGenerateInvoice, [BillingService]);

// Diagnosis
registerUseCase(ListPathologies, [DiagnosisRepository]);
registerUseCase(ListDiagnoses, [DiagnosisRepository]);
registerUseCase(CreateDiagnosis, [DiagnosisRepository]);

// Doctor
registerUseCase(RegisterDoctor, [DoctorRepository, SpecialtyRepository, DoctorLicenseValidationService]);
registerUseCase(UpdateDoctorProfile, [DoctorRepository, SpecialtyRepository, DoctorLicenseValidationService]);
registerUseCase(GetDoctorProfile, [DoctorRepository]);
registerUseCase(GetDoctorDetails, [DoctorRepository]);
registerUseCase(SearchDoctors, [DoctorRepository]);
registerUseCase(ListSpecialties, [SpecialtyRepository]);
registerUseCase(AddDoctorPrice, [DoctorRepository]);
registerUseCase(AddDoctorOfficeAddress, [DoctorRepository]);
registerUseCase(GetDoctorPatients, [DoctorRepository]);

//Home
registerUseCase(GetDoctorHomeMetrics, [DoctorRepository, HomeMetricRepository]);

// Patient
registerUseCase(CreatePatient, [PatientRepository]);
registerUseCase(UpdatePatient, [PatientRepository]);
registerUseCase(GetPatientProfile, [PatientRepository]);
registerUseCase(GetPatientDetails, [PatientRepository]);
registerUseCase(SearchPatients, [PatientRepository]);
registerUseCase(AddVitals, [PatientRepository]);
registerUseCase(AddContactInfo, [PatientRepository]);
registerUseCase(AddAllergy, [PatientRepository]);
registerUseCase(RemoveAllergy, [PatientRepository]);
registerUseCase(SetPhysicalInformation, [PatientRepository]);

// Prescription
registerUseCase(AddPrescription, [PrescriptionRepository]);
registerUseCase(SearchPrescriptions, [PrescriptionRepository]);
registerUseCase(GetPrescriptionDetails, [PrescriptionRepository]);
registerUseCase(GetPrescriptionDetailsSystem, [PrescriptionRepository]);
registerUseCase(UpdatePrescription, [PrescriptionRepository]);
registerUseCase(AddMedicationToPrescription, [PrescriptionRepository]);
registerUseCase(UpdateMedication, [PrescriptionRepository]);
registerUseCase(SearchMedications, [PrescriptionRepository]);
registerUseCase(SearchReminders, [PrescriptionRepository]);
registerUseCase(MarkReminderAsTaken, [PrescriptionRepository]);
registerUseCase(MarkRemindersAsForgotten, [PrescriptionRepository]);

// Schedule
registerUseCase(CreateSchedule, [ScheduleRepository]);
registerUseCase(AddDaysToSchedule, [ScheduleRepository]);
registerUseCase(GetSchedule, [ScheduleRepository]);
registerUseCase(SearchSchedule, [ScheduleRepository]);
registerUseCase(GetAvailabilities, [ScheduleRepository]);
registerUseCase(GenerateAvailability, [ScheduleRepository]);

// Video Call
registerUseCase(CreateVideoCallForAppointment, [VideoCallRepository]);
registerUseCase(GeneratePatientVideoCallToken, [VideoCallRepository, VideoCallAuthService]);
registerUseCase(GenerateDoctorVideoCallToken, [VideoCallRepository, VideoCallAuthService]);

export const container = builder.build({ autowire: false });

