// Esqueleto com as alturas reais da página de passeio — evita CLS enquanto
// os dados do passeio ainda estão chegando.
export const TourDetailSkeleton = () => (
  <main className="min-h-screen bg-background font-sans overflow-x-hidden" aria-busy="true">
    <div className="h-20" />
    <section className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* breadcrumbs */}
      <div className="h-3 w-56 rounded bg-muted mb-6" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-32 rounded-full bg-muted" />
          </div>
          {/* h1 */}
          <div className="h-10 sm:h-12 lg:h-14 w-4/5 rounded bg-muted" />
          <div className="h-6 w-48 rounded-full bg-muted" />
          <div className="lg:hidden flex flex-wrap gap-2 pt-1">
            <div className="h-8 w-28 rounded-full bg-muted" />
            <div className="h-8 w-24 rounded-full bg-muted" />
          </div>
        </div>
        {/* bloco de preço */}
        <div className="hidden md:block h-[108px] w-[220px] rounded-[2rem] bg-muted shrink-0" />
      </div>
    </section>

    <div className="flex flex-col gap-12 px-4 sm:px-6 lg:px-0 lg:block lg:gap-0 animate-pulse">
      {/* galeria */}
      <section className="-order-1 lg:order-none w-full lg:px-8 max-w-7xl mx-auto lg:mb-12">
        <div className="rounded-[2rem] bg-muted h-[350px] md:h-[400px] lg:h-[450px]" />
      </section>

      {/* conteúdo + card de reserva */}
      <section className="max-w-7xl mx-auto lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-10/12 rounded bg-muted" />
          <div className="h-4 w-9/12 rounded bg-muted" />
        </div>
        <div className="h-[420px] rounded-[2rem] bg-muted" />
      </section>
    </div>
  </main>
);

export default TourDetailSkeleton;
