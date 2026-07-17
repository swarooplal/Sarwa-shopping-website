'use client';

import { useEffect, useState } from 'react';
import { AdminModal } from '@/components/admin/AdminModal';
import { usePage } from '@/hooks/queries';
import { apiPut } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';

const PAGES = [
  { slug: 'about', title: 'About SARWA' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'return-policy', title: 'Return Policy' },
  { slug: 'shipping-policy', title: 'Shipping Policy' },
  { slug: 'faq', title: 'FAQ' },
];

export default function AdminCmsPage() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PAGES.map((p) => <CmsCard key={p.slug} slug={p.slug} title={p.title} />)}
    </div>
  );
}

function CmsCard({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="luxury-card p-5 flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-[11px] uppercase tracking-widest text-champagne-500">/{slug}</p>
      </div>
      <button onClick={() => setOpen(true)} className="btn-outline !py-2 text-xs">
        <Edit size={12} /> Edit
      </button>
      <AdminModal open={open} onClose={() => setOpen(false)} title={`Edit ${title}`} size="lg">
        <CmsEditor slug={slug} onClose={() => setOpen(false)} />
      </AdminModal>
    </div>
  );
}

function CmsEditor({ slug, onClose }: any) {
  const qc = useQueryClient();
  const { data: page, isLoading } = usePage(slug);
  const [f, setF] = useState<any>({ title: '', content: '' });

  useEffect(() => {
    if (page) setF({ title: page.title, content: page.content });
  }, [page]);

  if (isLoading) return <p>Loading…</p>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await apiPut(`/cms/pages/admin/${page.id}`, f);
        qc.invalidateQueries({ queryKey: ['page', slug] });
        onClose();
      }}
      className="space-y-3"
    >
      <div>
        <label className="label">Title</label>
        <input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Content (HTML)</label>
        <textarea rows={15} className="input font-mono" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
      </div>
      <button className="btn-primary">Save</button>
    </form>
  );
}
