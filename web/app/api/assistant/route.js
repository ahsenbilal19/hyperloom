import { embed, generateJson } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const hits = (globalThis._asstHits ??= new Map());
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 15;
}

// vector search can't understand numbers, so budget limits are extracted and applied as a SQL filter
function priceFilter(text) {
  const num = (m) => (m ? Math.round(parseFloat(m[1]) * 100) : null);
  return {
    max: num(text.match(/(?:under|below|less than|cheaper than|max(?:imum)?|up to|within|<)\s*\$?\s*(\d+(?:\.\d+)?)/i) || text.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:or less|and under|budget)/i)),
    min: num(text.match(/(?:over|above|more than|at least|from)\s*\$?\s*(\d+(?:\.\d+)?)/i)),
  };
}

const SYSTEM = `You are Loom, the friendly AI shopping guide for Hyperloom, a futuristic tech & lifestyle gear store.
Use ONLY the products in the CATALOG below. Never invent products, prices or features.
Recommend 1-3 products that fit the request and mention price. If stock is low (under 25) say so. If nothing fits, say so honestly.
Reply ONLY with JSON: {"answer": "friendly plain-text reply, max 70 words", "slugs": ["slug-of-recommended-product"]}`;

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (limited(ip)) return Response.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });

  const { messages } = await req.json().catch(() => ({}));
  if (!Array.isArray(messages) || !messages.length) return Response.json({ error: "No message." }, { status: 400 });
  const clean = messages.slice(-6).map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: String(m.content || "").slice(0, 300) }));
  while (clean[0]?.role === "model") clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== "user") return Response.json({ error: "Ask a question." }, { status: 400 });

  try {
    // 1) retrieve: embed the user's recent questions and find the closest products
    const query = clean.filter((m) => m.role === "user").slice(-2).map((m) => m.text).join(" ");
    const lastUser = clean.filter((m) => m.role === "user").slice(-1)[0].text;
    const { max, min } = priceFilter(lastUser);
    const { data: found, error } = await supabaseAdmin.rpc("match_products", { query_embedding: await embed(query), match_count: 6, max_price: max, min_price: min });
    if (error) throw new Error(`Product search failed: ${error.message}`);

    // 2) augment + generate: the LLM answers only from the retrieved catalog rows
    const catalog = found.map((p) => `slug=${p.slug} | ${p.name} | ${p.category} | $${(p.price_cents / 100).toFixed(2)} | stock ${p.stock} | rating ${p.rating} | ${p.tagline}. ${p.description}`).join("\n");
    const out = await generateJson(`${SYSTEM}\n\n${max || min ? "NOTE: the catalog below is already filtered to the shopper's budget.\n" : ""}CATALOG:\n${catalog || "(no matching products)"}`, clean.map((m) => ({ role: m.role, parts: [{ text: m.text }] })));
    const slugs = (out.slugs || []).filter((s) => found.some((p) => p.slug === s)).slice(0, 3);
    return Response.json({ answer: String(out.answer || "Here is what I found."), products: slugs.map((s) => found.find((p) => p.slug === s)) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}