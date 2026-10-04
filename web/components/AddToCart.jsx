"use client";
import { useCart } from "@/components/CartProvider";

export default function AddToCart({ product }) {
  const { add } = useCart();
  const out = product.stock <= 0;
  return (
    <button disabled={out} onClick={() => add(product)} className="mt-6 rounded-full bg-linear-to-r from-cyan-500 to-violet-600 px-8 py-4 font-semibold shadow-[0_0_40px_rgba(34,211,238,.3)] transition hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100">
      {out ? "Sold out" : "Add to cart"}
    </button>
  );
}