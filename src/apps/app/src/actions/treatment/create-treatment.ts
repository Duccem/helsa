'use server';

import { authActionClient } from '@helsa/actions';
import { database } from '@helsa/database';
import { Primitives } from '@helsa/ddd/types/primitives';
import { CreateTreatment } from '@helsa/engine/treatment/application/create-treatment';
import { Treatment } from '@helsa/engine/treatment/domain/treatment';
import { PrismaTreatmentRepository } from '@helsa/engine/treatment/infrastructure/prisma-treatment-repository';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.string(),
  status: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  patientId: z.string(),
  doctorId: z.string(),
  appointmentId: z.string(),
  medication: z
    .object({
      name: z.string(),
      dose: z.string(),
      frequency: z.string(),
      presentation: z.string(),
    })
    .optional(),
  therapy: z
    .object({
      description: z.string(),
    })
    .optional(),
  procedure: z
    .object({
      description: z.string(),
    })
    .optional(),
});

export const createTreatment = authActionClient
  .schema(schema)
  .metadata({
    actionName: 'create-treatment',
  })
  .action(async ({ parsedInput }) => {
    const service = new CreateTreatment(new PrismaTreatmentRepository(database));

    await service.run(parsedInput as unknown as Primitives<Treatment>);
    revalidatePath(`/appointments/${parsedInput.appointmentId}`);
  });
