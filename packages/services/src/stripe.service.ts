import Stripe from "stripe";
import { z } from "zod";
import {
  SubscriptionTier,
  BillingInterval,
  type Subscription,
  type CreateCheckoutSessionInput,
  TierLimits,
} from "@promptos/contracts";

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"] ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
});

const PriceMap: Record<SubscriptionTier, Record<BillingInterval, string>> = {
  [SubscriptionTier.FREE]: {
    monthly: "",
    yearly: "",
  },
  [SubscriptionTier.PRO]: {
    monthly: process.env["STRIPE_PRICE_PRO_MONTHLY"] ?? "",
    yearly: process.env["STRIPE_PRICE_PRO_YEARLY"] ?? "",
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthly: process.env["STRIPE_PRICE_ENTERPRISE_MONTHLY"] ?? "",
    yearly: process.env["STRIPE_PRICE_ENTERPRISE_YEARLY"] ?? "",
  },
};

export class StripeService {
  async createCustomer(userId: string, email: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    return customer.id;
  }

  async createCheckoutSession(
    userId: string,
    customerId: string,
    input: CreateCheckoutSessionInput
  ): Promise<string> {
    const priceId = PriceMap[input.tier][input.interval];
    if (!priceId) throw new Error(`No price configured for ${input.tier} ${input.interval}`);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${input.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: input.cancelUrl,
      metadata: { userId, tier: input.tier },
      subscription_data: { metadata: { userId, tier: input.tier } },
    });

    if (!session.url) throw new Error("Failed to create checkout session URL");
    return session.url;
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructWebhookEvent(payload: string | Buffer, sig: string): Promise<Stripe.Event> {
    const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";
    return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          action: "subscription_created",
          userId: session.metadata?.["userId"] ?? "",
          subscriptionId: session.subscription as string,
          tier: (session.metadata?.["tier"] as SubscriptionTier) ?? SubscriptionTier.FREE,
        };
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const tier = this.getTierFromPriceId(sub.items.data[0]?.price.id ?? "");
        return {
          action: "subscription_updated",
          userId: sub.metadata?.["userId"] ?? "",
          subscriptionId: sub.id,
          tier,
          status: sub.status,
        };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          action: "subscription_canceled",
          userId: sub.metadata?.["userId"] ?? "",
          subscriptionId: sub.id,
          tier: SubscriptionTier.FREE,
        };
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        return {
          action: "payment_failed",
          userId: invoice.customer_email ?? "",
          subscriptionId: invoice.subscription as string,
        };
      }
      default:
        return { action: "unhandled", eventType: event.type };
    }
  }

  private getTierFromPriceId(priceId: string): SubscriptionTier {
    for (const [tier, intervals] of Object.entries(PriceMap)) {
      if (Object.values(intervals).includes(priceId)) {
        return tier as SubscriptionTier;
      }
    }
    return SubscriptionTier.FREE;
  }

  async getRateLimitForTier(tier: SubscriptionTier): Promise<{ requests: number; windowSeconds: number }> {
    return TierLimits[tier].rateLimit;
  }
}

export interface WebhookResult {
  action: string;
  userId?: string;
  subscriptionId?: string;
  tier?: SubscriptionTier;
  status?: string;
  eventType?: string;
}

export const stripeService = new StripeService();
