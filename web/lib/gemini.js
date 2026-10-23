const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// POST with a timeout; network failures become a fake response so they can be retried and reported clearly
async function request(url, body) {
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
  } catch (e) {
    const detail = `${e.name}: ${e.message}${e.cause?.code ? ` (${e.cause.code})` : ""}`;
    return { ok: false, status: 0, text: async () => detail };
  }
}

// tries each model, retrying when Google is overloaded (429/500/503) or the network hiccups
async function withRetry(models, call) {
  let last = "";
  for (const m of models) {
    for (let a = 0; a < 2; a++) {
      const res = await call(m);
      if (res.ok) return res.json();
      last = `Gemini ${res.status || "network error"} (${m}): ${(await res.text()).slice(0, 160)}`;
      if (![0, 429, 500, 503].includes(res.status)) throw new Error(last);
      await sleep(1000 * (a + 1));
    }
  }
  throw new Error(last);
}

export async function embed(text, taskType = "RETRIEVAL_QUERY") {
  const model = process.env.EMBED_MODEL || "gemini-embedding-001";
  const d = await withRetry([model], (m) =>
    request(`${BASE}/${m}:embedContent`, { model: `models/${m}`, content: { parts: [{ text }] }, taskType, outputDimensionality: 768 })
  );
  return d.embedding.values;
}

export async function generateJson(system, contents) {
  const models = [process.env.GEMINI_MODEL || "gemini-3.8-flash", process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash"];
  const d = await withRetry(models, (m) =>
    request(`${BASE}/${m}:generateContent`, { systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.4, responseMimeType: "application/json" } })
  );
  const text = d.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}