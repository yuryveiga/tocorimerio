CREATE INDEX IF NOT EXISTS idx_tours_active_sort ON public.tours (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_pub_created ON public.blog_posts (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_desc ON public.sales (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_paid_archived_date ON public.sales (is_paid, is_archived, selected_date);