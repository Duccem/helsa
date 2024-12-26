'use client';

import { removePrice } from '@/src/actions/doctor/remove-price';
import { Dialog } from '@helsa/ui/components/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@helsa/ui/components/table';
import { cn } from '@helsa/ui/lib/utils';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import CreatePriceModal from '../forms/create-price-modal';
import { type Prices, columns } from './columns';
import { Header } from './header';

type Props = {
  data: Prices[];
  types: any[];
  doctorId: string;
};

export function DataTable({ data, doctorId, types }: Props) {
  const [isOpen, onOpenChange] = React.useState(false);
  const router = useRouter();

  const remove = async (id: string) => {
    await removePrice({ id });
    toast.success('Appointment type removed');
    router.refresh();
  };

  const table = useReactTable({
    data,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      remove,
      doctorId,
      types,
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
        <CreatePriceModal types={types} onOpenChange={onOpenChange} isOpen={isOpen} doctorId={doctorId} />
      </Dialog>
    </div>
  );
}
