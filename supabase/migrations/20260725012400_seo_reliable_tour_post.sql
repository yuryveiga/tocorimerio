-- SEO update: how-to-choose-a-reliable-private-tour-in-rio-de-janeiro
-- Title tag, Meta description, focus keywords, tags and image alt text

UPDATE public.blog_posts
SET
  title             = 'How to Choose a Reliable Private Tour in Rio de Janeiro',
  meta_description  = 'Not sure which Rio de Janeiro tour operator to trust? Here''s how to spot a reliable private guide — licensing, reviews, pricing, and red flags to avoid.',
  meta_keywords     = 'reliable private tour Rio de Janeiro, como escolher um tour privado confiável no Rio de Janeiro, travel tips rio, private guides rio de janeiro, safety rio de janeiro tours, best tour operators rio',
  tags              = ARRAY['Travel Tips', 'Private Tours', 'Rio de Janeiro Guide', 'Safety'],
  featured_image_alt = 'Licensed private tour guide greeting tourists outside a hotel in Rio de Janeiro'
WHERE slug = 'how-to-choose-a-reliable-private-tour-in-rio-de-janeiro';
