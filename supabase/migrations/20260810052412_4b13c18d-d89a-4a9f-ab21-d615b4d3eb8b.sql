CREATE TABLE public.email_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  language text,
  source_slug text,
  source_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX email_leads_email_key ON public.email_leads (lower(email));

GRANT INSERT ON public.email_leads TO anon;
GRANT SELECT, INSERT, DELETE ON public.email_leads TO authenticated;
GRANT ALL ON public.email_leads TO service_role;

ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
ON public.email_leads FOR INSERT TO anon, authenticated
WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255 AND (name IS NULL OR length(name) <= 120));

CREATE POLICY "Admins can view leads"
ON public.email_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.email_leads FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));