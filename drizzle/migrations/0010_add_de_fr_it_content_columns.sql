DO $$
DECLARE l text; c text;
BEGIN
  FOREACH l IN ARRAY ARRAY['de','fr','it'] LOOP
    FOREACH c IN ARRAY ARRAY['title','short_description','category','difficulty','meeting_point_address','meta_title','meta_description'] LOOP
      EXECUTE format('ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS %I text', c||'_'||l);
    END LOOP;
    FOREACH c IN ARRAY ARRAY['itinerary_json','included_json','highlights_json','faq_json'] LOOP
      EXECUTE format('ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS %I jsonb', c||'_'||l);
    END LOOP;
    FOREACH c IN ARRAY ARRAY['title','excerpt','content'] LOOP
      EXECUTE format('ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS %I text', c||'_'||l);
    END LOOP;
  END LOOP;
END $$;