'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api';
import { AdminTable } from '@/components/admin/AdminTable';

const ROLES = ['ADMIN', 'MANAGER', 'EDITOR', 'STAFF', 'CUSTOMER'];

export default function AdminUsersPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiGet<any[]>('/admin/users'),
  });

  const updateRole = async (id: string, role: string) => {
    await apiPatch(`/admin/users/${id}/role`, { role });
    refetch();
  };

  return (
    <div>
      <p className="text-sm text-charcoal-300 mb-6">Roles: ADMIN (full) · MANAGER (ops) · EDITOR (products/content) · STAFF (orders) · CUSTOMER (default)</p>
      {isLoading ? <p>Loading…</p> :
        <AdminTable
          headers={['Email', 'Name', 'Role', 'Joined']}
          rows={(data ?? []).map((u: any) => [
            u.email,
            `${u.firstName ?? ''} ${u.lastName ?? ''}`,
            <select
              key="r"
              defaultValue={u.role}
              onChange={(e) => updateRole(u.id, e.target.value)}
              className="rounded-full border border-charcoal-100 px-3 py-1 text-xs uppercase tracking-widest"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>,
            new Date(u.createdAt).toLocaleDateString(),
          ])}
        />}
    </div>
  );
}
