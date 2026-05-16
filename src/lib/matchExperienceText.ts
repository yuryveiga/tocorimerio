// Generates a 350–450-word SEO-optimized "About the Experience" block
// for each match page. Keeps every page unique by injecting team names,
// date, competition and rival context. Targets validated keywords:
// "maracana tour", "maracana tickets", "<team> tickets", "rio de janeiro
// tours", "private tour rio de janeiro", "matchday experience".

export type Lang = "pt" | "en" | "es";

export interface MatchExperienceInput {
  homeTeam: string;
  awayTeam: string;
  matchDate: string | Date;
  stadium?: string | null;
  competition?: string | null;
  language: Lang;
}

export interface ExperienceSection {
  heading: string;
  body: string;
}

export interface MatchExperienceContent {
  intro: string;
  sections: ExperienceSection[];
  /** Flat plain-text version for meta description / schema. */
  plain: string;
}

const formatDate = (date: string | Date, language: Lang): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const locale = language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US";
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isClassic = (home: string, away: string): boolean => {
  const big = ["flamengo", "fluminense", "vasco", "botafogo"];
  const h = home.toLowerCase();
  const a = away.toLowerCase();
  return big.some((t) => h.includes(t)) && big.some((t) => a.includes(t));
};

export const buildMatchExperienceContent = (
  input: MatchExperienceInput
): MatchExperienceContent => {
  const { homeTeam, awayTeam, language } = input;
  const stadium = input.stadium || "Maracanã";
  const competition = input.competition || "";
  const date = formatDate(input.matchDate, language);
  const classic = isClassic(homeTeam, awayTeam);

  if (language === "pt") {
    const intro = `Assistir a ${homeTeam} x ${awayTeam} no ${stadium} é muito mais do que um jogo de futebol — é uma imersão completa na cultura brasileira, no estádio mais icônico do mundo. ${competition ? `Esta partida válida pelo ${competition}` : "Esta partida"} acontece ${date ? `em ${date}` : "em breve"} e promete uma atmosfera elétrica, com milhares de torcedores cantando, batendo bumbo e soltando sinalizadores. A Tocorime Rio organiza uma experiência matchday completa e sem stress: ingresso garantido em setor seguro, transfer executivo do seu hotel ${classic ? "antes e depois do clássico" : "ida e volta"}, e guia bilíngue acompanhando você do início ao fim. Somos cadastrados no CADASTUR e operamos desde 2011, com centenas de viajantes do mundo todo já levados ao Maracanã com total segurança.`;

    return {
      intro,
      sections: [
        {
          heading: "O que está incluso no seu Maracanã matchday",
          body: `O pacote para ${homeTeam} x ${awayTeam} inclui: ingresso oficial no setor escolhido (sem filas, sem revenda), transfer executivo ida e volta a partir de qualquer hotel da Zona Sul carioca (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra da Tijuca), guia bilíngue (português, inglês e espanhol) durante toda a experiência, encontro pré-jogo em bar tradicional para conhecer a torcida de perto, entrada acompanhada no estádio pelos portões corretos e suporte 24/7 por WhatsApp. Se preferir um tour mais exclusivo, oferecemos também a opção privativa, com horário personalizado e veículo dedicado apenas para o seu grupo.`,
        },
        {
          heading: "Por que reservar com a Tocorime Rio",
          body: `Reservar ingressos para o ${stadium} por conta própria envolve risco de fraude, idioma e logística complexa do Rio de Janeiro. Com a Tocorime você elimina todos esses problemas: somos especialistas em turismo esportivo no Rio há mais de uma década, com nota média 5 estrelas no Google e TripAdvisor. Nossos guias falam fluentemente inglês e espanhol, conhecem a história de cada clube e te explicam tudo — desde a origem dos cantos da torcida até as melhores fotos para fazer na arquibancada. A segurança é prioridade absoluta: rotas planejadas, motoristas treinados e acompanhamento integral. Você só precisa se preocupar em viver a emoção.`,
        },
        {
          heading: "A experiência única do Maracanã",
          body: `Inaugurado em 1950 para a Copa do Mundo, o ${stadium} já recebeu finais de Mundial, Olimpíadas e shows históricos — mas é nos jogos de ${classic ? "clássicos cariocas" : "futebol brasileiro"} que o estádio mostra sua alma. O cheiro da pipoca, o canto coletivo entrando no túnel, o tremor do anel superior quando sai o gol: é uma experiência sensorial que viajantes do mundo todo descrevem como inesquecível. Reserve agora seu lugar em ${homeTeam} x ${awayTeam} e viva o futebol como apenas o Rio sabe fazer.`,
        },
      ],
      plain: `${intro}`,
    };
  }

  if (language === "es") {
    const intro = `Ver ${homeTeam} vs ${awayTeam} en el ${stadium} es mucho más que un partido de fútbol: es una inmersión completa en la cultura brasileña, en el estadio más icónico del mundo. ${competition ? `Este partido del ${competition}` : "Este encuentro"} se juega ${date ? `el ${date}` : "próximamente"} y promete una atmósfera eléctrica, con miles de hinchas cantando, tocando tambores y encendiendo bengalas. Tocorime Rio organiza una experiencia matchday completa y sin estrés: entrada garantizada en sector seguro, traslado ejecutivo desde tu hotel ${classic ? "antes y después del clásico" : "ida y vuelta"}, y guía bilingüe acompañándote de principio a fin. Estamos registrados en CADASTUR y operamos desde 2011, con cientos de viajeros llevados al Maracanã con total seguridad.`;

    return {
      intro,
      sections: [
        {
          heading: "Qué incluye tu Maracanã matchday",
          body: `El paquete para ${homeTeam} vs ${awayTeam} incluye: entrada oficial en el sector elegido (sin colas, sin reventa), traslado ejecutivo ida y vuelta desde cualquier hotel de la Zona Sur de Río (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra de Tijuca), guía bilingüe (español, inglés y portugués) durante toda la experiencia, encuentro previo en un bar tradicional para conocer la hinchada de cerca, entrada acompañada al estadio por los portones correctos y soporte 24/7 por WhatsApp. Si prefieres algo más exclusivo, también ofrecemos la opción privada, con horario personalizado y vehículo dedicado solo para tu grupo.`,
        },
        {
          heading: "Por qué reservar con Tocorime Rio",
          body: `Comprar entradas para el ${stadium} por tu cuenta implica riesgo de fraude, barrera del idioma y logística compleja de Río de Janeiro. Con Tocorime eliminas todos esos problemas: somos especialistas en turismo deportivo en Río desde hace más de una década, con calificación promedio de 5 estrellas en Google y TripAdvisor. Nuestros guías hablan español e inglés con fluidez, conocen la historia de cada club y te lo explican todo — desde el origen de los cánticos hasta las mejores fotos en la tribuna. La seguridad es prioridad absoluta: rutas planificadas, conductores capacitados y acompañamiento total. Tú solo te preocupas de vivir la emoción.`,
        },
        {
          heading: "La experiencia única del Maracanã",
          body: `Inaugurado en 1950 para el Mundial, el ${stadium} ha recibido finales de Copa del Mundo, Juegos Olímpicos y conciertos históricos — pero es en los partidos de ${classic ? "clásicos cariocas" : "fútbol brasileño"} cuando el estadio muestra su alma. El olor a pochoclo, el canto colectivo entrando al túnel, el temblor del anillo superior cuando llega el gol: es una experiencia sensorial que viajeros de todo el mundo describen como inolvidable. Reserva ahora tu lugar para ${homeTeam} vs ${awayTeam} y vive el fútbol como solo Río sabe hacerlo.`,
        },
      ],
      plain: `${intro}`,
    };
  }

  // English (default)
  const intro = `Watching ${homeTeam} vs ${awayTeam} live at ${stadium} is much more than a football match — it is a full immersion into Brazilian culture, inside the most iconic stadium in the world. ${competition ? `This ${competition} fixture` : "This match"} takes place ${date ? `on ${date}` : "soon"} and promises an electric atmosphere, with thousands of fans chanting, drumming and lighting flares. Tocorime Rio runs a complete, hassle-free matchday experience: guaranteed ticket in a safe sector, executive transfer from your hotel ${classic ? "before and after this Rio derby" : "round-trip"}, and a bilingual local guide with you from start to finish. We are CADASTUR-registered and have been operating since 2011, with hundreds of international travelers safely taken to Maracanã.`;

  return {
    intro,
    sections: [
      {
        heading: "What's included in your Maracanã matchday",
        body: `The package for ${homeTeam} vs ${awayTeam} includes: an official ticket in the sector you choose (no queues, no resale), executive round-trip transfer from any hotel in Rio's South Zone (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra da Tijuca), a bilingual guide (English, Spanish, Portuguese) throughout the entire experience, a pre-match meet-up at a traditional Rio bar to feel the fan culture up close, escorted entry through the correct stadium gates, and 24/7 WhatsApp support. If you prefer something more exclusive, we also offer a private option with a custom schedule and a dedicated vehicle for your group only.`,
      },
      {
        heading: "Why book your Maracanã tickets with Tocorime",
        body: `Buying tickets to the ${stadium} on your own means fraud risk, language barriers and Rio's complex logistics. With Tocorime you skip all of that: we are sports tourism specialists in Rio de Janeiro with more than a decade of experience and a 5-star average rating on Google and TripAdvisor. Our guides speak fluent English and Spanish, know the history of every club, and walk you through everything — from the origin of each chant to the best photo spots on the terraces. Safety is our absolute priority: planned routes, trained drivers, and full personal escort. All you need to worry about is living the moment.`,
      },
      {
        heading: "The unique Maracanã experience",
        body: `Opened in 1950 for the World Cup, the ${stadium} has hosted World Cup finals, Olympic Games and historic concerts — but it is during ${classic ? "Rio derbies" : "Brazilian football"} matches that the stadium truly reveals its soul. The smell of popcorn, the collective chant as players walk out of the tunnel, the trembling of the upper ring when the goal goes in: it is a sensory experience travelers from every continent describe as unforgettable. Book your seat for ${homeTeam} vs ${awayTeam} now and live football the way only Rio knows how.`,
      },
    ],
    plain: `${intro}`,
  };
};