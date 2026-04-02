import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { Patient, PatientGenderValues, PatientId, PatientUserId } from "../../domain/patient";
import { PatientRepository, PatientSearchCriteria } from "../../domain/patient-repository";
import { allergy, contact_info, patient, physical_information, vitals } from "./patient.schema";

export class DrizzlePatientRepository implements PatientRepository {
  async save(data: Patient): Promise<void> {
    const {
      contact_info: patientContactInfo,
      vitals: patientVitals,
      physical_information: patientPhysicalInfo,
      allergies: patientAllergies,
      ...primitives
    } = data.toPrimitives();

    await database.insert(patient).values(primitives).onConflictDoUpdate({
      target: patient.id,
      set: primitives,
    });

    await database.transaction(async (tx) => {
      if (patientContactInfo) {
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
      }

      if (patientVitals) {
        for (const item of patientVitals) {
          await tx
            .insert(vitals)
            .values(item)
            .onConflictDoUpdate({
              target: vitals.id,
              set: {
                blood_pressure: item.blood_pressure,
                heart_rate: item.heart_rate,
                respiratory_rate: item.respiratory_rate,
                oxygen_saturation: item.oxygen_saturation,
                temperature: item.temperature,
                updated_at: item.updated_at,
              },
            });
        }
      }

      if (patientPhysicalInfo) {
        await tx
          .insert(physical_information)
          .values(patientPhysicalInfo)
          .onConflictDoUpdate({
            target: physical_information.id,
            set: {
              height: patientPhysicalInfo.height,
              weight: patientPhysicalInfo.weight,
              blood_type: patientPhysicalInfo.blood_type,
              body_mass_index: patientPhysicalInfo.body_mass_index,
              updated_at: patientPhysicalInfo.updated_at,
            },
          });
      }

      if (patientAllergies) {
        await tx.delete(allergy).where(eq(allergy.patient_id, primitives.id));
        for (const item of patientAllergies) {
          await tx.insert(allergy).values(item);
        }
      }
    });
  }

  async find(id: PatientId): Promise<Patient | null> {
    const item = await database.query.patient.findFirst({
      where: eq(patient.id, id.value),
      with: {
        contact_info: true,
        vitals: {
          orderBy: [desc(vitals.created_at)],
          limit: 10,
        },
        physical_information: true,
        allergies: true,
      },
    });

    if (!item) {
      return null;
    }

    return Patient.fromPrimitives({
      ...item,
      user_id: item.user_id ?? "",
      gender: item.gender as PatientGenderValues,
      contact_info: item.contact_info.map((contact) => ({
        ...contact,
        phone: contact.phone ?? undefined,
        address: contact.address ?? undefined,
      })),
      vitals: item.vitals.map((v) => ({
        ...v,
        blood_pressure: v.blood_pressure ?? 0,
        heart_rate: v.heart_rate ?? 0,
        respiratory_rate: v.respiratory_rate ?? 0,
        oxygen_saturation: v.oxygen_saturation ?? 0,
        temperature: v.temperature ?? 0,
      })),
      physical_information: item.physical_information
        ? {
            ...item.physical_information,
            height: item.physical_information.height ?? 0,
            weight: item.physical_information.weight ?? 0,
            body_mass_index: item.physical_information.body_mass_index ?? 0,
            blood_type: item.physical_information.blood_type ?? undefined,
          }
        : undefined,
      allergies: item.allergies.map((a) => ({
        ...a,
        notes: a.notes ?? undefined,
      })),
    });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    const item = await database.query.patient.findFirst({
      where: eq(patient.email, email),
      with: {
        contact_info: true,
        vitals: true,
        physical_information: true,
        allergies: true,
      },
    });

    if (!item) {
      return null;
    }

    return Patient.fromPrimitives({
      ...item,
      user_id: item.user_id ?? "",
      gender: item.gender as PatientGenderValues,
      contact_info: item.contact_info.map((contact) => ({
        ...contact,
        phone: contact.phone ?? undefined,
        address: contact.address ?? undefined,
      })),
      vitals: item.vitals.map((v) => ({
        ...v,
        blood_pressure: v.blood_pressure ?? 0,
        heart_rate: v.heart_rate ?? 0,
        respiratory_rate: v.respiratory_rate ?? 0,
        oxygen_saturation: v.oxygen_saturation ?? 0,
        temperature: v.temperature ?? 0,
      })),
      physical_information: item.physical_information
        ? {
            ...item.physical_information,
            height: item.physical_information.height ?? 0,
            weight: item.physical_information.weight ?? 0,
            body_mass_index: item.physical_information.body_mass_index ?? 0,
            blood_type: item.physical_information.blood_type ?? undefined,
          }
        : undefined,
      allergies: item.allergies.map((a) => ({
        ...a,
        notes: a.notes ?? undefined,
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
      user_id: item.user_id ?? "",
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
        user_id: item.user_id ?? "",
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

