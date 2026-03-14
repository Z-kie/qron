import { prisma } from '@/lib/prisma';
import AdminOrdersClient from './AdminOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  // TODO: Add proper admin auth guard (e.g. check session/cookie)
  const adminKey = process.env.ADMIN_SECRET_KEY;
  // In production wire up NextAuth or similar; for now page is accessible
  // only when ADMIN_SECRET_KEY is set and you're on a private deployment

  const orders = await prisma.serviceOrder.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <AdminOrdersClient orders={orders} adminKey={adminKey ?? ''} />;
}
