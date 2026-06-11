"use client";

import { type ReactNode, useMemo, useState } from "react";
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
import { ArrowUpDown, Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalForm } from "@/components/ui/modal-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
};

export type CrudColumn = {
  key: string;
  label: string;
};

type AdminCrudTableProps = {
  title: string;
  description: string;
  module: string;
  rows: Record<string, unknown>[];
  columns: CrudColumn[];
  idColumn: string;
  badgeKey?: string;
  fields: CrudField[];
  updateFields: CrudField[];
  options: Record<string, { value: string; label: string }[]>;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createAction: (formData: FormData) => void;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString("en-KE");
  if (typeof value === "number") return value.toLocaleString("en-KE");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function FieldInput({
  field,
  options,
  defaultValue,
}: {
  field: CrudField;
  options: Record<string, { value: string; label: string }[]>;
  defaultValue?: unknown;
}) {
  const value = defaultValue === null || defaultValue === undefined ? "" : String(defaultValue);

  return (
    <label className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-start">
      <span className="pt-2 text-[10px] font-black uppercase tracking-widest text-dark/50">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={value}
          rows={3}
          className="portal-field"
        />
      ) : field.type === "select" ? (
        <select name={field.name} required={field.required} defaultValue={value} className="portal-field">
          <option value="">Select {field.label}</option>
          {(options[field.name] ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          required={field.required}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          defaultValue={value}
          className="portal-field"
        />
      )}
    </label>
  );
}

function FormBody({
  fields,
  options,
  row,
  action,
  idColumn,
  submitLabel,
}: {
  fields: CrudField[];
  options: Record<string, { value: string; label: string }[]>;
  row?: Record<string, unknown>;
  action: (formData: FormData) => void;
  idColumn: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      {row ? <input type="hidden" name="id" value={String(row[idColumn])} /> : null}
      {fields.map((field) => (
        <FieldInput key={field.name} field={field} options={options} defaultValue={row?.[field.name]} />
      ))}
      <div className="flex justify-end border-t border-[hsl(var(--border))] pt-4">
        <Button type="submit">
          <Save size={16} />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function AdminCrudTable({
  title,
  description,
  module,
  rows,
  columns: visibleColumns,
  idColumn,
  badgeKey,
  fields,
  updateFields,
  options,
  canCreate,
  canUpdate,
  canDelete,
  createAction,
  updateAction,
  deleteAction,
}: AdminCrudTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    const dataColumns = visibleColumns.map<ColumnDef<Record<string, unknown>>>((column) => ({
      accessorKey: column.key,
      header: ({ column: tableColumn }) => (
        <button
          type="button"
          onClick={() => tableColumn.toggleSorting(tableColumn.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1"
        >
          {column.label}
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => {
        const rawValue = row.original[column.key];
        return column.key === badgeKey ? (
          <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            {valueText(rawValue)}
          </span>
        ) : (
          <span className="line-clamp-2">{valueText(rawValue)}</span>
        );
      },
    }));

    return [
      ...dataColumns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              {module === "students" ? (
                <a
                  href={`/portal/admin/students/${String(item[idColumn])}`}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-black uppercase tracking-widest text-white hover:bg-dark"
                >
                  <Eye size={14} />
                  Dashboard
                </a>
              ) : null}
              {canUpdate && updateFields.length > 0 ? (
                <ModalForm
                  title={`Edit ${title}`}
                  description={`Update ${valueText(item[visibleColumns[0]?.key])}.`}
                  trigger={
                    <span className="inline-flex h-8 items-center rounded-md bg-dark px-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary">
                      Edit
                    </span>
                  }
                >
                  <FormBody
                    fields={updateFields}
                    options={options}
                    row={item}
                    action={updateAction}
                    idColumn={idColumn}
                    submitLabel="Update"
                  />
                </ModalForm>
              ) : null}
              {canDelete ? (
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={String(item[idColumn])} />
                  <Button type="submit" variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-white">
                    <Trash2 size={14} />
                    Remove
                  </Button>
                </form>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [badgeKey, canDelete, canUpdate, deleteAction, idColumn, module, options, title, updateAction, updateFields, visibleColumns]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="portal-page space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="text-2xl font-bold text-dark md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-dark/60">{description}</p>
        </div>
        <a href="/portal/admin" className="text-sm font-black uppercase tracking-widest text-primary">
          Back to Dashboard
        </a>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder={`Filter ${title.toLowerCase()}...`}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        {canCreate && fields.length > 0 ? (
          <ModalForm
            title={`Create ${title}`}
            description={description}
            widthClassName="max-w-3xl"
            trigger={
              <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-dark">
                <Plus size={16} />
                Create
              </span>
            }
          >
            <FormBody fields={fields} options={options} action={createAction} idColumn={idColumn} submitLabel="Save" />
          </ModalForm>
        ) : null}
      </div>

      <section className="portal-table-wrap">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center text-dark/50">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 text-sm text-dark/60">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
