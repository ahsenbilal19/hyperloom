import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUser(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data?.user || null;
}

export async function requireAdmin(req) {
  const user = await getUser(req);
  if (!user) return null;
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin" ? user : null;
}