'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-8 max-w-3xl">
      <section className="luxury-card p-6">
        <h2 className="font-serif text-2xl">Store</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Store name" value="SARWA" />
          <Field label="Currency" value="INR" />
          <Field label="Email" value="hello@sarwa.in" />
          <Field label="Phone" value="+91 11 4567 1234" />
        </div>
      </section>

      <section className="luxury-card p-6">
        <h2 className="font-serif text-2xl">Shipping</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Free shipping above (₹)" value="1500" />
          <Field label="Shipping fee (₹)" value="99" />
        </div>
      </section>

      <section className="luxury-card p-6">
        <h2 className="font-serif text-2xl">Integrations</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center justify-between"><span>Google Analytics</span><span className="text-charcoal-300">Connect in env</span></li>
          <li className="flex items-center justify-between"><span>Meta Pixel</span><span className="text-charcoal-300">Connect in env</span></li>
          <li className="flex items-center justify-between"><span>Google Tag Manager</span><span className="text-charcoal-300">Connect in env</span></li>
          <li className="flex items-center justify-between"><span>Razorpay</span><span className="text-charcoal-300">Configure in backend .env</span></li>
          <li className="flex items-center justify-between"><span>Stripe</span><span className="text-charcoal-300">Configure in backend .env</span></li>
        </ul>
      </section>

      <button onClick={() => setSaved(true)} className="btn-primary">{saved ? 'Saved!' : 'Save settings'}</button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" defaultValue={value} />
    </div>
  );
}
