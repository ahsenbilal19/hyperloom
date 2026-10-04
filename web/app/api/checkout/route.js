import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { items } = await req.json().catch(() => ({}));
  const valid = Array.isArray(items) && items.length > 0 && items.length <= 20 &&
    items.every((i) => typeof i.id === "string" && Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= 10);
  if (!valid) return Response.json({ error: "Invalid cart." }, { status: 400 });

  // prices and stock always come from the database, never from the browser
  const { data: products, error } = await supabaseAdmin.from("products").select("id,name,tagline,price_cents,stock").in("id", items.map((i) => i.id));
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const line_items = [];
  for (const i of items) {
    const p = products.find((x) => x.id === i.id);
    if (!p) return Response.json({ error: "A product in your cart no longer exists." }, { status: 400 });
    if (p.stock < i.qty) return Response.json({ error: `Only ${p.stock} left of ${p.name}.` }, { status: 400 });
    line_items.push({
      quantity: i.qty,
      price_data: { currency: "usd", unit_amount: p.price_cents, product_data: { name: p.name, description: p.tagline || undefined, metadata: { product_id: p.id } } },
    });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}