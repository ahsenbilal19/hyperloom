import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Truck, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductVisual from "@/components/ProductVisual";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { data: p } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/#shop" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"><ArrowLeft size={16} /> Back to shop</Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="glass rounded-3xl p-4"><ProductVisual product={p} /></div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{p.category}</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{p.name}</h1>
          <p className="mt-2 text-lg grad-text w-fit">{p.tagline}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <Star size={16} className="fill-amber-400 text-amber-400" /> {p.rating} · {p.review_count} reviews
          </div>
          <p className="mt-6 text-slate-300">{p.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="glass rounded-full px-3 py-1 text-xs text-slate-300">#{t}</span>)}</div>
          <div className="mt-8 flex items-end gap-3">
            <span className="text-4xl font-bold text-cyan-300">{money(p.price_cents)}</span>
            {p.compare_at_cents && <span className="pb-1 text-slate-500 line-through">{money(p.compare_at_cents)}</span>}
          </div>
          <p className={`mt-2 text-sm ${p.stock < 25 ? "text-amber-400" : "text-emerald-400"}`}>{p.stock < 25 ? `Only ${p.stock} left` : "In stock"}</p>
          <button className="mt-6 rounded-full bg-linear-to-r from-cyan-500 to-violet-600 px-8 py-4 font-semibold shadow-[0_0_40px_rgba(34,211,238,.3)] transition hover:scale-[1.03]">Add to cart</button>
          <div className="mt-8 flex gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2"><Truck size={16} /> Free shipping</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} /> 2-year warranty</span>
          </div>
        </div>
      </div>
    </main>
  );
}