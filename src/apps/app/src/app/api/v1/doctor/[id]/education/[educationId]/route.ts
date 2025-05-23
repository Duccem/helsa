import { database } from '@helsa/database';
import { RemoveEducation } from '@helsa/engine/doctor/application/services/remove-education';
import { PrismaDoctorRepository } from '@helsa/engine/doctor/infrastructure/persistence/prisma-doctor-repository';
import { NextResponse } from 'next/server';
import { routeHandler } from '../../../../route-handler';

export const DELETE = routeHandler(async ({ params }) => {
  const { id, educationId } = params;

  const service = new RemoveEducation(new PrismaDoctorRepository(database));
  await service.run(id, educationId);

  return NextResponse.json(
    {
      message: 'Education removed successfully',
    },
    { status: 200 },
  );
});
