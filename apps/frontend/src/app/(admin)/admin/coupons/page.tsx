'use client';

import { useState } from 'react';
import { useAdminCoupons, useSaveCoupon, useDeleteCoupon } from '@/hooks/queries';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminTable } from '@/components/admin/AdminTable';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCouponsPage() {
  const { data, refetch } = useAdminCoupons();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const remove = useDeleteCoupon();
  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary"><Plus size={14} /> New Coupon</button>
      </div>
      <AdminTable
        headers={['Code', 'Type', 'Value', 'Min Purchase', 'Expiry', 'Status', 'Actions']}
        rows={(data ?? []).map((c: any) => [
          <span key="c" className="font-mono">{c.code}</span>,
          c.type,
          c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`,
          c.minPurchase ? `₹${c.minPurchase}` : '—',
          c.expiry ? new Date(c.expiry).toLocaleDateString() : '—',
          <span key="s" className={c.active ? 'text-emerald-600' : 'text-charcoal-300'}>{c.active ? 'Active' : 'Off'}</span>,
          <div key="a" className="flex gap-2">
            <button onClick={() => { setEditing(c); setOpen(true); }} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
            <button onClick={async () => { if (confirm('Delete coupon?')) { await remove.mutateAsync(c.id); refetch(); } }} className="text-charcoal hover:text-red-500"><Trash2 size={14} /></button>
          </div>,
        ])}
      />
      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit coupon' : 'New coupon'}>
        <CouponForm initial={editing} onClose={() => { setOpen(false); refetch(); }} />
      </AdminModal>
    </div>
  );
}

function CouponForm({ initial, onClose }: any) {
  const save = useSaveCoupon();
  const [f, setF] = useState<any>(initial ?? { code: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, expiry: '', usageLimit: 0, perCustomerLimit: 1, active: true });
  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate({ ...f, id: initial?.id }, { onSuccess: () => onClose() }); }} className="space-y-3">
      <div>
        <label className="label">Code</label>
        <input className="input uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat amount</option>
          </select>
        </div>
        <div>
          <label className="label">Value</label>
          <input type="number" className="input" value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label">Min Purchase (₹)</label>
          <input type="number" className="input" value={f.minPurchase ?? ''} onChange={(e) => setF({ ...f, minPurchase: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div>
          <label className="label">Expiry</label>
          <input type="date" className="input" value={f.expiry?.slice(0, 10) ?? ''} onChange={(e) => setF({ ...f, expiry: e.target.value })} />
        </div>
        <div>
          <label className="label">Usage limit</label>
          <input type="number" className="input" value={f.usageLimit ?? ''} onChange={(e) => setF({ ...f, usageLimit: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div>
          <label className="label">Per customer</label>
          <input type="number" className="input" value={f.perCustomerLimit ?? 1} onChange={(e) => setF({ ...f, perCustomerLimit: Number(e.target.value) })} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
        Active
      </label>
      <button className="btn-primary">Save</button>
    </form>
  );
}
