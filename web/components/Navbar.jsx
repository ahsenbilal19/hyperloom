import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-bold tracking-[0.25em]"><span className="grad-text">HYPERLOOM</span></Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#shop" className="hover:text-cyan-300 transition">Shop</Link>
          <button className="glass relative rounded-full p-2.5 hover:border-cyan-400 transition" aria-label="Cart">
            <ShoppingBag size={18} />
          </button>
        </div>
      </nav>
    </header>
  );
}