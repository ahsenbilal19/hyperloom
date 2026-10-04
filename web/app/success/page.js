import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ClearCart from "@/components/ClearCart";
import DownloadReceipt from "@/components/DownloadReceipt";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;
  let order = null, error = "";
  try {
    const s = await stripe.checkout.sessions.retrieve(session_id, { expand: ["line_items.data.price.product"] });
    if (s.payment_status !== "paid") throw new Error("Payment not completed.");
    const items = s.line_items.data.map((li) => ({
      product_id: li.price.product.metadata.product_id, name: li.description, qty: li.quantity, unit_price_cents: li.price.unit_amount,
    }));
    const { data, error: e } = await supabaseAdmin.rpc("place_order", { p_session: s.id, p_email: s.customer_details?.email || null, p_total: s.amount_total, p_items: items });
    if (e) throw new Error(e.message);
    order = {
      number: String(data).slice(0, 8).toUpperCase(), total: s.amount_total, email: s.customer_details?.email || "", items,
      date: new Date(s.created * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC",
    };
  } catch (e) { error = e.message; }

  if (error) return <main className="mx-auto max-w-xl px-5 py-24 text-center text-red-400">Something went wrong confirming your order: {error}</main>;

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <ClearCart />
      <div className="text-center">
        <CheckCircle2 size={60} className="mx-auto text-emerald-400" />
        <h1 className="mt-5 text-4xl font-bold">Order confirmed</h1>
        <p className="mt-2 text-slate-400">Thank you! Your payment was successful.</p>
      </div>

      <div className="glass mt-10 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-5">
          <span className="grad-text text-xl font-bold tracking-[0.25em]">HYPERLOOM</span>
          <span className="text-sm uppercase tracking-widest text-slate-500">Receipt</span>
        </div>
        <dl className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Order number</dt><dd className="font-mono">#{order.number}</dd></div>
          <div><dt className="text-slate-500">Date</dt><dd>{order.date}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd>{order.email || "-"}</dd></div>
          <div><dt className="text-slate-500">Payment method</dt><dd>Card · Stripe (test)</dd></div>
        </dl>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-500"><th className="py-2 font-medium">Item</th><th className="py-2 text-center font-medium">Qty</th><th className="py-2 text-right font-medium">Price</th><th className="py-2 text-right font-medium">Amount</th></tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.product_id} className="border-b border-white/5">
                <td className="py-3">{i.name}</td><td className="py-3 text-center">{i.qty}</td>
                <td className="py-3 text-right">{money(i.unit_price_cents)}</td><td className="py-3 text-right">{money(i.qty * i.unit_price_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-5 w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{money(order.total)}</span></div>
          <div className="flex justify-between text-slate-400"><span>Shipping</span><span>Free</span></div>
          <div className="flex justify-between text-slate-400"><span>Tax</span><span>$0.00</span></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold"><span>Total paid</span><span className="text-cyan-300">{money(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <DownloadReceipt order={order} />
        <Link href="/" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3 font-semibold">Keep shopping</Link>
      </div>
    </main>
  );
}