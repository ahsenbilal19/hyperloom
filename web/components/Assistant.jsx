"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Plus } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/format";

const SUGGEST = ["A gift under $100", "Best audio for focus", "Make my desk look futuristic"];

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Hi! I'm Loom, your AI shopping guide. Tell me what you're looking for." }]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const { add } = useCart();
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy, open]);

  async function send(text = q) {
    text = text.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next); setQ(""); setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }) });
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: r.ok ? j.answer : j.error, products: j.products || [] }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setBusy(false);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="AI assistant" className="fixed bottom-6 right-6 z-55 grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-cyan-400 to-violet-600 shadow-[0_0_35px_rgba(167,139,250,.6)] transition hover:scale-110">
        {open ? <X /> : <Sparkles />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass fixed bottom-24 right-6 z-55 flex h-135 w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl bg-[#080a18]/95">
            <div className="border-b border-white/10 px-5 py-4"><p className="font-semibold"><span className="grad-text">Loom</span> · AI shopping guide</p><p className="text-xs text-slate-500">Answers from our live catalog</p></div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <p className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-left text-sm ${m.role === "user" ? "bg-violet-600/60" : "glass"}`}>{m.content}</p>
                  {m.products?.map((p) => (
                    <div key={p.id} className="glass mt-2 flex items-center gap-3 rounded-2xl p-2.5 text-left">
                      <div className="w-14 shrink-0"><ProductVisual product={p} /></div>
                      <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p><p className="text-sm text-cyan-300">{money(p.price_cents)}</p>
                      </Link>
                      <button onClick={() => add(p)} disabled={p.stock <= 0} className="rounded-full bg-cyan-500/20 p-2 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40" aria-label="Add to cart"><Plus size={16} /></button>
                    </div>
                  ))}
                </div>
              ))}
              {busy && <p className="glass inline-block animate-pulse rounded-2xl px-4 py-2.5 text-sm text-slate-400">Loom is thinking…</p>}
              {msgs.length === 1 && <div className="flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-400 hover:text-cyan-200">{s}</button>)}</div>}
              <div ref={end} />
            </div>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={300} placeholder="Ask about products…" className="glass flex-1 rounded-full px-4 py-2.5 text-sm outline-none focus:border-cyan-400" />
              <button onClick={() => send()} disabled={busy} className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-r from-cyan-500 to-violet-600 disabled:opacity-50" aria-label="Send"><Send size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}