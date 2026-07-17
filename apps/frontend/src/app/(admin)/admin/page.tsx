'use client';

import { useAdminDashboard } from '@/hooks/queries';
import { formatCurrency } from '@/lib/utils';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function AdminHome() {
  const { data, isLoading } = useAdminDashboard();

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Revenue" value={formatCurrency(Number(data?.revenue ?? 0))} icon={<TrendingUp />} accent="bg-emerald-50 text-emerald-700" />
        <Stat label="Orders" value={String(data?.orders ?? 0)} icon={<ShoppingCart />} accent="bg-amber-50 text-amber-700" />
        <Stat label="Customers" value={String(data?.customers ?? 0)} icon={<Users />} accent="bg-sky-50 text-sky-700" />
        <Stat label="Conversion" value={`${data?.conversionRate ?? 0}%`} icon={<Package />} accent="bg-rose-50 text-rose-700" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 luxury-card p-6">
          <h2 className="font-serif text-2xl mb-4">Sales (last 14 days)</h2>
          <SalesChart data={data?.salesSeries ?? []} />
        </div>
        <div className="luxury-card p-6">
          <h2 className="font-serif text-2xl mb-4">Top Products</h2>
          <ul className="space-y-3 text-sm">
            {(data?.topProducts ?? []).map((p: any) => (
              <li key={p.productId} className="flex items-center justify-between">
                <span className="truncate">{p.name}</span>
                <span className="font-medium">{p.sold}</span>
              </li>
            ))}
            {(data?.topProducts ?? []).length === 0 && (
              <li className="text-charcoal-300">No sales yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="luxury-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-charcoal-300">{label}</span>
        <span className={`h-9 w-9 grid place-items-center rounded-md ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 font-serif text-3xl">{value}</p>
    </div>
  );
}

function SalesChart({ data }: { data: { date: string; amount: number }[] }) {
  if (!data?.length) return <p className="text-sm text-charcoal-300">No data.</p>;
  const max = Math.max(...data.map((d) => d.amount)) || 1;
  return (
    <div className="flex items-end gap-1 h-48">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-primary rounded-t hover:bg-champagne transition"
            style={{ height: `${(d.amount / max) * 100}%`, minHeight: 4 }}
            title={`${d.date}: ₹${d.amount}`}
          />
          <span className="text-[9px] text-charcoal-300">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
