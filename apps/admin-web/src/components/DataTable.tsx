import { ReactNode } from 'react';

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Array<Column<T>>;
  data: T[];
  emptyText: string;
};

export function DataTable<T extends Record<string, unknown>>({ columns, data, emptyText }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.key)} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
