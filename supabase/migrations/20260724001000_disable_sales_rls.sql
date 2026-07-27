-- Disable RLS on sales table and drop all related policies
-- Reason: allow unauthenticated users to update sales records (e.g. payment callbacks)

ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all"                ON public.sales;
DROP POLICY IF EXISTS "Anyone can submit booking" ON public.sales;
DROP POLICY IF EXISTS "Admins can manage sales"  ON public.sales;
