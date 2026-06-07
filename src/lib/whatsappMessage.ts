const defaultMessages = {
  pt: `Olá! 👋

Seja bem-vindo à Tocorime Rio!

Obrigado pelo seu contato. Em breve vou responder sua mensagem pessoalmente. 🇧🇷⚽

Enquanto isso, fique à vontade para me enviar:

• Quantas pessoas são
• Datas da viagem
• Qual experiência procura no Rio de Janeiro
• Se deseja assistir a um jogo no Maracanã

Será um prazer ajudar você a viver uma experiência inesquecível no Rio! ☀️🏖️`,
  en: `Hello! 👋

Welcome to Tocorime Rio!

Thank you for getting in touch. I'll personally reply to your message soon. 🇧🇷⚽

In the meantime, feel free to send me:

• How many people are travelling
• Travel dates
• What kind of experience you're looking for in Rio de Janeiro
• Whether you'd like to watch a match at the Maracanã

It will be a pleasure to help you live an unforgettable experience in Rio! ☀️🏖️`,
  es: `¡Hola! 👋

¡Bienvenido a Tocorime Rio!

Gracias por tu contacto. En breve responderé tu mensaje personalmente. 🇧🇷⚽

Mientras tanto, no dudes en enviarme:

• Cuántas personas son
• Fechas del viaje
• Qué experiencia buscas en Río de Janeiro
• Si deseas ver un partido en el Maracaná

¡Será un placer ayudarte a vivir una experiencia inolvidable en Río! ☀️🏖️`,
};

function getOverride(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('site_settings');
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    const val = map['whatsapp_msg'];
    return val && val.trim() ? val : null;
  } catch {
    return null;
  }
}

export function getWhatsappWelcomeMessage(language?: string): string {
  const lang = (language || 'pt').toLowerCase().slice(0, 2);
  const key = (lang in defaultMessages ? lang : 'pt') as keyof typeof defaultMessages;
  return getOverride() || defaultMessages[key];
}

export function buildWhatsappLink(phoneOrUrl: string, language?: string): string {
  const text = encodeURIComponent(getWhatsappWelcomeMessage(language));
  if (phoneOrUrl.startsWith('http')) {
    return `${phoneOrUrl}${phoneOrUrl.includes('?') ? '&' : '?'}text=${text}`;
  }
  const clean = phoneOrUrl.replace(/[^\d+]/g, '').replace('+', '');
  return `https://wa.me/${clean}?text=${text}`;
}