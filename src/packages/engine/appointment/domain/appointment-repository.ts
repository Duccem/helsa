import { Collection } from '@helsa/ddd/core/collection.';
import { Criteria } from '@helsa/ddd/core/criteria';
import { AppointmentType } from '../domain/appointment-type';
import { Appointment } from './appointment';
import { Symptom } from './symptom';

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  search(criteria: Criteria): Promise<Collection<Appointment>>;
  get(id: string): Promise<Appointment | null>;
  getTypes(): Promise<AppointmentType[]>;
  getSymptoms(): Promise<Symptom[]>;
}
