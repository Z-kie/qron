import { NextRequest, NextResponse } from 'next/server';
import { stripe, SERVICE_CATALOG } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { serviceId, promoCode } = await req.json();

    const service = SERVICE_CATALOG.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    if (!service.stripePriceId) {
      return NextResponse.json({ error: 'Price not configured for this service' }, { status: 500 });
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'https://qron.space';

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'payment',
      line_items: [
        {
          price: service.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services`,
      metadata: {
        serviceId: service.id,
        serviceName: service.name,
      },
    };

    if (promoCode) {
      // Look up promotion code by code string
      const promoCodes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
      if (promoCodes.data.length > 0) {
        sessionParams.discounts = [{ promotion_code: promoCodes.data[0].id }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[checkout]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
