import { stripe } from "@/lib/stripe";
import { fulfillSession } from "@/lib/fulfill";

export const dynamic = "force-dynamic";

// Stripe calls this after every payment, even if the buyer closes the tab before the success page.
export async function POST(req) {
  const body = await req.text(); // raw body is required for signature verification
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Webhook signature error: ${e.message}`, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    try {
      await fulfillSession(event.data.object.id);
    } catch (e) {
      return new Response(`Fulfillment error: ${e.message}`, { status: 500 }); // Stripe will retry
    }
  }
  return Response.json({ received: true });
}