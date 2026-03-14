import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Service catalog — keep in sync with your Stripe Dashboard products
export const SERVICE_CATALOG = [
  {
    id: 'qr-starter',
    name: 'QR Starter Pack',
    description: 'AI-generated QR art for 1 product. Perfect for testing.',
    price: 9900,          // $99 in cents
    stripePriceId: process.env.STRIPE_PRICE_QR_STARTER ?? '',
    features: ['1 AI QR art design', 'Blockchain hash', 'PNG + SVG download'],
  },
  {
    id: 'qr-brand',
    name: 'QR Brand Bundle',
    description: '5 unique QR designs with brand colours and logo embed.',
    price: 29900,         // $299
    stripePriceId: process.env.STRIPE_PRICE_QR_BRAND ?? '',
    features: ['5 AI QR art designs', 'Logo integration', 'Blockchain batch hash', 'PDF catalog'],
  },
  {
    id: 'authichain-basic',
    name: 'AuthiChain Basic',
    description: 'Blockchain product authentication for up to 50 SKUs.',
    price: 49900,         // $499
    stripePriceId: process.env.STRIPE_PRICE_AUTHICHAIN_BASIC ?? '',
    features: ['50 authenticated SKUs', 'QR scan tracking', 'Verification dashboard', 'API access'],
  },
  {
    id: 'authichain-pro',
    name: 'AuthiChain Pro',
    description: 'Full supply chain verification for up to 500 SKUs.',
    price: 99900,         // $999
    stripePriceId: process.env.STRIPE_PRICE_AUTHICHAIN_PRO ?? '',
    features: ['500 authenticated SKUs', 'Advanced analytics', 'Webhook automation', 'Priority support'],
  },
  {
    id: 'enterprise-setup',
    name: 'Enterprise Setup',
    description: 'White-glove onboarding with custom integration.',
    price: 150000,        // $1,500
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_SETUP ?? '',
    features: ['Unlimited SKUs', 'Custom branding', 'Dedicated account manager', 'SLA guarantee'],
  },
  {
    id: 'enterprise-annual',
    name: 'Enterprise Annual',
    description: 'Full platform access for 12 months — best value.',
    price: 250000,        // $2,500
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
    features: ['Everything in Enterprise Setup', '12-month access', 'Quarterly reviews', 'Early feature access'],
  },
];
