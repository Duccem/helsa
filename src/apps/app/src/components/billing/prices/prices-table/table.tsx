'use client';
import { deleteDoctorPrice } from '@helsa/engine/doctor/infrastructure/http/http-doctor-api';
import { Dialog } from '@helsa/ui/components/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@helsa/ui/components/table';
import { cn } from '@helsa/ui/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import CreatePriceModal from '../forms/create-price-modal';
import { type Prices, columns } from './columns';
import { Header } from './header';

type Props = {
  data: Prices[];
  doctorId: string;
};

export function DataTable({ data, doctorId }: Props) {
  const [isOpen, onOpenChange] = React.useState(false);
  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: async (id: string) => deleteDoctorPrice(doctorId, id),
    onSuccess: () => {
      toast.success('Price removed successfully');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove price: ${error.message}`);
    },
  });

  const table = useReactTable({
    data,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      remove: mutate,
      doctorId,
    },
  });

  return (
    <div className="w-full">
      <Header onOpenChange={onOpenChange} table={table} />

      <Table className="border">
        <TableHeader className="">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="border">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow className="hover:bg-transparent" key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell, index) => (
                <TableCell key={cell.id} className={cn('border', index === 2 && 'w-[50px]')}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <CreatePriceModal onOpenChange={onOpenChange} isOpen={isOpen} doctorId={doctorId} />
      </Dialog>
    </div>
  );
}
