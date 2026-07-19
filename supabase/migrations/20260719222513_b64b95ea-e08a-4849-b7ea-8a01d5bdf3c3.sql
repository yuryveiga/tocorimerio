
CREATE OR REPLACE FUNCTION public.merge_kw(existing text, additions text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  arr text[]; seen text[] := ARRAY[]::text[]; result text[] := ARRAY[]::text[];
  item text; norm text;
BEGIN
  arr := string_to_array(coalesce(existing,'') || ',' || coalesce(additions,''), ',');
  FOREACH item IN ARRAY arr LOOP
    item := btrim(item);
    IF item = '' THEN CONTINUE; END IF;
    norm := lower(item);
    IF norm = ANY(seen) THEN CONTINUE; END IF;
    seen := seen || norm;
    result := result || item;
  END LOOP;
  RETURN array_to_string(result, ', ');
END; $$;

-- BLOG POSTS
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'o que é carioca, o''que é carioca, o carioca, carioca é quem nasce onde, quem é carioca, carioca é de onde, o''que significa rio') WHERE slug='authentic-rio-experiences-live-like-a-carioca';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'melhores lugares rio de janeiro') WHERE slug='best-coffee-shops-in-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'comida típica do rj, doces típicos do brasil, 5 doces típicos do folclore brasileiro, doce tipico do brasil, brazilian pastries, doce do brasil, doces no brasil, brazil drink, brazilian beverages, brazilian drinks') WHERE slug='best-feijoada-rio-de-janeiro-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol no rio de janeiro, por do sol arpoador hoje, sunset points, arpoador rock, por do sol no arpoador rio de janeiro, morro do vidigal vista, mirante da dona marta') WHERE slug='best-sunset-spots-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, melhores lugares rio de janeiro, 10 pontos turísticos do rio de janeiro, christ the redeemer train, sugarloaf tickets, cristo redentor tours') WHERE slug='best-tours-in-rio-de-janeiro-for-3-days';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'qual a praia mais bonita do rio de janeiro, beach rio de janeiro, melhores praias do rio') WHERE slug='beyond-the-beach-discovering-rios-hidden-gems-by-sea';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, spa copacabana') WHERE slug='boutique-hotels-rio-rooftops-vista-privada';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'samba in brazil, samba show, brazil samba, sambas no rio, samba domingo rio de janeiro') WHERE slug='carnaval-rio-guia-definitivo';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'christ redeemer train, christ the redeemer train, rio de janeiro christ the redeemer, cristo redentor tours, tour cristo redentor, corcovado train station, pao de acucar e cristo') WHERE slug='christ-the-redeemer-without-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'public transportation, precisa de visto para entrar no brasil, para entrar no brasil precisa de visto') WHERE slug='dicas-seguranca-transporte-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio') WHERE slug='ecotourism-tijuca-forest-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'comida típica do rj, doces típicos do brasil, 5 doces típicos do folclore brasileiro, doce tipico do brasil, brazilian pastries, doce do brasil, doces no brasil, brazil drink, brazilian beverages, brazilian drinks') WHERE slug='gastronomia-carioca-pratos-tipicos';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sugarloaf tickets, sugar loaf ticket, sugarloaf cable car tickets, sugarloaf cable car ticket, cristo redentor tours, pao de acucar e cristo, tour cristo redentor') WHERE slug='helicopter-tour-rio-de-janeiro-routes-prices-what-to-expect';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj, trilha no vidigal, morro do vidigal vista') WHERE slug='hiking-in-rio-a-premium-guide-to-tijuca-forest';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cristo redentor tours, tour cristo redentor, sugarloaf tickets, sugarloaf cable car tickets, christ the redeemer train') WHERE slug='how-much-does-a-city-tour-in-rio-de-jane';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, brazilian matches, brazil next match, brazil next games, maracana hoje jogo, soccer stadium') WHERE slug='how-to-buy-maracana-tickets-as-a-foreigner';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro') WHERE slug='how-to-find-a-trustworthy-tour-guide-in-rio-de-janeiro-scam-free';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, brazilian matches, brazil next match, brazil next games, maracana hoje jogo, soccer stadium') WHERE slug='how-to-get-tickets-for-maracana-the-comp';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'public transportation, corcovado train station') WHERE slug='how-to-get-to-rio-de-janeiro-new-flights-routes';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro') WHERE slug='how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'christ redeemer train, christ the redeemer train, rio de janeiro christ the redeemer, cristo redentor tours, tour cristo redentor, corcovado train station, pao de acucar e cristo, mirante da dona marta') WHERE slug='how-to-visit-christ-the-redeemer-in-2026';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, maracana hoje jogo') WHERE slug='how-to-visit-maracana-safely-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio') WHERE slug='inside-rocinha-rios-most-vibrant-favela-tour';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do in rio de janeiro, public transportation') WHERE slug='is-rio-de-janeiro-safe-for-foreign-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'pequena africa rio, pequena áfrica rj') WHERE slug='little-africa-pequena-africa-rios-most-s';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'spa copacabana, cristo redentor tours, sugarloaf tickets') WHERE slug='luxury-travel-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'xmas activities, xmas celebration') WHERE slug='melhor-epoca-visitar-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, arpoador rock, por do sol no rio de janeiro, morro do vidigal vista, mirante da dona marta') WHERE slug='melhores-mirantes-gratuitos-rj';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, arpoador rock, por do sol arpoador hoje, por do sol no rio de janeiro, por do sol no arpoador rio de janeiro, morro do vidigal vista, mirante da dona marta') WHERE slug='melhores-pontos-por-do-sol-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj, trilha no vidigal') WHERE slug='melhores-trilhas-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'mirante da dona marta, por do sol no rio de janeiro, sunset points, morro do vidigal vista') WHERE slug='mirante-dona-marta';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, '10 pontos turísticos do rio de janeiro, things to do in rio, what to do in rio de janeiro, melhores lugares rio de janeiro') WHERE slug='o-que-fazer-no-rio-de-janeiro-10-experiencias-que-voce-nao-pode-perder';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'melhores restaurantes de copacabana, melhor restaurante de copacabana, copacabana beach bars, restaurantes vegetarianos rio de janeiro, restaurantes vegetarianos no rio de janeiro, restaurante vegetariano rio de janeiro, brazilian drinks, brazil drink, comida típica do rj') WHERE slug='onde-comer-no-rio-gastronomia';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'power outlet, power sockets, plugs brazil') WHERE slug='packing-list-for-rio-from-beach-to-rainforest';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, 10 pontos turísticos do rio de janeiro, melhores lugares rio de janeiro, cristo redentor tours, sugarloaf tickets') WHERE slug='passeios-imperdiveis-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj') WHERE slug='pedra-da-gavea-hike-guide';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, '5 melhores praias do rio de janeiro, copacabana rio de janeiro beach, beaches in rio de janeiro copacabana, copacabana beach rio de janeiro, copacabana beach in rio de janeiro, copacabana beach rio de janeiro brazil, qual a praia mais bonita do rio de janeiro, beach rio de janeiro, melhores praias do rio, qual melhor praia do rio de janeiro, praia boa no rio de janeiro') WHERE slug='praias-do-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro') WHERE slug='private-vs-group-tours-why-exclusivity-matters-in-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'melhores lugares rio de janeiro') WHERE slug='rio-alem-do-obvio-lugares-secretos';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio de janeiro para crianças, o que fazer no rio com crianças') WHERE slug='rio-de-janeiro-com-criancas-roteiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, 10 pontos turísticos do rio de janeiro, cristo redentor tours, sugarloaf tickets') WHERE slug='rio-de-janeiro-in-3-days-itinerary-by-a';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio de janeiro para crianças, o que fazer no rio com crianças') WHERE slug='rio-de-janeiro-with-kids-3-day-itinerary';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, '10 pontos turísticos do rio de janeiro') WHERE slug='rio-imperial-cultura-historia';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'public transportation, precisa de visto para entrar no brasil, para entrar no brasil precisa de visto') WHERE slug='rio-safety-guide-for-us-european-travelers';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, spa copacabana, arpoador rock') WHERE slug='rooftops-ipanema-vista-mar-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points') WHERE slug='rooftops-santa-teresa-rio-vistas-privadas';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, 10 pontos turísticos do rio de janeiro') WHERE slug='roteiro-3-dias-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, 10 pontos turísticos do rio de janeiro, melhores lugares rio de janeiro') WHERE slug='roteiro-de-3-dias-no-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'aulas de surf rio de janeiro, aula de surf rio de janeiro, stadium games, brazilian matches, soccer stadium, beach games') WHERE slug='sports-tourism-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol no rio de janeiro, sunset points') WHERE slug='sunset-sailing-in-rio-the-ultimate-romantic-experience';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'xmas activities, xmas celebration') WHERE slug='the-best-months-to-visit-rio-for-hiking-and-outdoor-activities';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, arpoador rock, por do sol no arpoador rio de janeiro, morro do vidigal vista, mirante da dona marta') WHERE slug='the-best-private-rooftops-and-views-in-rio-avoid-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'melhores lugares rio de janeiro') WHERE slug='the-best-specialty-coffee-shops-in-the-center-of-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, pao de acucar e cristo') WHERE slug='the-best-way-to-see-rio-why-a-classic-schooner-beats-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, cristo redentor tours, sugarloaf tickets, tour cristo redentor') WHERE slug='the-complete-guide-to-custom-sightseeing';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'stadium games, soccer stadium, brazilian matches, brazil next match, brazil next games') WHERE slug='the-maracana-stadium-a-comprehensive-history-of-brazils-greatest-sporting-temple-and-its-connection-to-the-fifa-world-cup';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, o''que fazer em um dia de chuva, o''que fazer no rj com chuva') WHERE slug='things-to-do-in-rio-de-janeiro-when-it-rains';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio de janeiro para crianças, o que fazer no rio com crianças') WHERE slug='traveling-to-rio-with-kids-how-to-make-it-stress-free';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj, trilha no vidigal') WHERE slug='trilhas-no-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'christ redeemer train, christ the redeemer train, cristo redentor tours, tour cristo redentor, corcovado train station, rio de janeiro christ the redeemer') WHERE slug='um-dia-especial-no-rio-cristo-redentor-t';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, brazil next match, brazil next games, maracana hoje jogo') WHERE slug='um-dia-no-maraca';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, maracana hoje jogo') WHERE slug='uma-noite-de-idolos-no-maraca-a-experiencia-de-estar-no-maracana-quando-o-mengao-mandou-ver-no-medellin';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, 10 pontos turísticos do rio de janeiro, melhores lugares rio de janeiro, precisa de visto para entrar no brasil, para entrar no brasil precisa de visto') WHERE slug='visit-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sugarloaf cable car tickets, sugarloaf cable car ticket, sugarloaf tickets, sugar loaf ticket, pao de acucar e cristo') WHERE slug='visit-sugar-loaf-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, brazil next match, brazil next games, maracana hoje jogo') WHERE slug='watch-a-match-at-maracana-why-you-shouldnt-go-alone';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, o''que fazer em um dia de chuva, o''que fazer no rj com chuva') WHERE slug='what-to-do-in-rio-when-it-rains';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'power outlet, power sockets, plugs brazil, 5 melhores praias do rio de janeiro') WHERE slug='what-to-wear-hiking-and-beach-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'atm machine near me, cash machine near me, cash machines near me, cash in atm near me, casas de cambio barra da tijuca, casa de cambio rj') WHERE slug='where-exchange-money';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, brazil next match, brazil next games, maracana hoje jogo') WHERE slug='where-to-watch-the-2026-world-cup-in-rio';

