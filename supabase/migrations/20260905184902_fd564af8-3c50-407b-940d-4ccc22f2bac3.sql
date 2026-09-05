REVOKE EXECUTE ON FUNCTION public.update_match_override_sold_count() FROM public;
REVOKE EXECUTE ON FUNCTION public.update_match_override_sold_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_match_override_sold_count() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_match_override_sold_count() TO service_role;