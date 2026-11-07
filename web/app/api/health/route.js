// Temporary diagnostic: shows which env vars exist (never their values) and whether Supabase is reachable.
export const dynamic = "force-dynamic";

export async function GET() {
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "GEMINI_API_KEY", "GEMINI_MODEL", "EMBED_MODEL"];
  const env = Object.fromEntries(keys.map((k) => [k, process.env[k] ? "set" : "MISSING"]));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  let supabase = "no url set";
  if (url) {
    try {
      const r = await fetch(`${url}/auth/v1/health`, { signal: AbortSignal.timeout(8000), headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "" } });
      supabase = `reachable, HTTP ${r.status}`;
    } catch (e) {
      supabase = `FAILED: ${e.name}: ${e.message}${e.cause?.code ? ` (${e.cause.code})` : ""}`;
    }
  }
  return Response.json({ env, urlFormatOk: /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url), supabase });
}