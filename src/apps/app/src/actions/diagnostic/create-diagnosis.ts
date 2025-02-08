'use server';
import { authActionClient } from '@helsa/actions';
import { database } from '@helsa/database';
import { CreateDiagnosis } from '@helsa/engine/diagnostic/application/create-diagnosis';
import { PrismaDiagnosisRepository } from '@helsa/engine/diagnostic/infrastructure/prisma-diagnosis-repository';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  appointmentId: z.string(),
  pathologyId: z.string(),
});

export const createDiagnosis = authActionClient
  .schema(schema)
  .metadata({ actionName: 'create-diagnosis' })
  .action(async ({ parsedInput }) => {
    const service = new CreateDiagnosis(new PrismaDiagnosisRepository(database));
    await service.run(parsedInput);
    revalidatePath(`/appointments/${parsedInput.appointmentId}`);
  });
