-- SEO update: best-favela-tour-in-rocinha-for-cultural-immersion
-- Title tag, Meta description, focus keywords, tags and image alt text

UPDATE public.blog_posts
SET
  title             = 'Best Favela Tour in Rocinha for Cultural Immersion',
  meta_description  = 'Not every Rocinha tour offers real cultural immersion. Here''s what separates a genuinely community-led experience from a superficial one.',
  meta_keywords     = 'best favela tour Rocinha cultural immersion, melhor tour na Rocinha para imersão cultural, rocinha favela tour, favela walking tour rio, community led tour rocinha, rio de janeiro favela tour',
  tags              = ARRAY['Rocinha', 'Cultural Tours', 'Rio de Janeiro Guide', 'Travel Tips'],
  featured_image_alt = 'Local guide leading a small walking tour through the Rocinha community in Rio de Janeiro'
WHERE slug = 'best-favela-tour-in-rocinha-for-cultural-immersion';
