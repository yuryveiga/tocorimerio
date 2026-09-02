DROP POLICY "Anyone can view active guides" ON public.guides;
CREATE POLICY "Public can view active guides" ON public.guides FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Users can view guides" ON public.guides FOR SELECT TO authenticated USING (is_active = true OR has_role(auth.uid(), 'admin'));