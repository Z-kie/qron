'use client';

import { useState } from 'react';

type Order = {
  id: string;
  serviceName: string;
  customerEmail: string | null;
  customerName: string | null;
  status: string;
  priceAmount: number;
  currency: string;
  deliveryUrl: string | null;
  adminNotes: string | null;
  stripeSessionId: string;
  createdAt: Date;
};

const STATUS_OPTIONS = ['pending', 'paid', 'in_progress', 'delivered', 'cancelled'];

const statusColor: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  paid: 'text-green-400 bg-green-400/10 border-green-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  delivered: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function AdminOrdersClient({
  orders: initialOrders,
  adminKey,
}: {
  orders: Order[];
  adminKey: string;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function updateOrder(
    orderId: string,
    patch: { status?: string; deliveryUrl?: string; adminNotes?: string }
  ) {
    setSaving(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ orderId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Update failed');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
      showToast('✅ Order updated');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {toast && (
        <div className="fixed top-6 right-6 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl text-sm z-50 shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Admin — Orders</h1>
          <p className="text-white/50 mt-1">{orders.length} total orders</p>
        </div>
        <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">Admin View</span>
      </div>

      {orders.length === 0 && (
        <div className="text-white/40 text-center py-20">No orders yet.</div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">{order.serviceName}</h2>
                <p className="text-white/50 text-sm">
                  {order.customerName ?? 'Unknown'} · {order.customerEmail ?? 'No email'}
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Session: {order.stripeSessionId}
                </p>
                <p className="text-white/30 text-xs">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-extrabold">
                  ${(order.priceAmount / 100).toLocaleString()}
                </p>
                <p className="text-white/50 text-xs">{order.currency.toUpperCase()}</p>
              </div>
            </div>

            {/* Status selector */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-white/60 w-20 shrink-0">Status:</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateOrder(order.id, { status: s })}
                    disabled={saving === order.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide transition-opacity disabled:opacity-50 ${
                      order.status === s
                        ? statusColor[s] ?? 'text-white bg-white/10 border-white/20'
                        : 'text-white/40 bg-transparent border-white/10 hover:border-white/30'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery URL */}
            <DeliveryUrlRow
              orderId={order.id}
              value={order.deliveryUrl ?? ''}
              saving={saving === order.id}
              onSave={(url) => updateOrder(order.id, { deliveryUrl: url })}
            />

            {/* Admin notes */}
            <AdminNotesRow
              orderId={order.id}
              value={order.adminNotes ?? ''}
              saving={saving === order.id}
              onSave={(notes) => updateOrder(order.id, { adminNotes: notes })}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

function DeliveryUrlRow({
  orderId,
  value,
  saving,
  onSave,
}: {
  orderId: string;
  value: string;
  saving: boolean;
  onSave: (v: string) => void;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-white/60 w-20 shrink-0">Delivery URL:</label>
      <input
        type="url"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://drive.google.com/..."
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-400"
      />
      <button
        onClick={() => onSave(val)}
        disabled={saving || val === value}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        Save
      </button>
    </div>
  );
}

function AdminNotesRow({
  orderId,
  value,
  saving,
  onSave,
}: {
  orderId: string;
  value: string;
  saving: boolean;
  onSave: (v: string) => void;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="flex items-start gap-3">
      <label className="text-sm text-white/60 w-20 shrink-0 pt-2">Notes:</label>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        placeholder="Internal notes, delivery details..."
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-400 resize-none"
      />
      <button
        onClick={() => onSave(val)}
        disabled={saving || val === value}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors mt-1"
      >
        Save
      </button>
    </div>
  );
}
