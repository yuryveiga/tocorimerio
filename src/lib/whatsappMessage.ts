const messages = {
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

export function getWhatsappWelcomeMessage(language?: string): string {
  const lang = (language || 'pt').toLowerCase().slice(0, 2);
  return messages[lang as keyof typeof messages] || messages.pt;
}

export function buildWhatsappLink(phoneOrUrl: string, language?: string): string {
  const text = encodeURIComponent(getWhatsappWelcomeMessage(language));
  if (phoneOrUrl.startsWith('http')) {
    return `${phoneOrUrl}${phoneOrUrl.includes('?') ? '&' : '?'}text=${text}`;
  }
  const clean = phoneOrUrl.replace(/[^\d+]/g, '').replace('+', '');
  return `https://wa.me/${clean}?text=${text}`;
}