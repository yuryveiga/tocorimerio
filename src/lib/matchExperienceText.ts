// ============= Full file contents =============

// Generates a 350–450-word SEO-optimized "About the Experience" block
// for each match page. Keeps every page unique by injecting team names,
// date, competition and rival context — and now stadium-specific texts
// for Maracanã, Estádio Nilton Santos (Engenhão) and São Januário.

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

type VenueKey = "maracana" | "nilton_santos" | "sao_januario";

const norm = (s?: string | null) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const venueKeyFromStadium = (stadium?: string | null): VenueKey => {
  const s = norm(stadium);
  if (s.includes("nilton santos") || s.includes("engenhao")) return "nilton_santos";
  if (s.includes("sao januario")) return "sao_januario";
  return "maracana";
};

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
  const venue = venueKeyFromStadium(input.stadium);
  const competition = input.competition || "";
  const date = formatDate(input.matchDate, language);
  const classic = isClassic(homeTeam, awayTeam);

  if (language === "pt") {
    const introMaracana = `Assistir a ${homeTeam} x ${awayTeam} no ${stadium} é muito mais do que um jogo de futebol — é uma imersão completa na cultura brasileira, no estádio mais icônico do mundo. ${competition ? `Esta partida válida pelo ${competition}` : "Esta partida"} acontece ${date ? `em ${date}` : "em breve"} e promete uma atmosfera elétrica, com milhares de torcedores cantando, batendo bumbo e soltando sinalizadores. A Tocorime Rio organiza uma experiência matchday completa e sem stress: ingresso garantido em setor seguro, transfer executivo do seu hotel ${classic ? "antes e depois do clássico" : "ida e volta"}, e guia bilíngue acompanhando você do início ao fim. Somos cadastrados no CADASTUR e operamos desde 2011, com centenas de viajantes do mundo todo já levados ao Maracanã com total segurança.`;

    const introNiltonSantos = `Assistir a ${homeTeam} x ${awayTeam} no Estádio Nilton Santos, o Engenhão, é viver o futebol carioca em uma arena moderna inaugurada para os Jogos Pan-Americanos de 2007 e palco do atletismo nas Olimpíadas do Rio 2016. ${competition ? `Esta partida válida pelo ${competition}` : "Esta partida"} acontece ${date ? `em ${date}` : "em breve"}, com a torcida fazendo tremer as arquibancadas do bairro do Engenho de Dentro. A Tocorime Rio organiza uma experiência matchday completa e sem stress: ingresso garantido em setor seguro, transfer executivo do seu hotel ${classic ? "antes e depois do clássico" : "ida e volta"}, e guia bilíngue acompanhando você do início ao fim. Somos cadastrados no CADASTUR e operamos desde 2011, com total segurança em cada saída.`;

    const introSaoJanuario = `Assistir a ${homeTeam} x ${awayTeam} em São Januário é uma viagem no tempo: inaugurado em 1927, o estádio do Vasco da Gama é o mais antigo do Rio ainda em atividade e um dos mais tradicionais do Brasil. ${competition ? `Esta partida válida pelo ${competition}` : "Esta partida"} acontece ${date ? `em ${date}` : "em breve"}, e a atmosfera da Colina — com a torcida vascaína a poucos metros do gramado — é das mais intensas do futebol carioca. A Tocorime Rio organiza uma experiência matchday completa e sem stress: ingresso garantido em setor seguro, transfer executivo do seu hotel ${classic ? "antes e depois do clássico" : "ida e volta"}, e guia bilíngue acompanhando você do início ao fim. Somos cadastrados no CADASTUR e operamos desde 2011, com total segurança em cada saída.`;

    const intro =
      venue === "nilton_santos"
        ? introNiltonSantos
        : venue === "sao_januario"
          ? introSaoJanuario
          : introMaracana;

    const includedHeading =
      venue === "nilton_santos"
        ? "O que está incluso no seu matchday no Nilton Santos"
        : venue === "sao_januario"
          ? "O que está incluso no seu matchday em São Januário"
          : "O que está incluso no seu Maracanã matchday";

    const historySection: ExperienceSection =
      venue === "nilton_santos"
        ? {
            heading: "A experiência única do Estádio Nilton Santos",
            body: `Inaugurado em 2007 para os Jogos Pan-Americanos e batizado em homenagem a Nilton Santos — ídolo maior do Botafogo e bicampeão mundial com a Seleção — o Engenhão mistura arena moderna com a paixão das arquibancadas cariocas. Foi palco das provas de atletismo das Olimpíadas Rio 2016 e hoje vibra com os jogos de ${classic ? "clássicos cariocas" : "futebol brasileiro"}, com visão ampla do gramado de qualquer setor. Reserve agora seu lugar em ${homeTeam} x ${awayTeam} e viva o futebol como apenas o Rio sabe fazer.`,
          }
        : venue === "sao_januario"
          ? {
              heading: "A experiência única de São Januário",
              body: `Erguido em 1927, São Januário é o estádio particular mais antigo do Brasil ainda em uso e a casa histórica do Vasco da Gama. As colunas, a fachada clássica e a proximidade da arquibancada com o gramado criam um clima que nenhuma arena moderna reproduz — e quando a torcida canta, o estádio inteiro treme. Reserve agora seu lugar em ${homeTeam} x ${awayTeam} e viva o futebol como apenas o Rio sabe fazer.`,
            }
          : {
              heading: "A experiência única do Maracanã",
              body: `Inaugurado em 1950 para a Copa do Mundo, o ${stadium} já recebeu finais de Mundial, Olimpíadas e shows históricos — mas é nos jogos de ${classic ? "clássicos cariocas" : "futebol brasileiro"} que o estádio mostra sua alma. O cheiro da pipoca, o canto coletivo entrando no túnel, o tremor do anel superior quando sai o gol: é uma experiência sensorial que viajantes do mundo todo descrevem como inesquecível. Reserve agora seu lugar em ${homeTeam} x ${awayTeam} e viva o futebol como apenas o Rio sabe fazer.`,
            };

    return {
      intro,
      sections: [
        {
          heading: includedHeading,
          body: `O pacote para ${homeTeam} x ${awayTeam} inclui: ingresso oficial no setor escolhido (sem filas, sem revenda), transfer ida e volta a partir de qualquer hotel da Zona Sul carioca (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra da Tijuca), guia bilíngue (português, inglês e espanhol) durante toda a experiência e entrada acompanhada no estádio pelos portões corretos. Se preferir um tour mais exclusivo, oferecemos também a opção privativa, com horário personalizado e veículo dedicado apenas para o seu grupo.`,
        },
        {
          heading: "Por que reservar com a Tocorime Rio",
          body: `Reservar ingressos para o ${stadium} por conta própria envolve risco de fraude, idioma e logística complexa do Rio de Janeiro. Com a Tocorime você elimina todos esses problemas: somos especialistas em turismo esportivo no Rio há mais de uma década, com nota média 5 estrelas no Google e TripAdvisor. Nossos guias falam fluentemente inglês e espanhol, conhecem a história de cada clube e te explicam tudo — desde a origem dos cantos da torcida até as melhores fotos para fazer na arquibancada. A segurança é prioridade absoluta: rotas planejadas, motoristas treinados e acompanhamento integral. Você só precisa se preocupar em viver a emoção.`,
        },
        historySection,
      ],
      plain: `${intro}`,
    };
  }

  if (language === "es") {
    const introMaracana = `Ver ${homeTeam} vs ${awayTeam} en el ${stadium} es mucho más que un partido de fútbol: es una inmersión completa en la cultura brasileña, en el estadio más icónico del mundo. ${competition ? `Este partido del ${competition}` : "Este encuentro"} se juega ${date ? `el ${date}` : "próximamente"} y promete una atmósfera eléctrica, con miles de hinchas cantando, tocando tambores y encendiendo bengalas. Tocorime Rio organiza una experiencia matchday completa y sin estrés: entrada garantizada en sector seguro, traslado ejecutivo desde tu hotel ${classic ? "antes y después del clásico" : "ida y vuelta"}, y guía bilingüe acompañándote de principio a fin. Estamos registrados en CADASTUR y operamos desde 2011, con cientos de viajeros llevados al Maracanã con total seguridad.`;

    const introNiltonSantos = `Ver ${homeTeam} vs ${awayTeam} en el Estádio Nilton Santos, el Engenhão, es vivir el fútbol carioca en un estadio moderno inaugurado para los Juegos Panamericanos de 2007 y sede del atletismo en los Juegos Olímpicos de Río 2016. ${competition ? `Este partido del ${competition}` : "Este encuentro"} se juega ${date ? `el ${date}` : "próximamente"}, con la hinchada haciendo temblar las tribunas del barrio de Engenho de Dentro. Tocorime Rio organiza una experiencia matchday completa y sin estrés: entrada garantizada en sector seguro, traslado ejecutivo desde tu hotel ${classic ? "antes y después del clásico" : "ida y vuelta"}, y guía bilingüe acompañándote de principio a fin. Estamos registrados en CADASTUR y operamos desde 2011 con total seguridad.`;

    const introSaoJanuario = `Ver ${homeTeam} vs ${awayTeam} en São Januário es un viaje en el tiempo: inaugurado en 1927, el estadio del Vasco da Gama es el más antiguo de Río aún en actividad y uno de los más tradicionales de Brasil. ${competition ? `Este partido del ${competition}` : "Este encuentro"} se juega ${date ? `el ${date}` : "próximamente"}, y la atmósfera de la Colina — con la hinchada vascaína a pocos metros de la cancha — es de las más intensas del fútbol carioca. Tocorime Rio organiza una experiencia matchday completa y sin estrés: entrada garantizada en sector seguro, traslado ejecutivo desde tu hotel ${classic ? "antes y después del clásico" : "ida y vuelta"}, y guía bilingüe acompañándote de principio a fin. Estamos registrados en CADASTUR y operamos desde 2011 con total seguridad.`;

    const intro =
      venue === "nilton_santos"
        ? introNiltonSantos
        : venue === "sao_januario"
          ? introSaoJanuario
          : introMaracana;

    const includedHeading =
      venue === "nilton_santos"
        ? "Qué incluye tu matchday en el Nilton Santos"
        : venue === "sao_januario"
          ? "Qué incluye tu matchday en São Januário"
          : "Qué incluye tu Maracanã matchday";

    const historySection: ExperienceSection =
      venue === "nilton_santos"
        ? {
            heading: "La experiencia única del Estádio Nilton Santos",
            body: `Inaugurado en 2007 para los Juegos Panamericanos y bautizado en honor a Nilton Santos — ídolo máximo del Botafogo y bicampeón mundial con Brasil — el Engenhão combina un estadio moderno con la pasión de las tribunas cariocas. Fue sede del atletismo olímpico en Río 2016 y hoy vibra con los partidos de ${classic ? "clásicos cariocas" : "fútbol brasileño"}, con vista amplia de la cancha desde cualquier sector. Reserva ahora tu lugar para ${homeTeam} vs ${awayTeam} y vive el fútbol como solo Río sabe hacerlo.`,
          }
        : venue === "sao_januario"
          ? {
              heading: "La experiencia única de São Januário",
              body: `Levantado en 1927, São Januário es el estadio particular más antiguo de Brasil aún en uso y la casa histórica del Vasco da Gama. Sus columnas, su fachada clásica y la cercanía de la tribuna con la cancha crean un ambiente que ninguna arena moderna reproduce — y cuando la hinchada canta, el estadio entero tiembla. Reserva ahora tu lugar para ${homeTeam} vs ${awayTeam} y vive el fútbol como solo Río sabe hacerlo.`,
            }
          : {
              heading: "La experiencia única del Maracanã",
              body: `Inaugurado en 1950 para el Mundial, el ${stadium} ha recibido finales de Copa del Mundo, Juegos Olímpicos y conciertos históricos — pero es en los partidos de ${classic ? "clásicos cariocas" : "fútbol brasileño"} cuando el estadio muestra su alma. El olor a pochoclo, el canto colectivo entrando al túnel, el temblor del anillo superior cuando llega el gol: es una experiencia sensorial que viajeros de todo el mundo describen como inolvidable. Reserva ahora tu lugar para ${homeTeam} vs ${awayTeam} y vive el fútbol como solo Río sabe hacerlo.`,
            };

    return {
      intro,
      sections: [
        {
          heading: includedHeading,
          body: `El paquete para ${homeTeam} vs ${awayTeam} incluye: entrada oficial en el sector elegido (sin colas, sin reventa), traslado ejecutivo ida y vuelta desde cualquier hotel de la Zona Sur de Río (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra de Tijuca), guía bilingüe (español, inglés y portugués) durante toda la experiencia, encuentro previo en un bar tradicional para conocer la hinchada de cerca, entrada acompañada al estadio por los portones correctos y soporte 24/7 por WhatsApp. Si prefieres algo más exclusivo, también ofrecemos la opción privada, con horario personalizado y vehículo dedicado solo para tu grupo.`,
        },
        {
          heading: "Por qué reservar con Tocorime Rio",
          body: `Comprar entradas para el ${stadium} por tu cuenta implica riesgo de fraude, barrera del idioma y logística compleja de Río de Janeiro. Con Tocorime eliminas todos esos problemas: somos especialistas en turismo deportivo en Río desde hace más de una década, con calificación promedio de 5 estrellas en Google y TripAdvisor. Nuestros guías hablan español e inglés con fluidez, conocen la historia de cada club y te lo explican todo — desde el origen de los cánticos hasta las mejores fotos en la tribuna. La seguridad es prioridad absoluta: rutas planificadas, conductores capacitados y acompañamiento total. Tú solo te preocupas de vivir la emoción.`,
        },
        historySection,
      ],
      plain: `${intro}`,
    };
  }

  // English (default)
  const introMaracana = `Watching ${homeTeam} vs ${awayTeam} live at ${stadium} is much more than a football match — it is a full immersion into Brazilian culture, inside the most iconic stadium in the world. ${competition ? `This ${competition} fixture` : "This match"} takes place ${date ? `on ${date}` : "soon"} and promises an electric atmosphere, with thousands of fans chanting, drumming and lighting flares. Tocorime Rio runs a complete, hassle-free matchday experience: guaranteed ticket in a safe sector, executive transfer from your hotel ${classic ? "before and after this Rio derby" : "round-trip"}, and a bilingual local guide with you from start to finish. We are CADASTUR-registered and have been operating since 2011, with hundreds of international travelers safely taken to Maracanã.`;

  const introNiltonSantos = `Watching ${homeTeam} vs ${awayTeam} at Nilton Santos Stadium — the Engenhão — means experiencing Rio football in a modern arena opened for the 2007 Pan American Games and used for the athletics events of the Rio 2016 Olympics. ${competition ? `This ${competition} fixture` : "This match"} takes place ${date ? `on ${date}` : "soon"}, with the crowd shaking the stands of the Engenho de Dentro neighborhood. Tocorime Rio runs a complete, hassle-free matchday experience: guaranteed ticket in a safe sector, executive transfer from your hotel ${classic ? "before and after this Rio derby" : "round-trip"}, and a bilingual local guide with you from start to finish. We are CADASTUR-registered and have been operating since 2011.`;

  const introSaoJanuario = `Watching ${homeTeam} vs ${awayTeam} at São Januário is a trip back in time: opened in 1927, Vasco da Gama's home is the oldest stadium still in use in Rio and one of the most traditional in Brazil. ${competition ? `This ${competition} fixture` : "This match"} takes place ${date ? `on ${date}` : "soon"}, and the atmosphere at the Colina — with Vasco fans just meters from the pitch — is among the most intense in Rio football. Tocorime Rio runs a complete, hassle-free matchday experience: guaranteed ticket in a safe sector, executive transfer from your hotel ${classic ? "before and after this Rio derby" : "round-trip"}, and a bilingual local guide with you from start to finish. We are CADASTUR-registered and have been operating since 2011.`;

  const intro =
    venue === "nilton_santos"
      ? introNiltonSantos
      : venue === "sao_januario"
        ? introSaoJanuario
        : introMaracana;

  const includedHeading =
    venue === "nilton_santos"
      ? "What's included in your Nilton Santos matchday"
      : venue === "sao_januario"
        ? "What's included in your São Januário matchday"
        : "What's included in your Maracanã matchday";

  const whyHeading =
    venue === "maracana"
      ? "Why book your Maracanã tickets with Tocorime"
      : `Why book your ${stadium} tickets with Tocorime`;

  const historySection: ExperienceSection =
    venue === "nilton_santos"
      ? {
          heading: "The unique Nilton Santos Stadium experience",
          body: `Opened in 2007 for the Pan American Games and named after Nilton Santos — Botafogo's greatest idol and a two-time World Cup winner with Brazil — the Engenhão blends a modern arena with the passion of Rio's terraces. It hosted the athletics events of the Rio 2016 Olympics and now shakes with ${classic ? "Rio derbies" : "Brazilian football"}, offering a clear view of the pitch from every sector. Book your seat for ${homeTeam} vs ${awayTeam} now and live football the way only Rio knows how.`,
        }
      : venue === "sao_januario"
        ? {
            heading: "The unique São Januário experience",
            body: `Built in 1927, São Januário is the oldest privately owned stadium still in use in Brazil and the historic home of Vasco da Gama. Its columns, classic façade and stands just steps from the pitch create an atmosphere no modern arena can reproduce — and when the crowd sings, the whole stadium trembles. Book your seat for ${homeTeam} vs ${awayTeam} now and live football the way only Rio knows how.`,
          }
        : {
            heading: "The unique Maracanã experience",
            body: `Opened in 1950 for the World Cup, the ${stadium} has hosted World Cup finals, Olympic Games and historic concerts — but it is during ${classic ? "Rio derbies" : "Brazilian football"} matches that the stadium truly reveals its soul. The smell of popcorn, the collective chant as players walk out of the tunnel, the trembling of the upper ring when the goal goes in: it is a sensory experience travelers from every continent describe as unforgettable. Book your seat for ${homeTeam} vs ${awayTeam} now and live football the way only Rio knows how.`,
          };

  return {
    intro,
    sections: [
      {
        heading: includedHeading,
        body: `The package for ${homeTeam} vs ${awayTeam} includes: an official ticket in the sector you choose (no queues, no resale), executive round-trip transfer from any hotel in Rio's South Zone (Copacabana, Ipanema, Leblon, Botafogo, Flamengo, Lagoa, Barra da Tijuca), a bilingual guide (English, Spanish, Portuguese) throughout the entire experience, a pre-match meet-up at a traditional Rio bar to feel the fan culture up close, escorted entry through the correct stadium gates, and 24/7 WhatsApp support. If you prefer something more exclusive, we also offer a private option with a custom schedule and a dedicated vehicle for your group only.`,
      },
      {
        heading: whyHeading,
        body: `Buying tickets to the ${stadium} on your own means fraud risk, language barriers and Rio's complex logistics. With Tocorime you skip all of that: we are sports tourism specialists in Rio de Janeiro with more than a decade of experience and a 5-star average rating on Google and TripAdvisor. Our guides speak fluent English and Spanish, know the history of every club, and walk you through everything — from the origin of each chant to the best photo spots on the terraces. Safety is our absolute priority: planned routes, trained drivers, and full personal escort. All you need to worry about is living the moment.`,
      },
      historySection,
    ],
    plain: `${intro}`,
  };
};
