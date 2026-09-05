DROP VIEW IF EXISTS public.match_local_sold_counts;

ALTER TABLE public.match_overrides ADD COLUMN IF NOT EXISTS sold_count_local integer DEFAULT 0;

CREATE OR REPLACE FUNCTION public.update_match_override_sold_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id uuid;
BEGIN
  BEGIN
    v_match_id := NEW.tour_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NEW;
  END;

  IF v_match_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND (NEW.is_cancelled = false OR NEW.is_cancelled IS NULL) THEN
    UPDATE public.match_overrides
    SET sold_count_local = COALESCE(sold_count_local, 0) + NEW.quantity
    WHERE match_id = v_match_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.is_cancelled = true OR OLD.is_cancelled IS NULL) AND NEW.is_cancelled = false THEN
      UPDATE public.match_overrides
      SET sold_count_local = COALESCE(sold_count_local, 0) + NEW.quantity
      WHERE match_id = v_match_id;
    ELSIF OLD.is_cancelled = false AND (NEW.is_cancelled = true OR NEW.is_cancelled IS NULL) THEN
      UPDATE public.match_overrides
      SET sold_count_local = GREATEST(0, COALESCE(sold_count_local, 0) - NEW.quantity)
      WHERE match_id = v_match_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sales_update_match_override_sold_count ON public.sales;
CREATE TRIGGER sales_update_match_override_sold_count
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_match_override_sold_count();

UPDATE public.match_overrides mo
SET sold_count_local = COALESCE(s.total, 0)
FROM (
  SELECT tour_id, SUM(quantity) as total
  FROM public.sales
  WHERE is_cancelled = false OR is_cancelled IS NULL
  GROUP BY tour_id
) s
WHERE mo.match_id = s.tour_id::uuid;