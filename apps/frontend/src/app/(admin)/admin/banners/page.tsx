'use client';

import { useState } from 'react';
import { useBanners, useSaveBanner, useDeleteBanner, useUploadFile } from '@/hooks/queries';
import { AdminModal } from '@/components/admin/AdminModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminBannersPage() {
  const { data, refetch } = useBanners('HERO');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  return (
    <div>
      <div className="flex justify-between mb-6">
        <p className="text-sm text-charcoal-300">{(data ?? []).length} hero slides · Manage display order, scheduling & CTA.</p>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary"><Plus size={14} /> New Slide</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(data ?? []).map((b: any) => (
          <div key={b.id} className="luxury-card overflow-hidden">
            <div className="aspect-[16/9] bg-charcoal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.desktopImage} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <h4 className="font-serif text-xl">{b.heading}</h4>
              <p className="text-sm text-charcoal-300">{b.subHeading}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => { setEditing(b); setOpen(true); }} className="text-charcoal hover:text-primary"><Edit size={14} /></button>
                <BannerDelete id={b.id} refetch={refetch} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit slide' : 'New slide'} size="lg">
        <BannerForm initial={editing} onClose={() => { setOpen(false); refetch(); }} />
      </AdminModal>
    </div>
  );
}

function BannerDelete({ id, refetch }: any) {
  const remove = useDeleteBanner();
  return (
    <button onClick={async () => { if (confirm('Delete slide?')) { await remove.mutateAsync(id); refetch(); } }} className="text-charcoal hover:text-red-500">
      <Trash2 size={14} />
    </button>
  );
}

function BannerForm({ initial, onClose }: any) {
  const upload = useUploadFile();
  const save = useSaveBanner();
  const [f, setF] = useState<any>(initial ?? { heading: '', subHeading: '', buttonText: '', buttonLink: '', desktopImage: '', mobileImage: '', displayOrder: 0, isActive: true, position: 'HERO' });

  const handleImage = async (key: 'desktopImage' | 'mobileImage', file: File) => {
    const res = await upload.mutateAsync(file);
    setF((s: any) => ({ ...s, [key]: res?.data?.url }));
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save.mutate({ ...f, id: initial?.id }, { onSuccess: () => onClose() }); }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Heading</label>
          <input className="input" value={f.heading} onChange={(e) => setF({ ...f, heading: e.target.value })} />
        </div>
        <div>
          <label className="label">Sub heading</label>
          <input className="input" value={f.subHeading} onChange={(e) => setF({ ...f, subHeading: e.target.value })} />
        </div>
        <div>
          <label className="label">Button text</label>
          <input className="input" value={f.buttonText} onChange={(e) => setF({ ...f, buttonText: e.target.value })} />
        </div>
        <div>
          <label className="label">Button link</label>
          <input className="input" value={f.buttonLink} onChange={(e) => setF({ ...f, buttonLink: e.target.value })} />
        </div>
        <div>
          <label className="label">Display order</label>
          <input type="number" className="input" value={f.displayOrder} onChange={(e) => setF({ ...f, displayOrder: Number(e.target.value) })} />
        </div>
        <label className="flex items-center gap-2 text-sm mt-6">
          <input type="checkbox" checked={!!f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
          Active
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageDrop label="Desktop image" url={f.desktopImage} onPick={(file) => handleImage('desktopImage', file)} />
        <ImageDrop label="Mobile image (optional)" url={f.mobileImage} onPick={(file) => handleImage('mobileImage', file)} />
      </div>

      <button className="btn-primary">{initial ? 'Update' : 'Create'} slide</button>
    </form>
  );
}

function ImageDrop({ label, url, onPick }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="aspect-[16/10] rounded overflow-hidden bg-ivory mb-2">
        {url && <img src={url} className="h-full w-full object-cover" />}
      </div>
      <label className="btn-outline !py-2 text-xs w-full cursor-pointer">
        Upload
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
      </label>
    </div>
  );
}
