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
import { cn } from "@/modules/shared/presentation/lib/utils";

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

function toStatusClassName(status: AppointmentStatusValues): string {
  switch (status) {
    case "FINISHED":
      return "bg-emerald-500/20 text-emerald-500 border-emerald-500/50";
    case "CANCELLED":
    case "MISSED_BY_PATIENT":
    case "MISSED_BY_THERAPIST":
      return "bg-red-500/20 text-red-500 border-red-500/50";
    case "READY":
    case "STARTED":
    case "PAYED":
      return "bg-amber-500/20 text-amber-500 border-amber-500/50";
    case "SCHEDULED":
      return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default:
      return "bg-gray-100 text-gray-800";
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
    cell: ({ row }) => (row.original as any).patient_name,
  },
  {
    accessorKey: "doctor_name",
    header: "Doctor",
    cell: ({ row }) => (row.original as any).doctor_name,
  },
  {
    accessorKey: "status",
    header: ({ table }) => (
      <SortableHeader table={table} name="status">
        Status
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={"outline"} className={toStatusClassName(row.original.status)}>
        {toStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn({
          "bg-blue-500/20 text-blue-500 border-blue-500/50": row.original.mode === "ONLINE",
          "bg-green-500/20 text-green-500 border-green-500/50": row.original.mode === "IN_PERSON",
        })}
      >
        {toModeLabel(row.original.mode)}
      </Badge>
    ),
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

