import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, data, loading, emptyMessage = "Aucun résultat", onRowClick, rowKey }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width, textAlign: c.align || "left" }}
                className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400", c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{ textAlign: c.align || "left" }}
                    className={cn("whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300", c.className)}
                  >
                    {c.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}