import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, eq, gte, ilike, lte } from "drizzle-orm";
import { Doctor, DoctorId, DoctorUserId } from "../../domain/doctor";
import { DoctorRepository, DoctorSearchCriteria, SpecialtyRepository } from "../../domain/doctor-repository";
import { Specialty, SpecialtyId } from "../../domain/specialty";
import { doctor, education, office_address, price, specialty } from "./doctor.schema";

export class DrizzleDoctorRepository implements DoctorRepository {
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
      await database.transaction(async (tx) => {
        for (const doctorPrice of doctorPrices) {
          await tx
            .insert(price)
            .values(doctorPrice)
            .onConflictDoUpdate({
              target: price.id,
              set: {
                amount: doctorPrice.amount,
                updated_at: doctorPrice.updated_at,
              },
            });
        }
      });
    }

    if (officeAddresses) {
      await database.transaction(async (tx) => {
        for (const officeAddress of officeAddresses) {
          await tx
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
      });
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
      database
        .select({
          doctor,
        })
        .from(doctor)
        .leftJoin(price, eq(price.doctor_id, doctor.id))
        .where(query)
        .limit(criteria.pageSize)
        .offset((criteria.page - 1) * criteria.pageSize),
      database
        .select({ count: count(doctor.id) })
        .from(doctor)
        .leftJoin(price, eq(price.doctor_id, doctor.id))
        .where(query),
    ]);

    const doctorsById = new Map<string, (typeof items)[number]["doctor"]>();
    for (const item of items) {
      if (!doctorsById.has(item.doctor.id)) {
        doctorsById.set(item.doctor.id, item.doctor);
      }
    }

    const data = await Promise.all(
      [...doctorsById.values()].map(async (doctorData) => {
        const fullDoctor = await database.query.doctor.findFirst({
          where: eq(doctor.id, doctorData.id),
          with: {
            prices: true,
            office_addresses: true,
            education: true,
          },
        });

        if (!fullDoctor) {
          return null;
        }

        return Doctor.fromPrimitives({
          ...fullDoctor,
          bio: fullDoctor.bio ?? undefined,
          next_availability_generation: fullDoctor.next_availability_generation ?? undefined,
          prices: fullDoctor.prices,
          office_addresses: fullDoctor.office_addresses,
        });
      }),
    );

    const sanitizedData = data.filter((item): item is Doctor => item !== null);

    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data: sanitizedData,
      pagination,
    };
  }
}

export class DrizzleSpecialtyRepository implements SpecialtyRepository {
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

