import { database } from "@/modules/shared/infrastructure/database/client";
import {
  Appointment,
  AppointmentId,
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "../../domain/appointment";
import { AppointmentRepository, AppointmentSearchCriteria } from "../../domain/appointment-repository";
import { appointment, appointment_note, appointment_rating } from "./appointment.schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";

export class DrizzleAppointmentRepository implements AppointmentRepository {
  async save(data: Appointment): Promise<void> {
    const { rating, notes, ...primitives } = data.toPrimitives();
    await database.insert(appointment).values(primitives).onConflictDoUpdate({
      target: appointment.id,
      set: primitives,
    });

    if (rating) {
      await database
        .insert(appointment_rating)
        .values({
          appointment_id: data.id.value,
          patient_id: data.patient_id.value,
          doctor_id: data.doctor_id.value,
          score: rating.score,
        })
        .onConflictDoUpdate({
          target: appointment_rating.appointment_id,
          set: {
            score: rating.score,
          },
        });
    }

    if (notes) {
      await database.transaction(async (tx) => {
        for (const note of notes) {
          await tx
            .insert(appointment_note)
            .values({
              id: note.id,
              appointment_id: primitives.id,
              note: note.note,
              created_at: note.created_at,
              updated_at: note.updated_at,
            })
            .onConflictDoUpdate({
              target: appointment_note.id,
              set: {
                note: note.note,
                updated_at: note.updated_at,
              },
            });
        }
      });
    }
  }

  async find(id: AppointmentId): Promise<Appointment | null> {
    const item = await database.query.appointment.findFirst({
      where: eq(appointment.id, id.value),
      with: {
        notes: true,
        rating: true,
      },
    });

    if (!item) {
      return null;
    }

    return Appointment.fromPrimitives({
      ...item,
      mode: item.mode as AppointmentModeValues,
      status: item.status as AppointmentStatusValues,
      type: item.type as AppointmentTypeValues,
    });
  }

  async search(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<Appointment>> {
    const query = and(
      criteria.organization_id ? eq(appointment.organization_id, criteria.organization_id) : undefined,
      criteria.patient_id ? eq(appointment.patient_id, criteria.patient_id) : undefined,
      criteria.doctor_id ? eq(appointment.doctor_id, criteria.doctor_id) : undefined,
      criteria.status ? eq(appointment.status, criteria.status) : undefined,
      criteria.date_from ? gte(appointment.date, criteria.date_from) : undefined,
      criteria.date_to ? lte(appointment.date, criteria.date_to) : undefined,
    );
    const [items, total] = await Promise.all([
      database.query.appointment.findMany({
        where: query,
        limit: criteria.page,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(appointment.id) })
        .from(appointment)
        .where(query),
    ]);

    const data = items.map((item) =>
      Appointment.fromPrimitives({
        ...item,
        mode: item.mode as AppointmentModeValues,
        status: item.status as AppointmentStatusValues,
        type: item.type as AppointmentTypeValues,
      }),
    );
    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data,
      pagination,
    };
  }
}

