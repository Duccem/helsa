import { Criteria } from '@helsa/ddd/core/criteria';
import { Treatment } from './treatment';

export interface TreatmentRepository {
  save(treatment: Treatment): Promise<void>;
  search(criteria: Criteria): Promise<Treatment[]>;
  find(criteria: Criteria): Promise<Treatment | null>;
}
