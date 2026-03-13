import Stripe from "stripe";

// Only initialize Stripe if the secret key is available
// During build time, this may not be set
export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key);
}

export const stripe = getStripeClient();

// Coin packages - AED pricing (stored in fils: 1 AED = 100 fils)
export const COIN_PACKAGES = [
  { id: "starter", coins: 500, bonusCoins: 0, priceAed: 1800, popular: false },
  { id: "popular", coins: 1200, bonusCoins: 200, priceAed: 3700, popular: true },
  { id: "best-value", coins: 3500, bonusCoins: 500, priceAed: 9200, popular: false },
  { id: "whale", coins: 10000, bonusCoins: 2000, priceAed: 18400, popular: false },
] as const;

export function formatAed(fils: number): string {
  const aed = fils / 100;
  return `AED ${aed % 1 === 0 ? aed.toFixed(0) : aed.toFixed(2)}`;
}
