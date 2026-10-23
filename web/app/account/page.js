"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import DownloadReceipt from "@/components/DownloadReceipt";
import { money } from "@/lib/format";

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id,total_cents,email,created_at,order_items(name,qty,unit_price_cents)").order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
  }, [user]);

  if (!user) return <main className="p-20 text-center text-slate-500">Loading…</main>;
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">My orders</h1><p className="text-slate-400">{user.email}</p></div>
        <button onClick={async () => { await signOut(); router.push("/"); }} className="glass rounded-full px-5 py-2 text-sm hover:border-pink-400">Sign out</button>
      </div>
      {orders === null && <p className="text-slate-500">Loading orders…</p>}
      {orders?.length === 0 && <p className="text-slate-500">No orders yet. Go find some gear!</p>}
      <div className="space-y-5">
        {orders?.map((o) => {
          const receipt = { number: o.id.slice(0, 8).toUpperCase(), total: o.total_cents, email: o.email, items: o.order_items, date: new Date(o.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) };
          return (
            <div key={o.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-mono">#{receipt.number}</span><span className="text-slate-400">{receipt.date}</span></div>
              <ul className="my-3 space-y-1 text-sm text-slate-300">{o.order_items.map((i, k) => <li key={k}>{i.qty} × {i.name}</li>)}</ul>
              <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-bold text-cyan-300">{money(o.total_cents)}</span><DownloadReceipt order={receipt} /></div>
            </div>
          );
        })}
      </div>
    </main>
  );
}