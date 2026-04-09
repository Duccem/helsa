import { buildPagination, PaginatedResult } from "@/modules/shared/domain/query";
import { database } from "@/modules/shared/infrastructure/database/client";
import { and, count, eq, ilike, or } from "drizzle-orm";
import {
  Diagnosis,
  DiagnosisCertaintyValues,
  DiagnosisId,
  DiagnosisIncomeValues,
  DiagnosisStateValues,
  DiagnosisTypeValues,
} from "../../domain/diagnosis";
import { DiagnosisRepository, DiagnosisSearchCriteria } from "../../domain/diagnosis-repository";
import { Pathology } from "../../domain/pathology";
import { diagnosis } from "./diagnosis.schema";

export class DrizzleDiagnosisRepository extends DiagnosisRepository {
  async save(data: Diagnosis): Promise<void> {
    const primitives = data.toPrimitives();

    await database.insert(diagnosis).values(primitives).onConflictDoUpdate({
      target: diagnosis.id,
      set: primitives,
    });
  }

  async find(id: DiagnosisId): Promise<Diagnosis | null> {
    const item = await database.query.diagnosis.findFirst({
      where: eq(diagnosis.id, id.value),
    });

    if (!item) {
      return null;
    }

    return Diagnosis.fromPrimitives({
      ...item,
      type: item.type as DiagnosisTypeValues,
      certainty: item.certainty as DiagnosisCertaintyValues,
      state: item.state as DiagnosisStateValues,
      income: item.income as DiagnosisIncomeValues,
    });
  }

  async search(criteria: DiagnosisSearchCriteria): Promise<PaginatedResult<Diagnosis>> {
    const query = and(
      criteria.patient_id ? eq(diagnosis.patient_id, criteria.patient_id) : undefined,
      criteria.cie_code ? ilike(diagnosis.cie_code, `%${criteria.cie_code}%`) : undefined,
      criteria.certainty ? eq(diagnosis.certainty, criteria.certainty) : undefined,
      criteria.state ? eq(diagnosis.state, criteria.state) : undefined,
      criteria.income ? eq(diagnosis.income, criteria.income) : undefined,
      criteria.query
        ? or(ilike(diagnosis.summary, `%${criteria.query}%`), ilike(diagnosis.cie_code, `%${criteria.query}%`))
        : undefined,
    );

    const [items, total] = await Promise.all([
      database.query.diagnosis.findMany({
        where: query,
        limit: criteria.pageSize,
        offset: (criteria.page - 1) * criteria.pageSize,
      }),
      database
        .select({ count: count(diagnosis.id) })
        .from(diagnosis)
        .where(query),
    ]);

    const data = items.map((item) =>
      Diagnosis.fromPrimitives({
        ...item,
        type: item.type as DiagnosisTypeValues,
        certainty: item.certainty as DiagnosisCertaintyValues,
        state: item.state as DiagnosisStateValues,
        income: item.income as DiagnosisIncomeValues,
      }),
    );

    const pagination = buildPagination(total[0].count, criteria.page, criteria.pageSize);

    return {
      data,
      pagination,
    };
  }

  async listPathologies(query?: string): Promise<Pathology[]> {
    const criteria = query
      ? or(ilike(diagnosis.summary, `%${query}%`), ilike(diagnosis.cie_code, `%${query}%`))
      : undefined;

    const items = await database
      .selectDistinct({
        cie_code: diagnosis.cie_code,
        summary: diagnosis.summary,
      })
      .from(diagnosis)
      .where(criteria)
      .orderBy(diagnosis.summary);

    return items.map((item) => Pathology.fromPrimitives(item));
  }
}

