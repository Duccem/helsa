'use server';
import { authActionClient } from '@helsa/actions';
import { database } from '@helsa/database';
import { EnterRoom } from '@helsa/engine/appointment/application/enter-room';
import { PrismaAppointmentRepository } from '@helsa/engine/appointment/infrastructure/persistence/prisma-appointment-repository';
import { TriggerEventBus } from '@helsa/tasks';
import { z } from 'zod';

const schema = z.object({
  appointmentId: z.string(),
});

export const enterRoom = authActionClient
  .metadata({
    actionName: 'enter-room',
  })
  .schema(schema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const service = new EnterRoom(new PrismaAppointmentRepository(database), new TriggerEventBus());
    await service.run(parsedInput.appointmentId, user.role as 'PATIENT' | 'DOCTOR');
  });
