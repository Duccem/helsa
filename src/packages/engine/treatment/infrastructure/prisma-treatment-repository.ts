import { PrismaClient } from '@helsa/database';
import { PrismaCriteriaConverter } from '@helsa/database/converter';
import { Criteria } from '@helsa/ddd/core/criteria';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Treatment } from '../domain/treatment';
import { TreatmentRepository } from '../domain/treatment-repository';

export class PrismaTreatmentRepository implements TreatmentRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private readonly prisma: PrismaClient) {}
  get model() {
    return this.prisma.treatment;
  }
  async save(treatment: Treatment): Promise<void> {
    const { medication, therapy, procedure, ...data } = treatment.toPrimitives();
    await this.model.create({
      data: {
        ...data,
        ...(data.type === 'MEDICATION' ? { medication: { create: medication } } : {}),
        ...(data.type === 'THERAPY' ? { therapy: { create: therapy } } : {}),
        ...(data.type === 'PROCEDURE' ? { procedure: { create: procedure } } : {}),
      },
    });
  }
  async search(criteria: Criteria): Promise<Treatment[]> {
    const { where, include, orderBy, skip, take } = this.converter.criteria(criteria);
    const treatments = await this.model.findMany({ where, include, orderBy, skip, take });
    return treatments.map((treatment) => Treatment.fromPrimitives(treatment as Primitives<Treatment>));
  }
  async find(criteria: Criteria): Promise<Treatment | null> {
    const { where, include } = this.converter.criteria(criteria);
    const treatment = await this.model.findFirst({ where, include });
    return treatment ? Treatment.fromPrimitives(treatment as Primitives<Treatment>) : null;
  }
}
