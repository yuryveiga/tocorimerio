# Add German, French and Italian to the whole site

## What visitors will see
- Language menu: PT, EN, ES, DE, FR, IT (computer and phone).
- Browsers set to German, French or Italian open the site in that language, with prices in euros by default.
- Every public page translated: menu, buttons, home, tour list and tour pages, game pages and calendar, cart, checkout confirmation, contact, about, privacy policy and cookie notice.
- Tours, games and blog posts show their DE/FR/IT text; if a text hasn't been translated yet, English shows instead (never a blank).

## Content translation (AI, one time)
- All active tours and blog posts translated once by AI from English, keeping names like Maracanã and Pedra da Gávea.
- Game pages built from the shared stadium texts, translated the same way.
- New or edited tours: the existing translate button in the admin fills DE/FR/IT too.
- Estimated AI cost: small, one pass over existing content; nothing runs on visits.

## Search engines
- Each page announces its DE/FR/IT versions (?lang=de/fr/it), so Google can show them in those countries.

## Order of work
1. Language menu, detection and shared UI text.
2. Pages with their own wording (calendar, tour page, game page, blog, cart, home sections).
3. Database fields and one-time AI translation of tours and blog posts.
4. Admin translate button extended to DE/FR/IT.
5. Browser check of each language on home, a tour, a game, cart and blog.

## Technical details
- Language type gains 'de' | 'fr' | 'it'; translationsDe/Fr/It in src/translations; inline `language === 'es' ? …` ternaries replaced with a small per-language pick helper falling back to English.
- New nullable columns `*_de`, `*_fr`, `*_it` on tours and blog_posts mirroring the `*_es` ones (migration); translation batch via the existing admin-only translate-text function.
- Old zh columns stay untouched (no data loss).
