'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/queries';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminTable } from '@/components/admin/AdminTable';
import { apiPost, apiPut, apiDel } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminBlogsPage() {
  const { data, refetch } = usePosts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const posts = (data as any)?.data ?? data ?? [];

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary"><Plus size={14} /> New Post</button>
      </div>
      {Array.isArray(posts) && posts.length > 0 ? (
        <AdminTable
          headers={['Title', 'Status', 'Date', 'Actions']}
          rows={posts.map((p: any) => [
            <span key="t" className="font-medium">{p.title}</span>,
            <span key="s" className={p.isPublished ? 'text-emerald-600' : 'text-charcoal-300'}>{p.isPublished ? 'Published' : 'Draft'}</span>,
            p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—',
            <div key="a" className="flex gap-2">
              <button onClick={() => { setEditing(p); setOpen(true); }} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
              <button onClick={async () => { if (confirm('Delete post?')) { await apiDel(`/blogs/${p.id}`); refetch(); } }} className="text-charcoal hover:text-red-500"><Trash2 size={14} /></button>
            </div>,
          ])}
        />
      ) : <p className="text-sm text-charcoal-300">No posts yet.</p>}
      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit post' : 'New post'} size="lg">
        <BlogForm initial={editing} onClose={() => { setOpen(false); refetch(); }} />
      </AdminModal>
    </div>
  );
}

function BlogForm({ initial, onClose }: any) {
  const [f, setF] = useState<any>(initial ?? { title: '', slug: '', content: '', excerpt: '', coverImage: '', seoTitle: '', seoDescription: '', isPublished: false });
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (initial?.id) await apiPut(`/blogs/${initial.id}`, f);
      else await apiPost('/blogs', f);
      onClose();
    }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Title</label>
          <input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} required />
        </div>
        <div>
          <label className="label">Slug</label>
          <input className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="label">Cover image URL</label>
        <input className="input" value={f.coverImage ?? ''} onChange={(e) => setF({ ...f, coverImage: e.target.value })} />
      </div>
      <div>
        <label className="label">Excerpt</label>
        <textarea rows={2} className="input" value={f.excerpt ?? ''} onChange={(e) => setF({ ...f, excerpt: e.target.value })} />
      </div>
      <div>
        <label className="label">Content (HTML)</label>
        <textarea rows={10} className="input font-mono" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="SEO title" value={f.seoTitle ?? ''} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} />
        <input className="input" placeholder="SEO description" value={f.seoDescription ?? ''} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!f.isPublished} onChange={(e) => setF({ ...f, isPublished: e.target.checked })} />
        Publish immediately
      </label>
      <button className="btn-primary">Save</button>
    </form>
  );
}
