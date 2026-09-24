import{j as e}from"./vendor-BVqeCnZk.js";import{H as a}from"./index-CFCvMG1c.js";import"./charts-BvHnJdwW.js";import"./radix-tooltip-BC6SzsVK.js";import"./radix-core-BfPf5pR8.js";import"./radix-popper-Cw7shl4y.js";import"./radix-arrow-CYg4Hg7C.js";import"./radix-visually-hidden-DX1dKV_b.js";import"./icons-k74EZQdQ.js";import"./radix-dropdown-menu-sbsORLpW.js";import"./radix-menu-BTmCxtlX.js";import"./radix-direction-BKFVjZyi.js";import"./radix-roving-focus-DAWzJzzR.js";import"./radix-dialog-dFQGLtb_.js";const o=[{lang:"EN",oops:"Looks like this page took the wrong turn in Rio.",body:"The page you're looking for doesn't exist or has been moved. Try one of the routes below."},{lang:"PT",oops:"Parece que esta página errou o caminho no Rio.",body:"A página que você procura não existe ou foi movida. Escolha um dos caminhos abaixo."},{lang:"ES",oops:"Parece que esta página tomó el camino equivocado en Río.",body:"La página que buscas no existe o ha sido movida. Elige una de las opciones de abajo."}],u=()=>e.jsxs("div",{className:"nf-page",children:[e.jsxs(a,{children:[e.jsx("title",{children:"404 — Page Not Found | Tocorime Rio"}),e.jsx("meta",{name:"robots",content:"noindex, follow"}),e.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap",rel:"stylesheet"})]}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .nf-page {
          min-height: 100vh;
          background: #0a0a08;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow', sans-serif;
          color: #e5ddc8;
          padding: 2rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* ambient glow */
        .nf-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% 0%, rgba(26,122,46,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 90%, rgba(42,157,143,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 80% 80%, rgba(201,162,39,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        /* grid overlay */
        .nf-page::after {
          content: '';
          position: fixed; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.012) 60px, rgba(255,255,255,0.012) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.008) 60px, rgba(255,255,255,0.008) 61px);
          pointer-events: none;
        }

        .nf-card {
          position: relative; z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 620px;
          width: 100%;
          animation: nfFadeUp 0.7s ease both;
        }

        @keyframes nfFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo */
        .nf-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.14em;
          color: #c9a227;
          margin-bottom: 3rem;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nf-logo:hover { opacity: 0.8; }
        .nf-logo span { color: #2ecc5a; }

        /* 404 number */
        .nf-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(7rem, 22vw, 14rem);
          line-height: 0.88;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, rgba(201,162,39,0.6) 0%, rgba(240,200,74,0.15) 50%, rgba(201,162,39,0.05) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .nf-number::after {
          content: '404';
          position: absolute;
          inset: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: inherit;
          line-height: inherit;
          letter-spacing: inherit;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1px rgba(201,162,39,0.15);
          background: none;
        }

        /* Divider */
        .nf-divider {
          width: 48px; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a227, transparent);
          margin-bottom: 2rem;
        }

        /* Messages (3 languages stacked) */
        .nf-messages {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
          margin-bottom: 3rem;
          width: 100%;
        }

        .nf-msg {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          padding: 1.1rem 1.5rem;
          position: relative;
          transition: border-color 0.3s, background 0.3s;
        }
        .nf-msg:hover {
          border-color: rgba(201,162,39,0.25);
          background: rgba(201,162,39,0.04);
        }

        .nf-msg-lang {
          position: absolute;
          top: -0.55rem; left: 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a227;
          background: #0a0a08;
          padding: 0 0.4rem;
        }

        .nf-msg-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f0ead8;
          margin-bottom: 0.3rem;
        }

        .nf-msg-body {
          font-size: 0.85rem;
          color: #7a7360;
          line-height: 1.55;
        }

        /* CTA group */
        .nf-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          justify-content: center;
          width: 100%;
        }

        /* CTA */
        .nf-btn {
          display: inline-block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 0.95rem 1.9rem;
          min-height: 48px;
          background: #1a7a2e;
          color: #fff;
          text-decoration: none;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .nf-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        .nf-btn:hover {
          background: #2ecc5a;
          color: #0a0a08;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(46,204,90,0.3);
        }

        /* Footer note */
        .nf-footer {
          margin-top: 3rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: rgba(122,115,96,0.5);
          text-transform: uppercase;
        }
      `}}),e.jsxs("div",{className:"nf-card",children:[e.jsxs("a",{href:"/",className:"nf-logo",children:["Tocori",e.jsx("span",{children:"merio"})]}),e.jsx("div",{className:"nf-number",children:"404"}),e.jsx("div",{className:"nf-divider"}),e.jsx("div",{className:"nf-messages",children:o.map(n=>e.jsxs("div",{className:"nf-msg",children:[e.jsx("span",{className:"nf-msg-lang",children:n.lang}),e.jsx("div",{className:"nf-msg-title",children:n.oops}),e.jsx("div",{className:"nf-msg-body",children:n.body})]},n.lang))}),e.jsxs("div",{className:"nf-actions",children:[e.jsx("a",{href:"/passeio",className:"nf-btn",children:"View Tours"}),e.jsx("a",{href:"/things-to-do-in-rio-de-janeiro",className:"nf-btn",children:"Explore Rio"}),e.jsx("a",{href:"/contato",className:"nf-btn",children:"Contact Us"})]}),e.jsx("p",{className:"nf-footer",children:"tocorimerio.com"})]})]});export{u as default};
