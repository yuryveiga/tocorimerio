DROP FUNCTION IF EXISTS public.get_match_local_sold_count(text);
DROP FUNCTION IF EXISTS public.get_match_local_sold_counts(text[]);

CREATE OR REPLACE VIEW public.match_local_sold_counts AS
SELECT
  tour_id::text AS match_id,
  COALESCE(SUM(quantity), 0)::int AS sold_count
FROM public.sales
WHERE is_cancelled = false OR is_cancelled IS NULL
GROUP BY tour_id;

GRANT SELECT ON public.match_local_sold_counts TO anon;
GRANT SELECT ON public.match_local_sold_counts TO authenticated;
GRANT ALL ON public.match_local_sold_counts TO service_role;