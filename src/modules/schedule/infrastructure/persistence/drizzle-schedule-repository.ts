import { database } from "@/modules/shared/infrastructure/database/client";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { AvailabilitySlot, AvailabilitySlotStateValues } from "../../domain/availability-slot";
import { Schedule, ScheduleDoctorId } from "../../domain/schedule";
import { ScheduleRepository } from "../../domain/schedule-repository";
import { availability_slot, schedule, schedule_day } from "./schedule.schema";

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

    return Schedule.fromPrimitives({
      ...item,
    });
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
  ): Promise<void> {
    await database
      .delete(availability_slot)
      .where(
        and(
          eq(availability_slot.doctor_id, doctorId.value),
          gte(availability_slot.date, date_from),
          lte(availability_slot.date, date_to),
        ),
      );
  }

  async findAvailabilitiesByDoctorId(
    doctorId: ScheduleDoctorId,
    date_from?: Date,
    date_to?: Date,
  ): Promise<AvailabilitySlot[]> {
    const items = await database.query.availability_slot.findMany({
      where: and(
        eq(availability_slot.doctor_id, doctorId.value),
        date_from ? gte(availability_slot.date, date_from) : undefined,
        date_to ? lte(availability_slot.date, date_to) : undefined,
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
}

