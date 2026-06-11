"use client";

import Link from "next/link";
import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type StudentRow = {
  id: string;
  student_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  program: string | null;
  cohort: string | null;
};

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2">
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );
}

const columns: ColumnDef<StudentRow>[] = [
  {
    accessorKey: "student_number",
    header: ({ column }) => (
      <SortHeader label="Student Number" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
    ),
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.student_number}</span>,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <SortHeader label="Student" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-bold">{row.original.full_name}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {row.original.email ?? row.original.phone ?? "-"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => row.original.program ?? "Not assigned",
  },
  {
    accessorKey: "cohort",
    header: "Cohort",
    cell: ({ row }) => row.original.cohort ?? "Not assigned",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortHeader label="Status" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
    ),
    cell: ({ row }) => (
      <span className="inline-flex rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          href={`/portal/admin/students/${row.original.id}`}
          className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white hover:bg-dark"
        >
          <Eye className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </div>
    ),
  },
];

export function StudentTable({ data }: { data: StudentRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = statusFilter === "all"
    ? data
    : data.filter((student) => student.status === statusFilter);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const statuses = Array.from(new Set(data.map((student) => student.status))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search students..."
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="portal-field w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="portal-table-wrap">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.id === "actions" ? "text-right" : ""}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[hsl(var(--muted-foreground))]">
                  No students match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} filtered students
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="px-2 font-bold text-[hsl(var(--foreground))]">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
