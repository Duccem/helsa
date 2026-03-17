"use client";
import { Primitives } from "@/modules/shared/domain/primitives";
import {
  Appointment,
  AppointmentModeValues,
  AppointmentStatusValues,
  AppointmentTypeValues,
} from "../../domain/appointment";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  ServerPagination,
  ServerTable,
  SortableHeader,
} from "@/modules/shared/presentation/components/ui/server-table";
import { format } from "date-fns";
import { Badge } from "@/modules/shared/presentation/components/ui/badge";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import Link from "next/link";
import { Pagination } from "@/modules/shared/domain/query";
import { Card, CardContent, CardFooter } from "@/modules/shared/presentation/components/ui/card";

function toStatusLabel(status: AppointmentStatusValues) {
  return status.toLowerCase().replaceAll("_", " ");
}

function toTypeLabel(type: AppointmentTypeValues) {
  return type === "INITIAL" ? "Initial" : "Therapy";
}

function toModeLabel(mode: AppointmentModeValues) {
  return mode === "ONLINE" ? "Online" : "In person";
}

function toStatusVariant(status: AppointmentStatusValues): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "FINISHED":
      return "default";
    case "CANCELLED":
    case "MISSED_BY_PATIENT":
    case "MISSED_BY_THERAPIST":
      return "destructive";
    case "READY":
    case "STARTED":
    case "PAYED":
      return "secondary";
    default:
      return "outline";
  }
}

const columns: Array<ColumnDef<Primitives<Appointment>>> = [
  {
    accessorKey: "date",
    header: ({ table }) => (
      <SortableHeader table={table} name="date">
        Date
      </SortableHeader>
    ),
    cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy HH:mm"),
  },
  {
    accessorKey: "patient_name",
    header: "Patient",
    cell: ({ row }) => row.original.patient_id,
  },
  {
    accessorKey: "doctor_name",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor_id,
  },
  {
    accessorKey: "status",
    header: ({ table }) => (
      <SortableHeader table={table} name="status">
        Status
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={toStatusVariant(row.original.status)}>{toStatusLabel(row.original.status)}</Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => toTypeLabel(row.original.type),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => toModeLabel(row.original.mode),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/appointments/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          View details
        </Button>
      </Link>
    ),
  },
];

type AppointmentsTableProps = {
  items: Primitives<Appointment>[];
  pagination: Pagination;
};

export const AppointmentsTable = ({ items, pagination }: AppointmentsTableProps) => {
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <Card>
      <CardContent className="pt-4">
        <ServerTable table={table} columns={columns} />
      </CardContent>
      <CardFooter className="border-none">
        <ServerPagination
          meta={{
            page: pagination.page,
            pages: Math.ceil(pagination.total / pagination.pageSize),
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
        />
      </CardFooter>
    </Card>
  );
};

