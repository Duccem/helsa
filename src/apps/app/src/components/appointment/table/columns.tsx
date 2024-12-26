'use client';
import { Primitives } from '@helsa/ddd/types/primitives';
import { Appointment } from '@helsa/engine/appointment/domain/appointment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@helsa/ui/components/alert-dialog';
import { Button } from '@helsa/ui/components/button';
import { Checkbox } from '@helsa/ui/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@helsa/ui/components/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { stateLabel } from '../constants';

export const columns: ColumnDef<Primitives<Appointment>>[] = [
  {
    id: 'select',
    cell: ({ row }) => (
      <Checkbox
        className="rounded-none"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: 'Fecha',
    cell: ({ row }) => formatDate(row.original.date, 'PPp', { locale: es }),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StateColumn state={row.original.status} />,
  },
  {
    accessorKey: 'doctor',
    header: 'Doctor',
    cell: ({ row }) => row.original.doctor?.user?.name,
  },
  {
    accessorKey: 'specialty',
    header: 'Especialidad',
    cell: ({ row }) => row.original.doctor?.specialty?.name,
  },
  {
    accessorKey: 'type',
    header: 'Tipo de consulta',
    cell: ({ row }) => <TypeColumn name={row.original.type?.name || ''} color={row.original.type?.color || ''} />,
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => {
      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none">
              <DropdownMenuItem
                onClick={() => (table.options.meta as any).setOpen(row.original.id)}
                className="rounded-none"
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original?.status === 'SCHEDULED' && (
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive rounded-none">Cancelar</DropdownMenuItem>
                </AlertDialogTrigger>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent className="sm:rounded-none">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  console.log('Canceling appointment');
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];

export const StateColumn = ({ state }: { state: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-semibold px-3 py-1 rounded-full border">{stateLabel[state].label}</span>
    </div>
  );
};

const TypeColumn = ({ name, color }: { name: string; color: string }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="size-3" style={{ backgroundColor: color }}></div>
      <span className="text-xs font-semibold px-3 py-1">{name}</span>
    </div>
  );
};