-- TOURS
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj') WHERE slug='cachoeiras-horto';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio, what to do in rio de janeiro, 10 pontos turísticos do rio de janeiro, cristo redentor tours, tour cristo redentor, sugarloaf tickets, sugarloaf cable car tickets, pao de acucar e cristo, christ the redeemer train, mirante da dona marta') WHERE slug='city-tour-rio-completo';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sugarloaf cable car tickets, sugarloaf cable car ticket, sugarloaf tickets, sugar loaf ticket, pao de acucar e cristo') WHERE slug='costao-pao-de-acucar';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'christ redeemer train, christ the redeemer train, cristo redentor tours, tour cristo redentor, corcovado train station, pao de acucar e cristo, sugarloaf cable car tickets, sugarloaf tickets, mirante da dona marta') WHERE slug='cristo-redentor-pao-de-acucar';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'doces típicos do brasil, doce do brasil, doces no brasil, brazilian pastries, brazil drink, brazilian beverages, brazilian drinks') WHERE slug='degustacao-de-cafe-brasileiro';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in rio') WHERE slug='favela-rio-tour-rocinha';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'jogo maracanã amanhã, jogo maracanã domingo, stadium games, soccer stadium, brazilian matches, brazil next match, brazil next games, maracana hoje jogo') WHERE slug='maracana-matchday';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj') WHERE slug='pedra-da-gavea-trilha';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'pequena africa rio, pequena áfrica rj') WHERE slug='pequena-frica-experience-hist-ria-cultura-e-resist-ncia-no-cora-o-do-rio';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj') WHERE slug='pico-da-tijuca-hiking-tour-o-ponto-mais-alto-do-parque-nacional-da-tijuca';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, '5 melhores praias do rio de janeiro, qual a praia mais bonita do rio de janeiro, beach rio de janeiro, melhores praias do rio, qual melhor praia do rio de janeiro, praia boa no rio de janeiro') WHERE slug='praias-selvagens-guaratiba';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, beach rio de janeiro') WHERE slug='sailing-rio-ilhas-cagarras';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, por do sol no rio de janeiro, pao de acucar e cristo') WHERE slug='sunset-sailing-rio';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, '10 pontos turísticos do rio de janeiro, things to do in rio') WHERE slug='tour-pe-centro-historico';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'public transportation') WHERE slug='transfer-aeroporto-cidade';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha pedra do telégrafo grumari rio de janeiro rj, trilha no vidigal') WHERE slug='trilha-da-pedra-bonita';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sunset points, beach rio de janeiro') WHERE slug='um-dia-em-niteroi';

DROP FUNCTION public.merge_kw(text, text);
