'use client';

import { useAdminReviews, useApproveReview } from '@/hooks/queries';
import { AdminTable } from '@/components/admin/AdminTable';
import { Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const { data, isLoading } = useAdminReviews();
  const approve = useApproveReview();

  const rows = (data ?? []).map((r: any) => [
    <span key="u">{r.userName}</span>,
    <div key="r" className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} className={i < r.rating ? 'fill-champagne text-champagne' : 'text-charcoal-100'} />
      ))}
    </div>,
    <p key="c" className="line-clamp-2 max-w-md">{r.comment}</p>,
    <span key="s" className={`text-[11px] uppercase tracking-widest ${r.status === 'APPROVED' ? 'text-emerald-600' : 'text-charcoal-300'}`}>{r.status}</span>,
    <div key="a" className="flex gap-2">
      <button onClick={() => approve.mutate({ id: r.id, status: 'APPROVED' })} className="text-emerald-600 text-xs">Approve</button>
      <button onClick={() => approve.mutate({ id: r.id, status: 'REJECTED' })} className="text-red-500 text-xs">Reject</button>
    </div>,
  ]);

  return (
    <div>
      {isLoading ? <p>Loading…</p> :
        <AdminTable headers={['Reviewer', 'Rating', 'Comment', 'Status', 'Actions']} rows={rows} />}
    </div>
  );
}
