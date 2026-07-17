'use client';

import { useState } from 'react';
import { useAdminProducts, useSaveProduct, useDeleteProduct, useUploadFile } from '@/hooks/queries';
import { AdminTable, EmptyState } from '@/components/admin/AdminTable';
import { AdminModal } from '@/components/admin/AdminModal';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Copy, Search } from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProducts({ search, page, pageSize: 20 });
  const products = (data as any)?.data ?? [];
  const total = (data as any)?.meta?.total ?? 0;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const remove = useDeleteProduct();
  const save = useSaveProduct();
  const upload = useUploadFile();

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setOpen(true); };

  const onSubmit = async (form: any, imageUrls: string[]) => {
    await save.mutateAsync({
      ...form,
      id: editing?.id,
      price: Number(form.price),
      offerPrice: form.offerPrice ? Number(form.offerPrice) : null,
      stock: Number(form.stock),
      tags: form.tags?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? [],
      metaKeywords: form.metaKeywords?.split(',').map((s: string) => s.trim()).filter(Boolean) ?? [],
      imageUrls,
      isFeatured: !!form.isFeatured,
      isTrending: !!form.isTrending,
      isNewArrival: !!form.isNewArrival,
      isBestSeller: !!form.isBestSeller,
    });
    setOpen(false);
  };

  const duplicate = async (p: any) => {
    await apiPost(`/products/${p.id}/duplicate`, {});
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            placeholder="Search by name, SKU…"
          />
        </div>
        <button onClick={openNew} className="btn-primary"><Plus size={14} /> Add Product</button>
      </div>

      {isLoading ? (
        <p className="text-charcoal-300">Loading…</p>
      ) : products.length === 0 ? (
        <EmptyState title="No products yet." cta={<button onClick={openNew} className="btn-primary">Add your first product</button>} />
      ) : (
        <AdminTable
          headers={['Image', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Actions']}
          rows={products.map((p: any) => [
            <img key="i" src={p.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80'} className="w-12 h-14 object-cover rounded" />,
            <div key="n"><p className="font-medium">{p.name}</p><p className="text-[11px] text-charcoal-300">{p.fabric ?? '—'}</p></div>,
            <span key="s" className="text-xs text-charcoal-300">{p.sku}</span>,
            <span key="p">{formatCurrency(Number(p.offerPrice ?? p.price))}</span>,
            <span key="st" className={p.stock <= 5 ? 'text-red-500' : ''}>{p.stock}</span>,
            <div key="flags" className="flex gap-1 flex-wrap">
              {p.isFeatured && <Flag>Featured</Flag>}
              {p.isTrending && <Flag className="bg-champagne/10 text-champagne-600">Trending</Flag>}
              {p.isNewArrival && <Flag className="bg-emerald-50 text-emerald-700">New</Flag>}
              {p.isBestSeller && <Flag className="bg-rose-50 text-rose-700">Best</Flag>}
              {!p.isActive && <Flag className="bg-charcoal-100 text-charcoal">Draft</Flag>}
            </div>,
            <div key="a" className="flex items-center gap-2">
              <button onClick={() => openEdit(p)} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
              <button onClick={() => duplicate(p)} className="text-charcoal hover:text-champagne"><Copy size={14} /></button>
              <button onClick={() => confirm(`Delete ${p.name}?`) && remove.mutate(p.id)} className="text-charcoal hover:text-red-500"><Trash2 size={14} /></button>
            </div>,
          ])}
        />
      )}

      <div className="flex justify-between items-center mt-4 text-sm">
        <span className="text-charcoal-300">{total} products</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-outline !py-1.5 !px-3 text-xs">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} className="btn-outline !py-1.5 !px-3 text-xs">Next</button>
        </div>
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit product' : 'New product'} size="lg">
        <ProductForm initial={editing} onSubmit={onSubmit} upload={upload} saving={save.isPending} />
      </AdminModal>
    </div>
  );
}

function Flag({ children, className = 'bg-primary/10 text-primary' }: any) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${className}`}>{children}</span>;
}

function ProductForm({ initial, onSubmit, upload, saving }: any) {
  const [f, setF] = useState<any>(initial ?? {
    name: '', slug: '', sku: '', shortDescription: '', description: '',
    price: 0, offerPrice: 0, stock: 0,
    fabric: '', occasion: '', color: '', tags: '', metaKeywords: '',
    seoTitle: '', seoDescription: '',
    isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false,
  });
  const [images, setImages] = useState<string[]>(initial?.images?.map((i: any) => i.url) ?? []);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const res = await upload.mutateAsync(file);
      const url = res?.data?.url;
      if (url) setImages((s) => [...s, url]);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f, images); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required /></Field>
        <Field label="Slug"><input className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} required /></Field>
        <Field label="SKU"><input className="input" value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} required /></Field>
        <Field label="Stock"><input type="number" className="input" value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} /></Field>
        <Field label="Price (₹)"><input type="number" className="input" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} required /></Field>
        <Field label="Offer Price (₹)"><input type="number" className="input" value={f.offerPrice} onChange={(e) => setF({ ...f, offerPrice: e.target.value })} /></Field>
        <Field label="Fabric"><input className="input" value={f.fabric} onChange={(e) => setF({ ...f, fabric: e.target.value })} /></Field>
        <Field label="Occasion"><input className="input" value={f.occasion} onChange={(e) => setF({ ...f, occasion: e.target.value })} /></Field>
        <Field label="Color"><input className="input" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} /></Field>
        <Field label="Tags (comma-separated)"><input className="input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
      </div>
      <Field label="Short description"><input className="input" value={f.shortDescription} onChange={(e) => setF({ ...f, shortDescription: e.target.value })} /></Field>
      <Field label="Description"><textarea rows={5} className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="SEO title"><input className="input" value={f.seoTitle} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} /></Field>
        <Field label="SEO keywords"><input className="input" value={f.metaKeywords} onChange={(e) => setF({ ...f, metaKeywords: e.target.value })} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} />
            <span className="capitalize">{k.replace(/^is/, '').replace(/([A-Z])/g, ' $1')}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="label">Images</label>
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square rounded overflow-hidden bg-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">✕</button>
            </div>
          ))}
          <label className="aspect-square grid place-items-center rounded border-2 border-dashed border-charcoal-100 cursor-pointer hover:border-champagne text-charcoal-300 text-xs">
            + Upload
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </label>
        </div>
      </div>

      <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : initial ? 'Update product' : 'Create product'}</button>
    </form>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
