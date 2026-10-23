"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (!data.session) return setMsg("Account created. Check your email to confirm, then sign in.");
    router.push("/account");
  }

  const input = "glass w-full rounded-xl px-4 py-3 outline-none focus:border-cyan-400";
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-8">
        <h1 className="text-3xl font-bold">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {msg && <p className="text-sm text-amber-300">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-linear-to-r from-cyan-500 to-violet-600 py-3 font-semibold disabled:opacity-50">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</button>
        <p className="text-center text-sm text-slate-400">
          {mode === "in" ? "New here?" : "Already have an account?"}{" "}
          <button type="button" className="text-cyan-300" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>{mode === "in" ? "Create an account" : "Sign in"}</button>
        </p>
      </form>
    </main>
  );
}