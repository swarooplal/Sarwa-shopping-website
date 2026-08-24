'use client';

import Link from 'next/link';
import { useAdminOrders, useUpdateOrder } from '@/hooks/queries';
import { AdminTable } from '@/components/admin/AdminTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@sarwa/shared';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const { data, isLoading } = useAdminOrders({ pageSize: 30 });
  const update = useUpdateOrder();
  const [status, setStatus] = useState<Record<string, string>>({});

  const orderList: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  const rows = orderList.map((o: any) => [
    <Link key="n" href={`/admin/orders/${o.orderNumber}`} className="font-medium text-primary link-underline">
      {o.orderNumber}
    </Link>,
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
    <Link
      key="v"
      href={`/admin/orders/${o.orderNumber}`}
      className="btn-outline !py-1 !px-3 text-[10px]"
    >
      View
    </Link>,
  ]);

  return (
    <div>
      <p className="text-sm text-charcoal-300 mb-4">{orderList.length} orders</p>
      {isLoading ? (
        <p className="text-charcoal-300">Loading…</p>
      ) : orderList.length === 0 ? (
        <p className="text-charcoal-300 text-sm">No orders yet.</p>
      ) : (
        <AdminTable headers={['Order', 'Date', 'Customer', 'Total', 'Status', '']} rows={rows} />
      )}
    </div>
  );
}
