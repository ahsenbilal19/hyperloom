import Link from "next/link";
import CartButton from "@/components/CartButton";

export default function Navbar() {
  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-xl font-bold tracking-[0.25em]"><span className="grad-text">HYPERLOOM</span></Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#shop" className="transition hover:text-cyan-300">Shop</Link>
          <CartButton />
        </div>
      </nav>
    </header>
  );
}