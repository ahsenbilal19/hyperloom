"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Ctx = createContext({});
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); return; }
    supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle().then(({ data }) => setRole(data?.role || "customer"));
  }, [session?.user?.id]); // eslint-disable-line

  return <Ctx.Provider value={{ session, user: session?.user, role, loading, signOut: () => supabase.auth.signOut() }}>{children}</Ctx.Provider>;
}