import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import { user } from "@/modules/auth/infrastructure/persistence/auth.schema";
import { doctor } from "@/modules/doctor/infrastructure/persistence/doctor.schema";
import { patient } from "@/modules/patient/infrastructure/persistence/patient.schema";
import { buildPagination, type PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import {
  Appointment,
  type AppointmentId,
  type AppointmentModeValues,
  type AppointmentStatusValues,
  type AppointmentTypeValues,
} from "../../domain/appointment";
import type {
  AppointmentListItem,
  AppointmentRepository,
  AppointmentSearchCriteria,
} from "../../domain/appointment-repository";
import { appointment, appointment_note, appointment_rating } from "./appointment.schema";

export class DrizzleAppointmentRepository implements AppointmentRepository {
  private buildQuery(criteria: AppointmentSearchCriteria) {
    return and(
      criteria.organization_id ? eq(appointment.organization_id, criteria.organization_id) : undefined,
      criteria.patient_id ? eq(appointment.patient_id, criteria.patient_id) : undefined,
      criteria.doctor_id ? eq(appointment.doctor_id, criteria.doctor_id) : undefined,
      criteria.status ? eq(appointment.status, criteria.status) : undefined,
      criteria.mode ? eq(appointment.mode, criteria.mode) : undefined,
      criteria.type ? eq(appointment.type, criteria.type) : undefined,
      criteria.date_from ? gte(appointment.date, criteria.date_from) : undefined,
      criteria.date_to ? lte(appointment.date, criteria.date_to) : undefined,
    );
  }

  private buildOrderBy(criteria: AppointmentSearchCriteria) {
    const direction = criteria.order === "DESC" ? desc : asc;

    switch (criteria.sort) {
      case "status":
        return direction(appointment.status);
      case "created_at":
        return direction(appointment.created_at);
      default:
        return direction(appointment.date);
    }
  }

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
    const query = this.buildQuery(criteria);
    const [items, total] = await Promise.all([
      database.query.appointment.findMany({
        where: query,
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
        orderBy: this.buildOrderBy(criteria),
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

  async searchList(criteria: AppointmentSearchCriteria): Promise<PaginatedResult<AppointmentListItem>> {
    const query = this.buildQuery(criteria);
    const [items, total] = await Promise.all([
      database
        .select({
          id: appointment.id,
          organization_id: appointment.organization_id,
          patient_id: appointment.patient_id,
          patient_name: patient.name,
          doctor_id: appointment.doctor_id,
          doctor_name: user.name,
          date: appointment.date,
          motive: appointment.motive,
          type: appointment.type,
          mode: appointment.mode,
          status: appointment.status,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
        })
        .from(appointment)
        .leftJoin(patient, eq(appointment.patient_id, patient.id))
        .leftJoin(doctor, eq(appointment.doctor_id, doctor.id))
        .leftJoin(user, eq(doctor.user_id, user.id))
        .where(query)
        .orderBy(this.buildOrderBy(criteria))
        .limit(criteria.pageSize)
        .offset((criteria.page - 1) * criteria.pageSize),
      database
        .select({ count: count(appointment.id) })
        .from(appointment)
        .where(query),
    ]);

    const data: AppointmentListItem[] = items.map((item) => ({
      id: item.id,
      organization_id: item.organization_id,
      patient_id: item.patient_id,
      patient_name: item.patient_name,
      doctor_id: item.doctor_id,
      doctor_name: item.doctor_name,
      date: item.date,
      motive: item.motive,
      type: item.type as AppointmentTypeValues,
      mode: item.mode as AppointmentModeValues,
      status: item.status as AppointmentStatusValues,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return {
      data,
      pagination: buildPagination(total[0].count, criteria.page, criteria.pageSize),
    };
  }
}

