import { prisma } from '@/lib/prisma';

interface OrdersPageProps {
  searchParams: { session_id?: string };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { session_id } = searchParams;

  // Fetch orders by session id (if coming from checkout success) or show all
  // In production you'd filter by authenticated user email
  let orders: Awaited<ReturnType<typeof prisma.serviceOrder.findMany>> = [];

  if (session_id) {
    orders = await prisma.serviceOrder.findMany({
      where: { stripeSessionId: session_id },
      orderBy: { createdAt: 'desc' },
    });
  }

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    paid: 'text-green-400 bg-green-400/10',
    in_progress: 'text-blue-400 bg-blue-400/10',
    delivered: 'text-purple-400 bg-purple-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold mb-2">My Orders</h1>
      <p className="text-white/60 mb-10">Track your service order status below.</p>

      {session_id && orders.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-5 py-4 rounded-xl mb-8">
          ⏳ Payment received — your order is being confirmed. Refresh in a moment.
        </div>
      )}

      {orders.length === 0 && !session_id && (
        <div className="text-white/40 text-center py-20">
          No orders yet.{' '}
          <a href="/services" className="text-purple-400 hover:underline">Browse services →</a>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">{order.serviceName}</h2>
                <p className="text-white/50 text-sm mt-1">
                  {order.customerEmail} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
                {order.deliveryUrl && (
                  <a
                    href={order.deliveryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 text-sm hover:underline mt-2 inline-block"
                  >
                    📦 Access Delivery →
                  </a>
                )}
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    statusColor[order.status] ?? 'text-white/50 bg-white/10'
                  }`}
                >
                  {order.status.replace('_', ' ')}
                </span>
                <p className="text-white/60 text-sm mt-2">
                  ${(order.priceAmount / 100).toLocaleString()} {order.currency.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
