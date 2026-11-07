import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Confirms a paid Stripe session and records the order. Safe to call many times (idempotent).
export async function fulfillSession(sessionId) {
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items.data.price.product"] });
  if (s.payment_status !== "paid") throw new Error("Payment not completed.");
  const items = s.line_items.data.map((li) => ({
    product_id: li.price.product.metadata.product_id, name: li.description, qty: li.quantity, unit_price_cents: li.price.unit_amount,
  }));
  const { data, error } = await supabaseAdmin.rpc("place_order", {
    p_session: s.id, p_email: s.customer_details?.email || null, p_total: s.amount_total, p_items: items, p_user: s.client_reference_id || null,
  });
  if (error) throw new Error(error.message);
  return {
    number: String(data).slice(0, 8).toUpperCase(), total: s.amount_total, email: s.customer_details?.email || "", items,
    date: new Date(s.created * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC",
  };
}