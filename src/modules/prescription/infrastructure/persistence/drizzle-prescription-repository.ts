import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { Prescription, PrescriptionId } from "../../domain/prescription";
import {
  MedicationSearchCriteria,
  PrescriptionRepository,
  PrescriptionSearchCriteria,
} from "../../domain/prescription-repository";
import { medication, medication_reminder, prescription } from "./prescription.schema";
import { Medication, MedicationStateValues } from "../../domain/medication";
import { MedicationReminder } from "../../domain/medication-reminder";

export class DrizzlePrescriptionRepository implements PrescriptionRepository {
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
        const { reminder, ...medicationPrimitives } = item;

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

        if (reminder) {
          await tx
            .insert(medication_reminder)
            .values(reminder)
            .onConflictDoUpdate({
              target: medication_reminder.medication_id,
              set: {
                scheduled_time: reminder.scheduled_time,
                is_taken: reminder.is_taken,
                forgotten: reminder.forgotten,
                taken_at: reminder.taken_at,
                updated_at: reminder.updated_at,
              },
            });
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
            reminder: true,
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
        notes: entry.notes ?? undefined,
        end_date: entry.end_date ?? undefined,
        alternatives: entry.alternatives ?? [],
        state: entry.state as MedicationStateValues,
        reminder: entry.reminder ? entry.reminder : undefined,
      })),
    });
  }

  async search(criteria: PrescriptionSearchCriteria): Promise<PaginatedResult<Prescription>> {
    const query = and(
      eq(prescription.organization_id, criteria.organization_id),
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
          reminder: true,
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
        notes: item.notes ?? undefined,
        end_date: item.end_date ?? undefined,
        alternatives: item.alternatives ?? [],
        state: item.state as MedicationStateValues,
        reminder: item.reminder ? item.reminder : undefined,
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
        reminder: true,
      },
    });

    return items.filter((item) => item.reminder).map((item) => MedicationReminder.fromPrimitives(item.reminder));
  }
}

