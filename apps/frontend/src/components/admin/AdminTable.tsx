'use client';

import { ReactNode } from 'react';

export function AdminTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="luxury-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory-50 text-[11px] uppercase tracking-widest text-charcoal-400">
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-charcoal-100 hover:bg-ivory-50/50">
                {row.map((c, j) => (
                  <td key={j} className="px-4 py-3 align-middle">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ title, cta }: { title: string; cta?: ReactNode }) {
  return (
    <div className="text-center py-16">
      <p className="font-serif text-2xl">{title}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
