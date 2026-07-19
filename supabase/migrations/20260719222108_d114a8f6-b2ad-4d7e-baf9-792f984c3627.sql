
CREATE OR REPLACE FUNCTION public.merge_kw(existing text, additions text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  arr text[];
  seen text[] := ARRAY[]::text[];
  result text[] := ARRAY[]::text[];
  item text;
  norm text;
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
END;
$$;

-- BLOG POSTS
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cariocas significado, carioca significado, what to do') WHERE slug='authentic-rio-experiences-live-like-a-carioca';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cinelandia, what to do') WHERE slug='best-coffee-shops-in-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'comida típica rio de janeiro, rio de janeiro comida tipica, pratos tipicos do rio de janeiro, pratos típicos do rio de janeiro, prato típico do rio de janeiro, pratos tipicos de rio de janeiro, comida rio de janeiro, comidas do rio de janeiro, doces brasileiros, sobremesas brasileiras') WHERE slug='best-feijoada-rio-de-janeiro-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset rio, por do sol rio de janeiro, por do sol rj, pedra do arpoador, por do sol arpoador, mirante dona marta') WHERE slug='best-sunset-spots-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in brazil rio de janeiro, things to do in rio de janeiro brazil, what to do, sugar loaf rio, maracana stadium, cristo redentor como visitar, trilha do cristo redentor') WHERE slug='best-tours-in-rio-de-janeiro-for-3-days';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'praias rio, melhores praias do rio de janeiro') WHERE slug='beyond-the-beach-discovering-rios-hidden-gems-by-sea';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rio de janeiro, por do sol rj, pão de açúcar e cristo redentor') WHERE slug='boutique-hotels-rio-rooftops-vista-privada';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'bloco de carnaval do rio de janeiro, bloco de carnaval no rio de janeiro, what to do') WHERE slug='carnaval-rio-guia-definitivo';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cristo redentor como visitar, trilha do cristo redentor, cristo redentor em ingles, trilha do cristo, mirante dona marta') WHERE slug='christ-the-redeemer-without-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'transit station near me') WHERE slug='dicas-seguranca-transporte-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'grutas parque lage, what to do') WHERE slug='ecotourism-tijuca-forest-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, trilha do cristo redentor, what to do') WHERE slug='free-hikes-vs-guided-tours-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio de janeiro comida tipica, comida típica rio de janeiro, pratos tipicos do rio de janeiro, pratos típicos do rio de janeiro, prato típico do rio de janeiro, pratos tipicos de rio de janeiro, comida rio de janeiro, comidas do rio de janeiro, sobremesas brasileiras, doces brasileiros') WHERE slug='gastronomia-carioca-pratos-tipicos';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sugar loaf rio, sugar loaf rio de janeiro, pão de açúcar e cristo redentor, sugarloaf mountain tickets, what to do') WHERE slug='helicopter-tour-rio-de-janeiro-routes-prices-what-to-expect';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'grutas parque lage, trilha do cristo, what to do') WHERE slug='hiking-in-rio-a-premium-guide-to-tijuca-forest';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cristo redentor como visitar, sugar loaf rio, sugar loaf rio de janeiro, pão de açúcar e cristo redentor') WHERE slug='how-much-does-a-city-tour-in-rio-de-jane';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, museu maracanã, football game, football near me') WHERE slug='how-to-buy-maracana-tickets-as-a-foreigner';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, rio carioca tours & services') WHERE slug='how-to-find-a-trustworthy-tour-guide-in-rio-de-janeiro-scam-free';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogo maracana, football near me, museu maracanã') WHERE slug='how-to-get-tickets-for-maracana-the-comp';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'transit station near me') WHERE slug='how-to-get-to-rio-de-janeiro-new-flights-routes';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio carioca tours & services, what to do') WHERE slug='how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cristo redentor como visitar, trilha do cristo redentor, trilha do cristo, cristo redentor em ingles') WHERE slug='how-to-visit-christ-the-redeemer-in-2026';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, football game, museu maracanã') WHERE slug='how-to-visit-maracana-safely-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='is-rio-de-janeiro-safe-for-foreign-tourists';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='little-africa-pequena-africa-rios-most-s';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, sugar loaf rio, cristo redentor como visitar') WHERE slug='luxury-travel-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'new year''s eve celebration, christmas day, bloco de carnaval do rio de janeiro') WHERE slug='melhor-epoca-visitar-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset rio, por do sol rio de janeiro') WHERE slug='melhores-mirantes-gratuitos-rj';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rj') WHERE slug='melhores-pontos-por-do-sol-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, trilha do cristo redentor, grutas parque lage') WHERE slug='melhores-trilhas-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset rio, por do sol rio de janeiro') WHERE slug='mirante-dona-marta';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'things to do in brazil rio de janeiro, things to do in rio de janeiro brazil, sugar loaf rio, maracana stadium') WHERE slug='o-que-fazer-no-rio-de-janeiro-10-experiencias-que-voce-nao-pode-perder';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'grutas parque lage') WHERE slug='o-renascimento-verde-a-incrivel-historia-do-reflorestamento-da-floresta-da-tijuca';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'restaurantes em copacabana, restaurantes em copacabana rio de janeiro, melhores restaurantes copacabana, restaurantes copacabana rio de janeiro, restaurante copacabana rio de janeiro, restaurant in copacabana, onde comer copacabana, comida rio de janeiro, comidas do rio de janeiro, pratos típicos do rio de janeiro, prato típico do rio de janeiro, vegan restaurants, vegetarian restaurants') WHERE slug='onde-comer-no-rio-gastronomia';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='packing-list-for-rio-from-beach-to-rainforest';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, things to do in brazil rio de janeiro, sugar loaf rio, maracana stadium') WHERE slug='passeios-imperdiveis-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, what to do') WHERE slug='pedra-da-gavea-hike-guide';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'praias rio, melhor praia do rio de janeiro, melhores praias no rio de janeiro') WHERE slug='praias-do-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, rio carioca tours & services') WHERE slug='private-vs-group-tours-why-exclusivity-matters-in-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sitio burle marx, estrada roberto burle marx, grutas parque lage') WHERE slug='rio-alem-do-obvio-lugares-secretos';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'o''que fazer no rio de janeiro com crianças, o que fazer com criança no rio de janeiro') WHERE slug='rio-de-janeiro-com-criancas-roteiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sugar loaf rio, maracana stadium, what to do, things to do in brazil rio de janeiro, things to do in rio de janeiro brazil') WHERE slug='rio-de-janeiro-in-3-days-itinerary-by-a';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'o''que fazer no rio de janeiro com crianças, o que fazer com criança no rio de janeiro') WHERE slug='rio-de-janeiro-with-kids-3-day-itinerary';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cinelandia, neighborhoods, what to do') WHERE slug='rio-imperial-cultura-historia';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'transit station near me, what to do') WHERE slug='rio-safety-guide-for-us-european-travelers';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='rocinha-favela-tour-the-most-eye-opening-experience-in-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='rock-climbing-beginners-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rj') WHERE slug='rooftops-ipanema-vista-mar-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rj') WHERE slug='rooftops-santa-teresa-rio-vistas-privadas';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, things to do in brazil rio de janeiro, things to do in rio de janeiro brazil, sugar loaf rio, maracana stadium') WHERE slug='roteiro-3-dias-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, things to do in brazil rio de janeiro, sugar loaf rio, maracana stadium') WHERE slug='roteiro-de-3-dias-no-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, football near me, footballs near me') WHERE slug='sports-tourism-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset rio, por do sol rio de janeiro, por do sol rj, pão de açúcar e cristo redentor') WHERE slug='sunset-sailing-in-rio-the-ultimate-romantic-experience';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'new year''s eve celebration, christmas day, bloco de carnaval do rio de janeiro') WHERE slug='the-best-months-to-visit-rio-for-hiking-and-outdoor-activities';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rj') WHERE slug='the-best-private-rooftops-and-views-in-rio-avoid-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='the-best-specialty-coffee-shops-in-the-center-of-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sunset rio, sugar loaf rio, pão de açúcar e cristo redentor') WHERE slug='the-best-way-to-see-rio-why-a-classic-schooner-beats-the-crowds';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'rio carioca tours & services, what to do, sugar loaf rio, maracana stadium') WHERE slug='the-complete-guide-to-custom-sightseeing';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, football near me, footballs near me') WHERE slug='the-maracana-stadium-a-comprehensive-history-of-brazils-greatest-sporting-temple-and-its-connection-to-the-fifa-world-cup';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'museu maracanã, what to do, things to do in rio de janeiro brazil, things to do in brazil rio de janeiro') WHERE slug='things-to-do-in-rio-de-janeiro-when-it-rains';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'o''que fazer no rio de janeiro com crianças, o que fazer com criança no rio de janeiro') WHERE slug='traveling-to-rio-with-kids-how-to-make-it-stress-free';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, trilha do cristo redentor, grutas parque lage') WHERE slug='trilhas-no-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'cristo redentor em ingles, trilha do cristo, trilha do cristo redentor, mirante dona marta') WHERE slug='um-dia-especial-no-rio-cristo-redentor-t';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, museu maracanã, football near me, footballs near me') WHERE slug='um-dia-no-maraca';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, football game, museu maracanã, football near me') WHERE slug='uma-noite-de-idolos-no-maraca-a-experiencia-de-estar-no-maracana-quando-o-mengao-mandou-ver-no-medellin';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, things to do in brazil rio de janeiro, sugar loaf rio, maracana stadium, cristo redentor como visitar, sunset rio') WHERE slug='visit-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'sugar loaf rio, sugar loaf rio de janeiro, sugarloaf mountain tickets, pão de açúcar e cristo redentor, what to do') WHERE slug='visit-sugar-loaf-rio';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, football game, football near me, footballs near me, museu maracanã') WHERE slug='watch-a-match-at-maracana-why-you-shouldnt-go-alone';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, museu maracanã, cinelandia, things to do in brazil rio de janeiro, things to do in rio de janeiro brazil') WHERE slug='what-to-do-in-rio-when-it-rains';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'praias rio, melhores praias do rio de janeiro, trilha do cristo') WHERE slug='what-to-wear-hiking-and-beach-rio-de-janeiro';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'atm near me, currency exchange near me, exchange near me, casas de cambio rio, casas de câmbio centro rj') WHERE slug='where-exchange-money';
UPDATE blog_posts SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, jogos no maracana, jogo maracana, football game, football near me, footballs near me, museu maracanã') WHERE slug='where-to-watch-the-2026-world-cup-in-rio';

