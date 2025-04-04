'use server';

import { authActionClient } from '@helsa/actions';
import { database } from '@helsa/database';
import { Operator } from '@helsa/ddd/core/criteria';
import { GetTreatments } from '@helsa/engine/treatment/application/get-treatments';
import { PrismaTreatmentRepository } from '@helsa/engine/treatment/infrastructure/prisma-treatment-repository';
import { unstable_cache as cache } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  appointmentId: z.string(),
});

export const getAppointmentTreatments = authActionClient
  .schema(schema)
  .metadata({
    actionName: 'get-appointment-treatments',
  })
  .action(async ({ parsedInput, ctx: { user } }) => {
    const service = new GetTreatments(new PrismaTreatmentRepository(database));

    return cache(
      () => service.run([{ field: 'appointmentId', operator: Operator.EQUAL, value: parsedInput.appointmentId }]),
      ['get-appointment-treatments', user.id, parsedInput.appointmentId],
      {
        tags: [`get-appointment-treatments-${user.id}-${parsedInput.appointmentId}`],
        revalidate: 3600,
      }
    )();
  });
