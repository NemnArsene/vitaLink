import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { EmptyState } from "./Feedback";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  toolbar?: React.ReactNode;
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data, columns, searchable = true, searchPlaceholder = "Rechercher...",
  pageSize = 10, emptyTitle = "Aucun résultat", emptyDescription = "Aucune donnée à afficher.",
  emptyIcon, toolbar, rowKey, onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let list = data;
    if (search) {
      const q = search.toLowerCase();
      list = data.filter(row =>
        columns.some(c => {
          const v = (row as any)[c.key];
          return v && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      list = [...list].sort((a: any, b: any) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        return (av > bv ? 1 : -1) * (sortDir === "asc" ? 1 : -1);
      });
    }
    return list;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="card overflow-hidden">
      {(searchable || toolbar) && (
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[var(--border)]">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-subtle)" }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder={searchPlaceholder}
                className="input pl-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--surface-2)]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={{ width: c.width }}>
                  {c.sortable ? (
                    <button onClick={() => handleSort(c.key)} className="inline-flex items-center gap-1 hover:text-[var(--text)]">
                      {c.label}
                      {sortKey === c.key && <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => {
                const key = rowKey ? rowKey(row) : String(idx);
                return (
                  <tr key={key} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn(onRowClick && "cursor-pointer")}>
                    {columns.map(c => (
                      <td key={c.key}>{c.render ? c.render(row) : (row as any)[c.key]}</td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] text-sm">
          <span style={{ color: "var(--text-muted)" }}>
            {safePage * pageSize + 1}-{Math.min((safePage + 1) * pageSize, filtered.length)} sur {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="btn btn-ghost h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3">Page {safePage + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1} className="btn btn-ghost h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}