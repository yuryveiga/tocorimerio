# Architecture rules
- Route all paid-sale confirmations through the database-triggered `process-paid-sale-email` worker, preserving Resend templates; store per-audience acceptance and stable provider idempotency keys, and arm retries only while pending deliveries exist so partner inserts and Stripe updates share one low-cost path.
- Derive generic game page and static route metadata through `src/lib/matchSeo.js`; sharing registered teams, venue and Rio-local date prevents incorrect stadium labels and generic published titles.
- Share fixture status and event detail derivation through `src/lib/matchEventStatus.ts`, consumed by the general schema generator and landing builders; this keeps approved timing and home-team rules consistent without changing stored match data.

- Select match carousel photos from the existing site gallery through `getMatchGallery` in `src/lib/matchImages.ts`; this keeps stadium selection testable without extra requests or duplicated image storage.
- Select each stadium's featured match video through `getMatchFeaturedVideo` in `src/lib/matchImages.ts`; Nilton Santos games use their own YouTube Short, so per-stadium videos stay testable in one place.

- Share football reservation identification between sales UI and email functions through `supabase/functions/_shared/footballReservation.ts`, re-exported from `src/lib/footballReservation.ts`, so presentation stays consistent without changing stored booking or payment data.
- Keep Vasco–Boca landing metadata and event-offer generation in `src/lib/vascoBocaLanding.ts`, using the existing matches query for live data; this shares build-time metadata without adding AI calls or a separate booking flow.- Keep Flamengo–Estudiantes landing metadata and event-offer generation in `src/lib/flamengoEstudiantesLanding.ts`, using the existing matches query for live data; mirrors the Vasco–Boca landing pattern without a separate booking flow.
