DROP POLICY IF EXISTS "Anyone can submit booking" ON public.sales;
CREATE POLICY "Anyone can submit booking"
ON public.sales
FOR INSERT
TO public
WITH CHECK (true);