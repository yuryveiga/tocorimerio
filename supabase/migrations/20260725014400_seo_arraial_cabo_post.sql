-- SEO update: best-boat-tours-in-arraial-do-cabo-for-crystal-clear-beaches
-- Title tag, Meta description, focus keywords, tags and image alt text

UPDATE public.blog_posts
SET
  title             = 'Best Boat Tours in Arraial do Cabo for Crystal-Clear Beaches',
  meta_description  = 'Arraial do Cabo''s turquoise water is best seen by boat. Here''s which stops matter most, how to choose a tour, and how to plan the day trip from Rio.',
  meta_keywords     = 'best boat tours Arraial do Cabo crystal clear beaches, melhores passeios de barco em Arraial do Cabo para ver as praias cristalinas, arraial do cabo boat tour, arraial do cabo day trip, rio de janeiro to arraial do cabo',
  tags              = ARRAY['Boat Tours', 'Day Trips from Rio', 'Rio de Janeiro Guide', 'Travel Tips'],
  featured_image_alt = 'Schooner boat tour over turquoise water near Praia do Farol in Arraial do Cabo'
WHERE slug = 'best-boat-tours-in-arraial-do-cabo-for-crystal-clear-beaches';
