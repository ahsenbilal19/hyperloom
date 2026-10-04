"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";
import { money } from "@/lib/format";

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.review_count - a.review_count,
  low: (a, b) => a.price_cents - b.price_cents,
  high: (a, b) => b.price_cents - a.price_cents,
  rating: (a, b) => b.rating - a.rating,
};

export default function Storefront({ products }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const cats = ["All", ...new Set(products.map((p) => p.category))];

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return products
      .filter((p) => (cat === "All" || p.category === cat) && (!s || `${p.name} ${p.tagline} ${p.tags.join(" ")}`.toLowerCase().includes(s)))
      .sort(SORTS[sort]);
  }, [products, cat, q, sort]);

  return (
    <section id="shop" className="mx-auto max-w-6xl px-5 pb-20">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm transition ${cat === c ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{c}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-3">
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search gear…" className="w-36 bg-transparent text-sm outline-none" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="glass rounded-full px-4 py-2 text-sm outline-none">
            <option value="featured" className="bg-slate-900">Featured</option>
            <option value="low" className="bg-slate-900">Price: low to high</option>
            <option value="high" className="bg-slate-900">Price: high to low</option>
            <option value="rating" className="bg-slate-900">Top rated</option>
          </select>
        </div>
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -8 }} transition={{ duration: 0.35 }}>
              <Link href={`/product/${p.slug}`} className="glass card-hover block rounded-3xl p-3">
                <div className="relative">
                  <ProductVisual product={p} />
                  {p.compare_at_cents && (
                    <span className="absolute left-3 top-3 rounded-full bg-pink-500/90 px-2.5 py-1 text-xs font-semibold">-{Math.round((1 - p.price_cents / p.compare_at_cents) * 100)}%</span>
                  )}
                </div>
                <div className="px-2 pb-2 pt-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{p.category}</p>
                  <h3 className="mt-1 font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{p.tagline}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{money(p.price_cents)}</span>
                    <span className="flex items-center gap-1 text-sm text-slate-400"><Star size={14} className="fill-amber-400 text-amber-400" />{p.rating}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-slate-500">No products match your search.</p>}
    </section>
  );
}