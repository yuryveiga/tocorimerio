-- Append missing Semrush keywords (no duplicates)
create or replace function pg_temp.append_kw(existing text, add_list text[]) returns text language sql as $$
  select nullif(trim(both ', ' from concat_ws(', ', existing, (
    select string_agg(k, ', ') from unnest(add_list) k
    where lower(coalesce(existing,'')) not like '%'||lower(k)||'%'
  ))), '')
$$;

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['rio de janeiro world cup','rio de janeiro brazil world cup','world cup 2026 rio de janeiro','where to watch world cup rio']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['copa do mundo rio de janeiro','copa do mundo 2026 rio','onde assistir copa do mundo no rio']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['mundial rio de janeiro','mundial 2026 rio','dónde ver el mundial en río'])
where slug = 'where-to-watch-the-2026-world-cup-in-rio';

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['what to wear in rio','what to wear in rio de janeiro','what to wear hiking rio']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['o que vestir no rio','o que levar para trilha no rio']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['qué ropa llevar a río','qué llevar a la playa en río'])
where slug = 'what-to-wear-hiking-and-beach-rio-de-janeiro';

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['is rocinha dangerous','is rocinha safe','is favela tour safe']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['rocinha é perigosa','favela tour é seguro']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['es peligrosa la rocinha','es seguro el tour por la favela'])
where slug = 'is-it-safe-to-do-a-favela-tour-in-rocinh';

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['money in rio de janeiro brazil','what is rio de janeiro currency','what is the currency in rio de janeiro','rio de janeiro currency']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['qual a moeda do rio de janeiro','dinheiro no rio de janeiro']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['cuál es la moneda de río de janeiro','dinero en río de janeiro'])
where slug = 'where-exchange-money';

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['rio ipanema','things to do in ipanema','ipanema rio de janeiro','ipanema beach tours']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['o que fazer em ipanema','ipanema rio de janeiro','passeios em ipanema']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['qué hacer en ipanema','ipanema río de janeiro','tours en ipanema'])
where slug = 'tours-in-ipanema';

update blog_posts set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['rooftop bars in rio de janeiro','best rooftop bars rio','rooftop rio de janeiro']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['rooftop bars no rio de janeiro','melhores rooftops do rio']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['bares en azoteas en río de janeiro','mejores rooftops de río'])
where slug = 'the-best-private-rooftops-and-views-in-rio-avoid-the-crowds';

update tours set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['tour favela rio','rocinha favela tour','favela tour rio de janeiro']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['tour favela rio','tour na rocinha','passeio na favela rio']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['tour favela río','tour en la rocinha'])
where slug = 'favela-rio-tour-rocinha';

update tours set
  meta_keywords = pg_temp.append_kw(meta_keywords, array['little africa rio','little africa rio de janeiro','pequena africa rio tour']),
  meta_keywords_pt = pg_temp.append_kw(meta_keywords_pt, array['pequena áfrica rio','pequena áfrica rio de janeiro','tour pequena áfrica']),
  meta_keywords_es = pg_temp.append_kw(meta_keywords_es, array['pequeña áfrica río','tour pequeña áfrica río de janeiro'])
where slug = 'pequena-frica-experience-hist-ria-cultura-e-resist-ncia-no-cora-o-do-rio';