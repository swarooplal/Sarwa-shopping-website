'use client';

import { useAuth } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDel } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema } from '@sarwa/shared';
import { z } from 'zod';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function AddressesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiGet<any[]>('/customer/addresses'),
    enabled: !!user,
  });
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(AddressSchema) });
  const create = useMutation({
    mutationFn: (body: any) => apiPost('/customer/addresses', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); reset(); },
  });
  const del = useMutation({ mutationFn: (id: string) => apiDel(`/customer/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }) });

  if (!user) return <div className="container-x py-24 text-center"><Link href="/account" className="btn-primary">Sign in</Link></div>;

  return (
    <div className="container-x py-12 grid gap-10 md:grid-cols-[1fr_400px]">
      <div>
        <h1 className="font-serif text-4xl">Saved addresses</h1>
        <div className="mt-8 space-y-4">
          {(data ?? []).length === 0 ? (
            <p className="text-sm text-charcoal-300">No addresses yet. Add one on the right.</p>
          ) : (
            (data ?? []).map((a: any) => (
              <div key={a.id} className="luxury-card p-5 flex justify-between">
                <div>
                  <p className="font-medium">{a.fullName} · {a.phone}</p>
                  <p className="text-sm text-charcoal-300 mt-1">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}, {a.country}
                  </p>
                </div>
                <button onClick={() => del.mutate(a.id)} className="text-charcoal-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit((d: any) => create.mutate(d))} className="luxury-card p-6 h-fit space-y-3">
        <h2 className="font-serif text-xl">Add new address</h2>
        <input className="input" placeholder="Full name" {...register('fullName')} />
        <input className="input" placeholder="Phone" {...register('phone')} />
        <input className="input" placeholder="Address line 1" {...register('line1')} />
        <input className="input" placeholder="Address line 2 (optional)" {...register('line2')} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="City" {...register('city')} />
          <input className="input" placeholder="State" {...register('state')} />
        </div>
        <input className="input" placeholder="Pincode" {...register('pincode')} />
        <button className="btn-primary w-full">Save address</button>
      </form>
    </div>
  );
}
