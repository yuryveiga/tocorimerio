REVOKE EXECUTE ON FUNCTION public.get_match_local_sold_count(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_match_local_sold_count(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_match_local_sold_counts(text[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_match_local_sold_counts(text[]) TO anon, authenticated;