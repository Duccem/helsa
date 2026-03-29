import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { Patient, PatientGenderValues, PatientId, PatientUserId } from "../../domain/patient";
import { PatientRepository, PatientSearchCriteria } from "../../domain/patient-repository";
import { contact_info, patient } from "./patient.schema";

export class DrizzlePatientRepository implements PatientRepository {
  async save(data: Patient): Promise<void> {
    const { contact_info: patientContactInfo, ...primitives } = data.toPrimitives();

    await database.insert(patient).values(primitives).onConflictDoUpdate({
      target: patient.id,
      set: primitives,
    });

    if (patientContactInfo) {
      await database.transaction(async (tx) => {
        for (const item of patientContactInfo) {
          await tx
            .insert(contact_info)
            .values(item)
            .onConflictDoUpdate({
              target: contact_info.id,
              set: {
                phone: item.phone,
                address: item.address,
                updated_at: item.updated_at,
              },
            });
        }
      });
    }
  }

  async find(id: PatientId): Promise<Patient | null> {
    const item = await database.query.patient.findFirst({
      where: eq(patient.id, id.value),
      with: {
        contact_info: true,
      },
    });

    if (!item) {
      return null;
    }

    return Patient.fromPrimitives({
      ...item,
      gender: item.gender as PatientGenderValues,
      contact_info: item.contact_info.map((contact) => ({
        ...contact,
        phone: contact.phone ?? undefined,
        address: contact.address ?? undefined,
      })),
    });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    const item = await database.query.patient.findFirst({
      where: eq(patient.email, email),
      with: {
        contact_info: true,
      },
    });

    if (!item) {
      return null;
    }

    return Patient.fromPrimitives({
      ...item,
      gender: item.gender as PatientGenderValues,
      contact_info: item.contact_info.map((contact) => ({
        ...contact,
        phone: contact.phone ?? undefined,
        address: contact.address ?? undefined,
      })),
    });
  }

  async findByUserId(userId: PatientUserId): Promise<Patient | null> {
    const item = await database.query.patient.findFirst({
      where: eq(patient.user_id, userId.value),
    });

    if (!item) {
      return null;
    }

    return Patient.fromPrimitives({
      ...item,
      gender: item.gender as PatientGenderValues,
    });
  }

  async search(criteria: PatientSearchCriteria): Promise<PaginatedResult<Patient>> {
    const query = and(
      criteria.gender ? eq(patient.gender, criteria.gender) : undefined,
      criteria.email ? ilike(patient.email, `%${criteria.email}%`) : undefined,
      criteria.query
        ? or(ilike(patient.name, `%${criteria.query}%`), ilike(patient.email, `%${criteria.query}%`))
        : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.patient.findMany({
        where: query,
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(patient.id) })
        .from(patient)
        .where(query),
    ]);

    const data = items.map((item) =>
      Patient.fromPrimitives({
        ...item,
        gender: item.gender as PatientGenderValues,
      }),
    );

    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data,
      pagination,
    };
  }
}

