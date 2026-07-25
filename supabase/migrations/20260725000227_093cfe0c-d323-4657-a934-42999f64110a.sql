GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT INSERT ON public.sales TO anon;
GRANT ALL ON public.sales TO service_role;