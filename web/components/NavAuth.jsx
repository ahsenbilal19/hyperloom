"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function NavAuth() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <>
      {role === "admin" && <Link href="/admin" className="text-pink-300 transition hover:text-pink-200">Admin</Link>}
      <Link href="/account" className="transition hover:text-cyan-300">Account</Link>
    </>
  ) : (
    <Link href="/login" className="transition hover:text-cyan-300">Sign in</Link>
  );
}