import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const [o, p] = await Promise.all([
    supabaseAdmin.from("orders").select("id,email,total_cents,created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("products").select("id,name,category,price_cents,stock").order("name"),
  ]);
  const orders = o.data || [];
  return Response.json({
    orderCount: orders.length,
    revenue: orders.reduce((n, x) => n + x.total_cents, 0),
    recent: orders.slice(0, 15),
    products: p.data || [],
  });
}