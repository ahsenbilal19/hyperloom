"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { money } from "@/lib/format";

export default function Admin() {
  const { session, role, loading } = useAuth();
  const [d, setD] = useState(null);
  const [edits, setEdits] = useState({});
  const [msg, setMsg] = useState("");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` };

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/summary", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (r.ok) setD(await r.json());
  }, [session]);
  useEffect(() => { if (session && role === "admin") load(); }, [session, role, load]);

  async function save(p) {
    const e = edits[p.id] || {};
    const price = e.price !== undefined ? Math.round(parseFloat(e.price) * 100) : p.price_cents;
    const stock = e.stock !== undefined ? parseInt(e.stock, 10) : p.stock;
    const r = await fetch("/api/admin/products", { method: "PATCH", headers, body: JSON.stringify({ id: p.id, price_cents: price, stock }) });
    setMsg(r.ok ? `Saved ${p.name}` : (await r.json()).error);
    if (r.ok) { setEdits({ ...edits, [p.id]: undefined }); load(); }
  }

  if (loading || (session && role === null)) return <main className="p-20 text-center text-slate-500">Loading…</main>;
  if (role !== "admin") return <main className="p-20 text-center text-pink-300">Access denied. Admins only.</main>;
  if (!d) return <main className="p-20 text-center text-slate-500">Loading dashboard…</main>;

  const inp = "glass w-24 rounded-lg px-2 py-1 text-sm outline-none focus:border-cyan-400";
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="mb-8 text-3xl font-bold">Admin <span className="grad-text">dashboard</span></h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[["Orders", d.orderCount], ["Revenue", money(d.revenue)], ["Low stock (<25)", d.products.filter((p) => p.stock < 25).length]].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-slate-500">{k}</p><p className="mt-2 text-3xl font-bold text-cyan-300">{v}</p></div>
        ))}
      </div>
      {msg && <p className="mb-4 text-sm text-emerald-400">{msg}</p>}
      <h2 className="mb-3 text-lg font-semibold">Products</h2>
      <div className="glass mb-10 overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="p-3">Name</th><th>Category</th><th>Price ($)</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {d.products.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">{p.name}</td><td className="text-slate-400">{p.category}</td>
                <td><input className={inp} defaultValue={(p.price_cents / 100).toFixed(2)} onChange={(e) => setEdits({ ...edits, [p.id]: { ...edits[p.id], price: e.target.value } })} /></td>
                <td><input className={inp} defaultValue={p.stock} onChange={(e) => setEdits({ ...edits, [p.id]: { ...edits[p.id], stock: e.target.value } })} /></td>
                <td><button onClick={() => save(p)} className="rounded-full bg-cyan-500/20 px-4 py-1 text-cyan-200 hover:bg-cyan-500/30">Save</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="p-3">Order</th><th>Email</th><th>Date</th><th>Total</th></tr></thead>
          <tbody>
            {d.recent.map((o) => <tr key={o.id} className="border-t border-white/5"><td className="p-3 font-mono">#{o.id.slice(0, 8).toUpperCase()}</td><td>{o.email || "-"}</td><td className="text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td><td className="text-cyan-300">{money(o.total_cents)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </main>
  );
}