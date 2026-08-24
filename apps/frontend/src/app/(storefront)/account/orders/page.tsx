'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => apiGet<any[]>('/orders/customer'),
    enabled: !!user,
  });

  if (!user) {
    return <div className="container-x py-24 text-center"><Link href="/account" className="btn-primary">Sign in to view orders</Link></div>;
  }
  if (isLoading) return <div className="container-x py-24 text-center">Loading…</div>;

  return (
    <div className="container-x py-12">
      <h1 className="font-serif text-4xl">My Orders</h1>
      <div className="mt-8 space-y-4">
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-charcoal-300">No orders yet.</p>
        ) : (
          (data ?? []).map((o: any) => (
            <div key={o.id} className="luxury-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-xl">Order {o.orderNumber}</p>
                  <p className="text-sm text-charcoal-300">{formatDate(o.createdAt)}</p>
                </div>
                <span className="rounded-full bg-ivory px-3 py-1 text-[11px] uppercase tracking-widest">{o.status}</span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                {o.items?.slice(0, 3).map((it: any) => (
                  <div key={it.id} className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image || '/placeholder.jpg'}
                      alt={it.name}
                      className="h-14 w-14 rounded object-cover bg-ivory flex-shrink-0"
                    />
                    <div className="flex-1 text-charcoal">
                      <p className="font-medium">{it.name}</p>
                      <p className="text-xs text-charcoal-300">Qty {it.quantity}</p>
                    </div>
                    <span className="text-charcoal-300">{formatCurrency(Number(it.total))}</span>
                  </div>
                ))}
                {(o.items?.length ?? 0) > 3 && (
                  <p className="text-xs text-charcoal-300">+{o.items.length - 3} more items</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-4">
                <span className="text-sm text-charcoal-300">Total</span>
                <span className="font-medium">{formatCurrency(Number(o.total))}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
