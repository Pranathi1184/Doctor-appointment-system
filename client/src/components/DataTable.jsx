import React from "react";

export default function DataTable({ columns, rows, emptyText = "No data found." }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className || ""}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.className || ""}>
                    {typeof c.render === "function" ? c.render(r) : r[c.key]}
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

