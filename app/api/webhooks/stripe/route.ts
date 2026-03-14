import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Disable body parsing — Stripe requires the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('[stripe-webhook] Missing signature or secret');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('[stripe-webhook] Verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await prisma.serviceOrder.upsert({
        where: { stripeSessionId: session.id },
        create: {
          stripeSessionId: session.id,
          stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          serviceId: session.metadata?.serviceId ?? 'unknown',
          serviceName: session.metadata?.serviceName ?? 'Unknown Service',
          priceAmount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          customerEmail: session.customer_details?.email ?? null,
          customerName: session.customer_details?.name ?? null,
          status: 'paid',
          metadata: session.metadata as Record<string, string>,
        },
        update: {
          status: 'paid',
          stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          customerEmail: session.customer_details?.email ?? undefined,
          customerName: session.customer_details?.name ?? undefined,
        },
      });

      console.log(`[stripe-webhook] Order upserted for session ${session.id}`);
    } catch (dbErr) {
      console.error('[stripe-webhook] DB error:', dbErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
