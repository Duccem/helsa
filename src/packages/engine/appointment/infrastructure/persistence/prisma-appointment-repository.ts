import { PrismaClient } from '@helsa/database';
import { PrismaCriteriaConverter } from '@helsa/database/converter';
import { Collection } from '@helsa/ddd/core/collection.';
import { Criteria } from '@helsa/ddd/core/criteria';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '../../domain/appointment';
import { AppointmentRepository } from '../../domain/appointment-repository';
import { AppointmentType } from '../../domain/appointment-type';
import { AppointmentNote } from '../../domain/note';
import { Symptom } from '../../domain/symptom';
import { AppointmentTelemetry } from '../../domain/telemetry';

export class PrismaAppointmentRepository implements AppointmentRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private client: PrismaClient) {}

  get model() {
    return this.client.appointment;
  }

  async search(criteria: Criteria): Promise<Collection<Appointment>> {
    const { orderBy, skip, take, where } = this.converter.criteria(criteria);
    const include = {
      room: true,
      rating: true,
      telemetry: true,
      recipes: true,
      notes: true,
      type: true,
      symptoms: true,
      doctor: {
        include: {
          user: true,
          specialty: true,
        },
      },
      patient: {
        include: {
          user: true,
          allergies: true,
          diseases: true,
          contacts: true,
          vaccines: true,
          surgeries: true,
        },
      },
    };

    const [data, count] = await this.client.$transaction([
      this.client.appointment.findMany({
        where,
        orderBy,
        skip,
        take,
        include,
      }),
      this.client.appointment.count({ where }),
    ]);
    const appointments = data.map((appointment) =>
      Appointment.fromPrimitives(appointment as unknown as Primitives<Appointment>)
    );
    return Collection.fromResponse({
      data: appointments,
      total: count,
      skip: skip || 0,
      take: take || 10,
    });
  }

  async save(appointment: Appointment, symptomsOfThePatient?: string[]): Promise<void> {
    const {
      notes,
      treatments,
      diagnostics,
      symptoms,
      rating,
      recipe,
      room,
      telemetry,
      doctor,
      type,
      patient,
      price,
      documents,
      ...data
    } = appointment.toPrimitives();
    await this.model.upsert({
      where: { id: data.id },
      update: data,
      create: { ...data, symptoms: { connect: symptomsOfThePatient?.map((s) => ({ id: s })) } },
    });
  }

  async get(id: string, include?: any): Promise<Appointment | null> {
    const includeAll = {
      room: true,
      rating: true,
      telemetry: true,
      recipes: true,
      notes: true,
      type: true,
      symptoms: true,
      diagnostics: true,
      treatments: {
        include: {
          medication: true,
          therapy: true,
          procedure: true,
        },
      },
      doctor: {
        include: {
          user: true,
          specialty: true,
        },
      },
      patient: {
        include: {
          user: true,
          allergies: true,
          diseases: true,
          contacts: true,
          vaccines: true,
          surgeries: true,
        },
      },
      documents: true,
    };
    const appointment = await this.model.findUnique({
      where: { id },
      include: include || includeAll,
    });
    if (!appointment) {
      return null;
    }
    return Appointment.fromPrimitives(appointment as unknown as Primitives<Appointment>);
  }

  async getTypes(): Promise<AppointmentType[]> {
    const types = await this.client.appointmentType.findMany();
    return types.map((type) => AppointmentType.fromPrimitives(type as unknown as Primitives<AppointmentType>));
  }

  async getSymptoms(): Promise<Symptom[]> {
    const symptoms = await this.client.symptom.findMany();
    return symptoms.map((symptom) => Symptom.fromPrimitives(symptom));
  }

  async saveNotes(note: AppointmentNote): Promise<void> {
    const { appointmentId, date, description, id } = note.toPrimitives();

    await this.model.update({
      where: { id: appointmentId },
      data: {
        notes: {
          create: {
            id,
            date,
            description,
          },
        },
      },
    });
  }

  async saveTelemetry(telemetry: AppointmentTelemetry, appointmentId: string): Promise<void> {
    await this.client.appointmentTelemetry.upsert({
      where: { id: telemetry.id.toString(), appointmentId },
      create: {
        id: telemetry.id.toString(),
        weight: telemetry.weight.value,
        temperature: telemetry.temperature.value,
        bloodPressure: telemetry.bloodPressure.value,
        heartRate: telemetry.heartRate.value,
        respiratoryRate: telemetry.respiratoryRate.value,
        oxygenSaturation: telemetry.oxygenSaturation.value,
        appointmentId: appointmentId,
      },
      update: {
        weight: telemetry.weight.value,
        temperature: telemetry.temperature.value,
        bloodPressure: telemetry.bloodPressure.value,
        heartRate: telemetry.heartRate.value,
        respiratoryRate: telemetry.respiratoryRate.value,
        oxygenSaturation: telemetry.oxygenSaturation.value,
      },
    });
  }
}
