'use client';

import { useState } from 'react';
import { useCategories, useSaveCategory, useDeleteCategory } from '@/hooks/queries';
import { AdminModal } from '@/components/admin/AdminModal';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { data, refetch } = useCategories();
  const remove = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-charcoal-300">{(data ?? []).length} categories · Drag is in the Mega Menu builder.</p>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary"><Plus size={14} /> New Category</button>
      </div>

      <CategoryTree items={data ?? []} onEdit={(c: any) => { setEditing(c); setOpen(true); }} onDelete={(id: string) => remove.mutate(id)} />

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <CategoryForm initial={editing} onClose={() => { setOpen(false); refetch(); }} />
      </AdminModal>
    </div>
  );
}

function CategoryTree({ items, onEdit, onDelete }: { items: any[]; onEdit: (c: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="luxury-card p-4">
      {items.length === 0 ? <p className="text-sm text-charcoal-300 text-center py-8">No categories yet.</p> : (
        <ul className="space-y-1">
          {items.map((c) => (
            <CategoryNode key={c.id} node={c} depth={0} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryNode({ node, depth, onEdit, onDelete }: any) {
  return (
    <li>
      <div className="flex items-center gap-3 py-2 px-2 rounded hover:bg-ivory-50" style={{ paddingLeft: 8 + depth * 20 }}>
        <FolderTree size={14} className="text-champagne" />
        <span className="flex-1 text-sm font-medium">{node.name}</span>
        <span className="text-[11px] text-charcoal-300">/{node.slug}</span>
        <button onClick={() => onEdit(node)} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
        <button onClick={() => confirm(`Delete ${node.name}?`) && onDelete(node.id)} className="text-charcoal hover:text-red-500"><Trash2 size={14} /></button>
      </div>
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((c: any) => (
            <CategoryNode key={c.id} node={c} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategoryForm({ initial, onClose }: any) {
  const save = useSaveCategory();
  const { data: all } = useCategories();
  const [f, setF] = useState<any>(initial ?? { name: '', slug: '', description: '', image: '', banner: '', seoTitle: '', seoDescription: '', isVisible: true, sortOrder: 0, parentId: null });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate({ ...f, id: initial?.id }, { onSuccess: () => onClose() }); }}
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
      <div>
        <label className="label">Parent</label>
        <select className="input" value={f.parentId ?? ''} onChange={(e) => setF({ ...f, parentId: e.target.value || null })}>
          <option value="">— None —</option>
          {(all ?? []).filter((c: any) => c.id !== initial?.id).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Image URL</label>
          <input className="input" value={f.image ?? ''} onChange={(e) => setF({ ...f, image: e.target.value })} />
        </div>
        <div>
          <label className="label">Sort Order</label>
          <input type="number" className="input" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="label">SEO title</label>
        <input className="input" value={f.seoTitle ?? ''} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!f.isVisible} onChange={(e) => setF({ ...f, isVisible: e.target.checked })} />
        Visible
      </label>
      <button disabled={save.isPending} className="btn-primary">{save.isPending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
