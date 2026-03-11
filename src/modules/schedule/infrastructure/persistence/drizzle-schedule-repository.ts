import { database } from "@/modules/shared/infrastructure/database/client";
import { and, asc, count, eq, gte, lte } from "drizzle-orm";
import { AvailabilitySlot, AvailabilitySlotStateValues } from "../../domain/availability-slot";
import { Schedule, ScheduleDoctorId } from "../../domain/schedule";
import { ScheduleRepository, SearchSchedulesCriteria } from "../../domain/schedule-repository";
import { availability_slot, schedule, schedule_day } from "./schedule.schema";
import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";

export class DrizzleScheduleRepository implements ScheduleRepository {
  async save(data: Schedule): Promise<void> {
    const { days, ...primitives } = data.toPrimitives();

    await database.insert(schedule).values(primitives).onConflictDoUpdate({
      target: schedule.id,
      set: primitives,
    });

    await database.transaction(async (tx) => {
      await tx.delete(schedule_day).where(eq(schedule_day.schedule_id, data.id.value));

      if (days && days.length > 0) {
        await tx.insert(schedule_day).values(days);
      }
    });
  }

  async findByDoctorId(doctorId: ScheduleDoctorId): Promise<Schedule | null> {
    const item = await database.query.schedule.findFirst({
      where: eq(schedule.doctor_id, doctorId.value),
      with: {
        days: true,
      },
    });

    if (!item) {
      return null;
    }

    return Schedule.fromPrimitives(item);
  }

  async saveAvailabilities(slots: AvailabilitySlot[]): Promise<void> {
    if (slots.length === 0) {
      return;
    }

    const values = slots.map((item) => item.toPrimitives());
    await database.insert(availability_slot).values(values);
  }

  async deleteAvailabilitiesByDoctorIdAndRange(
    doctorId: ScheduleDoctorId,
    date_from: Date,
    date_to: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<void> {
    await database
      .delete(availability_slot)
      .where(
        and(
          eq(availability_slot.doctor_id, doctorId.value),
          gte(availability_slot.date, date_from),
          lte(availability_slot.date, date_to),
          state ? eq(availability_slot.state, state) : undefined,
        ),
      );
  }

  async findAvailabilitiesByDoctorId(
    doctorId: ScheduleDoctorId,
    date_from?: Date,
    date_to?: Date,
    state?: "TAKEN" | "AVAILABLE",
  ): Promise<AvailabilitySlot[]> {
    const items = await database.query.availability_slot.findMany({
      where: and(
        eq(availability_slot.doctor_id, doctorId.value),
        date_from ? gte(availability_slot.date, date_from) : undefined,
        date_to ? lte(availability_slot.date, date_to) : undefined,
        state ? eq(availability_slot.state, state) : undefined,
      ),
      orderBy: [asc(availability_slot.date)],
    });

    return items.map((item) =>
      AvailabilitySlot.fromPrimitives({
        ...item,
        state: item.state as AvailabilitySlotStateValues,
      }),
    );
  }

  async searchSchedules(criteria: SearchSchedulesCriteria): Promise<PaginatedResult<Schedule>> {
    const { doctor_id, next_availability_generation, max_appointments_per_day, page, pageSize } = criteria;
    const where = and(
      doctor_id ? eq(schedule.doctor_id, doctor_id) : undefined,
      next_availability_generation
        ? gte(schedule.next_availability_generation, next_availability_generation)
        : undefined,
      max_appointments_per_day ? eq(schedule.max_appointments_per_day, max_appointments_per_day) : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.schedule.findMany({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      database
        .select({ count: count(schedule.id) })
        .from(schedule)
        .where(where),
    ]);

    return {
      data: items.map((item) => Schedule.fromPrimitives(item)),
      pagination: buildPagination(total[0].count, page, pageSize),
    };
  }
}

