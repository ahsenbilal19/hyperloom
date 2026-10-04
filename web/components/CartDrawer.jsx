"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import ProductVisual from "@/components/ProductVisual";
import { money } from "@/lib/format";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function checkout() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Checkout failed");
      window.location.href = j.url;
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside className="glass fixed right-0 top-0 z-70 flex h-full w-full max-w-md flex-col bg-[#080a18]/95 p-6" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Your cart</h2>
              <button onClick={() => setOpen(false)} aria-label="Close"><X /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {items.length === 0 && <p className="py-20 text-center text-slate-500">Your cart is empty.</p>}
              {items.map((i) => (
                <div key={i.id} className="glass flex items-center gap-4 rounded-2xl p-3">
                  <div className="w-16 shrink-0"><ProductVisual product={i} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    <p className="text-sm text-cyan-300">{money(i.price_cents)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.qty - 1)} className="glass rounded-full p-1"><Minus size={14} /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} className="glass rounded-full p-1"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-slate-500 hover:text-pink-400" aria-label="Remove"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="mb-4 flex justify-between text-lg"><span>Total</span><span className="font-bold text-cyan-300">{money(total)}</span></div>
              {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
              <button disabled={!items.length || busy} onClick={checkout} className="w-full rounded-full bg-linear-to-r from-cyan-500 to-violet-600 py-3.5 font-semibold disabled:opacity-40">{busy ? "Redirecting to Stripe…" : "Checkout securely"}</button>
              <p className="mt-3 text-center text-xs text-slate-500">Test mode · use card 4242 4242 4242 4242</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}