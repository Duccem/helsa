import { database } from '@helsa/database';
import { Operator } from '@helsa/ddd/core/criteria';
import { CreateDiagnosis } from '@helsa/engine/diagnostic/application/create-diagnosis';
import { GetDiagnoses } from '@helsa/engine/diagnostic/application/get-diagnoses';
import { PrismaDiagnosisRepository } from '@helsa/engine/diagnostic/infrastructure/prisma-diagnosis-repository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '../route-handler';

const schema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  appointmentId: z.string(),
  pathologyId: z.string(),
});

export const POST = routeHandler(async ({ req, user }) => {
  const parsedInput = schema.parse(await req.json());

  const service = new CreateDiagnosis(new PrismaDiagnosisRepository(database));
  await service.run(parsedInput);
  revalidateTag(`get-diagnoses-patientId-${user.id}`);
  revalidateTag(`get-diagnoses-appointmentId-${user.id}`);
  revalidatePath(`/appointments/${parsedInput.appointmentId}`);

  return NextResponse.json({ message: 'Diagnosis created successfully' }, { status: 201 });
});

const getSchema = z.object({
  id: z.string(),
  field: z.enum(['patientId', 'doctorId', 'appointmentId']),
});

export const GET = routeHandler(async ({ searchParams, user }) => {
  const parsedInput = getSchema.parse(searchParams);
  const criteria = { field: parsedInput.field, operator: Operator.EQUAL, value: parsedInput.id };
  const service = new GetDiagnoses(new PrismaDiagnosisRepository(database));

  // const diagnoses = await cache(() => service.run([criteria]), ['get-diagnoses', parsedInput.field, parsedInput.id], {
  //   tags: [`get-diagnoses-${parsedInput.field}-${user.id}`],
  //   revalidate: 3600,
  // })();
  const diagnoses = await service.run([criteria]);
  return NextResponse.json({ data: diagnoses }, { status: 200 });
});
