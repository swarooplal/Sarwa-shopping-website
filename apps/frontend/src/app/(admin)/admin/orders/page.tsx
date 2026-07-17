'use client';

import { useAdminOrders, useUpdateOrder } from '@/hooks/queries';
import { AdminTable } from '@/components/admin/AdminTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@sarwa/shared';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const { data, isLoading } = useAdminOrders({ pageSize: 30 });
  const update = useUpdateOrder();
  const [status, setStatus] = useState<Record<string, string>>({});

  const rows = (data ?? []).map((o: any) => [
    <span key="n" className="font-medium">{o.orderNumber}</span>,
    <span key="d">{formatDate(o.createdAt)}</span>,
    <span key="c">{o.user?.email ?? o.guestEmail ?? '—'}</span>,
    <span key="t">{formatCurrency(Number(o.total))}</span>,
    <select
      key="s"
      value={status[o.id] ?? o.status}
      onChange={(e) => setStatus({ ...status, [o.id]: e.target.value })}
      className="rounded-full border border-charcoal-100 px-3 py-1 text-xs uppercase tracking-widest"
    >
      {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>,
    <button
      key="u"
      onClick={() => update.mutate({ id: o.id, status: status[o.id] ?? o.status })}
      className="btn-outline !py-1 !px-3 text-[10px]"
    >
      Save
    </button>,
  ]);

  return (
    <div>
      <p className="text-sm text-charcoal-300 mb-4">{(data ?? []).length} orders</p>
      {isLoading ? <p className="text-charcoal-300">Loading…</p> :
        <AdminTable headers={['Order', 'Date', 'Customer', 'Total', 'Status', '']} rows={rows} />}
    </div>
  );
}
