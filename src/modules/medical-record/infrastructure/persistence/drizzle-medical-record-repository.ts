import { database } from "@/modules/shared/infrastructure/database/client";
import { MedicalRecordId, MedicalRecord } from "../../domain/medical-record";
import { MedicalRecordRepository, MedicalRecordSearchCriteria } from "../../domain/medical-record-repository";
import { Primitives } from "@/modules/shared/domain/primitives";
import { medical_record } from "./medical-record.schema";
import { and, count, eq, gte, like, lte, or } from "drizzle-orm";
import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { InfrastructureService } from "@/modules/shared/domain/service.";

@InfrastructureService()
export class DrizzleMedicalRecordRepository extends MedicalRecordRepository {
  private buildCriteria(criteria: MedicalRecordSearchCriteria) {
    return and(
      criteria.patient_id ? eq(medical_record.patient_id, criteria.patient_id) : undefined,
      criteria.doctor_id ? eq(medical_record.doctor_id, criteria.doctor_id) : undefined,
      criteria.type ? eq(medical_record.type, criteria.type) : undefined,
      criteria.date_from ? gte(medical_record.date, criteria.date_from) : undefined,
      criteria.date_to ? lte(medical_record.date, criteria.date_to) : undefined,
      criteria.query
        ? or(like(medical_record.title, `%${criteria.query}%`), like(medical_record.description, `%${criteria.query}%`))
        : undefined,
    );
  }
  async get(id: MedicalRecordId): Promise<MedicalRecord | null> {
    const item = await database.query.medical_record.findFirst({
      where: (record, { eq }) => eq(record.id, id.value),
    });
    if (!item) return null;
    return MedicalRecord.fromPrimitives(item as Primitives<MedicalRecord>);
  }

  async search(criteria: MedicalRecordSearchCriteria): Promise<PaginatedResult<MedicalRecord>> {
    const whereClause = this.buildCriteria(criteria);

    const [items, total] = await Promise.all([
      database.query.medical_record.findMany({
        where: whereClause,
      }),
      database
        .select({ count: count(medical_record.id) })
        .from(medical_record)
        .where(this.buildCriteria(criteria)),
    ]);
    return {
      data: items.map((item) => MedicalRecord.fromPrimitives(item as Primitives<MedicalRecord>)),
      pagination: buildPagination(total[0].count, criteria.page || 1, criteria.pageSize || 10),
    };
  }

  async create(record: MedicalRecord): Promise<void> {
    await database.insert(medical_record).values(record.toPrimitives());
  }

  async update(record: MedicalRecord): Promise<void> {
    await database.update(medical_record).set(record.toPrimitives()).where(eq(medical_record.id, record.id.value));
  }

  async delete(id: MedicalRecordId): Promise<void> {
    await database.delete(medical_record).where(eq(medical_record.id, id.value));
  }
}

