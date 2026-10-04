"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("hl_cart") || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("hl_cart", JSON.stringify(items)); }, [items, ready]);

  const clamp = (qty, stock) => Math.max(0, Math.min(qty, stock, 10));
  const add = (p) => {
    setItems((prev) => {
      const f = prev.find((i) => i.id === p.id);
      if (f) return prev.map((i) => (i.id === p.id ? { ...i, qty: clamp(i.qty + 1, i.stock) } : i));
      return [...prev, { id: p.id, slug: p.slug, name: p.name, price_cents: p.price_cents, stock: p.stock, category: p.category, accent: p.accent, accent2: p.accent2, qty: 1 }];
    });
    setOpen(true);
  };
  const setQty = (id, qty) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clamp(qty, i.stock) } : i)).filter((i) => i.qty > 0));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.price_cents, 0);

  return <Ctx.Provider value={{ items, open, setOpen, add, setQty, remove, clear, count, total }}>{children}</Ctx.Provider>;
}