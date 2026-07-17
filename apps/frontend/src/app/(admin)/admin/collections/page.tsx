'use client';

import { useEffect, useState } from 'react';
import { useCollections, useUploadFile } from '@/hooks/queries';
import { apiPost, apiPut, apiDel } from '@/lib/api';
import { AdminModal } from '@/components/admin/AdminModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCollectionsPage() {
  const { data, refetch } = useCollections();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary"><Plus size={14} /> New Collection</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(data ?? []).map((c: any) => (
          <div key={c.id} className="luxury-card overflow-hidden">
            <div className="aspect-[4/3] bg-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'} className="h-full w-full object-cover" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-[11px] uppercase tracking-widest text-champagne-500">{c.type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(c); setOpen(true); }} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
                <button onClick={async () => { if (confirm(`Delete ${c.name}?`)) { await apiDel(`/collections/${c.id}`); refetch(); } }} className="text-charcoal hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit collection' : 'New collection'}>
        <CollectionForm initial={editing} onClose={() => { setOpen(false); refetch(); }} />
      </AdminModal>
    </div>
  );
}

const TYPES = ['FEATURED', 'WEDDING', 'SILK', 'DAILY', 'OFFICE', 'PARTY', 'DESIGNER', 'JEWELLERY'];

function CollectionForm({ initial, onClose }: any) {
  const upload = useUploadFile();
  const [f, setF] = useState<any>(initial ?? { name: '', slug: '', description: '', image: '', type: 'FEATURED', isActive: true });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (initial?.id) await apiPut(`/collections/${initial.id}`, f);
        else await apiPost('/collections', f);
        onClose();
      }}
      className="space-y-3"
    >
      <div>
        <label className="label">Name</label>
        <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required />
      </div>
      <div>
        <label className="label">Slug</label>
        <input className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea rows={3} className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Image URL</label>
          <input className="input" value={f.image ?? ''} onChange={(e) => setF({ ...f, image: e.target.value })} />
        </div>
      </div>
      <button className="btn-primary">{initial ? 'Update' : 'Create'}</button>
    </form>
  );
}
