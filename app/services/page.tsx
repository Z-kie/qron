'use client';

import { useState } from 'react';
import { SERVICE_CATALOG } from '@/lib/stripe';

export default function ServicesPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(serviceId: string) {
    setLoading(serviceId);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, promoCode: promoCode.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold mb-2">Services</h1>
      <p className="text-white/60 mb-10">Choose a plan to get started with QRON and AuthiChain.</p>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8 flex items-center gap-3">
        <label className="text-sm text-white/60">Promo code:</label>
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="e.g. LAUNCH99"
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_CATALOG.map((service) => (
          <div
            key={service.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col hover:border-purple-500/50 transition-colors"
          >
            <h2 className="text-xl font-bold mb-1">{service.name}</h2>
            <p className="text-white/50 text-sm mb-4">{service.description}</p>
            <ul className="space-y-1 mb-6 flex-1">
              {service.features.map((f) => (
                <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                  <span className="text-purple-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-2xl font-extrabold">
                ${(service.price / 100).toLocaleString()}
              </span>
              <button
                onClick={() => handleCheckout(service.id)}
                disabled={loading === service.id}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
              >
                {loading === service.id ? 'Redirecting…' : 'Buy Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
