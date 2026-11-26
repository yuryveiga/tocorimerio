/** Exact-input reuse only; changing prompts, models or languages invalidates the key. */
export async function translationKey(input: unknown): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(input)));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

type CacheStore = {
  read: (key: string) => Promise<unknown | null>;
  write: (key: string, value: unknown) => Promise<void>;
};

export async function reuseTranslation<T>(store: CacheStore, input: unknown, generate: () => Promise<T>, valid: (value: unknown) => value is T): Promise<T> {
  const key = await translationKey(input);
  // Cache outages must not disable translation. Only validated results are saved.
  let cached: unknown;
  try { cached = await store.read(key); } catch { cached = null; }
  if (valid(cached)) return cached;
  const value = await generate();
  if (!valid(value)) throw new Error("Incomplete translation");
  try { await store.write(key, value); } catch { /* best-effort reuse */ }
  return value;
}

export function translationStore(db: any): CacheStore {
  return {
    async read(key) {
      const { data } = await db.from("ai_translation_cache").select("result").eq("cache_key", key).maybeSingle();
      return data?.result ?? null;
    },
    async write(key, result) {
      await db.from("ai_translation_cache").upsert({ cache_key: key, result }, { onConflict: "cache_key" });
    },
  };
}