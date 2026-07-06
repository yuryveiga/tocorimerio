import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const blogUpdates = [
  { slug: 'authentic-rio-experiences-live-like-a-carioca', desc: "Discover authentic Rio de Janeiro experiences and live like a true Carioca. Skip the tourist traps and explore the city's vibrant local culture and lifestyle." },
  { slug: 'best-feijoada-rio-de-janeiro-tourists', desc: "Looking for the best feijoada in Rio de Janeiro? Discover top local restaurants where tourists can enjoy Brazil's most famous and delicious traditional dish." },
  { slug: 'best-tours-in-rio-de-janeiro-for-3-days', desc: "Maximize your trip with the best tours in Rio de Janeiro for a 3-day itinerary. See Christ the Redeemer, Sugarloaf, and hidden gems with our expert guide." },
  { slug: 'beyond-the-beach-discovering-rios-hidden-gems-by-sea', desc: "Go beyond the beaches and discover Rio de Janeiro's hidden gems by sea. Explore secluded islands, pristine coastlines, and exclusive boat tours in Brazil." },
  { slug: 'boutique-hotels-rio-rooftops-vista-privada', desc: "Discover the best boutique hotels in Rio de Janeiro featuring private rooftops and exclusive ocean views. Book your luxury stay for an unforgettable trip." },
  { slug: 'boutique%E2%80%91hotels%E2%80%91rio%E2%80%91rooftops%E2%80%91vista%E2%80%91privada', desc: "Discover the best boutique hotels in Rio de Janeiro featuring private rooftops and exclusive ocean views. Book your luxury stay for an unforgettable trip." },
  { slug: 'buzios-cabo-frio-regiao-dos-lagos', desc: "Plan your ultimate getaway to Búzios, Cabo Frio, and the stunning Região dos Lagos. Crystal-clear waters and white sandy beaches await you just outside Rio." },
  { slug: 'carnaval-rio-guia-definitivo', desc: "The ultimate guide to Rio Carnival! Learn how to buy tickets, where to find the best blocos, and top tips to experience the world's greatest party safely." },
  { slug: 'christ-the-redeemer-without-the-crowds', desc: "Want to visit Christ the Redeemer without the crowds? Discover the best times, secret routes, and insider tips for a peaceful experience at Corcovado." },
  { slug: 'dicas-seguranca-transporte-rio', desc: "Stay safe while traveling in Rio de Janeiro. Read our expert tips on public transportation, reliable taxis, and navigating the city securely as a tourist." },
  { slug: 'ecotourism-tijuca-forest-rio-de-janeiro', desc: "Explore the wonders of ecotourism in Tijuca Forest, Rio de Janeiro. Discover breathtaking waterfalls, exotic wildlife, and lush trails in the urban jungle." },
  { slug: 'free-hikes-vs-guided-tours-rio', desc: "Free hikes vs. guided tours in Rio de Janeiro: which is right for you? Compare safety, costs, and experiences to make the best choice for your adventure." },
  { slug: 'gastronomia-carioca-pratos-tipicos', desc: "Dive into Carioca gastronomy! Discover the must-try traditional dishes in Rio de Janeiro, from classic feijoada to delicious street food snacks." },
  { slug: 'hiking-in-rio-a-premium-guide-to-tijuca-forest', desc: "The premium guide to hiking in Rio de Janeiro. Discover top trails in Tijuca Forest, breathtaking viewpoints, and essential safety tips for outdoor lovers." },
  { slug: 'how-much-does-a-city-tour-in-rio-de-jane', desc: "Wondering how much a city tour in Rio de Janeiro costs? Compare prices for private, group, and custom tours to budget your perfect Brazilian vacation." },
  { slug: 'how-to-buy-maracana-tickets-as-a-foreigner', desc: "A complete guide for foreigners on how to buy Maracanã stadium tickets. Skip the hassle, avoid scams, and secure your spot to watch a live football match." },
  { slug: 'how-to-find-a-trustworthy-tour-guide-in-rio-de-janeiro-scam-free', desc: "Learn how to find a trustworthy, scam-free tour guide in Rio de Janeiro. Expert tips to hire certified professionals for a safe and memorable experience." },
  { slug: 'how-to-get-tickets-for-maracana-the-comp', desc: "A complete guide for foreigners on how to buy Maracanã stadium tickets. Skip the hassle, avoid scams, and secure your spot to watch a live football match." },
  { slug: 'how-to-hire-a-safe-tour-guide-in-rio-de-janeiro-without-getting-scammed', desc: "Learn how to find a trustworthy, scam-free tour guide in Rio de Janeiro. Expert tips to hire certified professionals for a safe and memorable experience." },
  { slug: 'how-to-visit-maracana-safely-tourists', desc: "Planning to visit the Maracanã stadium? Read our essential safety guide for tourists on how to get there, what to bring, and how to enjoy the match safely." },
  { slug: 'is-it-safe-to-do-a-favela-tour-in-rocinh', desc: "Is it safe to do a favela tour in Rocinha? Find out what to expect, how to choose a responsible guide, and the cultural impact of visiting Rio's communities." },
  { slug: 'luxury-travel-rio-de-janeiro', desc: "Experience luxury travel in Rio de Janeiro. Uncover 5-star boutique hotels, exclusive private tours, fine dining, and VIP experiences in the Marvelous City." },
  { slug: 'melhor-epoca-visitar-rio-de-janeiro', desc: "Find out the best time to visit Rio de Janeiro. Compare weather, crowds, and events by month to plan your perfect Brazilian vacation all year round." },
  { slug: 'melhores-mirantes-gratuitos-rj', desc: "Discover the best free viewpoints in Rio de Janeiro. Capture stunning panoramic photos of the city's landscapes, beaches, and mountains without spending a dime." },
  { slug: 'melhores-trilhas-rio-de-janeiro', desc: "Uncover the best hiking trails in Rio de Janeiro. From easy walks to challenging climbs, find the perfect route for breathtaking views of the Marvelous City." },
  { slug: 'o-que-fazer-no-rio-de-janeiro-10-experiencias-que-voce-nao-pode-perder', desc: "Top 10 unforgettable experiences in Rio de Janeiro. Discover iconic landmarks, hidden beaches, and unique cultural activities you absolutely cannot miss." },
  { slug: 'o-renascimento-verde-a-incrivel-historia-do-reflorestamento-da-floresta-da-tijuca', desc: "Learn the incredible history of Tijuca Forest's reforestation. Discover how Rio de Janeiro created the world's largest urban forest and its ecological legacy." },
  { slug: 'onde-comer-no-rio-gastronomia', desc: "Where to eat in Rio de Janeiro? Explore our curated list of the city's top restaurants, local markets, and hidden gastronomic gems for every budget." },
  { slug: 'passeios-imperdiveis-rio-de-janeiro', desc: "Must-do tours in Rio de Janeiro! Plan your itinerary with our handpicked selection of top attractions, cultural experiences, and scenic outdoor adventures." },
  { slug: 'pedra-da-gavea-hike-guide', desc: "The ultimate Pedra da Gávea hike guide. Learn about trail difficulty, safety tips, and what to pack to conquer Rio's most thrilling and rewarding mountain." },
  { slug: 'praias-do-rio-de-janeiro', desc: "A guide to the best beaches in Rio de Janeiro. From the iconic sands of Copacabana and Ipanema to hidden, pristine coves perfect for surfing and relaxing." },
  { slug: 'rio-alem-do-obvio-lugares-secretos', desc: "Experience Rio beyond the obvious. Uncover secret spots, hidden nature trails, and authentic local neighborhoods ignored by traditional tourist guides." },
  { slug: 'rio-de-janeiro-com-criancas-roteiro', desc: "Traveling to Rio de Janeiro with kids? Check out our family-friendly itinerary featuring safe beaches, interactive museums, and fun parks for all ages." },
  { slug: 'rio-de-janeiro-in-3-days-itinerary-by-a', desc: "The perfect 3-day Rio de Janeiro itinerary crafted by a local expert. Maximize your time and see the city's best highlights, food, and culture efficiently." },
  { slug: 'rio-safety-guide-for-us-european-travelers', desc: "The ultimate Rio de Janeiro safety guide for US and European travelers. Practical advice on avoiding scams, safe transport, and enjoying your trip stress-free." },
  { slug: 'rocinha-favela-tour-rio-de-janeiro', desc: "Book a respectful and insightful Rocinha favela tour in Rio de Janeiro. Learn about the community's rich history, culture, and vibrant daily life." },
  { slug: 'rooftops-ipanema-vista-mar-rio', desc: "Discover the best rooftops in Ipanema with stunning ocean views. Enjoy premium cocktails, sunsets, and exclusive atmospheres in Rio de Janeiro's chicest neighborhood." },
  { slug: 'rooftops%E2%80%91ipanema%E2%80%91vista%E2%80%91mar%E2%80%91rio', desc: "Discover the best rooftops in Ipanema with stunning ocean views. Enjoy premium cocktails, sunsets, and exclusive atmospheres in Rio de Janeiro's chicest neighborhood." },
  { slug: 'rooftops-santa-teresa-rio-vistas-privadas', desc: "Explore the most exclusive rooftops in Santa Teresa, Rio de Janeiro. Enjoy private views, bohemian vibes, and unforgettable sunsets away from the crowds." },
  { slug: 'rooftops%E2%80%91santa%E2%80%91teresa%E2%80%91rio%E2%80%91vistas%E2%80%91privadas', desc: "Explore the most exclusive rooftops in Santa Teresa, Rio de Janeiro. Enjoy private views, bohemian vibes, and unforgettable sunsets away from the crowds." },
  { slug: 'roteiro-3-dias-rio-de-janeiro', desc: "Planning a quick trip? Discover our optimized 3-day itinerary for Rio de Janeiro, featuring must-see attractions, local dining, and efficient travel tips." },
  { slug: 'roteiro-de-3-dias-no-rio-de-janeiro', desc: "Planning a quick trip? Discover our optimized 3-day itinerary for Rio de Janeiro, featuring must-see attractions, local dining, and efficient travel tips." },
  { slug: 'sports-tourism-rio-de-janeiro', desc: "Dive into sports tourism in Rio de Janeiro. From surfing and hang gliding to attending epic football matches, discover the city's active lifestyle." },
  { slug: 'sustainability-and-craftsmanship-the-soul-of-the-tocorime', desc: "Discover the soul of the Tocorimé: a journey of sustainability and traditional craftsmanship. Learn how this unique wooden ship preserves maritime heritage." },
  { slug: 'the-best-private-rooftops-and-views-in-rio-avoid-the-crowds', desc: "Avoid the crowds with the best private rooftops and exclusive views in Rio de Janeiro. Elevate your trip with luxury experiences and breathtaking landscapes." },
  { slug: 'the%E2%80%91best%E2%80%91private%E2%80%91rooftops%E2%80%91and%E2%80%91views%E2%80%91in%E2%80%91rio%E2%80%91avoid%E2%80%91the%E2%80%91crowds', desc: "Avoid the crowds with the best private rooftops and exclusive views in Rio de Janeiro. Elevate your trip with luxury experiences and breathtaking landscapes." },
  { slug: 'the-best-months-to-visit-rio-for-hiking-and-outdoor-activities', desc: "What are the best months to visit Rio for hiking and outdoor activities? Plan your adventure around the optimal weather for exploring trails and beaches." },
  { slug: 'the-best-specialty-coffee-shops-in-the-center-of-rio-de-janeiro', desc: "Explore the best specialty coffee shops in downtown Rio de Janeiro. Discover premium Brazilian beans, historic cafes, and the ultimate local coffee culture." },
  { slug: 'the-maracana-stadium-a-comprehensive-history-of-brazils-greatest-sporting-temple-and-its-connection-to-the-fifa-world-cup', desc: "A comprehensive history of the Maracanã stadium. Discover the legacy of Brazil's greatest sporting temple and its iconic connection to the FIFA World Cup." },
  { slug: 'things-to-do-in-rio-de-janeiro-when-it-rains', desc: "Don't let bad weather ruin your trip! Discover the best things to do in Rio de Janeiro when it rains, from world-class museums to cozy cafes and culture." },
  { slug: 'trilhas-no-rio-de-janeiro', desc: "Explore the ultimate guide to hiking trails in Rio de Janeiro. Find detailed routes for all fitness levels, showcasing the best views of the Marvelous City." },
  { slug: 'um-dia-especial-no-rio-cristo-redentor-t', desc: "Spend a special day in Rio de Janeiro visiting Christ the Redeemer. Discover tips for combining this iconic wonder with other unforgettable city experiences." },
  { slug: 'watch-a-match-at-maracana-why-you-shouldnt-go-alone', desc: "Want to watch a match at Maracanã? Discover why you shouldn't go alone, how to navigate the massive crowds safely, and why a guided experience is better." },
  { slug: 'what-to-do-in-rio-when-it-rains', desc: "Don't let bad weather ruin your trip! Discover the best things to do in Rio de Janeiro when it rains, from world-class museums to cozy cafes and culture." },
  { slug: 'what-to-wear-hiking-and-beach-rio-de-janeiro', desc: "Wondering what to pack? Our essential guide on what to wear for hiking and the beach in Rio de Janeiro ensures you stay comfortable, safe, and stylish." },
  { slug: 'where-to-watch-the-2026-world-cup-in-rio', desc: "Get ready for football fever! Discover the best bars, fan zones, and iconic spots to watch the 2026 World Cup in Rio de Janeiro with passionate local fans." },
]

