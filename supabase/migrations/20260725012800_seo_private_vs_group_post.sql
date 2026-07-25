-- SEO update: private-tours-vs-group-tours-in-rio-de-janeiro-which-is-worth-it
-- Title tag, Meta description, focus keywords, tags and image alt text

UPDATE public.blog_posts
SET
  title             = 'Private Tours vs. Group Tours in Rio de Janeiro: Which Is Worth It?',
  meta_description  = 'Private or group tour in Rio de Janeiro? A clear, honest comparison of cost, flexibility, and experience to help you pick the right one for your trip.',
  meta_keywords     = 'private tours vs group tours Rio de Janeiro, tours privados no Rio de Janeiro valem mais a pena do que passeios em grupo, private tour vs group tour, rio de janeiro tours, best way to see rio de janeiro',
  tags              = ARRAY['Travel Tips', 'Private Tours', 'Rio de Janeiro Guide'],
  featured_image_alt = 'Small private tour group versus large tour bus group at Christ the Redeemer in Rio de Janeiro'
WHERE slug = 'private-tours-vs-group-tours-in-rio-de-janeiro-which-is-worth-it';
