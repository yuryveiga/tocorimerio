CREATE OR REPLACE FUNCTION public.count_recent_bookings(_tour_id text, _days integer DEFAULT 7)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN EXISTS (SELECT 1 FROM public.tours t WHERE t.id::text = _tour_id AND t.is_active IS TRUE) THEN (
    SELECT COUNT(*)::int FROM public.sales
    WHERE tour_id = _tour_id
      AND is_cancelled = false
      AND created_at >= now() - (LEAST(GREATEST(COALESCE(_days, 7), 1), 7) || ' days')::interval
  ) ELSE 0 END;
$function$;