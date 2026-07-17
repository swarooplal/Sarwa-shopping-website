'use client';

import { useContact } from '@/hooks/queries';
import { useForm } from 'react-hook-form';
import { ContactSchema } from '@sarwa/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const c = useContact();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(ContactSchema) });

  return (
    <div className="container-x py-16 grid gap-12 md:grid-cols-2">
      <div>
        <span className="eyebrow">SARWA · Concierge</span>
        <h1 className="font-serif text-5xl mt-2">Get in touch</h1>
        <p className="mt-4 text-sm text-charcoal-300 max-w-md">
          Questions about a piece, customization, or bulk orders? Our concierge replies within 24 hours.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3"><Phone size={16} className="text-champagne" /> +91 11 4567 1234</li>
          <li className="flex items-center gap-3"><Mail size={16} className="text-champagne" /> hello@sarwa.in</li>
          <li className="flex items-center gap-3"><MapPin size={16} className="text-champagne" /> 21, Meherchand Market, Lodhi Colony, New Delhi</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit((d: any) => c.mutate(d, { onSuccess: () => reset() }))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" reg={register('name')} err={errors.name} />
          <Field label="Email" reg={register('email')} err={errors.email} />
        </div>
        <Field label="Phone (optional)" reg={register('phone')} />
        <Field label="Subject" reg={register('subject')} err={errors.subject} />
        <div>
          <label className="label">Message</label>
          <textarea rows={5} className="input" {...register('message')} />
          {errors.message && <p className="text-xs text-red-500 mt-1">{String(errors.message.message)}</p>}
        </div>
        <button className="btn-primary">{c.isPending ? 'Sending…' : 'Send message'}</button>
      </form>
    </div>
  );
}

function Field({ label, reg, err }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" {...reg} />
      {err && <p className="text-xs text-red-500 mt-1">{String(err.message)}</p>}
    </div>
  );
}
