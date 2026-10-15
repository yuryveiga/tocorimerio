# Architecture rules

- Share football reservation identification between sales UI and email functions through `supabase/functions/_shared/footballReservation.ts`, re-exported from `src/lib/footballReservation.ts`, so presentation stays consistent without changing stored booking or payment data.