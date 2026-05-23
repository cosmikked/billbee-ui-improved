import { type ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T, index: number) => ReactNode
  /** CSS width — e.g. "120px" or "20%" */
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  /** Rendered when rows is empty */
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-[14px]">

        <thead>
          <tr className="border-b border-border">
            {columns.map(col => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={[
                  'px-3 py-[10px] bg-bg',
                  'text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 whitespace-nowrap',
                  col.align === 'right'  ? 'text-right'  :
                  col.align === 'center' ? 'text-center' : 'text-left',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-12 text-center text-ink-3 text-[13.5px]"
              >
                {emptyState ?? 'No records yet'}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={getRowKey(row, idx)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  'border-b border-border-subtle',
                  onRowClick ? 'cursor-pointer hover:bg-surface-2 transition-ui' : '',
                ].join(' ')}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}
                    className={[
                      'px-3 text-ink-2',
                      col.align === 'right'  ? 'text-right'  :
                      col.align === 'center' ? 'text-center' : 'text-left',
                    ].join(' ')}
                  >
                    {col.cell(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  )
}
