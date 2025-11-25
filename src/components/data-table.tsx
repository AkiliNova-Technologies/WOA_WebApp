import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  Loader2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Base type for table data
export interface TableData {
  id: string | number;
  [key: string]: unknown;
}

// Field configuration type
export interface TableField<TData extends TableData> {
  key: keyof TData;
  header: string;
  cell?: (value: TData[keyof TData], row: TData) => React.ReactNode;
  enableHiding?: boolean;
  enableSorting?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// Action configuration type
export interface TableAction<TData extends TableData> {
  type: "view" | "edit" | "delete" | "custom";
  label?: string;
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  disabled?: (row: TData) => boolean;
}

// Props for the dynamic table
interface DataTableProps<TData extends TableData> {
  title?: string;
  description?: string;
  data: TData[];
  fields: TableField<TData>[];
  actions?: TableAction<TData>[];
  loading?: boolean;
  enableSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void; // Add this
}

// Default action icons
const defaultIcons = {
  view: <EyeIcon className="size-4" />,
  edit: <EditIcon className="size-4" />,
  delete: <TrashIcon className="size-4" />,
} as const;

// Default cell renderers with proper typing
const defaultCellRenderers = {
  string: (value: string) => <span>{value}</span>,
  number: (value: number) => <span>{value.toLocaleString()}</span>,
  boolean: (value: boolean) => (
    <Badge variant={value ? "default" : "secondary"}>
      {value ? "Yes" : "No"}
    </Badge>
  ),
  date: (value: string | Date) => (
    <span>{new Date(value).toLocaleDateString()}</span>
  ),
} as const;

// Helper function to determine value type and render appropriately
const renderValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (typeof value === "string") {
    // Check if it's a date string
    if (!isNaN(Date.parse(value))) {
      return defaultCellRenderers.date(value);
    }
    return defaultCellRenderers.string(value);
  }

  if (typeof value === "number") {
    return defaultCellRenderers.number(value);
  }

  if (typeof value === "boolean") {
    return defaultCellRenderers.boolean(value);
  }

  if (value instanceof Date) {
    return defaultCellRenderers.date(value);
  }

  // Fallback for other types
  return <span>{String(value)}</span>;
};

function DataTable<TData extends TableData>({
  title,
  description,
  data,
  fields,
  actions = [],
  loading = false,
  enableSelection = true,
  enablePagination = true,
  pageSize = 10,
  onRowClick,
  onSelectionChange, // Add this
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  // Generate columns dynamically based on fields
  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    const baseColumns: ColumnDef<TData>[] = [];

    // Selection column
    if (enableSelection) {
      baseColumns.push({
        id: "select",
        header: ({}) => (
          <div className="flex items-center justify-center">
            {/* <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            /> */}
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="mr-2"

            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Data columns
    fields.forEach((field) => {
      baseColumns.push({
        accessorKey: field.key as string,
        header: field.header,
        cell: ({ row }) => {
          const value = row.original[field.key];

          if (field.cell) {
            return field.cell(value, row.original);
          }

          return (
            <div className={`text-${field.align || "left"}`}>
              {renderValue(value)}
            </div>
          );
        },
        enableHiding: field.enableHiding ?? true,
        enableSorting: field.enableSorting ?? true,
      });
    });

    // Actions column
    if (actions.length > 0) {
      baseColumns.push({
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 justify-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={() => action.onClick(row.original)}
                title={action.label || action.type}
                className="size-8 hover:bg-muted text-[#8C8C8C]"
                disabled={
                  action.disabled ? action.disabled(row.original) : false
                }
              >
                {action.icon ||
                  defaultIcons[action.type as keyof typeof defaultIcons] || (
                    <MoreVerticalIcon className="size-4" />
                  )}
              </Button>
            ))}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return baseColumns;
  }, [fields, actions, enableSelection]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: enablePagination ? pagination : undefined,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Add selection change handler
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className=" flex-col items-start">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto ">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                    }
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {enablePagination && !loading && (
          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { DataTable };