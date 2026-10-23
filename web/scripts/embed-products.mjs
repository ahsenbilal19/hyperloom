// Run: node --env-file=.env.local scripts/embed-products.mjs
// Re-run whenever product text changes.
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const MODEL = process.env.EMBED_MODEL || "gemini-embedding-001";

async function embed(text) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ model: `models/${MODEL}`, content: { parts: [{ text }] }, taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 }),
    });
    if (r.ok) return (await r.json()).embedding.values;
    console.log(`  retry (${r.status}): ${(await r.text()).slice(0, 150)}`);
    await new Promise((res) => setTimeout(res, 1500 * (a + 1)));
  }
  throw new Error("Embedding failed");
}

const { data: products, error } = await sb.from("products").select("*");
if (error) throw error;
for (const p of products) {
  const text = `${p.name}. ${p.tagline}. ${p.description} Category: ${p.category}. Tags: ${p.tags.join(", ")}. Price: $${(p.price_cents / 100).toFixed(2)}.`;
  const { error: e } = await sb.from("products").update({ embedding: await embed(text) }).eq("id", p.id);
  if (e) throw e;
  console.log("embedded:", p.name);
}
console.log("Done.");