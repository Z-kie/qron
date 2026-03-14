import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return false;
  return req.headers.get('x-admin-key') === adminKey;
}

// GET — list all orders
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orders = await prisma.serviceOrder.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

// PATCH — update order status, deliveryUrl, or adminNotes
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, status, deliveryUrl, adminNotes } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'paid', 'in_progress', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updated = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        ...(status !== undefined && { status }),
        ...(deliveryUrl !== undefined && { deliveryUrl }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error('[admin/orders PATCH]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