-- TOURS
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'grutas parque lage, what to do') WHERE slug='cachoeiras-horto';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sugar loaf rio de janeiro, pão de açúcar e cristo redentor, mirante dona marta, cinelandia, maracana, cristo redentor como visitar, what to do, things to do in brazil rio de janeiro, things to do in rio de janeiro brazil') WHERE slug='city-tour-rio-completo';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'sugar loaf rio de janeiro, sugarloaf mountain tickets') WHERE slug='costao-pao-de-acucar';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'mirante dona marta, sugarloaf mountain tickets, trilha do cristo, trilha do cristo redentor') WHERE slug='cristo-redentor-pao-de-acucar';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, doces brasileiros, sobremesas brasileiras') WHERE slug='degustacao-de-cafe-brasileiro';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='escalada-rocha-rio';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='favela-rio-tour-rocinha';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'maracana, maracanã jogos, football near me, footballs near me') WHERE slug='maracana-matchday';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, what to do') WHERE slug='pedra-da-gavea-trilha';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, cinelandia') WHERE slug='pequena-frica-experience-hist-ria-cultura-e-resist-ncia-no-cora-o-do-rio';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'grutas parque lage, trilha do cristo, what to do') WHERE slug='pico-da-tijuca-hiking-tour-o-ponto-mais-alto-do-parque-nacional-da-tijuca';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'praias rio, melhores praias do rio de janeiro, melhores praias no rio de janeiro, melhor praia do rio de janeiro') WHERE slug='praias-selvagens-guaratiba';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rio de janeiro, praias rio') WHERE slug='sailing-rio-ilhas-cagarras';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'por do sol rj, pão de açúcar e cristo redentor') WHERE slug='sunset-sailing-rio';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do') WHERE slug='tour-pe-centro-historico';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'transit station near me') WHERE slug='transfer-aeroporto-cidade';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'trilha do cristo, trilha do cristo redentor, what to do') WHERE slug='trilha-da-pedra-bonita';
UPDATE tours SET meta_keywords = public.merge_kw(meta_keywords, 'what to do, sunset rio') WHERE slug='um-dia-em-niteroi';

DROP FUNCTION public.merge_kw(text, text);
