'use client';
import { useSession } from '@/src/modules/auth/components/session-provider';
import { usePrices } from '../../../hooks/use-prices';
import { TypesSkeleton } from './skeleton';
import { DataTable } from './table';

export function TypesTable() {
  const { profile } = useSession();
  const { prices, isLoading } = usePrices(profile?.id ?? '');

  if (isLoading) {
    return <TypesSkeleton />;
  }

  return <DataTable data={prices} doctorId={profile.id} />;
}
