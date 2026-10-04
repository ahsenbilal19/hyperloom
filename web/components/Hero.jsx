"use client";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const rise = (d) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d } });

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-24 text-center">
      <motion.div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 7 }} />
      <motion.div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 9 }} />
      <motion.p {...rise(0)} className="relative mb-4 text-xs uppercase tracking-[0.4em] text-cyan-300">New drop · 2026</motion.p>
      <motion.h1 {...rise(0.15)} className="relative text-5xl font-bold leading-tight md:text-7xl">
        Gear from the <span className="grad-text">next decade</span>
      </motion.h1>
      <motion.p {...rise(0.3)} className="relative mx-auto mt-6 max-w-xl" style={{ color: "var(--muted)" }}>
        Wearables, audio, desk setups and smart lighting, engineered for people who live ahead of the curve.
      </motion.p>
      <motion.a {...rise(0.45)} href="#shop" className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-violet-600 px-8 py-3.5 font-semibold shadow-[0_0_40px_rgba(34,211,238,.35)] transition hover:scale-105">
        Shop the collection <ArrowDown size={18} />
      </motion.a>
    </section>
  );
}