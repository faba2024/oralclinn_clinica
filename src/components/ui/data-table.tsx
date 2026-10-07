"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  mobileCard?: (row: T) => ReactNode;
  empty?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  caption?: string;
  rowClassName?: (row: T) => string | undefined;
}

/**
 * Tabela com ordenação, paginação e versão em cartões para telas pequenas.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  pageSize = 10,
  mobileCard,
  empty,
  initialSort,
  caption,
  rowClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const getter = column.sortValue;
    return [...rows].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      const result = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "pt-BR");
      return sort.dir === "asc" ? result : -result;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div>
      {mobileCard ? (
        <ul className="divide-y divide-line md:hidden">
          {visible.map((row) => (
            <li key={getRowId(row)}>
              {onRowClick ? (
                <button type="button" onClick={() => onRowClick(row)} className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-ivory">
                  {mobileCard(row)}
                </button>
              ) : (
                <div className="px-4 py-3.5">{mobileCard(row)}</div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={cn("scrollbar-thin overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-line">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "h-10 whitespace-nowrap px-4 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-subtle first:pl-5 last:pr-5",
                    c.align === "right" && "text-right",
                    c.headerClassName,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn("inline-flex items-center gap-1 uppercase transition-colors hover:text-ink", sort?.key === c.key && "text-ink")}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(
                  "border-b border-line/70 transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-ivory focus-visible:bg-ivory focus-visible:outline-none",
                  rowClassName?.(row),
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("h-14 px-4 first:pl-5 last:pr-5", c.align === "right" && "text-right", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12.5px] text-muted sm:px-5">
          <span className="tabular">
            {current * pageSize + 1}–{Math.min(sorted.length, (current + 1) * pageSize)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              className="rounded-lg p-1.5 hover:bg-sand disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 tabular">
              {current + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount - 1}
              className="rounded-lg p-1.5 hover:bg-sand disabled:opacity-30"
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