const tourUpdates = [
  { slug: 'pequena-frica-experience-hist-ria-cultura-e-resist-ncia', desc: "Join the Little Africa experience in Rio de Janeiro. Discover the profound history, rich culture, and powerful resistance in the heart of the city's heritage." },
  { slug: 'pequena%E2%80%91frica%E2%80%91experience%E2%80%91hist%E2%80%91ria%E2%80%91cultura%E2%80%91e-resist%E2%80%91ncia%E2%80%91no%E2%80%91cora%E2%80%91o-do%E2%80%91rio', desc: "Join the Little Africa experience in Rio de Janeiro. Discover the profound history, rich culture, and powerful resistance in the heart of the city's heritage." },
  { slug: 'scuba-diving-in-arraial-do-cabo', desc: "Experience the best scuba diving in Arraial do Cabo. Explore crystal-clear waters, vibrant marine life, and stunning shipwrecks in the Brazilian Caribbean." },
  { slug: 'tour-pe-centro-historico', desc: "Book a walking tour of Rio's Historical Center. Uncover centuries of Brazilian history, stunning colonial architecture, and hidden cultural treasures." },
  { slug: 'tour%E2%80%91pe%E2%80%91centro%E2%80%91historico', desc: "Book a walking tour of Rio's Historical Center. Uncover centuries of Brazilian history, stunning colonial architecture, and hidden cultural treasures." }
]

async function run() {
  console.log("Updating blogs...")
  let totalBlogs = 0
  for (const b of blogUpdates) {
    const s = decodeURIComponent(b.slug)
    const { data, error } = await supabase.from('blog_posts').update({ excerpt_en: b.desc }).eq('slug', s).select('id')
    if (error) console.error("Error for", s, error)
    if (data && data.length > 0) totalBlogs++
  }
  
  console.log("Updating tours...")
  let totalTours = 0
  for (const t of tourUpdates) {
    const s = decodeURIComponent(t.slug)
    const { data, error } = await supabase.from('tours').update({ short_description_en: t.desc }).eq('slug', s).select('id')
    if (error) console.error("Error for", s, error)
    if (data && data.length > 0) totalTours++
  }

  console.log(`Updated ${totalBlogs} blogs and ${totalTours} tours successfully.`)
}

run()
