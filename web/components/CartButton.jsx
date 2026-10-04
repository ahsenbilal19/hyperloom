"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} className="glass relative rounded-full p-2.5 transition hover:border-cyan-400" aria-label="Open cart">
      <ShoppingBag size={18} />
      {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-pink-500 text-[11px] font-bold">{count}</span>}
    </button>
  );
}