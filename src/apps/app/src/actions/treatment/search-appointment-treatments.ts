'use server';

import { authActionClient } from '@helsa/actions';
import { database } from '@helsa/database';
import { GetAppointmentTreatments } from '@helsa/engine/treatment/application/get-appointment-treatments';
import { PrismaTreatmentRepository } from '@helsa/engine/treatment/infrastructure/prisma-treatment-repository';
import { z } from 'zod';

const schema = z.object({
  appointmentId: z.string(),
});

export const createTreatment = authActionClient
  .schema(schema)
  .metadata({
    actionName: 'search-appointment-treatments',
  })
  .action(async ({ parsedInput }) => {
    const service = new GetAppointmentTreatments(new PrismaTreatmentRepository(database));

    return await service.run(parsedInput.appointmentId);
  });
