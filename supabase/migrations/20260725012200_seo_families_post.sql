-- SEO update: best-private-tours-in-rio-de-janeiro-for-families-with-children
-- Meta description, focus keywords, tags and image alt text

UPDATE public.blog_posts
SET
  meta_description  = 'Planning Rio de Janeiro with kids? See the best private family tours to Christ the Redeemer, Sugarloaf & more — flexible, safe, and kid-paced.',
  meta_keywords     = 'private tours Rio de Janeiro for families, melhores tours privados Rio de Janeiro para famílias com crianças, family travel rio de janeiro, private tours rio de janeiro, rio de janeiro guide, travel tips, tours for kids rio, family friendly tours rio',
  tags              = ARRAY['Family Travel', 'Private Tours', 'Rio de Janeiro Guide', 'Travel Tips'],
  featured_image_alt = 'Family with young children looking at Christ the Redeemer from a private tour van in Rio de Janeiro'
WHERE slug = 'best-private-tours-in-rio-de-janeiro-for-families-with-children';
