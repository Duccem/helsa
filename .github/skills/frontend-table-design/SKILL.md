---
name: frontend-table-design
description: Design and implement frontend tables following the conventions of the codebase and the framework
---

- Use @tanstack/react-table to create tables that follow the design and functionality requirements of the project.
- Use the components from `@/modules/shared/presentation/components/ui/server-table` to ensure consistency in the design and behavior of tables across the application.
- For a new table create the columns definition and use it on the corresponding component, for example:

```tsx
"use client";
import { useState } from "react";
import { ColumnDef, getCoreRowModel, useReactTable, RowSelectionState, VisibilityState } from "@tanstack/react-table";
import { Button } from "@/modules/shared/presentation/components/ui/button";
import {
  SelectableCell,
  SelectableHeader,
  ServerPagination,
  ServerTable,
  SortableHeader,
  TableVisibility,
} from "@/modules/shared/presentation/components/ui/server-table";
import { Eye, Pencil, Trash } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
};

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    cell: ({ row }) => <SelectableCell row={row} />,
    header: ({ table }) => <SelectableHeader table={table} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ table }) => (
      <SortableHeader table={table} name="name">
        <span>Name</span>
      </SortableHeader>
    ),
    cell: ({ row }) => <span className="pl-2">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: ({ table }) => (
      <SortableHeader table={table} name="email">
        <span>Email</span>
      </SortableHeader>
    ),
    cell: ({ row }) => <span className="pl-2">{row.getValue("email")}</span>,
  },
  {
    id: "actions",
    header: () => <span>Actions</span>,
    cell: ({}) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon"}>
            <Pencil className="text-blue-500" />
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <Trash className="text-red-500" />
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <Eye className="text-emerald-500" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

type UsersTableProps = {
  items: User[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    pageSize: number;
    nextPage: number | null;
    prevPage: number | null;
  };
};

export const UsersTable = ({ items, pagination }: UsersTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    getRowId: (row) => row.id,
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    enableHiding: true,
    initialState: {
      rowSelection,
      columnVisibility,
    },
    state: {
      rowSelection,
      columnVisibility,
    },
  });

  return (
    <div className="w-full flex flex-col gap-4 mb-8">
      <div className="w-full flex items-center justify-between">
        <div>
          <TableVisibility table={table} />
        </div>
      </div>
      <div>
        <ServerTable columns={columns} table={table} />
        <ServerPagination meta={pagination} />
      </div>
    </div>
  );
};
```

