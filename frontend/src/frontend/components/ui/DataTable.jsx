import { EmptyState } from './primitives';

/**
 * Thin table wrapper so every dashboard list looks identical.
 * columns: [{ key, label, render?(row), align? }]
 */
export default function DataTable({ columns, rows, empty, onRowClick, footer }) {
  if (!rows?.length) {
    return empty || <EmptyState icon="Search" title="Nothing to show" message="No records match the current filters." />;
  }
  return (
    <div className="cb-table-wrap">
      <table className="cb-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.align ? { textAlign: c.align } : undefined}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} style={c.align ? { textAlign: c.align } : undefined}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer ? <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>{footer}</div> : null}
    </div>
  );
}
