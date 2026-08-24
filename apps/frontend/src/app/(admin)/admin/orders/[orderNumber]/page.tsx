'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminOrder, useUpdateOrder } from '@/hooks/queries';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@sarwa/shared';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

const ORDER_STATUS_TIMELINE = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export default function AdminOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const orderNumber = decodeURIComponent(params.orderNumber);
  const { data: order, isLoading } = useAdminOrder(orderNumber);
  const update = useUpdateOrder();
  const [newStatus, setNewStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-charcoal-300">Loading…</p>;
  }
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="font-serif text-2xl">Order not found</p>
        <Link href="/admin/orders" className="btn-outline mt-4 inline-flex">
          <ChevronLeft size={14} /> Back to orders
        </Link>
      </div>
    );
  }

  const customerName = order.user
    ? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || '—'
    : 'Guest';
  const customerEmail = order.user?.email ?? order.guestEmail ?? '—';
  const customerPhone = order.user?.phone ?? order.shippingAddress?.phone ?? '—';

  const onSaveStatus = async () => {
    const status = newStatus || order.status;
    if (!status || status === order.status) return;
    setSaving(true);
    try {
      await update.mutateAsync({ id: order.id, status, note: note || undefined });
      setNewStatus('');
      setNote('');
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-charcoal-300 hover:text-charcoal inline-flex items-center gap-1 mb-4">
        <ChevronLeft size={12} /> Back to orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl">Order {order.orderNumber}</h1>
          <p className="text-sm text-charcoal-300">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right space-y-1">
          <span className="inline-block rounded-full bg-ivory px-3 py-1 text-[11px] uppercase tracking-widest">
            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
          </span>
          <p className="text-xs text-charcoal-300">
            Payment: {PAYMENT_STATUS_LABELS[order.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] ?? order.paymentStatus}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="luxury-card p-6">
            <h2 className="font-serif text-lg mb-4">Items ({order.items?.length ?? 0})</h2>
            <ul className="divide-y divide-charcoal-100">
              {(order.items ?? []).map((it: any) => (
                <li key={it.id} className="flex items-center gap-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image || '/placeholder.jpg'}
                    alt={it.name}
                    className="h-16 w-16 rounded object-cover bg-ivory flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-charcoal-300">
                      {it.sku ? `SKU ${it.sku}` : ''}
                      {it.size ? ` · Size ${it.size}` : ''}
                      {' · Qty '}{it.quantity}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatCurrency(Number(it.unitPrice))}</p>
                    <p className="text-xs text-charcoal-300">{formatCurrency(Number(it.total))} total</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCurrency(Number(order.subtotal))} />
              {Number(order.discount) > 0 && <Row label="Discount" value={`− ${formatCurrency(Number(order.discount))}`} />}
              <Row label="Shipping" value={Number(order.shipping) === 0 ? 'Free' : formatCurrency(Number(order.shipping))} />
              <Row label="Tax" value={formatCurrency(Number(order.tax))} />
              <div className="flex justify-between border-t border-charcoal-200 pt-3 mt-2 font-medium">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="luxury-card p-6">
              <h2 className="font-serif text-lg mb-2">Customer note</h2>
              <p className="text-sm text-charcoal-300">{order.notes}</p>
            </section>
          )}

          <section className="luxury-card p-6">
            <h2 className="font-serif text-lg mb-4">Timeline</h2>
            {order.timeline?.length ? (
              <ol className="space-y-3 text-sm">
                {order.timeline.map((t: any) => (
                  <li key={t.id} className="flex gap-3">
                    <div className="w-24 flex-shrink-0 text-xs text-charcoal-300">
                      {formatDate(t.at ?? t.createdAt)}
                    </div>
                    <div className="flex-1">
                      <span className="inline-block rounded-full bg-ivory px-2 py-0.5 text-[10px] uppercase tracking-widest mr-2">
                        {ORDER_STATUS_LABELS[t.status as keyof typeof ORDER_STATUS_LABELS] ?? t.status}
                      </span>
                      {t.note && <span className="text-charcoal-300">{t.note}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-charcoal-300">No timeline entries yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="luxury-card p-6">
            <h2 className="font-serif text-lg mb-4">Customer</h2>
            {order.user ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{customerName}</p>
                <p className="text-charcoal-300">{customerEmail}</p>
                <p className="text-charcoal-300">{customerPhone}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="font-medium">Guest checkout</p>
                <p className="text-charcoal-300">{customerEmail}</p>
                <p className="text-charcoal-300">{customerPhone}</p>
              </div>
            )}
          </section>

          {order.shippingAddress && (
            <section className="luxury-card p-6">
              <h2 className="font-serif text-lg mb-4">Shipping address</h2>
              <p className="text-sm">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-charcoal-300">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="text-sm text-charcoal-300">{order.shippingAddress.line2}</p>}
              <p className="text-sm text-charcoal-300">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="text-sm text-charcoal-300">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-sm text-charcoal-300 mt-2">{order.shippingAddress.phone}</p>
              )}
            </section>
          )}

          <section className="luxury-card p-6">
            <h2 className="font-serif text-lg mb-4">Update status</h2>
            <div className="space-y-3">
              <div>
                <label className="label">New status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                >
                  <option value="">Current ({ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status})</option>
                  {ORDER_STATUS_TIMELINE.filter((s) => s !== order.status).map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS] ?? s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="e.g. Shipped via DHL, tracking #1234"
                />
              </div>
              <button
                disabled={saving || !newStatus || newStatus === order.status}
                onClick={onSaveStatus}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save status'}
              </button>
              {savedAt && (
                <p className="text-xs text-champagne-500">Updated at {savedAt}</p>
              )}
              {update.isError && (
                <p className="text-xs text-red-500">Failed to save. Try again.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-charcoal-300">{label}</span>
      <span>{value}</span>
    </div>
  );
}