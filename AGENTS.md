# Architecture rules

- Share football reservation identification between sales UI and email functions through `supabase/functions/_shared/footballReservation.ts`, re-exported from `src/lib/footballReservation.ts`, so presentation stays consistent without changing stored booking or payment data.
- Keep Vasco–Boca landing metadata and event-offer generation in `src/lib/vascoBocaLanding.ts`, using the existing matches query for live data; this shares build-time metadata without adding AI calls or a separate booking flow.- Keep Flamengo–Estudiantes landing metadata and event-offer generation in `src/lib/flamengoEstudiantesLanding.ts`, using the existing matches query for live data; mirrors the Vasco–Boca landing pattern without a separate booking flow.
