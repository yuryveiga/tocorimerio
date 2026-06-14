import{O as W,r as y,j as e,N as V,y as c}from"./vendor-8laeIfBe.js";import{p as S}from"./purify.es-BlZidd4c.js";import{a as A,u as Q,g as n,H as K,j as L,k as Z,o as X,i as Y,l as ee,B as i,O as te,p as ae,m as re}from"./index-Bks20TxF.js";import{F as oe}from"./Footer-C47DbgNh.js";import{T as se}from"./TourItem-DGFLlcZ0.js";import{C as ie,a as ne,b as le,c as ce,d as me}from"./carousel-BaSpKp2F.js";/* empty css                   */import{J as M,z as $,r as F,j as O,s as I,K as de,k as pe}from"./icons-Cxz3YDqC.js";import{f as E,b as xe,e as ue,a as he}from"./dates-B2o-8M6z.js";import"./supabase-BgQJfCCH.js";import"./whatsappMessage-CZ1hafey.js";const P=()=>{const{t:b,language:a}=A();return e.jsxs("div",{className:"my-12 p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-inner",children:[e.jsx("div",{className:"absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"}),e.jsx("div",{className:"absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-150 duration-1000"}),e.jsxs("div",{className:"relative z-10 text-left flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsx(de,{className:"w-5 h-5 text-accent animate-pulse"}),e.jsx("span",{className:"text-[10px] font-black uppercase tracking-[0.3em] text-accent",children:a==="pt"?"Experiência Exclusiva":"Exclusive Experience"})]}),e.jsx("h4",{className:"font-serif text-2xl sm:text-3xl font-bold mb-3 text-foreground leading-tight",children:a==="pt"?"Planejando sua visita ao Rio?":"Planning your visit to Rio?"}),e.jsx("p",{className:"text-muted-foreground text-base font-sans max-w-md leading-relaxed",children:a==="pt"?"Transforme sua leitura em realidade. Reserve um tour privativo com quem entende a alma carioca.":"Turn your reading into reality. Book a private tour with those who understand the soul of Rio."})]}),e.jsx(c,{to:"/#tours",className:"relative z-10 shrink-0 w-full md:w-auto",children:e.jsxs(i,{className:"w-full md:w-auto rounded-full px-10 h-16 font-black text-sm uppercase tracking-widest shadow-2xl shadow-accent/30 bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-3",children:[b("explorar_passeios"),e.jsx(pe,{className:"w-5 h-5"})]})})]})},Te=()=>{var T;const{slug:b}=W(),[a,J]=y.useState(null),[B,N]=y.useState(!0),{t:m,language:t}=A(),{siteSettings:d,tours:D}=Q(),k=t==="en"?xe:t==="es"?ue:he,v=((T=d==null?void 0:d.site_title)==null?void 0:T.split("|")[0].trim())||"Tocorime Rio",g=`${n("")}/og-image.jpg`;y.useEffect(()=>{window.scrollTo(0,0),(async()=>{N(!0);const h=(await ae("blog_posts")).find(o=>o.slug===b&&o.is_published);J(h||null),N(!1)})()},[b]);const R=()=>{const r=encodeURIComponent(`${s}

${window.location.href}`);window.open(`https://wa.me/?text=${r}`,"_blank")},_=()=>{window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,"_blank")},C=()=>{navigator.clipboard.writeText(window.location.href),re.success(t==="pt"?"Link copiado!":t==="es"?"¡Enlace copiado!":"Link copied!")},H=r=>r.replace("-","_").toLowerCase(),j=r=>{if(!a)return"";if(t==="pt")return String(a[r]||"");const u=`${String(r)}_${H(t)}`,h=a[u];return String(h||a[r]||"")};if(B)return e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"})});if(!a)return e.jsx(V,{to:"/404",replace:!0});const s=j("title"),U=j("content"),f=j("excerpt"),p=String(U||"").replace(/\u00A0/g," ").replace(/&nbsp;/g," ").replace(/\u00AD/g,"").replace(/&shy;/g,"").replace(/&#173;/g,"").replace(/([a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])(-)([a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g,"$1&#8209;$3"),x=(()=>{if(!p)return{part1:"",part2:""};const r=p.split("</p>");if(r.length<5)return{part1:p,part2:""};const u=2,h=r.slice(0,u).join("</p>")+"</p>",o=r.slice(u).join("</p>");return{part1:h,part2:o}})(),q=(d==null?void 0:d.blog_hero_style)||"hero";return e.jsxs("div",{className:"min-h-screen flex flex-col font-sans bg-background",children:[e.jsx("style",{children:`
        .blog-content-area {
          font-family: 'Open Sans', sans-serif !important;
          color: #555555 !important;
          line-height: 1.6 !important;
          font-size: 1.05rem !important;
          text-align: justify !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
          word-break: normal !important;
          line-break: strict !important;
          overflow-wrap: break-word !important;
          }
        .blog-content-area * {
          margin-top: 0 !important;
          margin-inline: 0 !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
        }
        .blog-content-area p {
          margin-bottom: 1.2rem !important;
          line-height: 1.7 !important;
          text-align: justify !important;
          word-break: normal !important;
          line-break: strict !important;
          overflow-wrap: break-word !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -ms-hyphens: none !important;
        }
        /* Handle spacing for manual line breaks without forcing them to be blocks */
        .blog-content-area br {
          margin-bottom: 0 !important;
        }
        /* Specific fix for empty paragraphs used as spacers by some editors */
        .blog-content-area p:empty,
        .blog-content-area p:has(br:only-child) {
          min-height: 1.2rem;
          margin-bottom: 0.8rem !important;
        }
        .blog-content-area h1, 
        .blog-content-area h2, 
        .blog-content-area h3 {
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          color: #333333 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.3rem !important;
          line-height: 1.2 !important;
          text-align: left !important;
        }
        .blog-content-area h1 { font-size: 2rem !important; }
        .blog-content-area h2 { font-size: 1.6rem !important; }
        .blog-content-area h3 { font-size: 1.3rem !important; }
        
        .blog-content-area ul, 
        .blog-content-area ol {
          margin-bottom: 1.5rem !important;
          margin-top: 0.5rem !important;
          padding-left: 2rem !important;
          display: block !important;
        }
        .blog-content-area ul {
          list-style-type: disc !important;
        }
        .blog-content-area ol {
          list-style-type: decimal !important;
        }
        .blog-content-area li {
          margin-bottom: 0.5rem !important;
          line-height: 1.6 !important;
          display: list-item !important;
          list-style: inherit !important;
        }
        .blog-content-area img {
          border-radius: 0.5rem;
          margin: 1rem 0 !important;
          max-width: 100%;
          display: block;
        }
        .blog-content-area blockquote {
          border-left: 3px solid #008967;
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0 !important;
          opacity: 0.9;
        }
        /* Override Quill default padding */
        .ql-editor.blog-content-area {
          padding: 0 !important;
        }
      `}),e.jsxs(K,{children:[a.slug.includes("rocinha")?e.jsxs(e.Fragment,{children:[e.jsx("title",{children:"Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide"}),e.jsx("meta",{name:"description",content:"Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps."}),e.jsx("meta",{name:"keywords",content:"Rocinha favela tour, Rio de Janeiro favela tour, safe favela tour Rio, guided tour Rocinha, favela tour for tourists, community tour Rio de Janeiro, responsible favela tourism, things to do in Rio de Janeiro, Rio de Janeiro private tours, Tocorime Rio"}),e.jsx("meta",{name:"robots",content:"index, follow"}),e.jsx("link",{rel:"canonical",href:"https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro"}),e.jsx("meta",{property:"og:type",content:"article"}),e.jsx("meta",{property:"og:title",content:"Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide"}),e.jsx("meta",{property:"og:description",content:"Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps."}),e.jsx("meta",{property:"og:url",content:"https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro"}),e.jsx("meta",{property:"og:image",content:`${n("")}/og-image.jpg`}),e.jsx("meta",{property:"og:image:alt",content:"Guided favela tour in Rocinha, Rio de Janeiro with local expert"}),e.jsx("meta",{property:"og:locale",content:"en_US"}),e.jsx("meta",{property:"og:site_name",content:"Tocorime Rio"}),e.jsx("meta",{property:"article:published_time",content:"2026-06-09"}),e.jsx("meta",{property:"article:author",content:"Tocorime Rio"}),e.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),e.jsx("meta",{name:"twitter:title",content:"Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide"}),e.jsx("meta",{name:"twitter:description",content:"Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps."}),e.jsx("meta",{name:"twitter:image",content:`${n("")}/og-image.jpg`}),e.jsx("script",{type:"application/ld+json",children:`
              {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": "Rocinha Favela Tour Rio: Safe, Fun & Eye-Opening Guide",
                "description": "Is a Rocinha favela tour safe? Discover Rio's most authentic cultural experience with local expert guides. Private tours, real community access, no tourist traps.",
                "image": "https://tocorimerio.com/images/blog/rocinha-favela-tour-cover.jpg",
                "author": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "url": "https://tocorimerio.com"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Tocorime Rio",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://tocorimerio.com/logo.png"
                  }
                },
                "datePublished": "2026-06-09",
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://tocorimerio.com/blog/rocinha-favela-tour-rio-de-janeiro"
                }
              }
              `})]}):e.jsxs(e.Fragment,{children:[e.jsxs("title",{children:[s," | ",v]}),e.jsx("meta",{name:"description",content:L(f||p||s,s,t)}),e.jsx("meta",{property:"og:type",content:"article"}),e.jsx("meta",{property:"og:url",content:n(`/blog/${a.slug}`)}),e.jsx("meta",{property:"og:title",content:`${s} | ${v}`}),e.jsx("meta",{property:"og:description",content:L(f||p||s,s,t)}),e.jsx("meta",{property:"og:image",content:a.image_url||g}),e.jsx("meta",{property:"og:site_name",content:"Tocorime Rio"}),e.jsx("meta",{property:"og:locale",content:t==="pt"?"pt_BR":t==="es"?"es_ES":"en_US"}),a.created_at&&e.jsx("meta",{property:"article:published_time",content:a.created_at}),a.updated_at&&e.jsx("meta",{property:"article:modified_time",content:a.updated_at}),e.jsx("link",{rel:"canonical",href:n(`/blog/${a.slug}`)}),Z(`/blog/${a.slug}`).map(r=>e.jsx("link",{rel:"alternate",hrefLang:r.hreflang,href:r.href},r.hreflang)),e.jsx("script",{type:"application/ld+json",children:JSON.stringify(X({title:s,description:f||s,imageUrl:a.image_url||g,url:n(`/blog/${a.slug}`),datePublished:a.created_at,dateModified:a.updated_at||a.created_at}))}),e.jsx("script",{type:"application/ld+json",children:JSON.stringify(Y([{name:m("inicio"),url:n("/")},{name:"Blog",url:n("/blog")},{name:s,url:n(`/blog/${a.slug}`)}]))}),e.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),e.jsx("meta",{name:"twitter:title",content:`${s} | ${v}`}),e.jsx("meta",{name:"twitter:description",content:f||s}),e.jsx("meta",{name:"twitter:image",content:a.image_url||g})]}),e.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Open+Sans:wght@400;600&display=swap",rel:"stylesheet"})]}),e.jsx(ee,{}),e.jsxs("main",{className:"flex-1","data-blog-post":!0,children:[q==="hero"?e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden bg-black",children:[e.jsx("div",{className:"absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[length:20000ms] hover:scale-110",style:{backgroundImage:`url('${a.image_url||g}')`}}),e.jsx("div",{className:"absolute inset-0 bg-black/50"}),e.jsx("div",{className:"absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]"}),e.jsxs("div",{className:"relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up",children:[e.jsxs(c,{to:"/blog",className:"inline-flex items-center text-white/80 hover:text-white font-sans mb-8 transition-colors",children:[e.jsx(M,{className:"w-5 h-5 mr-2"})," ",m("voltar_blog")]}),e.jsxs("div",{className:"flex items-center justify-center gap-2 text-sm text-white/80 mb-6 font-sans uppercase tracking-[0.2em]",children:[e.jsx($,{className:"w-4 h-4 text-primary"}),a.created_at?E(new Date(a.created_at),t==="en"?"MMMM dd, yyyy":"dd 'de' MMMM 'de' yyyy",{locale:k}):m("publicado_recentemente")]}),e.jsx("h1",{className:"font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl",children:s})]})]}),e.jsx("div",{className:"max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-20",children:e.jsxs("div",{className:"bg-card rounded-3xl shadow-2xl p-8 sm:p-16 border border-border/50",children:[e.jsxs("nav",{"aria-label":"Breadcrumb",className:"flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8",children:[e.jsx(c,{to:"/",className:"hover:text-primary transition-colors",children:m("inicio")}),e.jsx("span",{"aria-hidden":!0,children:"/"}),e.jsx(c,{to:"/blog",className:"hover:text-primary transition-colors",children:"Blog"}),e.jsx("span",{"aria-hidden":!0,children:"/"}),e.jsx("span",{className:"text-foreground/70 truncate max-w-[60%]",children:s})]}),e.jsx("div",{className:"max-w-none ql-editor blog-content-area",style:{padding:0},lang:t,dangerouslySetInnerHTML:{__html:S.sanitize(x.part1||"")}}),x.part2&&e.jsxs(e.Fragment,{children:[e.jsx(P,{}),e.jsx("div",{className:"max-w-none ql-editor blog-content-area",style:{padding:0},lang:t,dangerouslySetInnerHTML:{__html:S.sanitize(x.part2||"")}})]}),e.jsxs("div",{className:"mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center animate-fade-in shadow-inner relative overflow-hidden group",children:[e.jsx("div",{className:"absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"}),e.jsx("div",{className:"absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-150 duration-700"}),e.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-8 relative z-10",children:[e.jsxs("div",{className:"text-left flex-1",children:[e.jsx("h3",{className:"font-serif text-2xl sm:text-3xl font-bold mb-4",children:t==="pt"?"Gostou dessa dica?":t==="es"?"¿Te gustó este consejo?":"Did you like this tip?"}),e.jsx("p",{className:"text-muted-foreground text-lg mb-0 font-sans max-w-xl",children:t==="pt"?"Viva a emoção de descobrir o Rio de Janeiro com nossos guias especialistas e exclusivos.":t==="es"?"Vive la emoción de descubrir Río de Janeiro con nuestros guías expertos y exclusivos.":"Experience the thrill of discovering Rio de Janeiro with our expert and exclusive guides."})]}),e.jsxs("div",{className:"flex flex-col items-center gap-4 shrink-0",children:[e.jsx(c,{to:"/#tours",children:e.jsx(i,{size:"lg",className:"rounded-full px-12 font-bold h-16 text-base uppercase tracking-wider shadow-2xl shadow-primary/30 hover:scale-105 transition-all duration-300",children:t==="pt"?"Reservar Agora":t==="es"?"Reservar Ahora":"Book Now"})}),e.jsxs("div",{className:"flex items-center gap-3 mt-2",children:[e.jsx("span",{className:"text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2 opacity-60",children:t==="pt"?"Compartilhar:":t==="es"?"Compartir:":"Share:"}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm",onClick:R,title:"WhatsApp",children:e.jsx(F,{className:"w-4 h-4"})}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm",onClick:_,title:"Facebook",children:e.jsx(O,{className:"w-4 h-4"})}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm",onClick:C,title:t==="pt"?"Copiar Link":"Copy Link",children:e.jsx(I,{className:"w-4 h-4"})})]})]})]})]})]})})]}):e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 relative z-10 mb-20",children:e.jsxs("div",{className:"bg-card rounded-2xl shadow-xl p-8 sm:p-12 border border-border/50",children:[e.jsxs(c,{to:"/blog",className:"inline-flex items-center text-primary font-medium font-sans mb-6 hover:underline",children:[e.jsx(M,{className:"w-4 h-4 mr-2"})," ",m("voltar_blog")]}),e.jsx("div",{className:"w-full aspect-video relative rounded-xl overflow-hidden mb-10 shadow-lg border border-border/50 bg-muted",children:e.jsx(te,{src:a.image_url||g,alt:s,width:1200,containerClassName:"w-full h-full",fit:"cover",className:"w-full h-full transition-transform duration-[length:2000ms] group-hover:scale-105",loading:"eager",fetchPriority:"high"})}),e.jsxs("div",{className:"flex items-center gap-2 text-sm text-muted-foreground mb-4 font-sans",children:[e.jsx($,{className:"w-4 h-4"}),a.created_at?E(new Date(a.created_at),t==="en"?"MMMM dd, yyyy":"dd 'de' MMMM 'de' yyyy",{locale:k}):m("publicado_recentemente")]}),e.jsx("h1",{className:"font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight",children:s}),e.jsx("div",{className:"max-w-none ql-editor blog-content-area",style:{padding:0},lang:t,dangerouslySetInnerHTML:{__html:x.part1||""}}),x.part2&&e.jsxs(e.Fragment,{children:[e.jsx(P,{}),e.jsx("div",{className:"max-w-none ql-editor blog-content-area",style:{padding:0},lang:t,dangerouslySetInnerHTML:{__html:x.part2||""}})]}),e.jsxs("div",{className:"mt-16 p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center animate-fade-in shadow-inner relative overflow-hidden group",children:[e.jsx("div",{className:"absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"}),e.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-8 relative z-10",children:[e.jsxs("div",{className:"text-left flex-1",children:[e.jsx("h3",{className:"font-serif text-2xl sm:text-3xl font-bold mb-4",children:t==="pt"?"Gostou dessa dica?":t==="es"?"¿Te gustó este consejo?":"Did you like this tip?"}),e.jsx("p",{className:"text-muted-foreground text-lg mb-0 font-sans max-w-xl",children:t==="pt"?"Viva a emoção de descobrir o Rio de Janeiro com nossos guias especialistas e exclusivos.":t==="es"?"Vive la emoción de descobrir Río de Janeiro con nossos guías expertos e exclusivos.":"Experience the thrill of discovering Rio de Janeiro with our expert and exclusive guides."})]}),e.jsxs("div",{className:"flex flex-col items-center gap-4 shrink-0",children:[e.jsx(c,{to:"/#tours",children:e.jsx(i,{size:"lg",className:"rounded-full px-12 font-bold h-16 text-base uppercase tracking-wider shadow-2xl shadow-primary/30 hover:scale-105 transition-all duration-300",children:t==="pt"?"Reservar Agora":t==="es"?"Reservar Ahora":"Book Now"})}),e.jsxs("div",{className:"flex items-center gap-3 mt-2",children:[e.jsx("span",{className:"text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2 opacity-60",children:t==="pt"?"Compartilhar:":t==="es"?"Compartir:":"Share:"}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm",onClick:R,title:"WhatsApp",children:e.jsx(F,{className:"w-4 h-4"})}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm",onClick:_,title:"Facebook",children:e.jsx(O,{className:"w-4 h-4"})}),e.jsx(i,{variant:"outline",size:"icon",className:"rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm",onClick:C,title:t==="pt"?"Copiar Link":"Copy Link",children:e.jsx(I,{className:"w-4 h-4"})})]})]})]})]})]})}),e.jsx("section",{className:"py-20 lg:py-24 bg-muted/30 border-t border-border/50",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"text-center mb-12",children:[e.jsx("h2",{className:"font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4",children:t==="pt"?"Que tal viver essa experiência no Rio de Janeiro?":t==="es"?"¿Qué tal viver esta experiência en Río?":"How about living this experience in Rio?"}),e.jsx("p",{className:"text-muted-foreground text-lg max-w-2xl mx-auto font-sans",children:t==="pt"?"Confira nossos passeios mais bem avaliados e reserve sua próxima aventura.":t==="es"?"Echa un vistazo a nuestros tours melhor valorados e reserva tu próxima aventura.":"Check out our top-rated tours and book your next adventure."})]}),e.jsx("div",{className:"px-4 md:px-12",children:e.jsxs(ie,{opts:{align:"start",loop:!0},className:"w-full",children:[e.jsx(ne,{className:"-ml-4",children:(()=>{const r=(s+" "+f+" "+p).toLowerCase();return D.filter(o=>o.is_active!==!1).map(o=>{let l=0;const z=(o.title||"").toLowerCase(),G=(o.slug||"").toLowerCase();return(o.short_description||"").toLowerCase(),r.includes(G)&&(l+=100),r.includes(z)&&(l+=50),z.split(" ").filter(w=>w.length>3).forEach(w=>{r.includes(w)&&(l+=10)}),o.is_featured&&(l+=5),{tour:o,score:l}}).sort((o,l)=>l.score-o.score||(l.tour.is_featured?1:0)-(o.tour.is_featured?1:0)).map(o=>o.tour).map(o=>e.jsx(le,{className:"pl-4 basis-full sm:basis-1/2 lg:basis-1/4",children:e.jsx("div",{className:"p-1","data-tour-card":!0,children:e.jsx(se,{tour:o})})},o.id))})()}),e.jsxs("div",{className:"hidden md:block",children:[e.jsx(ce,{className:"-left-12 lg:-left-16 w-12 h-12 bg-white/80 hover:bg-white shadow-lg border-primary/20"}),e.jsx(me,{className:"-right-12 lg:-right-16 w-12 h-12 bg-white/80 hover:bg-white shadow-lg border-primary/20"})]})]})}),e.jsx("div",{className:"mt-12 text-center",children:e.jsx(c,{to:"/#tours",children:e.jsx(i,{size:"lg",className:"rounded-full px-10 font-bold h-14 text-sm uppercase tracking-widest shadow-xl shadow-primary/20",children:"TOURS"})})})]})})]}),e.jsx(oe,{})]})};export{Te as default};
