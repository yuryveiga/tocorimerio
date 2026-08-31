const fs = require('fs');

let content = fs.readFileSync('src/pages/FluminenseIndependienteRivadaviaLibertadores.tsx', 'utf8');

// Date & URLs
content = content.replace(/2026-08-11T19:00:00-03:00/g, '2026-09-02T21:30:00-03:00');
content = content.replace(/https:\/\/tocorimerio\.com\/match\/fluminense-vs-independiente-rivadavia-2026-08-11/g, 'https://tocorimerio.com/match/flamengo-vs-mirassol-sp-2026-09-02');
content = content.replace(/\/fluminense-indenpediente-rivadavia-libertadores-maracana/g, '/flamengo-x-mirassol-maracana-tickets-02-09');

// General replacements
content = content.replace(/FluminenseIndependienteRivadaviaLibertadores/g, 'FlamengoMirassolMaracana');
content = content.replace(/Fluminense FC/g, 'CR Flamengo');
content = content.replace(/Fluminense/g, 'Flamengo');
content = content.replace(/Independiente Rivadavia/g, 'Mirassol');
content = content.replace(/\bFlu\b/g, 'Flamengo');

content = content.replace(/CONMEBOL Libertadores 2026 · Round of 16 · 1st Leg/g, 'Brasileirão Série A 2026 · Official Match');
content = content.replace(/CONMEBOL Libertadores 2026 · Oitavas de Final · Jogo 1/g, 'Brasileirão Série A 2026 · Jogo Oficial');
content = content.replace(/CONMEBOL Libertadores 2026 · Octavos de Final · Partido 1/g, 'Brasileirão Série A 2026 · Partido Oficial');

content = content.replace(/Round of 16 · 1st Leg/g, 'Official Match');
content = content.replace(/Oitavas · Jogo 1/g, 'Jogo Oficial');
content = content.replace(/Octavos · Partido 1/g, 'Partido Oficial');

content = content.replace(/Tue, Aug 11/g, 'Wed, Sep 2');
content = content.replace(/Ter, 11 Ago/g, 'Qua, 2 Set');
content = content.replace(/Mar, 11 Ago/g, 'Mié, 2 Sep');

content = content.replace(/19:00 BRT/g, '21:30 BRT');

content = content.replace(/🏆 COPA LIBERTADORES — Round of 16/g, '🏆 BRASILEIRÃO SÉRIE A — Official Match');
content = content.replace(/🏆 COPA LIBERTADORES — Oitavas de Final/g, '🏆 BRASILEIRÃO SÉRIE A — Jogo Oficial');
content = content.replace(/🏆 COPA LIBERTADORES — Octavos de Final/g, '🏆 BRASILEIRÃO SÉRIE A — Partido Oficial');

content = content.replace(/South America is here/g, 'Brazil is here');
content = content.replace(/América do Sul/g, 'Brasil');
content = content.replace(/Sudamérica/g, 'Brasil'); 

// Dates in text
content = content.replace(/Aug 11/g, 'Sep 2');
content = content.replace(/August 11/g, 'September 2');
content = content.replace(/11 de Agosto/g, '2 de Setembro');
content = content.replace(/No te pierdas el 2 de Setembro/g, 'No te pierdas el 2 de Septiembre');
content = content.replace(/ctaDate: "2 de Setembro"/g, 'ctaDate: "2 de Septiembre"'); // We will fix the PT/ES block manually after in code if needed

// Teams info
content = content.replace(/Ind\. Rivadavia/g, 'Mirassol');
content = content.replace(/Mendoza · ARG/g, 'Mirassol · SP');

// Images
content = content.replace(/https:\/\/crests\.football-data\.org\/1765\.png/g, 'https://crests.football-data.org/1783.png');
content = content.replace(/https:\/\/ruacloirelfsbejduefa\.supabase\.co\/storage\/v1\/object\/public\/crests\/0599b17b-7b6a-4492-8c13-110552ef037c\/visitante\.png/g, 'https://upload.wikimedia.org/wikipedia/pt/b/bc/Mirassol_Futebol_Clube.png');
content = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/en\/thumb\/3\/3c\/CONMEBOL_Copa_Libertadores_logo\.svg\/200px-CONMEBOL_Copa_Libertadores_logo\.svg\.png/g, 'https://upload.wikimedia.org/wikipedia/pt/thumb/2/23/Confedera%C3%A7%C3%A3o_Brasileira_de_Futebol.svg/200px-Confedera%C3%A7%C3%A3o_Brasileira_de_Futebol.svg.png');

content = content.replace(/Copa Libertadores 2026/g, 'Brasileirão 2026');
content = content.replace(/Copa Libertadores/g, 'Brasileirão');

// CSS classes
content = content.replace(/\.riv-/g, '.mir-');
content = content.replace(/className="riv-/g, 'className="mir-');
content = content.replace(/riv-page/g, 'mir-page');
content = content.replace(/riv-/g, 'mir-');

// Colors (we replace flu with fla)
content = content.replace(/--flu-green: #1a7a2e;/g, '--flu-green: #c51b22;');
content = content.replace(/--flu-green-light: #2ecc5a;/g, '--flu-green-light: #e6242c;');
content = content.replace(/--flu-maroon: #8b0000;/g, '--flu-maroon: #111111;');
content = content.replace(/--mir-blue: #003b96;/g, '--mir-blue: #ffcc00;');
content = content.replace(/--mir-blue-light: #4d82e0;/g, '--mir-blue-light: #008000;');

content = content.replace(/flu"/g, 'fla"');
content = content.replace(/flu {/g, 'fla {');
content = content.replace(/className="mir-team-name flu"/g, 'className="mir-team-name fla"');

// Some texts specific to flu
content = content.replace(/tricolor/g, 'rubro-negro');

fs.writeFileSync('src/pages/FlamengoMirassolMaracana.tsx', content);
console.log('File created successfully');
