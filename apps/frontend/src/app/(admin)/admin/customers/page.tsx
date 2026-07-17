'use client';

import { useState } from 'react';
import { useAdminCustomers } from '@/hooks/queries';
import { AdminTable } from '@/components/admin/AdminTable';
import { formatCurrency } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminCustomers({ search, pageSize: 50 });

  const rows = ((data as any)?.data ?? []).map((c: any) => [
    <span key="n" className="font-medium">{c.firstName ?? ''} {c.lastName ?? ''}</span>,
    <span key="e" className="text-xs text-charcoal-300">{c.email}</span>,
    <span key="o">{c.orderCount ?? 0}</span>,
    <span key="t">{formatCurrency(Number(c.totalSpent ?? 0))}</span>,
    <span key="a">{c.isActive ? 'Active' : 'Disabled'}</span>,
  ]);

  return (
    <div>
      <div className="relative max-w-md mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" placeholder="Search by email…" />
      </div>
      {isLoading ? <p className="text-charcoal-300">Loading…</p> :
        <AdminTable headers={['Name', 'Email', 'Orders', 'Total Spent', 'Status']} rows={rows} />}
    </div>
  );
}
