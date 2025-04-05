import { database } from '@helsa/database';
import { RemovePrice } from '@helsa/engine/doctor/application/services/remove-appointment-type';
import { PrismaDoctorRepository } from '@helsa/engine/doctor/infrastructure/persistence/prisma-doctor-repository';
import { NextResponse } from 'next/server';
import { withUser } from '../../../../withUser';

export const DELETE = withUser(async ({ params }) => {
  const { id, priceId } = params;
  const service = new RemovePrice(new PrismaDoctorRepository(database));
  await service.run(id, priceId);

  return NextResponse.json({ message: 'Price removed successfully' }, { status: 200 });
});
