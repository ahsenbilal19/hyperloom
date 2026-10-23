import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/serverAuth";

export async function PATCH(req) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id, price_cents, stock } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !Number.isInteger(price_cents) || price_cents <= 0 || !Number.isInteger(stock) || stock < 0)
    return Response.json({ error: "Invalid values." }, { status: 400 });
  const { error } = await supabaseAdmin.from("products").update({ price_cents, stock }).eq("id", id);
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true });
}