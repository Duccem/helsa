import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, eq, gte, ilike, inArray, lte } from "drizzle-orm";
import { Doctor, DoctorId, DoctorUserId } from "../../domain/doctor";
import { DoctorRepository, DoctorSearchCriteria, SpecialtyRepository } from "../../domain/doctor-repository";
import { Specialty, SpecialtyId } from "../../domain/specialty";
import { doctor, education, office_address, price, specialty } from "./doctor.schema";
import { appointment } from "@/modules/appointment/infrastructure/persistence/appointment.schema";
import { patient } from "@/modules/patient/infrastructure/persistence/patient.schema";
import { DoctorPatient } from "../../domain/doctor-patient";
import { InfrastructureService } from "@/modules/shared/domain/service.";

@InfrastructureService()
export class DrizzleDoctorRepository extends DoctorRepository {
  async save(data: Doctor): Promise<void> {
    const {
      prices: doctorPrices,
      office_addresses: officeAddresses,
      education: doctorEducation,
      ...primitives
    } = data.toPrimitives();

    await database.insert(doctor).values(primitives).onConflictDoUpdate({
      target: doctor.id,
      set: primitives,
    });

    if (doctorPrices) {
      for (const priceData of doctorPrices) {
        await database
          .insert(price)
          .values({
            doctor_id: priceData.doctor_id,
            id: priceData.id,
            amount: priceData.amount,
            payment_mode: priceData.payment_mode as "PREPAID" | "POSTPAID" | "CREDIT",
          })
          .onConflictDoUpdate({
            target: price.id,
            set: {
              amount: priceData.amount,
            },
          });
      }
    }

    if (officeAddresses) {
      for (const officeAddress of officeAddresses) {
        await database
          .insert(office_address)
          .values(officeAddress)
          .onConflictDoUpdate({
            target: office_address.id,
            set: {
              address: officeAddress.address,
              location: officeAddress.location,
              updated_at: officeAddress.updated_at,
            },
          });
      }
    }

    if (doctorEducation) {
      await database.transaction(async (tx) => {
        for (const item of doctorEducation) {
          await tx
            .insert(education)
            .values(item)
            .onConflictDoUpdate({
              target: education.id,
              set: {
                title: item.title,
                institution: item.institution,
                graduated_at: item.graduated_at,
                updated_at: item.updated_at,
              },
            });
        }
      });
    }
  }

  async find(id: DoctorId): Promise<Doctor | null> {
    const item = await database.query.doctor.findFirst({
      where: eq(doctor.id, id.value),
      with: {
        prices: true,
        office_addresses: true,
        education: true,
      },
    });

    if (!item) {
      return null;
    }

    return Doctor.fromPrimitives({
      ...item,
      bio: item.bio ?? undefined,
      next_availability_generation: item.next_availability_generation ?? undefined,
      prices: item.prices,
      office_addresses: item.office_addresses,
    });
  }

  async findByUserId(userId: DoctorUserId): Promise<Doctor | null> {
    const item = await database.query.doctor.findFirst({
      where: eq(doctor.user_id, userId.value),
      with: {
        prices: true,
        office_addresses: true,
        education: true,
      },
    });

    if (!item) {
      return null;
    }

    return Doctor.fromPrimitives({
      ...item,
      bio: item.bio ?? undefined,
      next_availability_generation: item.next_availability_generation ?? undefined,
      prices: item.prices,
      office_addresses: item.office_addresses,
    });
  }

  async search(criteria: DoctorSearchCriteria): Promise<PaginatedResult<Doctor>> {
    const query = and(
      criteria.specialty_id ? eq(doctor.specialty_id, criteria.specialty_id) : undefined,
      criteria.min_score !== undefined ? gte(doctor.score, criteria.min_score) : undefined,
      criteria.min_experience !== undefined ? gte(doctor.experience, criteria.min_experience) : undefined,
      criteria.max_price !== undefined ? lte(price.amount, criteria.max_price) : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.doctor.findMany({
        where: query,
        with: {
          prices: true,
          office_addresses: true,
          education: true,
        },
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(doctor.id) })
        .from(doctor)
        .leftJoin(price, eq(price.doctor_id, doctor.id))
        .where(query),
    ]);

    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    const data = items.map((item) =>
      Doctor.fromPrimitives({
        ...item,
        bio: item.bio ?? undefined,
        next_availability_generation: item.next_availability_generation ?? undefined,
        prices: item.prices,
        office_addresses: item.office_addresses,
      }),
    );

    return {
      data,
      pagination,
    };
  }

  async getDoctorPatients(doctorId: DoctorId): Promise<DoctorPatient[]> {
    const appointments = await database
      .selectDistinct({ patient_id: appointment.patient_id })
      .from(appointment)
      .where(eq(appointment.doctor_id, doctorId.value));
    const patients = await database
      .select({ id: patient.id, name: patient.name, email: patient.email })
      .from(patient)
      .where(
        inArray(
          patient.id,
          appointments.map((a) => a.patient_id),
        ),
      );
    return patients.map((p) =>
      DoctorPatient.fromPrimitives({
        id: p.id,
        name: p.name,
        email: p.email,
      }),
    );
  }
}

@InfrastructureService()
export class DrizzleSpecialtyRepository extends SpecialtyRepository {
  async save(data: Specialty): Promise<void> {
    const primitives = data.toPrimitives();
    await database.insert(specialty).values(primitives).onConflictDoUpdate({
      target: specialty.id,
      set: primitives,
    });
  }

  async find(id: SpecialtyId): Promise<Specialty | null> {
    const item = await database.query.specialty.findFirst({
      where: eq(specialty.id, id.value),
    });

    if (!item) {
      return null;
    }

    return Specialty.fromPrimitives(item);
  }

  async search(name?: string): Promise<Specialty[]> {
    const items = await database.query.specialty.findMany({
      where: name ? ilike(specialty.name, `%${name}%`) : undefined,
    });

    return items.map((item) => Specialty.fromPrimitives(item));
  }
}

