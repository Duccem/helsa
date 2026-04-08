import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, between, count, eq, gte, ilike, or } from "drizzle-orm";
import { Prescription, PrescriptionId } from "../../domain/prescription";
import {
  MedicationSearchCriteria,
  PrescriptionRepository,
  PrescriptionSearchCriteria,
  ReminderSearchCriteria,
} from "../../domain/prescription-repository";
import { medication, medication_reminder, prescription } from "./prescription.schema";
import { Medication, MedicationId, MedicationStateValues } from "../../domain/medication";
import { MedicationReminder } from "../../domain/medication-reminder";
import { InfrastructureService } from "@/modules/shared/domain/service.";

@InfrastructureService()
export class DrizzlePrescriptionRepository extends PrescriptionRepository {
  async save(data: Prescription): Promise<void> {
    const { medications, ...primitives } = data.toPrimitives();

    await database.insert(prescription).values(primitives).onConflictDoUpdate({
      target: prescription.id,
      set: primitives,
    });

    if (!medications || medications.length === 0) {
      return;
    }

    await database.transaction(async (tx) => {
      for (const item of medications) {
        const { reminders, ...medicationPrimitives } = item;

        await tx
          .insert(medication)
          .values(medicationPrimitives)
          .onConflictDoUpdate({
            target: medication.id,
            set: {
              name: medicationPrimitives.name,
              dosage: medicationPrimitives.dosage,
              dosage_unit: medicationPrimitives.dosage_unit,
              frequency: medicationPrimitives.frequency,
              administration_method: medicationPrimitives.administration_method,
              alternatives: medicationPrimitives.alternatives,
              start_date: medicationPrimitives.start_date,
              end_date: medicationPrimitives.end_date,
              notes: medicationPrimitives.notes,
              state: medicationPrimitives.state,
              updated_at: medicationPrimitives.updated_at,
            },
          });

        if (reminders) {
          for (const reminder of reminders) {
            await tx
              .insert(medication_reminder)
              .values(reminder)
              .onConflictDoUpdate({
                target: medication_reminder.id,
                set: {
                  scheduled_time: reminder.scheduled_time,
                  is_taken: reminder.is_taken,
                  forgotten: reminder.forgotten,
                  taken_at: reminder.taken_at ? reminder.taken_at : null,
                  updated_at: reminder.updated_at,
                },
              });
          }
        }
      }
    });
  }

  async find(id: PrescriptionId): Promise<Prescription | null> {
    const item = await database.query.prescription.findFirst({
      where: eq(prescription.id, id.value),
      with: {
        medications: {
          with: {
            reminders: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return Prescription.fromPrimitives({
      ...item,
      medications: item.medications.map((entry) => ({
        ...entry,
        notes: entry.notes ?? null,
        end_date: entry.end_date ?? null,
        alternatives: entry.alternatives ?? [],
        state: entry.state as MedicationStateValues,
        reminders: entry.reminders ? entry.reminders : null,
      })),
    });
  }

  async search(criteria: PrescriptionSearchCriteria): Promise<PaginatedResult<Prescription>> {
    const query = and(
      criteria.patient_id ? eq(prescription.patient_id, criteria.patient_id) : undefined,
      criteria.doctor_id ? eq(prescription.doctor_id, criteria.doctor_id) : undefined,
      criteria.query ? ilike(prescription.observation, `%${criteria.query}%`) : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.prescription.findMany({
        where: query,
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(prescription.id) })
        .from(prescription)
        .where(query),
    ]);

    const data = items.map((item) => Prescription.fromPrimitives(item));
    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data,
      pagination,
    };
  }

  async searchMedications(criteria: MedicationSearchCriteria): Promise<PaginatedResult<Medication>> {
    const query = and(
      eq(medication.patient_id, criteria.patient_id),
      criteria.prescription_id ? eq(medication.prescription_id, criteria.prescription_id) : undefined,
      criteria.query
        ? or(
            ilike(medication.name, `%${criteria.query}%`),
            ilike(medication.frequency, `%${criteria.query}%`),
            ilike(medication.administration_method, `%${criteria.query}%`),
          )
        : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.medication.findMany({
        where: query,
        with: {
          reminders: true,
        },
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(medication.id) })
        .from(medication)
        .where(query),
    ]);

    const data = items.map((item) =>
      Medication.fromPrimitives({
        ...item,
        notes: item.notes ?? null,
        end_date: item.end_date ?? null,
        alternatives: item.alternatives ?? [],
        state: item.state as MedicationStateValues,
        reminders: item.reminders ? item.reminders : null,
      }),
    );

    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data,
      pagination,
    };
  }

  async listRemindersForPrescription(prescription_id: PrescriptionId): Promise<MedicationReminder[]> {
    const items = await database.query.medication.findMany({
      where: eq(medication.prescription_id, prescription_id.value),
      with: {
        reminders: true,
      },
    });

    return items
      .filter((item) => item.reminders && item.reminders.length > 0)
      .flatMap((item) => item.reminders!.map((reminder) => MedicationReminder.fromPrimitives(reminder)));
  }

  async searchReminders(query: ReminderSearchCriteria): Promise<PaginatedResult<MedicationReminder>> {
    const whereClause = [];

    if (query.is_taken) {
      whereClause.push(eq(medication_reminder.is_taken, query.is_taken));
    }

    if (query.forgotten) {
      whereClause.push(eq(medication_reminder.forgotten, query.forgotten));
    }

    if (query.start_date && query.end_date) {
      whereClause.push(between(medication_reminder.scheduled_time, query.start_date, query.end_date));
    } else if (query.start_date) {
      whereClause.push(gte(medication_reminder.scheduled_time, query.start_date));
    } else if (query.end_date) {
      whereClause.push(gte(medication_reminder.scheduled_time, query.end_date));
    }

    const [items, total] = await Promise.all([
      database.query.medication_reminder.findMany({
        where: and(...whereClause),
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
      }),
      database
        .select({ count: count(medication_reminder.medication_id) })
        .from(medication_reminder)
        .where(and(...whereClause)),
    ]);

    const data = items.map((item) => MedicationReminder.fromPrimitives(item));
    const pagination = buildPagination(total[0].count, query.page, query.pageSize);

    return {
      data,
      pagination,
    };
  }

  async findMedication(id: MedicationId): Promise<Medication | null> {
    const item = await database.query.medication.findFirst({
      where: eq(medication.id, id.value),
    });

    if (!item) {
      return null;
    }

    return Medication.fromPrimitives({
      ...item,
      notes: item.notes ?? null,
      end_date: item.end_date ?? null,
      alternatives: item.alternatives ?? [],
      state: item.state as MedicationStateValues,
      reminders: null,
    });
  }
}

