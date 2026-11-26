CREATE TABLE public.ai_translation_cache (cache_key text PRIMARY KEY CHECK (length(cache_key) = 64), result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_translation_cache TO service_role;
REVOKE ALL ON public.ai_translation_cache FROM anon, authenticated;
ALTER TABLE public.ai_translation_cache ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_translation_cache IS 'Service-only exact-input AI translation reuse; no public or authenticated policies.';