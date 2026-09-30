const o={pt:`Olá! 👋

Seja bem-vindo à Tocorime Rio!

Obrigado pelo seu contato. Em breve vou responder sua mensagem pessoalmente. 🇧🇷⚽

Enquanto isso, fique à vontade para me enviar:

• Quantas pessoas são
• Datas da viagem
• Qual experiência procura no Rio de Janeiro
• Se deseja assistir a um jogo no Maracanã

Será um prazer ajudar você a viver uma experiência inesquecível no Rio! ☀️🏖️`,en:`Hello! 👋

Welcome to Tocorime Rio!

Thank you for getting in touch. I'll personally reply to your message soon. 🇧🇷⚽

In the meantime, feel free to send me:

• How many people are travelling
• Travel dates
• What kind of experience you're looking for in Rio de Janeiro
• Whether you'd like to watch a match at the Maracanã

It will be a pleasure to help you live an unforgettable experience in Rio! ☀️🏖️`,es:`¡Hola! 👋

¡Bienvenido a Tocorime Rio!

Gracias por tu contacto. En breve responderé tu mensaje personalmente. 🇧🇷⚽

Mientras tanto, no dudes en enviarme:

• Cuántas personas son
• Fechas del viaje
• Qué experiencia buscas en Río de Janeiro
• Si deseas ver un partido en el Maracaná

¡Será un placer ayudarte a vivir una experiencia inolvidable en Río! ☀️🏖️`};function t(){if(typeof window>"u")return null;try{const e=localStorage.getItem("site_settings");if(!e)return null;const a=JSON.parse(e).whatsapp_msg;return a&&a.trim()?a:null}catch{return null}}function r(e){const n=(e||"pt").toLowerCase().slice(0,2),a=n in o?n:"pt";return t()||o[a]}function s(e,n){const a=encodeURIComponent(r(n));return e.startsWith("http")?`${e}${e.includes("?")?"&":"?"}text=${a}`:`https://wa.me/${e.replace(/[^\d+]/g,"").replace("+","")}?text=${a}`}export{s as b};
